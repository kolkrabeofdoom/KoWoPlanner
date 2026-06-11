use axum::{
    async_trait,
    extract::FromRequestParts,
    http::{request::Parts, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use crate::config::Config;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Claims {
    pub id: String,
    pub email: String,
    pub role: String,
    pub is_admin: bool,
}

// Custom error type for authentication
pub enum AuthError {
    MissingToken,
    InvalidToken,
    NotAdmin,
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AuthError::MissingToken => (StatusCode::UNAUTHORIZED, "Authentifizierung erforderlich"),
            AuthError::InvalidToken => (StatusCode::FORBIDDEN, "Token ist ungültig oder abgelaufen"),
            AuthError::NotAdmin => (StatusCode::FORBIDDEN, "Diese Aktion erfordert Administrator-Rechte."),
        };

        let body = Json(serde_json::json!({ "error": error_message }));
        (status, body).into_response()
    }
}

#[async_trait]
impl<S> FromRequestParts<S> for Claims
where
    S: Send + Sync,
{
    type Rejection = AuthError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        // Get Authorization header
        let auth_header = parts
            .headers
            .get(axum::http::header::AUTHORIZATION)
            .and_then(|value| value.to_str().ok())
            .ok_or(AuthError::MissingToken)?;

        if !auth_header.starts_with("Bearer ") {
            return Err(AuthError::MissingToken);
        }

        let token = &auth_header[7..];

        // Access the config (usually we store Config in Extension or State)
        // Let's get the JWT_SECRET from environment variable directly or configuration
        // In Rust, we can read JWT_SECRET from env inside decoding logic or extract from state
        // Reading from env is extremely simple and reliable for this setup:
        let jwt_secret = std::env::var("JWT_SECRET").map_err(|_| AuthError::InvalidToken)?;

        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(jwt_secret.as_bytes()),
            &Validation::default(),
        )
        .map_err(|_| AuthError::InvalidToken)?;

        Ok(token_data.claims)
    }
}

// Extractor that requires admin permissions
pub struct AdminClaims(pub Claims);

#[async_trait]
impl<S> FromRequestParts<S> for AdminClaims
where
    S: Send + Sync,
{
    type Rejection = AuthError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let claims = Claims::from_request_parts(parts, state).await?;
        if !claims.is_admin {
            return Err(AuthError::NotAdmin);
        }
        Ok(AdminClaims(claims))
    }
}
