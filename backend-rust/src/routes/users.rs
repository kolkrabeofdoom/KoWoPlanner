use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post, put},
    Json, Router,
};
use bcrypt::{hash, DEFAULT_COST};
use sqlx::PgPool;

use crate::{
    middleware::auth::{AdminClaims, Claims},
    models::{CreateUserDto, UpdateUserDto, User, UserResponse},
};

const MIN_PASSWORD_LENGTH: usize = 8;

async fn get_users(
    _claims: Claims,
    State(pool): State<PgPool>,
) -> impl IntoResponse {
    let users_res: Result<Vec<User>, sqlx::Error> = sqlx::query_as::<_, User>(
        r#"SELECT id, name, email, "passwordHash", role, "isAdmin", "avatarInitials", color FROM "User""#
    )
    .fetch_all(&pool)
    .await;

    match users_res {
        Ok(users) => {
            let res: Vec<UserResponse> = users.into_iter().map(UserResponse::from).collect();
            (StatusCode::OK, Json(res)).into_response()
        }
        Err(e) => {
            eprintln!("Error fetching users: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Fehler beim Laden der Benutzer." }))).into_response()
        }
    }
}

async fn create_user(
    _admin_claims: AdminClaims,
    State(pool): State<PgPool>,
    Json(payload): Json<CreateUserDto>,
) -> impl IntoResponse {
    if payload.name.is_empty() || payload.email.is_empty() || payload.role.is_empty() {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "Name, E-Mail, Passwort und Rolle sind erforderlich." }))).into_response();
    }

    let password = match payload.password {
        Some(ref p) if p.len() >= MIN_PASSWORD_LENGTH => p,
        _ => return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": format!("Das Passwort muss mindestens {} Zeichen lang sein.", MIN_PASSWORD_LENGTH) }))).into_response(),
    };

    // Check if email already exists
    let exists: Result<Option<String>, sqlx::Error> = sqlx::query_scalar(
        r#"SELECT id FROM "User" WHERE email = $1"#
    )
    .bind(&payload.email)
    .fetch_optional(&pool)
    .await;

    match exists {
        Ok(Some(_)) => return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits." }))).into_response(),
        Err(e) => {
            eprintln!("Error checking user existence: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Datenbankfehler beim Prüfen der E-Mail." }))).into_response();
        }
        _ => {}
    }

    // Hash password
    let password_hash = match hash(password, DEFAULT_COST) {
        Ok(h) => h,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Fehler beim Hashen des Passworts." }))).into_response(),
    };

    let avatar_initials = payload.avatar_initials.clone().unwrap_or_else(|| {
        payload.name
            .split_whitespace()
            .map(|n| n.chars().next().unwrap_or(' '))
            .collect::<String>()
            .to_uppercase()
            .chars()
            .take(2)
            .collect()
    });

    let color = payload.color.clone().unwrap_or_else(|| "#8b5cf6".to_string());
    let is_admin = payload.is_admin.unwrap_or(false);
    let id = uuid::Uuid::new_v4().to_string();

    let insert_res = sqlx::query_as::<_, User>(
        r#"INSERT INTO "User" (id, name, email, "passwordHash", role, "isAdmin", "avatarInitials", color)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id, name, email, "passwordHash", role, "isAdmin", "avatarInitials", color"#
    )
    .bind(&id)
    .bind(&payload.name)
    .bind(&payload.email)
    .bind(&password_hash)
    .bind(&payload.role)
    .bind(is_admin)
    .bind(&avatar_initials)
    .bind(&color)
    .fetch_one(&pool)
    .await;

    match insert_res {
        Ok(user) => (StatusCode::CREATED, Json(UserResponse::from(user))).into_response(),
        Err(e) => {
            eprintln!("Error creating user: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Benutzer konnte nicht erstellt werden." }))).into_response()
        }
    }
}

async fn update_user(
    AdminClaims(claims): AdminClaims,
    Path(id): Path<String>,
    State(pool): State<PgPool>,
    Json(payload): Json<UpdateUserDto>,
) -> impl IntoResponse {
    // Admins cannot revoke their own admin rights
    if claims.id == id && payload.is_admin == Some(false) {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "Sie können Ihre eigenen Administrator-Rechte nicht entziehen." }))).into_response();
    }

    // Fetch existing user to check if they exist
    let existing: Result<Option<User>, sqlx::Error> = sqlx::query_as::<_, User>(
        r#"SELECT id, name, email, "passwordHash", role, "isAdmin", "avatarInitials", color FROM "User" WHERE id = $1"#
    )
    .bind(&id)
    .fetch_optional(&pool)
    .await;

    let existing_user = match existing {
        Ok(Some(u)) => u,
        Ok(None) => return (StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": "Benutzer nicht gefunden" }))).into_response(),
        Err(e) => {
            eprintln!("Error checking existing user: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Datenbankfehler beim Laden des Benutzers." }))).into_response();
        }
    };

    let mut password_hash = existing_user.password_hash;
    if let Some(ref password) = payload.password {
        if password.len() < MIN_PASSWORD_LENGTH {
            return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": format!("Das Passwort muss mindestens {} Zeichen lang sein.", MIN_PASSWORD_LENGTH) }))).into_response();
        }
        password_hash = match hash(password, DEFAULT_COST) {
            Ok(h) => h,
            Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Fehler beim Hashen des neuen Passworts." }))).into_response(),
        };
    }

    let is_admin = payload.is_admin.unwrap_or(existing_user.is_admin);
    let avatar_initials = payload.avatar_initials.clone().unwrap_or(existing_user.avatar_initials);
    let color = payload.color.clone().unwrap_or(existing_user.color);

    let update_res = sqlx::query_as::<_, User>(
        r#"UPDATE "User"
           SET name = $1, email = $2, "passwordHash" = $3, role = $4, "isAdmin" = $5, "avatarInitials" = $6, color = $7
           WHERE id = $8
           RETURNING id, name, email, "passwordHash", role, "isAdmin", "avatarInitials", color"#
    )
    .bind(&payload.name)
    .bind(&payload.email)
    .bind(&password_hash)
    .bind(&payload.role)
    .bind(is_admin)
    .bind(&avatar_initials)
    .bind(&color)
    .bind(&id)
    .fetch_one(&pool)
    .await;

    match update_res {
        Ok(user) => (StatusCode::OK, Json(UserResponse::from(user))).into_response(),
        Err(e) => {
            eprintln!("Error updating user: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Benutzer konnte nicht aktualisiert werden." }))).into_response()
        }
    }
}

async fn delete_user(
    AdminClaims(claims): AdminClaims,
    Path(id): Path<String>,
    State(pool): State<PgPool>,
) -> impl IntoResponse {
    if claims.id == id {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "Sie können sich nicht selbst löschen." }))).into_response();
    }

    let delete_res = sqlx::query(r#"DELETE FROM "User" WHERE id = $1"#)
        .bind(&id)
        .execute(&pool)
        .await;

    match delete_res {
        Ok(_) => (StatusCode::OK, Json(serde_json::json!({ "success": true, "message": "Benutzer erfolgreich gelöscht." }))).into_response(),
        Err(e) => {
            eprintln!("Error deleting user: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Benutzer konnte nicht gelöscht werden." }))).into_response()
        }
    }
}

pub fn router(pool: PgPool) -> Router {
    Router::new()
        .route("/", get(get_users).post(create_user))
        .route("/:id", put(update_user).delete(delete_user))
        .with_state(pool)
}
