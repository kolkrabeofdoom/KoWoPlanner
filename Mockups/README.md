# KoWoPlanner – UI-Designs

Hi-Fi Design-Mockups für KoWoPlanner (IT- & Helpdesk-Projektplaner).

## Inhalt

| Screen | Datei |
|---|---|
| Login | `KoWoPlanner Login.dc.html` |
| Dashboard & Analysen | `KoWoPlanner Dashboard.dc.html` |
| Kanban-Board | `KoWoPlanner Kanban.dc.html` |
| Listenansicht | `KoWoPlanner Liste.dc.html` |
| Kalenderansicht | `KoWoPlanner Kalender.dc.html` |
| Gantt-Timeline | `KoWoPlanner Gantt.dc.html` |
| Meine Aufgaben | `KoWoPlanner Meine Aufgaben.dc.html` |
| IT-Support Helpdesk | `KoWoPlanner Helpdesk.dc.html` |
| Admin-Panel | `KoWoPlanner Admin.dc.html` |
| Task-Modal | `KoWoPlanner Task-Modal.dc.html` |

`support.js` ist die gemeinsame Laufzeit – muss neben den `.dc.html`-Dateien liegen, damit sie sich im Browser öffnen lassen.

## Öffnen

Jede `.dc.html` lässt sich direkt im Browser öffnen (Doppelklick oder über einen lokalen Static-Server, z. B. `npx serve designs`).

## Design-System (Kurzreferenz)

- **Schriften:** Plus Jakarta Sans (UI), Space Grotesk (Überschriften/Zahlen)
- **Primärfarbe:** `#0a8fd6` (Light) · `#38bdf8` (Dark)
- **Hintergrund:** `#eef1f5` (Light) · `#0a0f1a` (Dark)
- **Sidebar:** `#0a1120`
- **Dark Mode:** über `localStorage['kowo-theme'] = 'dark'`, `body.dark`-Klasse schaltet die CSS-Variablen um.

Die vollständige Token-Palette steht im `:root`/`body.dark`-Block jeder Datei.
