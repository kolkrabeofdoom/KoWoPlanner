use axum::{
    extract::{ConnectInfo, State},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use chrono::Utc;
use sqlx::PgPool;
use std::{
    collections::HashMap,
    net::SocketAddr,
    sync::Arc,
    time::{Duration, Instant},
};
use tokio::sync::Mutex;

use crate::{
    config::Config,
    middleware::auth::Claims,
    models::{User, UserResponse},
};

// --- Rate Limiter ---

#[derive(Clone)]
pub struct LoginLimiter {
    attempts: Arc<Mutex<HashMap<String, (u32, Instant)>>>,
}

impl LoginLimiter {
    pub fn new() -> Self {
        Self {
            attempts: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn is_rate_limited(&self, key: &str) -> bool {
        let mut map = self.attempts.lock().await;
        let now = Instant::now();
        let window = Duration::from_secs(15 * 60); // 15 minutes

        if let Some((count, first_attempt)) = map.get_mut(key) {
            if now.duration_since(*first_attempt) > window {
                *count = 1;
                *first_attempt = now;
                false
            } else {
                *count += 1;
                *count > 10 // Max 10 attempts
            }
        } else {
            map.insert(key.to_string(), (1, now));
            false
        }
    }

    pub async fn reset(&self, key: &str) {
        let mut map = self.attempts.lock().await;
        map.remove(key);
    }
}

// --- Auth State ---

#[derive(Clone)]
pub struct AuthState {
    pub pool: PgPool,
    pub limiter: LoginLimiter,
    pub jwt_secret: String,
}

// --- DTOs ---

#[derive(Deserialize)]
pub struct LoginDto {
    pub email: Option<String>,
    pub password: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginResponse {
    pub token: String,
    pub user: UserResponse,
}

// --- Handlers ---

fn get_client_ip(headers: &HeaderMap, addr: SocketAddr) -> String {
    headers
        .get("x-forwarded-for")
        .and_then(|val| val.to_str().ok())
        .and_then(|val| val.split(',').next())
        .map(|s| s.trim().to_string())
        .unwrap_or_else(|| addr.ip().to_string())
}

async fn login(
    State(state): State<AuthState>,
    headers: HeaderMap,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Json(payload): Json<LoginDto>,
) -> impl IntoResponse {
    let email = match payload.email {
        Some(e) if !e.is_empty() => e,
        _ => return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "E-Mail und Passwort müssen angegeben werden." }))).into_response(),
    };

    let password = match payload.password {
        Some(p) if !p.is_empty() => p,
        _ => return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "E-Mail und Passwort müssen angegeben werden." }))).into_response(),
    };

    let client_ip = get_client_ip(&headers, addr);
    let rate_limit_key = format!("{}|{}", client_ip, email);

    if state.limiter.is_rate_limited(&rate_limit_key).await {
        return (
            StatusCode::TOO_MANY_REQUESTS,
            Json(serde_json::json!({ "error": "Zu viele Anmeldeversuche. Bitte warten Sie 15 Minuten." })),
        )
            .into_response();
    }

    // Query user by email
    let user_res: Result<Option<User>, sqlx::Error> = sqlx::query_as::<_, User>(
        r#"SELECT id, name, email, "passwordHash", role, "isAdmin", "avatarInitials", color FROM "User" WHERE email = $1"#
    )
    .bind(&email)
    .fetch_optional(&state.pool)
    .await;

    let user = match user_res {
        Ok(Some(u)) => u,
        _ => {
            return (StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "error": "Ungültige E-Mail-Adresse oder Passwort." }))).into_response();
        }
    };

    // Compare password hash
    let is_match = bcrypt::verify(&password, &user.password_hash).unwrap_or(false);
    if !is_match {
        return (StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "error": "Ungültige E-Mail-Adresse oder Passwort." }))).into_response();
    }

    // Reset rate limiter on success
    state.limiter.reset(&rate_limit_key).await;

    // Generate JWT token
    let expiration = Utc::now() + chrono::Duration::hours(24);
    let claims = Claims {
        id: user.id.clone(),
        email: user.email.clone(),
        role: user.role.clone(),
        is_admin: user.is_admin,
    };

    // In a production app, jsonwebtoken expects exp as a timestamp (usize/i64)
    // However, jsonwebtoken crate default Claims struct uses exp. Let's make sure it compiles.
    // Let's declare our own jsonwebtoken claims struct or serialize expiration
    #[derive(Serialize)]
    struct JwtClaims {
        id: String,
        email: String,
        role: String,
        #[serde(rename = "isAdmin")]
        is_admin: bool,
        exp: i64,
    }

    let jwt_claims = JwtClaims {
        id: claims.id,
        email: claims.email,
        role: claims.role,
        is_admin: claims.is_admin,
        exp: expiration.timestamp(),
    };

    let token = match encode(
        &Header::default(),
        &jwt_claims,
        &EncodingKey::from_secret(state.jwt_secret.as_bytes()),
    ) {
        Ok(t) => t,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Fehler bei der Token-Erstellung" }))).into_response(),
    };

    let response = LoginResponse {
        token,
        user: UserResponse::from(user),
    };

    (StatusCode::OK, Json(response)).into_response()
}

async fn get_me(
    claims: Claims,
    State(state): State<AuthState>,
) -> impl IntoResponse {
    let user_res: Result<Option<User>, sqlx::Error> = sqlx::query_as::<_, User>(
        r#"SELECT id, name, email, "passwordHash", role, "isAdmin", "avatarInitials", color FROM "User" WHERE id = $1"#
    )
    .bind(&claims.id)
    .fetch_optional(&state.pool)
    .await;

    match user_res {
        Ok(Some(user)) => (StatusCode::OK, Json(UserResponse::from(user))).into_response(),
        Ok(None) => (StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": "Benutzer nicht gefunden" }))).into_response(),
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Fehler beim Laden des Benutzerprofils." }))).into_response(),
    }
}

pub fn router(pool: PgPool, config: &Config) -> Router {
    let state = AuthState {
        pool,
        limiter: LoginLimiter::new(),
        jwt_secret: config.jwt_secret.clone(),
    };

    Router::new()
        .route("/login", post(login))
        .route("/me", get(get_me))
        .with_state(state)
}
