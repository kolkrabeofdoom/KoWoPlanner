use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post},
    Json, Router,
};
use sqlx::PgPool;

use crate::{
    middleware::auth::Claims,
    models::{CreateWorkspaceDto, Workspace},
};

async fn get_workspaces(
    _claims: Claims,
    State(pool): State<PgPool>,
) -> impl IntoResponse {
    let workspaces_res: Result<Vec<Workspace>, sqlx::Error> = sqlx::query_as::<_, Workspace>(
        r#"SELECT id, name, description FROM "Workspace""#
    )
    .fetch_all(&pool)
    .await;

    match workspaces_res {
        Ok(workspaces) => (StatusCode::OK, Json(workspaces)).into_response(),
        Err(e) => {
            eprintln!("Error fetching workspaces: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Fehler beim Laden der Arbeitsbereiche." }))).into_response()
        }
    }
}

async fn create_workspace(
    _claims: Claims,
    State(pool): State<PgPool>,
    Json(payload): Json<CreateWorkspaceDto>,
) -> impl IntoResponse {
    if payload.name.is_empty() {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "Name des Arbeitsbereichs ist erforderlich." }))).into_response();
    }

    let description = payload.description.unwrap_or_default();
    let id = uuid::Uuid::new_v4().to_string();

    let insert_res = sqlx::query_as::<_, Workspace>(
        r#"INSERT INTO "Workspace" (id, name, description)
           VALUES ($1, $2, $3)
           RETURNING id, name, description"#
    )
    .bind(&id)
    .bind(&payload.name)
    .bind(&description)
    .fetch_one(&pool)
    .await;

    match insert_res {
        Ok(workspace) => (StatusCode::CREATED, Json(workspace)).into_response(),
        Err(e) => {
            eprintln!("Error creating workspace: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Arbeitsbereich konnte nicht erstellt werden." }))).into_response()
        }
    }
}

async fn delete_workspace(
    _claims: Claims,
    Path(id): Path<String>,
    State(pool): State<PgPool>,
) -> impl IntoResponse {
    let delete_res = sqlx::query(r#"DELETE FROM "Workspace" WHERE id = $1"#)
        .bind(&id)
        .execute(&pool)
        .await;

    match delete_res {
        Ok(_) => (StatusCode::OK, Json(serde_json::json!({ "success": true, "message": "Arbeitsbereich gelöscht." }))).into_response(),
        Err(e) => {
            eprintln!("Error deleting workspace: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Arbeitsbereich konnte nicht gelöscht werden." }))).into_response()
        }
    }
}

pub fn router(pool: PgPool) -> Router {
    Router::new()
        .route("/", get(get_workspaces).post(create_workspace))
        .route("/:id", delete(delete_workspace))
        .with_state(pool)
}
