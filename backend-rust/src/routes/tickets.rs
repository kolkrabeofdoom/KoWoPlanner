use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post, put},
    Json, Router,
};
use sqlx::{PgPool, Postgres, Transaction};
use chrono::Utc;

use crate::{
    middleware::auth::Claims,
    models::{ConvertTicketDto, CreateTicketDto, Ticket, TicketResponse, UpdateTicketStatusDto, TaskResponse},
};

const PRIORITIES: &[&str] = &["low", "medium", "high", "urgent"];
const TICKET_CATEGORIES: &[&str] = &["Hardware", "Software", "Netzwerk", "Berechtigungen"];

fn is_valid_priority(p: &str) -> bool {
    PRIORITIES.contains(&p)
}

fn is_valid_category(c: &str) -> bool {
    TICKET_CATEGORIES.contains(&c)
}

async fn get_tickets(
    _claims: Claims,
    State(pool): State<PgPool>,
) -> impl IntoResponse {
    let tickets_res: Result<Vec<Ticket>, sqlx::Error> = sqlx::query_as::<_, Ticket>(
        r#"SELECT id, title, description, reporter, category, priority, status, "createdAt", "slaHours"
           FROM "Ticket"
           ORDER BY "createdAt" DESC"#
    )
    .fetch_all(&pool)
    .await;

    match tickets_res {
        Ok(tickets) => {
            let res: Vec<TicketResponse> = tickets.into_iter().map(TicketResponse::from).collect();
            (StatusCode::OK, Json(res)).into_response()
        }
        Err(e) => {
            eprintln!("Error fetching tickets: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Fehler beim Laden der Support-Tickets." }))).into_response()
        }
    }
}

async fn create_ticket(
    _claims: Claims,
    State(pool): State<PgPool>,
    Json(payload): Json<CreateTicketDto>,
) -> impl IntoResponse {
    if payload.title.is_empty() || payload.reporter.is_empty() || payload.description.is_empty() {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "Titel, Melder und Beschreibung sind erforderlich." }))).into_response();
    }

    let category = payload.category.unwrap_or_else(|| "Hardware".to_string());
    let priority = payload.priority.unwrap_or_else(|| "medium".to_string());

    if !is_valid_category(&category) {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "Ungültige Kategorie." }))).into_response();
    }

    if !is_valid_priority(&priority) {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "Ungültige Priorität." }))).into_response();
    }

    let sla_hours = payload.sla_hours.unwrap_or(24);
    let id = format!("t-{}", uuid::Uuid::new_v4().to_string().split('-').next().unwrap_or("gen"));
    let now = Utc::now().naive_utc();

    let insert_res = sqlx::query_as::<_, Ticket>(
        r#"INSERT INTO "Ticket" (id, title, description, reporter, category, priority, status, "createdAt", "slaHours")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id, title, description, reporter, category, priority, status, "createdAt", "slaHours""#
    )
    .bind(&id)
    .bind(&payload.title)
    .bind(&payload.description)
    .bind(&payload.reporter)
    .bind(&category)
    .bind(&priority)
    .bind("open")
    .bind(now)
    .bind(sla_hours)
    .fetch_one(&pool)
    .await;

    match insert_res {
        Ok(ticket) => (StatusCode::CREATED, Json(TicketResponse::from(ticket))).into_response(),
        Err(e) => {
            eprintln!("Error creating ticket: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Support-Ticket konnte nicht erstellt werden." }))).into_response()
        }
    }
}

async fn update_ticket_status(
    _claims: Claims,
    Path(id): Path<String>,
    State(pool): State<PgPool>,
    Json(payload): Json<UpdateTicketStatusDto>,
) -> impl IntoResponse {
    let allowed_statuses = ["open", "in_progress", "resolved"];
    if !allowed_statuses.contains(&payload.status.as_str()) {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "Gültiger Status ist erforderlich." }))).into_response();
    }

    let update_res = sqlx::query_as::<_, Ticket>(
        r#"UPDATE "Ticket"
           SET status = $1
           WHERE id = $2
           RETURNING id, title, description, reporter, category, priority, status, "createdAt", "slaHours""#
    )
    .bind(&payload.status)
    .bind(&id)
    .fetch_one(&pool)
    .await;

    match update_res {
        Ok(ticket) => (StatusCode::OK, Json(TicketResponse::from(ticket))).into_response(),
        Err(e) => {
            eprintln!("Error updating ticket status: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Ticket-Status konnte nicht aktualisiert werden." }))).into_response()
        }
    }
}

async fn convert_ticket(
    _claims: Claims,
    Path(id): Path<String>,
    State(pool): State<PgPool>,
    Json(payload): Json<ConvertTicketDto>,
) -> impl IntoResponse {
    if payload.workspace_id.is_empty() || payload.assignee_id.is_empty() || payload.due_date.is_empty() {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": "Projekt-ID, Bearbeiter-ID und Fälligkeit sind erforderlich." }))).into_response();
    }

    // Begin Transaction
    let mut tx: Transaction<'_, Postgres> = match pool.begin().await {
        Ok(t) => t,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Transaktion konnte nicht gestartet werden." }))).into_response(),
    };

    // 1. Fetch ticket
    let ticket_res: Result<Option<Ticket>, sqlx::Error> = sqlx::query_as::<_, Ticket>(
        r#"SELECT id, title, description, reporter, category, priority, status, "createdAt", "slaHours"
           FROM "Ticket" WHERE id = $1"#
    )
    .bind(&id)
    .fetch_optional(&mut *tx)
    .await;

    let ticket = match ticket_res {
        Ok(Some(t)) => t,
        Ok(None) => return (StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": "Ticket nicht gefunden." }))).into_response(),
        Err(e) => {
            eprintln!("Error fetching ticket for convert: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Fehler beim Laden des Tickets." }))).into_response();
        }
    };

    // 2. Create task
    let task_id = uuid::Uuid::new_v4().to_string();
    let task_title = format!("Ticket #{}: {}", &ticket.id[..std::cmp::min(ticket.id.len(), 8)], ticket.title);
    let task_desc = format!("Ticket-Beschreibung:\n{}\n\nGemeldet von: {}", ticket.description, ticket.reporter);
    let today_str = Utc::now().format("%Y-%m-%d").to_string();

    let task_insert_res = sqlx::query(
        r#"INSERT INTO "Task" (id, "workspaceId", title, description, status, priority, "startDate", "dueDate", address, attachments)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"#
    )
    .bind(&task_id)
    .bind(&payload.workspace_id)
    .bind(&task_title)
    .bind(&task_desc)
    .bind("planning")
    .bind(&ticket.priority)
    .bind(&today_str)
    .bind(&payload.due_date)
    .bind("Support-Ticket")
    .bind(&Vec::<String>::new())
    .execute(&mut *tx)
    .await;

    if let Err(e) = task_insert_res {
        eprintln!("Error inserting converted task: {:?}", e);
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Aufgabe konnte nicht erstellt werden." }))).into_response();
    }

    // 3. Connect assignee
    let assignee_connect_res = sqlx::query(
        r#"INSERT INTO "_TaskAssignees" ("A", "B") VALUES ($1, $2)"#
    )
    .bind(&task_id)
    .bind(&payload.assignee_id)
    .execute(&mut *tx)
    .await;

    if let Err(e) = assignee_connect_res {
        eprintln!("Error connecting assignee for converted task: {:?}", e);
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Zuweisung des Bearbeiters fehlgeschlagen." }))).into_response();
    }

    // 4. Mark ticket as resolved
    let ticket_update_res = sqlx::query_as::<_, Ticket>(
        r#"UPDATE "Ticket"
           SET status = 'resolved'
           WHERE id = $1
           RETURNING id, title, description, reporter, category, priority, status, "createdAt", "slaHours""#
    )
    .bind(&id)
    .fetch_one(&mut *tx)
    .await;

    let updated_ticket = match ticket_update_res {
        Ok(t) => t,
        Err(e) => {
            eprintln!("Error resolving converted ticket: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Ticket konnte nicht gelöst werden." }))).into_response();
        }
    };

    // Commit Transaction
    if let Err(e) = tx.commit().await {
        eprintln!("Transaction commit error: {:?}", e);
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": "Transaktionsfehler beim Speichern." }))).into_response();
    }

    // Build task response mapping what the frontend expects
    let task_response = TaskResponse {
        id: task_id,
        workspace_id: payload.workspace_id,
        title: task_title,
        description: task_desc,
        status: "planning".to_string(),
        priority: ticket.priority,
        start_date: today_str,
        due_date: payload.due_date,
        address: "Support-Ticket".to_string(),
        attachments: Vec::new(),
        assignees: vec![payload.assignee_id],
        checklist: Vec::new(),
        comments: Vec::new(),
    };

    (StatusCode::OK, Json(serde_json::json!({
        "success": true,
        "ticket": TicketResponse::from(updated_ticket),
        "task": task_response
    }))).into_response()
}

pub fn router(pool: PgPool) -> Router {
    Router::new()
        .route("/", get(get_tickets).post(create_ticket))
        .route("/:id/status", put(update_ticket_status))
        .route("/:id/convert", post(convert_ticket))
        .with_state(pool)
}
