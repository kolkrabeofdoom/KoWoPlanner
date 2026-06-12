use sqlx::PgPool;
use bcrypt::{hash, DEFAULT_COST};
use chrono::{DateTime, Utc};
use backend_rust::{config, db};

#[tokio::main]
async fn main() {
    println!("Loading configuration...");
    let config = config::Config::from_env();

    println!("Connecting to database...");
    let pool = db::init_pool(&config.database_url)
        .await
        .expect("Failed to connect to database");

    println!("Clearing database...");
    sqlx::query(r#"DELETE FROM "Comment""#).execute(&pool).await.unwrap();
    sqlx::query(r#"DELETE FROM "ChecklistItem""#).execute(&pool).await.unwrap();
    sqlx::query(r#"DELETE FROM "Task""#).execute(&pool).await.unwrap();
    sqlx::query(r#"DELETE FROM "Ticket""#).execute(&pool).await.unwrap();
    sqlx::query(r#"DELETE FROM "Workspace""#).execute(&pool).await.unwrap();
    sqlx::query(r#"DELETE FROM "User""#).execute(&pool).await.unwrap();

    println!("Seeding users...");
    let password_hash = hash("PASSWORT", DEFAULT_COST).unwrap();

    // Michel Foucault (Admin)
    sqlx::query(
        r#"INSERT INTO "User" (id, name, email, "passwordHash", role, "isAdmin", "avatarInitials", color)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)"#
    )
    .bind("user-1")
    .bind("Michel Foucault")
    .bind("michel.foucault@verbietetdieafd.de")
    .bind(&password_hash)
    .bind("IT-Leiter KOWOBAU")
    .bind(true)
    .bind("MF")
    .bind("#0ea5e9")
    .execute(&pool)
    .await
    .unwrap();

    // Jacques Derrida
    sqlx::query(
        r#"INSERT INTO "User" (id, name, email, "passwordHash", role, "isAdmin", "avatarInitials", color)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)"#
    )
    .bind("user-2")
    .bind("Jacques Derrida")
    .bind("jacques.derrida@verbietetdieafd.de")
    .bind(&password_hash)
    .bind("Systemadministratorin")
    .bind(false)
    .bind("JD")
    .bind("#8b5cf6")
    .execute(&pool)
    .await
    .unwrap();

    // Gilles Deleuze
    sqlx::query(
        r#"INSERT INTO "User" (id, name, email, "passwordHash", role, "isAdmin", "avatarInitials", color)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)"#
    )
    .bind("user-3")
    .bind("Gilles Deleuze")
    .bind("gilles.deleuze@verbietetdieafd.de")
    .bind(&password_hash)
    .bind("IT-Support & Hardware")
    .bind(false)
    .bind("GD")
    .bind("#10b981")
    .execute(&pool)
    .await
    .unwrap();

    // Judith Butler
    sqlx::query(
        r#"INSERT INTO "User" (id, name, email, "passwordHash", role, "isAdmin", "avatarInitials", color)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)"#
    )
    .bind("user-4")
    .bind("Judith Butler")
    .bind("judith.butler@verbietetdieafd.de")
    .bind(&password_hash)
    .bind("Softwareentwicklerin")
    .bind(false)
    .bind("JB")
    .bind("#f59e0b")
    .execute(&pool)
    .await
    .unwrap();

    println!("Seeding workspaces...");
    sqlx::query(
        r#"INSERT INTO "Workspace" (id, name, description)
           VALUES ($1, $2, $3)"#
    )
    .bind("ws-1")
    .bind("ERP & SAP S/4HANA Migration")
    .bind("Kern-Migrationsprojekt für die Mieterdatenbank, Buchhaltungsmodule und SAP RE-FX Integration.")
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(
        r#"INSERT INTO "Workspace" (id, name, description)
           VALUES ($1, $2, $3)"#
    )
    .bind("ws-2")
    .bind("Mieter-Portal & Mobile App")
    .bind("Entwicklung und Launch der neuen digitalen Mieterservices für Schadensmeldungen und Mietverwaltung.")
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(
        r#"INSERT INTO "Workspace" (id, name, description)
           VALUES ($1, $2, $3)"#
    )
    .bind("ws-3")
    .bind("IT-Infrastruktur & Sicherheit")
    .bind("Server-Virtualisierung, Firewall-Cluster-Upgrades, Cloud-Transit und Hardware-Rollouts.")
    .execute(&pool)
    .await
    .unwrap();

    println!("Seeding tasks...");

    // Task 101
    sqlx::query(
        r#"INSERT INTO "Task" (id, "workspaceId", title, description, status, priority, "startDate", "dueDate", address, attachments)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"#
    )
    .bind("task-101")
    .bind("ws-1")
    .bind("Datenmigration Mieterkontakte SAP RE-FX")
    .bind("Validierung und Bereinigung der Mieterstammdaten für den Import in das neue SAP S/4HANA RE-FX Modul. Abstimmung der Mapping-Tabelle.")
    .bind("in_progress")
    .bind("high")
    .bind("2026-06-05")
    .bind("2026-06-15")
    .bind("SAP-Sandkasten / Zentrale")
    .bind(&Vec::<String>::new())
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(r#"INSERT INTO "_TaskAssignees" ("A", "B") VALUES ('task-101', 'user-3')"#).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "_TaskAssignees" ("A", "B") VALUES ('task-101', 'user-4')"#).execute(&pool).await.unwrap();

    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-101', 'Dubletten in Alt-Daten identifizieren', true)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-101', 'Mapping-Tabelle für RE-FX Felder erstellen', true)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-101', 'Testimport von 100 Datensätzen durchführen', false)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-101', 'Freigabe durch IT-Leitung einholen', false)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();

    sqlx::query(r#"INSERT INTO "Comment" (id, "taskId", "authorId", text, timestamp) VALUES ($1, 'task-101', 'user-4', 'Ich habe den Testimport vorbereitet. Die csv-Datei liegt im Ordner.', $2)"#).bind(uuid::Uuid::new_v4().to_string()).bind(DateTime::parse_from_rfc3339("2026-06-09T09:30:00Z").unwrap().naive_utc()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "Comment" (id, "taskId", "authorId", text, timestamp) VALUES ($1, 'task-101', 'user-1', 'Sehr gut. Ich schaue mir das Mapping morgen früh an.', $2)"#).bind(uuid::Uuid::new_v4().to_string()).bind(DateTime::parse_from_rfc3339("2026-06-10T14:45:00Z").unwrap().naive_utc()).execute(&pool).await.unwrap();


    // Task 102
    sqlx::query(
        r#"INSERT INTO "Task" (id, "workspaceId", title, description, status, priority, "startDate", "dueDate", address, attachments)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"#
    )
    .bind("task-102")
    .bind("ws-1")
    .bind("Schnittstelle für Nebenkostenabrechnung definieren")
    .bind("Spezifikation der REST-API zur Übergabe der Verbrauchswerte an das SAP-System. Abstimmung mit dem Messdienstleister.")
    .bind("planning")
    .bind("medium")
    .bind("2026-06-11")
    .bind("2026-06-20")
    .bind("REST-API / Service Bus")
    .bind(&Vec::<String>::new())
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(r#"INSERT INTO "_TaskAssignees" ("A", "B") VALUES ('task-102', 'user-1')"#).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "_TaskAssignees" ("A", "B") VALUES ('task-102', 'user-4')"#).execute(&pool).await.unwrap();

    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-102', 'Schnittstellendokumentation anfordern', false)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-102', 'Datenstrukturen definieren (JSON-Schema)', false)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-102', 'Authentifizierungs-Konzept abstimmen', false)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();

    sqlx::query(r#"INSERT INTO "Comment" (id, "taskId", "authorId", text, timestamp) VALUES ($1, 'task-102', 'user-4', 'Der Messdienstleister hat uns die Test-Endpunkte übermittelt.', $2)"#).bind(uuid::Uuid::new_v4().to_string()).bind(DateTime::parse_from_rfc3339("2026-06-10T08:15:00Z").unwrap().naive_utc()).execute(&pool).await.unwrap();


    // Task 103
    sqlx::query(
        r#"INSERT INTO "Task" (id, "workspaceId", title, description, status, priority, "startDate", "dueDate", address, attachments)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"#
    )
    .bind("task-103")
    .bind("ws-1")
    .bind("Datenbank-Performance nach SAP-Import prüfen")
    .bind("Nach dem Einspielen der Altdaten bricht die Performance der Abfragen ein. Indexe müssen überprüft und optimiert werden.")
    .bind("in_progress")
    .bind("urgent")
    .bind("2026-06-10")
    .bind("2026-06-12")
    .bind("SAP DB Cluster / Serverraum")
    .bind(&Vec::<String>::new())
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(r#"INSERT INTO "_TaskAssignees" ("A", "B") VALUES ('task-103', 'user-4')"#).execute(&pool).await.unwrap();

    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-103', 'Datenbank-Auslastung loggen', true)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-103', 'Fehlende Primär- und Fremdschlüssel-Indizes anlegen', true)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-103', 'Queries auf Tabellen-Scans analysieren', false)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-103', 'Abfrage-Laufzeiten vergleichen', false)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();

    sqlx::query(r#"INSERT INTO "Comment" (id, "taskId", "authorId", text, timestamp) VALUES ($1, 'task-103', 'user-2', 'Es fehlte ein Index auf der Tabelle V_KUN_ADR. Query-Zeit sank von 12s auf 80ms.', $2)"#).bind(uuid::Uuid::new_v4().to_string()).bind(DateTime::parse_from_rfc3339("2026-06-10T17:20:00Z").unwrap().naive_utc()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "Comment" (id, "taskId", "authorId", text, timestamp) VALUES ($1, 'task-103', 'user-1', 'Hervorragende Arbeit! Bitte auch die restlichen RE-FX Ansichten prüfen.', $2)"#).bind(uuid::Uuid::new_v4().to_string()).bind(DateTime::parse_from_rfc3339("2026-06-11T06:45:00Z").unwrap().naive_utc()).execute(&pool).await.unwrap();


    // Task 104
    sqlx::query(
        r#"INSERT INTO "Task" (id, "workspaceId", title, description, status, priority, "startDate", "dueDate", address, attachments)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"#
    )
    .bind("task-104")
    .bind("ws-1")
    .bind("ERP-Altsystem in Nur-Lese-Modus versetzen")
    .bind("Das alte d.3 Archivsystem und die Access-Datenbank müssen nach dem Go-Live für Schreibzugriffe gesperrt werden.")
    .bind("completed")
    .bind("low")
    .bind("2026-05-15")
    .bind("2026-06-08")
    .bind("Archivserver / Alt-Infrastruktur")
    .bind(&Vec::<String>::new())
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(r#"INSERT INTO "_TaskAssignees" ("A", "B") VALUES ('task-104', 'user-1')"#).execute(&pool).await.unwrap();

    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-104', 'Schreibberechtigungen im AD entziehen', true)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-104', 'Datenbankschemata auf READ-ONLY setzen', true)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-104', 'Zugriffsrechte für Revision prüfen', true)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();

    sqlx::query(r#"INSERT INTO "Comment" (id, "taskId", "authorId", text, timestamp) VALUES ($1, 'task-104', 'user-2', 'Berechtigungen wurden angepasst. Nur-Lese-Zugriff für Revisoren ist aktiv.', $2)"#).bind(uuid::Uuid::new_v4().to_string()).bind(DateTime::parse_from_rfc3339("2026-06-08T16:00:00Z").unwrap().naive_utc()).execute(&pool).await.unwrap();


    // Task 105
    sqlx::query(
        r#"INSERT INTO "Task" (id, "workspaceId", title, description, status, priority, "startDate", "dueDate", address, attachments)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"#
    )
    .bind("task-105")
    .bind("ws-1")
    .bind("Active Directory Bereinigung")
    .bind("Bereinigung von verwaisten Benutzerkonten und Sicherheitsgruppen im KOWOBAU Active Directory.")
    .bind("planning")
    .bind("low")
    .bind("2026-06-15")
    .bind("2026-06-25")
    .bind("Domain Controller / IT-Büro")
    .bind(&Vec::<String>::new())
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(r#"INSERT INTO "_TaskAssignees" ("A", "B") VALUES ('task-105', 'user-3')"#).execute(&pool).await.unwrap();

    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-105', 'Inaktive User (>90 Tage) deaktivieren', false)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-105', 'Leere Sicherheitsgruppen löschen', false)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-105', '2FA für Admin-Konten erzwingen', false)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();


    // Task 201
    sqlx::query(
        r#"INSERT INTO "Task" (id, "workspaceId", title, description, status, priority, "startDate", "dueDate", address, attachments)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"#
    )
    .bind("task-201")
    .bind("ws-2")
    .bind("UI/UX Mockups für Mieter-App freigeben")
    .bind("Abstimmung der Screen-Layouts für den Schadensmeldungs-Prozess und die Heizkostenanzeige in der neuen App.")
    .bind("in_progress")
    .bind("medium")
    .bind("2026-06-01")
    .bind("2026-06-18")
    .bind("Figma Cloud / Online")
    .bind(&Vec::<String>::new())
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(r#"INSERT INTO "_TaskAssignees" ("A", "B") VALUES ('task-201', 'user-1')"#).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "_TaskAssignees" ("A", "B") VALUES ('task-201', 'user-2')"#).execute(&pool).await.unwrap();

    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-201', 'Feedback der Kundenbetreuung sammeln', true)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-201', 'Barrierefreiheit nach WCAG 2.1 prüfen', false)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-201', 'Freigabemeeting mit Vorstand planen', false)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();

    sqlx::query(r#"INSERT INTO "Comment" (id, "taskId", "authorId", text, timestamp) VALUES ($1, 'task-201', 'user-2', 'Das Feedback der Kundenbetreuung war positiv. Die Schriftgrößen wurden vergrößert.', $2)"#).bind(uuid::Uuid::new_v4().to_string()).bind(DateTime::parse_from_rfc3339("2026-06-08T11:20:00Z").unwrap().naive_utc()).execute(&pool).await.unwrap();


    // Task 202
    sqlx::query(
        r#"INSERT INTO "Task" (id, "workspaceId", title, description, status, priority, "startDate", "dueDate", address, attachments)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"#
    )
    .bind("task-202")
    .bind("ws-2")
    .bind("Push-Notification-Service in App integrieren")
    .bind("Einrichtung von Firebase Cloud Messaging (FCM) für Android und Apple Push Notification Service (APNs) für iOS.")
    .bind("planning")
    .bind("high")
    .bind("2026-06-10")
    .bind("2026-06-30")
    .bind("Firebase Console / iOS App Store")
    .bind(&Vec::<String>::new())
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(r#"INSERT INTO "_TaskAssignees" ("A", "B") VALUES ('task-202', 'user-4')"#).execute(&pool).await.unwrap();

    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-202', 'Zertifikate im Apple Developer Portal erstellen', false)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-202', 'FCM SDK im App-Code einbinden', false)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();


    // Task 203
    sqlx::query(
        r#"INSERT INTO "Task" (id, "workspaceId", title, description, status, priority, "startDate", "dueDate", address, attachments)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"#
    )
    .bind("task-203")
    .bind("ws-2")
    .bind("App-Store Accounts für KOWOBAU anlegen")
    .bind("Einrichten der Firmen-Accounts im Apple App Store (DUNS-Nummer bereitstellen) und der Google Play Console.")
    .bind("completed")
    .bind("medium")
    .bind("2026-05-10")
    .bind("2026-05-12")
    .bind("Developer Portale Apple & Google")
    .bind(&Vec::<String>::new())
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(r#"INSERT INTO "_TaskAssignees" ("A", "B") VALUES ('task-203', 'user-1')"#).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "_TaskAssignees" ("A", "B") VALUES ('task-203', 'user-2')"#).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "_TaskAssignees" ("A", "B") VALUES ('task-203', 'user-3')"#).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "_TaskAssignees" ("A", "B") VALUES ('task-203', 'user-4')"#).execute(&pool).await.unwrap();

    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-203', 'DUNS-Nummer verifizieren', true)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-203', 'Kreditkarte für Gebühren hinterlegen', true)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();


    // Task 301
    sqlx::query(
        r#"INSERT INTO "Task" (id, "workspaceId", title, description, status, priority, "startDate", "dueDate", address, attachments)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"#
    )
    .bind("task-301")
    .bind("ws-3")
    .bind("Firewall-Cluster Upgrade durchführen")
    .bind("Einspielen des kritischen Sicherheits-Patches auf die Fortinet Cluster-Firewalls an den Standorten Zentrale und Außenstelle.")
    .bind("in_progress")
    .bind("high")
    .bind("2026-06-08")
    .bind("2026-06-14")
    .bind("Haupt-Firewall / Rechenzentrum")
    .bind(&Vec::<String>::new())
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(r#"INSERT INTO "_TaskAssignees" ("A", "B") VALUES ('task-301', 'user-2')"#).execute(&pool).await.unwrap();

    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-301', 'Backup der Konfiguration erstellen', true)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-301', 'Wartungsfenster ankündigen (Freitag 22:00 Uhr)', true)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-301', 'Firmware auf Backup-Node einspielen', false)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-301', 'Failover testen und Master patchen', false)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();

    sqlx::query(r#"INSERT INTO "Comment" (id, "taskId", "authorId", text, timestamp) VALUES ($1, 'task-301', 'user-2', 'Das Wartungsfenster wurde per E-Mail an alle Mitarbeiter kommuniziert.', $2)"#).bind(uuid::Uuid::new_v4().to_string()).bind(DateTime::parse_from_rfc3339("2026-06-10T10:00:00Z").unwrap().naive_utc()).execute(&pool).await.unwrap();


    // Task 302
    sqlx::query(
        r#"INSERT INTO "Task" (id, "workspaceId", title, description, status, priority, "startDate", "dueDate", address, attachments)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"#
    )
    .bind("task-302")
    .bind("ws-3")
    .bind("Hardware-Rollout Tablets für Wohnungsprüfer")
    .bind("Installation der KOWO-Prüfsoftware, Einrichtung des Mobile Device Managements (MDM) und Ausgabe der iPad Pro Geräte.")
    .bind("planning")
    .bind("medium")
    .bind("2026-06-12")
    .bind("2026-06-25")
    .bind("IT-Werkstatt / Zentrale")
    .bind(&Vec::<String>::new())
    .execute(&pool)
    .await
    .unwrap();

    sqlx::query(r#"INSERT INTO "_TaskAssignees" ("A", "B") VALUES ('task-302', 'user-3')"#).execute(&pool).await.unwrap();

    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-302', '15 iPad Pro auspacken & inventarisieren', false)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-302', 'MDM-Profil (Relution) aufspielen', false)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-302', 'SIM-Karten aktivieren und einsetzen', false)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();
    sqlx::query(r#"INSERT INTO "ChecklistItem" (id, "taskId", text, completed) VALUES ($1, 'task-302', 'Übergabetermine koordinieren', false)"#).bind(uuid::Uuid::new_v4().to_string()).execute(&pool).await.unwrap();


    println!("Seeding tickets...");

    // Ticket 901
    sqlx::query(
        r#"INSERT INTO "Ticket" (id, title, description, reporter, category, priority, status, "createdAt", "slaHours")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"#
    )
    .bind("t-901")
    .bind("VPN-Zugang gesperrt (Mitarbeiter Homeoffice)")
    .bind("Mein VPN-Token wird nicht mehr akzeptiert. Ich erhalte die Fehlermeldung \"User deactivated\". Dringend benötigt für Zugriff auf das Mietportal.")
    .bind("Brigitte Schmitz (Mietverwaltung)")
    .bind("Berechtigungen")
    .bind("high")
    .bind("open")
    .bind(DateTime::parse_from_rfc3339("2026-06-11T06:15:00Z").unwrap().naive_utc())
    .bind(4)
    .execute(&pool)
    .await
    .unwrap();

    // Ticket 902
    sqlx::query(
        r#"INSERT INTO "Ticket" (id, title, description, reporter, category, priority, status, "createdAt", "slaHours")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"#
    )
    .bind("t-902")
    .bind("Drucker im Kundencenter druckt nur Streifen")
    .bind("Der Hauptdrucker (HP LaserJet Raum 04) zieht Papier ein, aber alle Seiten haben vertikale schwarze Streifen. Toner wurde bereits getauscht.")
    .bind("Markus Weber (Kundenbetreuung)")
    .bind("Hardware")
    .bind("medium")
    .bind("in_progress")
    .bind(DateTime::parse_from_rfc3339("2026-06-11T05:30:00Z").unwrap().naive_utc())
    .bind(24)
    .execute(&pool)
    .await
    .unwrap();

    // Ticket 903
    sqlx::query(
        r#"INSERT INTO "Ticket" (id, title, description, reporter, category, priority, status, "createdAt", "slaHours")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"#
    )
    .bind("t-903")
    .bind("Schnittstellenfehler bei Nebenkostendaten-Import")
    .bind("Der automatische Import der Verbrauchswerte für Heizung meldet einen XML-Schema-Validierungsfehler.")
    .bind("Helmut Lang (Buchhaltung)")
    .bind("Software")
    .bind("high")
    .bind("open")
    .bind(DateTime::parse_from_rfc3339("2026-06-11T07:10:00Z").unwrap().naive_utc())
    .bind(8)
    .execute(&pool)
    .await
    .unwrap();

    // Ticket 904
    sqlx::query(
        r#"INSERT INTO "Ticket" (id, title, description, reporter, category, priority, status, "createdAt", "slaHours")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"#
    )
    .bind("t-904")
    .bind("Passwort-Reset für E-Mail-Postfach")
    .bind("Ich habe mein Domänen-Passwort vergessen und kann mich nicht mehr bei Outlook Web Access anmelden.")
    .bind("Sabine Schulze (Kundenberatung)")
    .bind("Berechtigungen")
    .bind("low")
    .bind("resolved")
    .bind(DateTime::parse_from_rfc3339("2026-06-10T14:20:00Z").unwrap().naive_utc())
    .bind(48)
    .execute(&pool)
    .await
    .unwrap();

    println!("Seeding finished successfully!");
}
