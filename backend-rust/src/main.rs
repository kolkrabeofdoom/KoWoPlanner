use axum::{
    response::IntoResponse,
    routing::get,
    Router,
};
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use axum::http::Method;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use backend_rust::{config, db, routes};

async fn status_handler() -> impl IntoResponse {
    let now = chrono::Utc::now().to_rfc3339();
    axum::Json(serde_json::json!({
        "status": "ok",
        "service": "KoWoPlanner Backend API (Rust)",
        "timestamp": now
    }))
}

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "backend_rust=debug,tower_http=debug,axum=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load configuration
    let config = config::Config::from_env();

    // Initialize database pool
    let pool = db::init_pool(&config.database_url)
        .await
        .expect("Failed to initialize database pool");

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS])
        .allow_headers([axum::http::header::CONTENT_TYPE, axum::http::header::AUTHORIZATION]);

    // Handle CORS origin mapping
    let cors = if config.cors_origin == "*" {
        cors.allow_origin(Any)
    } else {
        match config.cors_origin.parse::<axum::http::HeaderValue>() {
            Ok(origin) => cors.allow_origin(origin),
            Err(_) => {
                tracing::warn!("Invalid CORS_ORIGIN config: {}, falling back to Any", config.cors_origin);
                cors.allow_origin(Any)
            }
        }
    };

    // Combine routers under /api
    let app = Router::new()
        .nest("/api/auth", routes::auth::router(pool.clone(), &config))
        .nest("/api/users", routes::users::router(pool.clone()))
        .nest("/api/workspaces", routes::workspaces::router(pool.clone()))
        .nest("/api/tickets", routes::tickets::router(pool.clone()))
        .nest("/api/tasks", routes::tasks::router(pool.clone()))
        .route("/status", get(status_handler))
        .layer(cors)
        .layer(tower_http::trace::TraceLayer::new_for_http());

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    tracing::info!("🚀 KoWoPlanner Backend API (Rust) running on port {}", config.port);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>())
        .await
        .unwrap();
}
