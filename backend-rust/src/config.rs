use std::env;

pub struct Config {
    pub database_url: String,
    pub jwt_secret: String,
    pub port: u16,
    pub cors_origin: String,
}

impl Config {
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();

        let database_url = env::var("DATABASE_URL")
            .expect("DATABASE_URL must be set in environment or .env file");
        let jwt_secret = env::var("JWT_SECRET")
            .expect("JWT_SECRET must be set in environment or .env file");
        let port = env::var("PORT")
            .ok()
            .and_then(|p| p.parse().ok())
            .unwrap_or(3001);
        let cors_origin = env::var("CORS_ORIGIN")
            .unwrap_or_else(|_| "*".to_string());

        Self {
            database_url,
            jwt_secret,
            port,
            cors_origin,
        }
    }
}
