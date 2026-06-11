use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::{DateTime, Utc, NaiveDateTime};

// --- User Models ---

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub id: String,
    pub name: String,
    pub email: String,
    #[serde(skip_serializing)]
    #[sqlx(rename = "passwordHash")]
    pub password_hash: String,
    pub role: String,
    #[sqlx(rename = "isAdmin")]
    pub is_admin: bool,
    #[sqlx(rename = "avatarInitials")]
    pub avatar_initials: String,
    pub color: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserResponse {
    pub id: String,
    pub name: String,
    pub email: String,
    pub role: String,
    pub is_admin: bool,
    pub avatar_initials: String,
    pub color: String,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            is_admin: user.is_admin,
            avatar_initials: user.avatar_initials,
            color: user.color,
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateUserDto {
    pub name: String,
    pub email: String,
    pub password: Option<String>,
    pub role: String,
    pub avatar_initials: Option<String>,
    pub color: Option<String>,
    pub is_admin: Option<bool>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateUserDto {
    pub name: String,
    pub email: String,
    pub password: Option<String>,
    pub role: String,
    pub avatar_initials: Option<String>,
    pub color: Option<String>,
    pub is_admin: Option<bool>,
}

// --- Workspace Models ---

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Workspace {
    pub id: String,
    pub name: String,
    pub description: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateWorkspaceDto {
    pub name: String,
    pub description: Option<String>,
}

// --- Task Models ---

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DbTask {
    pub id: String,
    #[sqlx(rename = "workspaceId")]
    pub workspace_id: String,
    pub title: String,
    pub description: String,
    pub status: String,
    pub priority: String,
    #[sqlx(rename = "startDate")]
    pub start_date: String,
    #[sqlx(rename = "dueDate")]
    pub due_date: String,
    pub address: String,
    pub attachments: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TaskResponse {
    pub id: String,
    pub workspace_id: String,
    pub title: String,
    pub description: String,
    pub status: String,
    pub priority: String,
    pub start_date: String,
    pub due_date: String,
    pub address: String,
    pub attachments: Vec<String>,
    pub assignees: Vec<String>, // list of user IDs
    pub checklist: Vec<ChecklistItem>,
    pub comments: Vec<CommentResponse>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTaskDto {
    pub workspace_id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: Option<String>,
    pub priority: Option<String>,
    pub start_date: Option<String>,
    pub due_date: Option<String>,
    pub address: Option<String>,
    pub assignees: Option<Vec<String>>,
    pub checklist: Option<Vec<CreateChecklistItemDto>>,
    pub attachments: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTaskDto {
    pub title: Option<String>,
    pub description: Option<String>,
    pub status: Option<String>,
    pub priority: Option<String>,
    pub start_date: Option<String>,
    pub due_date: Option<String>,
    pub address: Option<String>,
    pub assignees: Option<Vec<String>>,
    pub checklist: Option<Vec<CreateChecklistItemDto>>,
    pub comments: Option<Vec<CommentInputDto>>,
    pub attachments: Option<Vec<String>>,
}

// --- Checklist Item Models ---

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ChecklistItem {
    pub id: String,
    #[sqlx(rename = "taskId")]
    pub task_id: String,
    pub text: String,
    pub completed: bool,
}

#[derive(Debug, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CreateChecklistItemDto {
    pub text: String,
    pub completed: Option<bool>,
}

// --- Comment Models ---

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Comment {
    pub id: String,
    #[sqlx(rename = "taskId")]
    pub task_id: String,
    #[sqlx(rename = "authorId")]
    pub author_id: String,
    pub text: String,
    pub timestamp: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CommentResponse {
    pub id: String,
    pub author_id: String,
    pub text: String,
    pub timestamp: String,
}

#[derive(Debug, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CommentInputDto {
    pub id: Option<String>,
    pub text: String,
    pub timestamp: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateCommentDto {
    pub text: String,
}

// --- Ticket Models ---

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Ticket {
    pub id: String,
    pub title: String,
    pub description: String,
    pub reporter: String,
    pub category: String,
    pub priority: String,
    pub status: String,
    #[sqlx(rename = "createdAt")]
    pub created_at: NaiveDateTime,
    #[sqlx(rename = "slaHours")]
    pub sla_hours: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TicketResponse {
    pub id: String,
    pub title: String,
    pub description: String,
    pub reporter: String,
    pub category: String,
    pub priority: String,
    pub status: String,
    pub created_at: String,
    pub sla_hours: i32,
}

impl From<Ticket> for TicketResponse {
    fn from(t: Ticket) -> Self {
        Self {
            id: t.id,
            title: t.title,
            description: t.description,
            reporter: t.reporter,
            category: t.category,
            priority: t.priority,
            status: t.status,
            created_at: t.created_at.and_utc().to_rfc3339(),
            sla_hours: t.sla_hours,
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTicketDto {
    pub title: String,
    pub description: String,
    pub reporter: String,
    pub category: Option<String>,
    pub priority: Option<String>,
    pub sla_hours: Option<i32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTicketStatusDto {
    pub status: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConvertTicketDto {
    pub workspace_id: String,
    pub assignee_id: String,
    pub due_date: String,
}

// --- Bulk Operations ---

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BulkStatusDto {
    pub task_ids: Vec<String>,
    pub status: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BulkDeleteDto {
    pub task_ids: Vec<String>,
}
