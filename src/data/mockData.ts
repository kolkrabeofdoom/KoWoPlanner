export interface User {
  id: string;
  name: string;
  avatarInitials: string;
  role: string;
  email: string;
  color: string;
  isAdmin?: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  timestamp: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignees: string[]; // User IDs
  startDate: string;
  dueDate: string;
  checklist: ChecklistItem[];
  comments: Comment[];
  address: string; // Used internally as address, rendered in UI as "System / Ort"
  attachments: string[];
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  reporter: string;
  category: 'Hardware' | 'Software' | 'Netzwerk' | 'Berechtigungen';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  slaHours: number;
}

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Michel Foucault',
    avatarInitials: 'MF',
    role: 'IT-Leiter KOWOBAU',
    email: 'michel.foucault@kowobau.de',
    color: '#0ea5e9' // primary cyan
  },
  {
    id: 'user-2',
    name: 'Jacques Derrida',
    avatarInitials: 'JD',
    role: 'Systemadministratorin',
    email: 'jacques.derrida@kowobau.de',
    color: '#8b5cf6' // purple
  },
  {
    id: 'user-3',
    name: 'Gilles Deleuze',
    avatarInitials: 'GD',
    role: 'IT-Support & Hardware',
    email: 'gilles.deleuze@kowobau.de',
    color: '#10b981' // green
  },
  {
    id: 'user-4',
    name: 'Judith Butler',
    avatarInitials: 'JB',
    role: 'Softwareentwicklerin',
    email: 'judith.butler@kowobau.de',
    color: '#f59e0b' // warning amber
  }
];

export const mockWorkspaces: Workspace[] = [
  {
    id: 'ws-1',
    name: 'ERP & SAP S/4HANA Migration',
    description: 'Kern-Migrationsprojekt für die Mieterdatenbank, Buchhaltungsmodule und SAP RE-FX Integration.'
  },
  {
    id: 'ws-2',
    name: 'Mieter-Portal & Mobile App',
    description: 'Entwicklung und Launch der neuen digitalen Mieterservices für Schadensmeldungen und Mietverwaltung.'
  },
  {
    id: 'ws-3',
    name: 'IT-Infrastruktur & Sicherheit',
    description: 'Server-Virtualisierung, Firewall-Cluster-Upgrades, Cloud-Transit und Hardware-Rollouts.'
  }
];

export const mockTasks: Task[] = [
  // Workspace 1 Tasks: SAP Migration
  {
    id: 'task-101',
    workspaceId: 'ws-1',
    title: 'Datenmigration Mieterkontakte SAP RE-FX',
    description: 'Validierung und Bereinigung der Mieterstammdaten für den Import in das neue SAP S/4HANA RE-FX Modul. Abstimmung der Mapping-Tabelle.',
    status: 'in_progress',
    priority: 'high',
    assignees: ['user-3', 'user-4'],
    startDate: '2026-06-05',
    dueDate: '2026-06-15',
    address: 'SAP-Sandkasten / Zentrale',
    attachments: ['SAP_Migration_Mapping.xlsx', 'Mieterdaten_Bereinigt.csv'],
    checklist: [
      { id: 'ch-1', text: 'Dubletten in Alt-Daten identifizieren', completed: true },
      { id: 'ch-2', text: 'Mapping-Tabelle für RE-FX Felder erstellen', completed: true },
      { id: 'ch-3', text: 'Testimport von 100 Datensätzen durchführen', completed: false },
      { id: 'ch-4', text: 'Freigabe durch IT-Leitung einholen', completed: false }
    ],
    comments: [
      {
        id: 'c-1',
        authorId: 'user-4',
        text: 'Ich habe den Testimport vorbereitet. Die csv-Datei liegt im Ordner.',
        timestamp: '2026-06-09T09:30:00Z'
      },
      {
        id: 'c-2',
        authorId: 'user-1',
        text: 'Sehr gut. Ich schaue mir das Mapping morgen früh an.',
        timestamp: '2026-06-10T14:45:00Z'
      }
    ]
  },
  {
    id: 'task-102',
    workspaceId: 'ws-1',
    title: 'Schnittstelle für Nebenkostenabrechnung definieren',
    description: 'Spezifikation der REST-API zur Übergabe der Verbrauchswerte an das SAP-System. Abstimmung mit dem Messdienstleister.',
    status: 'planning',
    priority: 'medium',
    assignees: ['user-1', 'user-4'],
    startDate: '2026-06-11',
    dueDate: '2026-06-20',
    address: 'REST-API / Service Bus',
    attachments: ['API_Spezifikation_V1.2.pdf'],
    checklist: [
      { id: 'ch-5', text: 'Schnittstellendokumentation anfordern', completed: false },
      { id: 'ch-6', text: 'Datenstrukturen definieren (JSON-Schema)', completed: false },
      { id: 'ch-7', text: 'Authentifizierungs-Konzept abstimmen', completed: false }
    ],
    comments: [
      {
        id: 'c-3',
        authorId: 'user-4',
        text: 'Der Messdienstleister hat uns die Test-Endpunkte übermittelt.',
        timestamp: '2026-06-10T08:15:00Z'
      }
    ]
  },
  {
    id: 'task-103',
    workspaceId: 'ws-1',
    title: 'Datenbank-Performance nach SAP-Import prüfen',
    description: 'Nach dem Einspielen der Altdaten bricht die Performance der Abfragen ein. Indexe müssen überprüft und optimiert werden.',
    status: 'in_progress',
    priority: 'urgent',
    assignees: ['user-4'],
    startDate: '2026-06-10',
    dueDate: '2026-06-12',
    address: 'SAP DB Cluster / Serverraum',
    attachments: ['PerfLog_2026-06-10.log'],
    checklist: [
      { id: 'ch-9', text: 'Datenbank-Auslastung loggen', completed: true },
      { id: 'ch-10', text: 'Fehlende Primär- und Fremdschlüssel-Indizes anlegen', completed: true },
      { id: 'ch-11', text: 'Queries auf Tabellen-Scans analysieren', completed: false },
      { id: 'ch-12', text: 'Abfrage-Laufzeiten vergleichen', completed: false }
    ],
    comments: [
      {
        id: 'c-4',
        authorId: 'user-2',
        text: 'Es fehlte ein Index auf der Tabelle V_KUN_ADR. Query-Zeit sank von 12s auf 80ms.',
        timestamp: '2026-06-10T17:20:00Z'
      },
      {
        id: 'c-5',
        authorId: 'user-1',
        text: 'Hervorragende Arbeit! Bitte auch die restlichen RE-FX Ansichten prüfen.',
        timestamp: '2026-06-11T06:45:00Z'
      }
    ]
  },
  {
    id: 'task-104',
    workspaceId: 'ws-1',
    title: 'ERP-Altsystem in Nur-Lese-Modus versetzen',
    description: 'Das alte d.3 Archivsystem und die Access-Datenbank müssen nach dem Go-Live für Schreibzugriffe gesperrt werden.',
    status: 'completed',
    priority: 'low',
    assignees: ['user-1'],
    startDate: '2026-05-15',
    dueDate: '2026-06-08',
    address: 'Archivserver / Alt-Infrastruktur',
    attachments: ['Freigabeprotokoll_Migration.pdf'],
    checklist: [
      { id: 'ch-13', text: 'Schreibberechtigungen im AD entziehen', completed: true },
      { id: 'ch-14', text: 'Datenbankschemata auf READ-ONLY setzen', completed: true },
      { id: 'ch-15', text: 'Zugriffsrechte für Revision prüfen', completed: true }
    ],
    comments: [
      {
        id: 'c-6',
        authorId: 'user-2',
        text: 'Berechtigungen wurden angepasst. Nur-Lese-Zugriff für Revisoren ist aktiv.',
        timestamp: '2026-06-08T16:00:00Z'
      }
    ]
  },
  {
    id: 'task-105',
    workspaceId: 'ws-1',
    title: 'Active Directory Bereinigung',
    description: 'Bereinigung von verwaisten Benutzerkonten und Sicherheitsgruppen im KOWOBAU Active Directory.',
    status: 'planning',
    priority: 'low',
    assignees: ['user-3'],
    startDate: '2026-06-15',
    dueDate: '2026-06-25',
    address: 'Domain Controller / IT-Büro',
    attachments: [],
    checklist: [
      { id: 'ch-16', text: 'Inaktive User (>90 Tage) deaktivieren', completed: false },
      { id: 'ch-17', text: 'Leere Sicherheitsgruppen löschen', completed: false },
      { id: 'ch-18', text: '2FA für Admin-Konten erzwingen', completed: false }
    ],
    comments: []
  },

  // Workspace 2 Tasks: Mieter-Portal App
  {
    id: 'task-201',
    workspaceId: 'ws-2',
    title: 'UI/UX Mockups für Mieter-App freigeben',
    description: 'Abstimmung der Screen-Layouts für den Schadensmeldungs-Prozess und die Heizkostenanzeige in der neuen App.',
    status: 'in_progress',
    priority: 'medium',
    assignees: ['user-1', 'user-2'],
    startDate: '2026-06-01',
    dueDate: '2026-06-18',
    address: 'Figma Cloud / Online',
    attachments: ['Figma_Mockups_MieterApp_V2.pdf'],
    checklist: [
      { id: 'ch-201', text: 'Feedback der Kundenbetreuung sammeln', completed: true },
      { id: 'ch-202', text: 'Barrierefreiheit nach WCAG 2.1 prüfen', completed: false },
      { id: 'ch-203', text: 'Freigabemeeting mit Vorstand planen', completed: false }
    ],
    comments: [
      {
        id: 'c-201',
        authorId: 'user-2',
        text: 'Das Feedback der Kundenbetreuung war positiv. Die Schriftgrößen wurden vergrößer.',
        timestamp: '2026-06-08T11:20:00Z'
      }
    ]
  },
  {
    id: 'task-202',
    workspaceId: 'ws-2',
    title: 'Push-Notification-Service in App integrieren',
    description: 'Einrichtung von Firebase Cloud Messaging (FCM) für Android und Apple Push Notification Service (APNs) für iOS.',
    status: 'planning',
    priority: 'high',
    assignees: ['user-4'],
    startDate: '2026-06-10',
    dueDate: '2026-06-30',
    address: 'Firebase Console / iOS App Store',
    attachments: [],
    checklist: [
      { id: 'ch-204', text: 'Zertifikate im Apple Developer Portal erstellen', completed: false },
      { id: 'ch-205', text: 'FCM SDK im App-Code einbinden', completed: false }
    ],
    comments: []
  },
  {
    id: 'task-203',
    workspaceId: 'ws-2',
    title: 'App-Store Accounts für KOWOBAU anlegen',
    description: 'Einrichten der Firmen-Accounts im Apple App Store (DUNS-Nummer bereitstellen) und der Google Play Console.',
    status: 'completed',
    priority: 'medium',
    assignees: ['user-1', 'user-2', 'user-3', 'user-4'],
    startDate: '2026-05-10',
    dueDate: '2026-05-12',
    address: 'Developer Portale Apple & Google',
    attachments: ['DUNS_Auszug_Kowobau.pdf'],
    checklist: [
      { id: 'ch-206', text: 'DUNS-Nummer verifizieren', completed: true },
      { id: 'ch-207', text: 'Kreditkarte für Gebühren hinterlegen', completed: true }
    ],
    comments: []
  },

  // Workspace 3 Tasks: IT-Infrastruktur & Sicherheit
  {
    id: 'task-301',
    workspaceId: 'ws-3',
    title: 'Firewall-Cluster Upgrade durchführen',
    description: 'Einspielen des kritischen Sicherheits-Patches auf die Fortinet Cluster-Firewalls an den Standorten Zentrale und Außenstelle.',
    status: 'in_progress',
    priority: 'high',
    assignees: ['user-2'],
    startDate: '2026-06-08',
    dueDate: '2026-06-14',
    address: 'Haupt-Firewall / Rechenzentrum',
    attachments: ['Patchnotes_FortiOS_7.4.pdf'],
    checklist: [
      { id: 'ch-301', text: 'Backup der Konfiguration erstellen', completed: true },
      { id: 'ch-302', text: 'Wartungsfenster ankündigen (Freitag 22:00 Uhr)', completed: true },
      { id: 'ch-303', text: 'Firmware auf Backup-Node einspielen', completed: false },
      { id: 'ch-304', text: 'Failover testen und Master patchen', completed: false }
    ],
    comments: [
      {
        id: 'c-301',
        authorId: 'user-2',
        text: 'Das Wartungsfenster wurde per E-Mail an alle Mitarbeiter kommuniziert.',
        timestamp: '2026-06-10T10:00:00Z'
      }
    ]
  },
  {
    id: 'task-302',
    workspaceId: 'ws-3',
    title: 'Hardware-Rollout Tablets für Wohnungsprüfer',
    description: 'Installation der KOWO-Prüfsoftware, Einrichtung des Mobile Device Managements (MDM) und Ausgabe der iPad Pro Geräte.',
    status: 'planning',
    priority: 'medium',
    assignees: ['user-3'],
    startDate: '2026-06-12',
    dueDate: '2026-06-25',
    address: 'IT-Werkstatt / Zentrale',
    attachments: ['Tablet_Ausgabeprotokoll.docx'],
    checklist: [
      { id: 'ch-305', text: '15 iPad Pro auspacken & inventarisieren', completed: false },
      { id: 'ch-306', text: 'MDM-Profil (Relution) aufspielen', completed: false },
      { id: 'ch-307', text: 'SIM-Karten aktivieren und einsetzen', completed: false },
      { id: 'ch-308', text: 'Übergabetermine koordinieren', completed: false }
    ],
    comments: []
  }
];

export const mockTickets: Ticket[] = [
  {
    id: 't-901',
    title: 'VPN-Zugang gesperrt (Mitarbeiter Homeoffice)',
    description: 'Mein VPN-Token wird nicht mehr akzeptiert. Ich erhalte die Fehlermeldung "User deactivated". Dringend benötigt für Zugriff auf das Mietportal.',
    reporter: 'Brigitte Schmitz (Mietverwaltung)',
    category: 'Berechtigungen',
    priority: 'high',
    status: 'open',
    createdAt: '2026-06-11T06:15:00Z',
    slaHours: 4
  },
  {
    id: 't-902',
    title: 'Drucker im Kundencenter druckt nur Streifen',
    description: 'Der Hauptdrucker (HP LaserJet Raum 04) zieht Papier ein, aber alle Seiten haben vertikale schwarze Streifen. Toner wurde bereits getauscht.',
    reporter: 'Markus Weber (Kundenbetreuung)',
    category: 'Hardware',
    priority: 'medium',
    status: 'in_progress',
    createdAt: '2026-06-11T05:30:00Z',
    slaHours: 24
  },
  {
    id: 't-903',
    title: 'Schnittstellenfehler bei Nebenkostendaten-Import',
    description: 'Der automatische Import der Verbrauchswerte für Heizung meldet einen XML-Schema-Validierungsfehler.',
    reporter: 'Helmut Lang (Buchhaltung)',
    category: 'Software',
    priority: 'high',
    status: 'open',
    createdAt: '2026-06-11T07:10:00Z',
    slaHours: 8
  },
  {
    id: 't-904',
    title: 'Passwort-Reset für E-Mail-Postfach',
    description: 'Ich habe mein Domänen-Passwort vergessen und kann mich nicht mehr bei Outlook Web Access anmelden.',
    reporter: 'Sabine Schulze (Kundenberatung)',
    category: 'Berechtigungen',
    priority: 'low',
    status: 'resolved',
    createdAt: '2026-06-10T14:20:00Z',
    slaHours: 48
  }
];
