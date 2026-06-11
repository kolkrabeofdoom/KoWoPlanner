use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post, put},
    Json, Router,
};
use sqlx::{PgPool, Postgres, Transaction, Executor};
use serde::Deserialize;
use chrono::Utc;

use crate::{
    middleware::auth::Claims,
    models::{
        BulkDeleteDto, BulkStatusDto, ChecklistItem, CommentResponse, CreateCommentDto,
        CreateTaskDto, DbTask, TaskResponse, UpdateTaskDto, Comment,
    },
};

const TASK_STATUSES: &[&str] = &["planning", "in_progress", "completed"];
const PRIORITIES: &[&str] = &["low", "medium", "high", "urgent"];

fn is_valid_status(s: &str) -> bool {
    TASK_STATUSES.contains(&s)
}

fn is_valid_priority(p: &str) -> bool {
    PRIORITIES.contains(&p)
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskParams {
    pub workspace_id: Option<String>,
}

async fn get_tasks(
    _claims: Claims,
    Query(params): Query<TaskParams>,
    State(pool): State<PgPool>,
) -> impl IntoResponse {
    let db_tasks_res: Result<Vec<DbTask>, sqlx::Error> = if let Some(ref ws_id) = params.workspace_id {
        sqlx::query_as::<_, DbTask>(
            r#"SELECT id, "workspaceId", title, description, status, priority, "startDate", "dueDate", address, attachments
               FROM "Task" WHERE "workspaceId" = $1"#
        )
        .bind(ws_id)
        .fetch_all(&pool)
        .await
    } else {
        sqlx::query_as::<_, DbTask>(
            r#"SELECT id, "workspaceId", title, description, status, priority, "startDate", "dueDate", address, attachments
               FROM "Task""#
        )
        .fetch_all(&pool)
        .await
    };

    let db_tasks = match db_tasks_res {
        Ok(t) => t,
        Err(e) => {
            eprintln!("Error fetching tasks: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Fehler beim Laden der Aufgaben." }))).into_response();
        }
    };

    let mut response_tasks = Vec::new();

    for task in db_tasks {
        // Fetch assignees
        let assignees_res: Result<Vec<String>, sqlx::Error> = sqlx::query_scalar(
            r#"SELECT "B" FROM "_TaskAssignees" WHERE "A" = $1"#
        )
        .bind(&task.id)
        .fetch_all(&pool)
        .await;

        let assignees = assignees_res.unwrap_or_default();

        // Fetch checklist
        let checklist_res: Result<Vec<ChecklistItem>, sqlx::Error> = sqlx::query_as::<_, ChecklistItem>(
            r#"SELECT id, "taskId", text, completed FROM "ChecklistItem" WHERE "taskId" = $1"#
        )
        .bind(&task.id)
        .fetch_all(&pool)
        .await;

        let checklist = checklist_res.unwrap_or_default();

        // Fetch comments
        let comments_res: Result<Vec<Comment>, sqlx::Error> = sqlx::query_as::<_, Comment>(
            r#"SELECT id, "taskId", "authorId", text, timestamp FROM "Comment" WHERE "taskId" = $1 ORDER BY timestamp ASC"#
        )
        .bind(&task.id)
        .fetch_all(&pool)
        .await;

        let comments = comments_res.unwrap_or_default()
            .into_iter()
            .map(|c| CommentResponse {
                id: c.id,
                author_id: c.author_id,
                text: c.text,
                timestamp: c.timestamp.and_utc().to_rfc3339(),
            })
            .collect();

        response_tasks.push(TaskResponse {
            id: task.id,
            workspace_id: task.workspace_id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            start_date: task.start_date,
            due_date: task.due_date,
            address: task.address,
            attachments: task.attachments,
            assignees,
            checklist,
            comments,
        });
    }

    (StatusCode::OK, Json(response_tasks)).into_response()
}

async fn create_task(
    _claims: Claims,
    State(pool): State<PgPool>,
    Json(payload): Json<CreateTaskDto>,
) -> impl IntoResponse {
    if payload.workspace_id.is_empty() || payload.title.is_empty() {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "Arbeitsbereich-ID und Titel sind erforderlich." }))).into_response();
    }

    let status = payload.status.unwrap_or_else(|| "planning".to_string());
    let priority = payload.priority.unwrap_or_else(|| "medium".to_string());

    if !is_valid_status(&status) {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "Ungültiger Status." }))).into_response();
    }
    if !is_valid_priority(&priority) {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "Ungültige Priorität." }))).into_response();
    }

    let today = Utc::now().format("%Y-%m-%d").to_string();
    let start_date = payload.start_date.unwrap_or_else(|| today.clone());
    let due_date = payload.due_date.unwrap_or_else(|| today.clone());
    let description = payload.description.unwrap_or_default();
    let address = payload.address.unwrap_or_default();
    let attachments = payload.attachments.unwrap_or_default();
    let id = uuid::Uuid::new_v4().to_string();

    let mut tx = match pool.begin().await {
        Ok(t) => t,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Transaktionsfehler" }))).into_response(),
    };

    // Insert task
    let insert_res = sqlx::query(
        r#"INSERT INTO "Task" (id, "workspaceId", title, description, status, priority, "startDate", "dueDate", address, attachments)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"#
    )
    .bind(&id)
    .bind(&payload.workspace_id)
    .bind(&payload.title)
    .bind(&description)
    .bind(&status)
    .bind(&priority)
    .bind(&start_date)
    .bind(&due_date)
    .bind(&address)
    .bind(&attachments)
    .execute(&mut *tx)
    .await;

    if let Err(e) = insert_res {
        eprintln!("Error inserting task: {:?}", e);
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Aufgabe konnte nicht erstellt werden." }))).into_response();
    }

    // Insert assignees
    let mut assignee_ids = Vec::new();
    if let Some(assignees) = payload.assignees {
        for user_id in assignees {
            let conn_res = sqlx::query(
                r#"INSERT INTO "_TaskAssignees" ("A", "B") VALUES ($1, $2)"#
            )
            .bind(&id)
            .bind(&user_id)
            .execute(&mut *tx)
            .await;

            if conn_res.is_ok() {
                assignee_ids.push(user_id);
            }
        }
    }

    // Insert checklist items
    let mut checklist_items = Vec::new();
    if let Some(checklist) = payload.checklist {
        for item in checklist {
            let item_id = uuid::Uuid::new_v4().to_string();
            let completed = item.completed.unwrap_or(false);
            let item_insert = sqlx::query_as::<_, ChecklistItem>(
                r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed)
                   VALUES ($1, $2, $3, $4)
                   RETURNING id, "taskId", text, completed"#
            )
            .bind(&item_id)
            .bind(&id)
            .bind(&item.text)
            .bind(completed)
            .fetch_one(&mut *tx)
            .await;

            if let Ok(inserted) = item_insert {
                checklist_items.push(inserted);
            }
        }
    }

    if let Err(e) = tx.commit().await {
        eprintln!("Commit error: {:?}", e);
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Fehler beim Bestätigen der Transaktion." }))).into_response();
    }

    let response = TaskResponse {
        id,
        workspace_id: payload.workspace_id,
        title: payload.title,
        description,
        status,
        priority,
        start_date,
        due_date,
        address,
        attachments,
        assignees: assignee_ids,
        checklist: checklist_items,
        comments: Vec::new(),
    };

    (StatusCode::CREATED, Json(response)).into_response()
}

async fn update_task(
    claims: Claims,
    Path(id): Path<String>,
    State(pool): State<PgPool>,
    Json(payload): Json<UpdateTaskDto>,
) -> impl IntoResponse {
    if let Some(ref status) = payload.status {
        if !is_valid_status(status) {
            return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "Ungültiger Status." }))).into_response();
        }
    }
    if let Some(ref priority) = payload.priority {
        if !is_valid_priority(priority) {
            return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "Ungültige Priorität." }))).into_response();
        }
    }

    let mut tx = match pool.begin().await {
        Ok(t) => t,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Transaktionsfehler beim Update" }))).into_response(),
    };

    // 1. Check if task exists
    let existing_task: Result<Option<DbTask>, sqlx::Error> = sqlx::query_as::<_, DbTask>(
        r#"SELECT id, "workspaceId", title, description, status, priority, "startDate", "dueDate", address, attachments
           FROM "Task" WHERE id = $1"#
    )
    .bind(&id)
    .fetch_optional(&mut *tx)
    .await;

    let existing = match existing_task {
        Ok(Some(t)) => t,
        Ok(None) => return (StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": "Aufgabe nicht gefunden" }))).into_response(),
        Err(e) => {
            eprintln!("Error checking task existence: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Datenbankfehler." }))).into_response();
        }
    };

    // 2. Update Checklist if provided
    if let Some(ref checklist) = payload.checklist {
        let delete_res = sqlx::query(r#"DELETE FROM "ChecklistItem" WHERE "taskId" = $1"#)
            .bind(&id)
            .execute(&mut *tx)
            .await;

        if let Err(e) = delete_res {
            eprintln!("Error deleting checklist items: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Fehler beim Aktualisieren der Checkliste." }))).into_response();
        }

        for item in checklist {
            let item_id = uuid::Uuid::new_v4().to_string();
            let completed = item.completed.unwrap_or(false);
            let insert_res = sqlx::query(
                r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, $2, $3, $4)"#
            )
            .bind(&item_id)
            .bind(&id)
            .bind(&item.text)
            .bind(completed)
            .execute(&mut *tx)
            .await;

            if let Err(e) = insert_res {
                eprintln!("Error inserting checklist item: {:?}", e);
                return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Fehler beim Einfügen eines Checklistenelements." }))).into_response();
            }
        }
    }

    // 3. Update Assignees if provided
    if let Some(ref assignees) = payload.assignees {
        let delete_res = sqlx::query(r#"DELETE FROM "_TaskAssignees" WHERE "A" = $1"#)
            .bind(&id)
            .execute(&mut *tx)
            .await;

        if let Err(e) = delete_res {
            eprintln!("Error deleting assignees links: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Fehler beim Aktualisieren der Zuweisungen." }))).into_response();
        }

        for user_id in assignees {
            let insert_res = sqlx::query(
                r#"INSERT INTO "_TaskAssignees" ("A", "B") VALUES ($1, $2)"#
            )
            .bind(&id)
            .bind(user_id)
            .execute(&mut *tx)
            .await;

            if let Err(e) = insert_res {
                eprintln!("Error inserting assignee link: {:?}", e);
                return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Fehler beim Zuweisen eines Benutzers." }))).into_response();
            }
        }
    }

    // 4. Update Comments if provided
    if let Some(ref comments) = payload.comments {
        for c in comments {
            if c.text.trim().is_empty() {
                continue;
            }

            let is_persisted = if let Some(ref comment_id) = c.id {
                // Client temporary IDs start with 'c-' or 'temp-'
                if comment_id.starts_with("c-") || comment_id.starts_with("temp-") {
                    false
                } else {
                    let comment_exists: Result<Option<String>, sqlx::Error> = sqlx::query_scalar(
                        r#"SELECT id FROM "Comment" WHERE id = $1"#
                    )
                    .bind(comment_id)
                    .fetch_optional(&mut *tx)
                    .await;
                    comment_exists.unwrap_or(None).is_some()
                }
            } else {
                false
            };

            if !is_persisted {
                let comment_id = uuid::Uuid::new_v4().to_string();
                let timestamp = c.timestamp
                    .as_ref()
                    .and_then(|t| chrono::DateTime::parse_from_rfc3339(t).ok())
                    .map(|t| t.naive_utc())
                    .unwrap_or_else(|| Utc::now().naive_utc());

                let insert_res = sqlx::query(
                    r#"INSERT INTO "Comment" (id, "taskId", "authorId", text, timestamp) VALUES ($1, $2, $3, $4, $5)"#
                )
                .bind(&comment_id)
                .bind(&id)
                .bind(&claims.id) // The author is always taken from the JWT claims
                .bind(c.text.trim())
                .bind(timestamp)
                .execute(&mut *tx)
                .await;

                if let Err(e) = insert_res {
                    eprintln!("Error inserting comment: {:?}", e);
                    return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Fehler beim Hinzufügen des Kommentars." }))).into_response();
                }
            }
        }
    }

    // 5. Update Task columns
    let title = payload.title.unwrap_or(existing.title);
    let description = payload.description.unwrap_or(existing.description);
    let status = payload.status.unwrap_or(existing.status);
    let priority = payload.priority.unwrap_or(existing.priority);
    let start_date = payload.start_date.unwrap_or(existing.start_date);
    let due_date = payload.due_date.unwrap_or(existing.due_date);
    let address = payload.address.unwrap_or(existing.address);
    let attachments = payload.attachments.unwrap_or(existing.attachments);

    let update_res = sqlx::query(
        r#"UPDATE "Task"
           SET title = $1, description = $2, status = $3, priority = $4, "startDate" = $5, "dueDate" = $6, address = $7, attachments = $8
           WHERE id = $9"#
    )
    .bind(&title)
    .bind(&description)
    .bind(&status)
    .bind(&priority)
    .bind(&start_date)
    .bind(&due_date)
    .bind(&address)
    .bind(&attachments)
    .bind(&id)
    .execute(&mut *tx)
    .await;

    if let Err(e) = update_res {
        eprintln!("Error updating Task row: {:?}", e);
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Fehler beim Aktualisieren der Aufgabe." }))).into_response();
    }

    if let Err(e) = tx.commit().await {
        eprintln!("Commit error: {:?}", e);
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Transaktionsfehler beim Abschließen des Updates." }))).into_response();
    }

    // Fetch and return the fully updated task
    let updated_assignees: Vec<String> = sqlx::query_scalar(
        r#"SELECT "B" FROM "_TaskAssignees" WHERE "A" = $1"#
    )
    .bind(&id)
    .fetch_all(&pool)
    .await
    .unwrap_or_default();

    let updated_checklist: Vec<ChecklistItem> = sqlx::query_as::<_, ChecklistItem>(
        r#"SELECT id, "taskId", text, completed FROM "ChecklistItem" WHERE "taskId" = $1"#
    )
    .bind(&id)
    .fetch_all(&pool)
    .await
    .unwrap_or_default();

    let updated_comments_raw: Vec<Comment> = sqlx::query_as::<_, Comment>(
        r#"SELECT id, "taskId", "authorId", text, timestamp FROM "Comment" WHERE "taskId" = $1 ORDER BY timestamp ASC"#
    )
    .bind(&id)
    .fetch_all(&pool)
    .await
    .unwrap_or_default();

    let updated_comments = updated_comments_raw
        .into_iter()
        .map(|c| CommentResponse {
            id: c.id,
            author_id: c.author_id,
            text: c.text,
            timestamp: c.timestamp.and_utc().to_rfc3339(),
        })
        .collect();

    let response = TaskResponse {
        id,
        workspace_id: existing.workspace_id,
        title,
        description,
        status,
        priority,
        start_date,
        due_date,
        address,
        attachments,
        assignees: updated_assignees,
        checklist: updated_checklist,
        comments: updated_comments,
    };

    (StatusCode::OK, Json(response)).into_response()
}

async fn delete_task(
    _claims: Claims,
    Path(id): Path<String>,
    State(pool): State<PgPool>,
) -> impl IntoResponse {
    let delete_res = sqlx::query(r#"DELETE FROM "Task" WHERE id = $1"#)
        .bind(&id)
        .execute(&pool)
        .await;

    match delete_res {
        Ok(_) => (StatusCode::OK, Json(serde_json::json!({ "success": true, "message": "Aufgabe gelöscht." }))).into_response(),
        Err(e) => {
            eprintln!("Error deleting task: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Aufgabe konnte nicht gelöscht werden." }))).into_response()
        }
    }
}

async fn add_comment(
    claims: Claims,
    Path(id): Path<String>,
    State(pool): State<PgPool>,
    Json(payload): Json<CreateCommentDto>,
) -> impl IntoResponse {
    if payload.text.trim().is_empty() {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "Kommentartext ist erforderlich." }))).into_response();
    }

    // Verify if task exists
    let exists: Result<Option<String>, sqlx::Error> = sqlx::query_scalar(
        r#"SELECT id FROM "Task" WHERE id = $1"#
    )
    .bind(&id)
    .fetch_optional(&pool)
    .await;

    match exists {
        Ok(None) => return (StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": "Aufgabe nicht gefunden" }))).into_response(),
        Err(e) => {
            eprintln!("Error checking task existence: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Datenbankfehler." }))).into_response();
        }
        _ => {}
    }

    let comment_id = uuid::Uuid::new_v4().to_string();
    let now = Utc::now().naive_utc();

    let insert_res = sqlx::query_as::<_, Comment>(
        r#"INSERT INTO "Comment" (id, "taskId", "authorId", text, timestamp)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, "taskId", "authorId", text, timestamp"#
    )
    .bind(&comment_id)
    .bind(&id)
    .bind(&claims.id)
    .bind(payload.text.trim())
    .bind(now)
    .fetch_one(&pool)
    .await;

    match insert_res {
        Ok(comment) => {
            let res = CommentResponse {
                id: comment.id,
                author_id: comment.author_id,
                text: comment.text,
                timestamp: comment.timestamp.and_utc().to_rfc3339(),
            };
            (StatusCode::CREATED, Json(res)).into_response()
        }
        Err(e) => {
            eprintln!("Error inserting comment: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Kommentar konnte nicht hinzugefügt werden." }))).into_response()
        }
    }
}

async fn bulk_status(
    _claims: Claims,
    State(pool): State<PgPool>,
    Json(payload): Json<BulkStatusDto>,
) -> impl IntoResponse {
    if payload.task_ids.is_empty() {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "Aufgaben-IDs und gültiger Status sind erforderlich." }))).into_response();
    }
    if !is_valid_status(&payload.status) {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "Ungültiger Status." }))).into_response();
    }

    let update_res = sqlx::query(
        r#"UPDATE "Task" SET status = $1 WHERE id = ANY($2)"#
    )
    .bind(&payload.status)
    .bind(&payload.task_ids)
    .execute(&pool)
    .await;

    match update_res {
        Ok(_) => (StatusCode::OK, Json(serde_json::json!({ "success": true, "message": "Status für Aufgaben aktualisiert." }))).into_response(),
        Err(e) => {
            eprintln!("Bulk status update error: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Bulk-Statusaktualisierung fehlgeschlagen." }))).into_response()
        }
    }
}

async fn bulk_delete(
    _claims: Claims,
    State(pool): State<PgPool>,
    Json(payload): Json<BulkDeleteDto>,
) -> impl IntoResponse {
    if payload.task_ids.is_empty() {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "Aufgaben-IDs sind erforderlich." }))).into_response();
    }

    let delete_res = sqlx::query(
        r#"DELETE FROM "Task" WHERE id = ANY($1)"#
    )
    .bind(&payload.task_ids)
    .execute(&pool)
    .await;

    match delete_res {
        Ok(_) => (StatusCode::OK, Json(serde_json::json!({ "success": true, "message": "Aufgaben erfolgreich gelöscht." }))).into_response(),
        Err(e) => {
            eprintln!("Bulk delete error: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Bulk-Löschen fehlgeschlagen." }))).into_response()
        }
    }
}

pub fn router(pool: PgPool) -> Router {
    Router::new()
        .route("/", get(get_tasks).post(create_task))
        .route("/:id", put(update_task).delete(delete_task))
        .route("/:id/comments", post(add_comment))
        .route("/bulk/status", put(bulk_status))
        .route("/bulk/delete", post(bulk_delete))
        .with_state(pool)
}
