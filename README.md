# 🏢 KoWoPlanner - IT-Projektplaner & Helpdesk

KoWoPlanner ist ein moderner, interaktiver Prototyp für ein webbasiertes Projektmanagement- und Helpdesk-System, das speziell auf die Bedürfnisse der IT-Abteilung der **KOWOBAU** zugeschnitten ist. Die Anwendung kombiniert ein leistungsfähiges Aufgabenmanagement mit einem direkten Support-Ticket-Kanal, um eingehende Meldungen reibungslos in aktive IT-Projekte einzuplanen.

---

## ✨ Hauptfeatures

### 1. 📊 Dashboard & Analytics
- **KPI-Karten:** Echtzeit-Übersicht aller Aufgaben, offenen Tickets, Erledigungsraten und Notfälle.
- **Interaktive SVG-Charts:** Reaktive Visualisierungen der Aufgabenverteilung (Doughnut Chart), des Team-Workloads (Bar Chart) und der Prioritäten (Column Chart) mittels CSS-Animationen.
- **Fristen-Timeline & Notfall-Ticker:** Chronologische Sortierung der nächsten Deadlines und eine Highlight-Liste für kritische Probleme.

![KoWoPlanner Dashboard](public/dashboard.png)

### 2. 🎛️ Projektansichten & Task-Modal
- **Kanban-Board:** Visualisierung der Projektphasen (*In Planung, In Bearbeitung, Erledigt*) mit nativer HTML5 Drag-and-Drop Unterstützung zur einfachen Statusänderung.
- **Interaktive Listenansicht:** Tabellarische Ansicht aller Aufgaben mit Filterfunktion, mehrspaltiger Sortierung (Titel, Status, Priorität, Fälligkeit) und Sammelaktionen (Bulk Actions).
- **Kalenderansicht:** Ein vollständiger Monatskalender mit farblich markierten Aufgabenblöcken und der Option, per Klick neue Aufgaben direkt an einem Tag anzulegen.
- **Gantt-Timeline:** Ein horizontales Gantt-Diagramm für den Projektmonat Juni 2026 zur Veranschaulichung von Aufgabenlaufzeiten und Teamzuteilungen.
- **Detaillierter Editor:** Anpassbare Titel, Beschreibungen, Fristen, Checklisten (mit Fortschrittsbalken) sowie ein interaktiver Kommentar-Feed.

![KoWoPlanner Kanban & Task Modal](public/kanban_modal.png)

### 3. 🛟 IT-Support Helpdesk & SLA-Dashboard
- **Fehlererfassung:** Zentrales Eingabeformular für andere Fachabteilungen zur Erfassung von IT-Problemen (Hardware, Software, Netzwerk, Berechtigungen) inklusive SLA-Stufung.
- **Dynamisches SLA-Dashboard:** Automatische, relative Berechnung verbleibender Stunden bis zum SLA-Ablauf basierend auf einer Systemzeit-Simulation.
- **Aufgaben-Konvertierung (Ticket-to-Task):** Wandelt eingehende Support-Tickets mit wenigen Klicks in Aufgaben für spezifische IT-Projekte um. Ein modales Formular ermöglicht das Zuweisen von Bearbeiter, Fälligkeit und Projekt-Workspace. Nach Abschluss wird das Ticket automatisch als gelöst markiert.

![KoWoPlanner Helpdesk](public/helpdesk.png)

### 4. 🔐 Admin-Panel (Benutzerverwaltung)
- Übersicht aller aktiven Mitarbeiter mit Name, Rolle, E-Mail und individuellem Farbschema.
- Anlegen und Bearbeiten von IT-Benutzern inklusive simulierter Passwortänderung.
- **Kaskadierende Datenlöschung:** Beim Entfernen eines Benutzers wird dieser automatisch aus allen Aufgabenzuweisungen entfernt, um Datenkonsistenz zu gewährleisten (Administratoren-Selbstlöschung ist gesperrt).

![KoWoPlanner Admin Panel](public/admin.png)

---

## 🗺️ EPK-Diagramme (Prozessketten)

Die folgenden ereignisgesteuerten Prozessketten (EPK) veranschaulichen die Kernprozesse der Anwendung.

### 1. Support-Ticket Erfassung & SLA-Zuweisung
```mermaid
flowchart TD
    classDef event fill:#f43f5e,stroke:#e11d48,stroke-width:2px,color:#fff;
    classDef function fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#fff;
    classDef connector fill:#4b5563,stroke:#374151,stroke-width:2px,color:#fff;
    classDef org fill:#eab308,stroke:#ca8a04,stroke-width:2px,color:#000;
    classDef info fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff;

    E1{{"Support-Bedarf tritt auf"}}:::event --> F1("Ticket-Formular ausfüllen & absenden"):::function
    Org1["Melder (Mitarbeiter Fachabteilung)"]:::org -.-> F1
    F1 --> E2{{"Support-Ticket abgeschickt"}}:::event
    E2 --> F2("Datenbankeintrag erstellen & SLA berechnen"):::function
    Info1["PostgreSQL (Ticket-Tabelle)"]:::info -.-> F2
    F2 --> E3{{"Ticket erfasst & verbleibende SLA-Zeit visualisiert"}}:::event
```

### 2. Ticket-zu-Aufgabe Konvertierung (Escalation Flow)
```mermaid
flowchart TD
    classDef event fill:#f43f5e,stroke:#e11d48,stroke-width:2px,color:#fff;
    classDef function fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#fff;
    classDef connector fill:#4b5563,stroke:#374151,stroke-width:2px,color:#fff;
    classDef org fill:#eab308,stroke:#ca8a04,stroke-width:2px,color:#000;
    classDef info fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff;

    E1{{"Offenes Support-Ticket liegt vor"}}:::event --> F1("Konvertierungs-Formular öffnen"):::function
    Org1["IT-Leiter"]:::org -.-> F1
    F1 --> E2{{"Parameter-Eingabe (Projekt, Bearbeiter, Fälligkeit)"}}:::event
    E2 --> F2("Konvertierung bestätigen"):::function
    F2 --> F3("Datenbank-Transaktion ausführen"):::function
    Info1["PostgreSQL DB Transaktion"]:::info -.-> F3
    
    F3 --> E3{{"Ticket-Status auf gelöst gesetzt"}}:::event
    F3 --> E4{{"Neuer Task im Projekt-Workspace angelegt"}}:::event
```

### 3. Aufgabenbearbeitung & Kommentar-Feed
```mermaid
flowchart TD
    classDef event fill:#f43f5e,stroke:#e11d48,stroke-width:2px,color:#fff;
    classDef function fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#fff;
    classDef connector fill:#4b5563,stroke:#374151,stroke-width:2px,color:#fff;
    classDef org fill:#eab308,stroke:#ca8a04,stroke-width:2px,color:#000;
    classDef info fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff;

    E1{{"Aufgabe im Kanban-Board zugewiesen"}}:::event --> F1("Aufgabe per Drag-and-Drop verschieben"):::function
    Org1["IT-Mitarbeiter (Zuständiger)"]:::org -.-> F1
    F1 --> E2{{"Statusänderung initiiert"}}:::event
    E2 --> F2("Aufgabendetails im Modal öffnen"):::function
    F2 --> E3{{"Aufgaben-Editor angezeigt"}}:::event
    
    E3 --> F3("Checkliste aktualisieren oder Kommentar abschicken"):::function
    F3 --> E4{{"Änderungen in DB gespeichert & UI aktualisiert"}}:::event
    Info1["PostgreSQL (Task- & Comment-Tabellen)"]:::info -.-> F3
```

---

## 🎨 Design & Styling
Das System basiert auf einem Premium-Designsystem in **Vanilla CSS**:
- **Harmonisches Farbschema:** Moderne dunkle und helle Nuancen mit HSL-Werten und Akzentfarben (z. B. Cyan für IT-Projekte, Amber für Warnungen).
- **Glassmorphismus:** Transluzente Oberflächeneffekte, weiche Schatten und abgerundete Ecken für ein erstklassiges UI-Gefühl.
- **Premium Dark Mode:** Nahtloser Wechsel der Benutzeroberfläche über einen Schalter im Header mit vollständiger Synchronisierung.
- **Micro-Animations:** Visuelles Feedback bei Hover-Aktionen und Ladeübergängen.

---

## 🛠️ Technologie-Stack
- **Framework:** React 18 mit TypeScript
- **Build-Tool:** Vite
- **Router:** React Router (`react-router-dom`)
- **State:** Zustand
- **Backend:** Node.js Express API mit TypeScript
- **Database:** PostgreSQL mit Prisma ORM
- **Icons:** Lucide React
- **Styling:** Vanilla CSS (CSS Variables)

---

## 🏃 Installation & Starten

Folgen Sie diesen Schritten, um die Anwendung lokal auszuführen:

### 1. Repository klonen & vorbereiten
Stellen Sie sicher, dass Node.js installiert ist. Navigieren Sie in das Projektverzeichnis:
```bash
cd KoWoPlanner
```

### 2. Abhängigkeiten installieren
```bash
npm install
```

### 3. Entwicklungsserver starten
```bash
npm run dev
```
Der Planer läuft standardmäßig auf [http://localhost:5173](http://localhost:5173).

### 4. Produktions-Build erstellen
Um die App für den Release zu kompilieren und zu validieren:
```bash
npm run build
```
Der Build wird im Ordner `dist` generiert.

---

## 📅 Simulationshinweis
Da es sich um einen interaktiven Prototyp handelt, basiert die zeitliche Berechnung der Gantt-Charts und SLA-Laufzeiten auf einer simulierten Systemzeit vom **11. Juni 2026, 07:30 Uhr UTC**. Dies stellt sicher, dass die Demodaten jederzeit korrekt gerendert werden.

---

## 📄 Lizenz
Dieses Projekt ist unter der **GNU General Public License v3.0** lizenziert. Siehe die [LICENSE](LICENSE)-Datei für Details.
