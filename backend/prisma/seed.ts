import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.comment.deleteMany({});
  await prisma.checklistItem.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.workspace.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding users...');
  // Demo password is configurable; default only intended for local demo setups.
  const passwordHash = bcrypt.hashSync(process.env.SEED_PASSWORD || 'PASSWORT', 10);

  const user1 = await prisma.user.create({
    data: {
      id: 'user-1',
      name: 'Michel Foucault',
      email: 'michel.foucault@verbietetdieafd.de',
      passwordHash,
      role: 'IT-Leiter KOWOBAU',
      isAdmin: true,
      avatarInitials: 'MF',
      color: '#0ea5e9'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      id: 'user-2',
      name: 'Jacques Derrida',
      email: 'jacques.derrida@verbietetdieafd.de',
      passwordHash,
      role: 'Systemadministratorin',
      avatarInitials: 'JD',
      color: '#8b5cf6'
    }
  });

  const user3 = await prisma.user.create({
    data: {
      id: 'user-3',
      name: 'Gilles Deleuze',
      email: 'gilles.deleuze@verbietetdieafd.de',
      passwordHash,
      role: 'IT-Support & Hardware',
      avatarInitials: 'GD',
      color: '#10b981'
    }
  });

  const user4 = await prisma.user.create({
    data: {
      id: 'user-4',
      name: 'Judith Butler',
      email: 'judith.butler@verbietetdieafd.de',
      passwordHash,
      role: 'Softwareentwicklerin',
      avatarInitials: 'JB',
      color: '#f59e0b'
    }
  });

  console.log('Seeding workspaces...');
  const ws1 = await prisma.workspace.create({
    data: {
      id: 'ws-1',
      name: 'ERP & SAP S/4HANA Migration',
      description: 'Kern-Migrationsprojekt für die Mieterdatenbank, Buchhaltungsmodule und SAP RE-FX Integration.'
    }
  });

  const ws2 = await prisma.workspace.create({
    data: {
      id: 'ws-2',
      name: 'Mieter-Portal & Mobile App',
      description: 'Entwicklung und Launch der neuen digitalen Mieterservices für Schadensmeldungen und Mietverwaltung.'
    }
  });

  const ws3 = await prisma.workspace.create({
    data: {
      id: 'ws-3',
      name: 'IT-Infrastruktur & Sicherheit',
      description: 'Server-Virtualisierung, Firewall-Cluster-Upgrades, Cloud-Transit und Hardware-Rollouts.'
    }
  });

  console.log('Seeding tasks...');
  // Workspace 1 Tasks
  await prisma.task.create({
    data: {
      id: 'task-101',
      workspaceId: ws1.id,
      title: 'Datenmigration Mieterkontakte SAP RE-FX',
      description: 'Validierung und Bereinigung der Mieterstammdaten für den Import in das neue SAP S/4HANA RE-FX Modul. Abstimmung der Mapping-Tabelle.',
      status: 'in_progress',
      priority: 'high',
      startDate: '2026-06-05',
      dueDate: '2026-06-15',
      address: 'SAP-Sandkasten / Zentrale',
      assignees: {
        connect: [{ id: user3.id }, { id: user4.id }]
      },
      checklist: {
        create: [
          { text: 'Dubletten in Alt-Daten identifizieren', completed: true },
          { text: 'Mapping-Tabelle für RE-FX Felder erstellen', completed: true },
          { text: 'Testimport von 100 Datensätzen durchführen', completed: false },
          { text: 'Freigabe durch IT-Leitung einholen', completed: false }
        ]
      },
      comments: {
        create: [
          { authorId: user4.id, text: 'Ich habe den Testimport vorbereitet. Die csv-Datei liegt im Ordner.', timestamp: new Date('2026-06-09T09:30:00Z') },
          { authorId: user1.id, text: 'Sehr gut. Ich schaue mir das Mapping morgen früh an.', timestamp: new Date('2026-06-10T14:45:00Z') }
        ]
      }
    }
  });

  await prisma.task.create({
    data: {
      id: 'task-102',
      workspaceId: ws1.id,
      title: 'Schnittstelle für Nebenkostenabrechnung definieren',
      description: 'Spezifikation der REST-API zur Übergabe der Verbrauchswerte an das SAP-System. Abstimmung mit dem Messdienstleister.',
      status: 'planning',
      priority: 'medium',
      startDate: '2026-06-11',
      dueDate: '2026-06-20',
      address: 'REST-API / Service Bus',
      assignees: {
        connect: [{ id: user1.id }, { id: user4.id }]
      },
      checklist: {
        create: [
          { text: 'Schnittstellendokumentation anfordern', completed: false },
          { text: 'Datenstrukturen definieren (JSON-Schema)', completed: false },
          { text: 'Authentifizierungs-Konzept abstimmen', completed: false }
        ]
      },
      comments: {
        create: [
          { authorId: user4.id, text: 'Der Messdienstleister hat uns die Test-Endpunkte übermittelt.', timestamp: new Date('2026-06-10T08:15:00Z') }
        ]
      }
    }
  });

  await prisma.task.create({
    data: {
      id: 'task-103',
      workspaceId: ws1.id,
      title: 'Datenbank-Performance nach SAP-Import prüfen',
      description: 'Nach dem Einspielen der Altdaten bricht die Performance der Abfragen ein. Indexe müssen überprüft und optimiert werden.',
      status: 'in_progress',
      priority: 'urgent',
      startDate: '2026-06-10',
      dueDate: '2026-06-12',
      address: 'SAP DB Cluster / Serverraum',
      assignees: {
        connect: [{ id: user4.id }]
      },
      checklist: {
        create: [
          { text: 'Datenbank-Auslastung loggen', completed: true },
          { text: 'Fehlende Primär- und Fremdschlüssel-Indizes anlegen', completed: true },
          { text: 'Queries auf Tabellen-Scans analysieren', completed: false },
          { text: 'Abfrage-Laufzeiten vergleichen', completed: false }
        ]
      },
      comments: {
        create: [
          { authorId: user2.id, text: 'Es fehlte ein Index auf der Tabelle V_KUN_ADR. Query-Zeit sank von 12s auf 80ms.', timestamp: new Date('2026-06-10T17:20:00Z') },
          { authorId: user1.id, text: 'Hervorragende Arbeit! Bitte auch die restlichen RE-FX Ansichten prüfen.', timestamp: new Date('2026-06-11T06:45:00Z') }
        ]
      }
    }
  });

  await prisma.task.create({
    data: {
      id: 'task-104',
      workspaceId: ws1.id,
      title: 'ERP-Altsystem in Nur-Lese-Modus versetzen',
      description: 'Das alte d.3 Archivsystem und die Access-Datenbank müssen nach dem Go-Live für Schreibzugriffe gesperrt werden.',
      status: 'completed',
      priority: 'low',
      startDate: '2026-05-15',
      dueDate: '2026-06-08',
      address: 'Archivserver / Alt-Infrastruktur',
      assignees: {
        connect: [{ id: user1.id }]
      },
      checklist: {
        create: [
          { text: 'Schreibberechtigungen im AD entziehen', completed: true },
          { text: 'Datenbankschemata auf READ-ONLY setzen', completed: true },
          { text: 'Zugriffsrechte für Revision prüfen', completed: true }
        ]
      },
      comments: {
        create: [
          { authorId: user2.id, text: 'Berechtigungen wurden angepasst. Nur-Lese-Zugriff für Revisoren ist aktiv.', timestamp: new Date('2026-06-08T16:00:00Z') }
        ]
      }
    }
  });

  await prisma.task.create({
    data: {
      id: 'task-105',
      workspaceId: ws1.id,
      title: 'Active Directory Bereinigung',
      description: 'Bereinigung von verwaisten Benutzerkonten und Sicherheitsgruppen im KOWOBAU Active Directory.',
      status: 'planning',
      priority: 'low',
      startDate: '2026-06-15',
      dueDate: '2026-06-25',
      address: 'Domain Controller / IT-Büro',
      assignees: {
        connect: [{ id: user3.id }]
      },
      checklist: {
        create: [
          { text: 'Inaktive User (>90 Tage) deaktivieren', completed: false },
          { text: 'Leere Sicherheitsgruppen löschen', completed: false },
          { text: '2FA für Admin-Konten erzwingen', completed: false }
        ]
      }
    }
  });

  // Workspace 2 Tasks
  await prisma.task.create({
    data: {
      id: 'task-201',
      workspaceId: ws2.id,
      title: 'UI/UX Mockups für Mieter-App freigeben',
      description: 'Abstimmung der Screen-Layouts für den Schadensmeldungs-Prozess und die Heizkostenanzeige in der neuen App.',
      status: 'in_progress',
      priority: 'medium',
      startDate: '2026-06-01',
      dueDate: '2026-06-18',
      address: 'Figma Cloud / Online',
      assignees: {
        connect: [{ id: user1.id }, { id: user2.id }]
      },
      checklist: {
        create: [
          { text: 'Feedback der Kundenbetreuung sammeln', completed: true },
          { text: 'Barrierefreiheit nach WCAG 2.1 prüfen', completed: false },
          { text: 'Freigabemeeting mit Vorstand planen', completed: false }
        ]
      },
      comments: {
        create: [
          { authorId: user2.id, text: 'Das Feedback der Kundenbetreuung war positiv. Die Schriftgrößen wurden vergrößert.', timestamp: new Date('2026-06-08T11:20:00Z') }
        ]
      }
    }
  });

  await prisma.task.create({
    data: {
      id: 'task-202',
      workspaceId: ws2.id,
      title: 'Push-Notification-Service in App integrieren',
      description: 'Einrichtung von Firebase Cloud Messaging (FCM) für Android und Apple Push Notification Service (APNs) für iOS.',
      status: 'planning',
      priority: 'high',
      startDate: '2026-06-10',
      dueDate: '2026-06-30',
      address: 'Firebase Console / iOS App Store',
      assignees: {
        connect: [{ id: user4.id }]
      },
      checklist: {
        create: [
          { text: 'Zertifikate im Apple Developer Portal erstellen', completed: false },
          { text: 'FCM SDK im App-Code einbinden', completed: false }
        ]
      }
    }
  });

  await prisma.task.create({
    data: {
      id: 'task-203',
      workspaceId: ws2.id,
      title: 'App-Store Accounts für KOWOBAU anlegen',
      description: 'Einrichten der Firmen-Accounts im Apple App Store (DUNS-Nummer bereitstellen) und der Google Play Console.',
      status: 'completed',
      priority: 'medium',
      startDate: '2026-05-10',
      dueDate: '2026-05-12',
      address: 'Developer Portale Apple & Google',
      assignees: {
        connect: [{ id: user1.id }, { id: user2.id }, { id: user3.id }, { id: user4.id }]
      },
      checklist: {
        create: [
          { text: 'DUNS-Nummer verifizieren', completed: true },
          { text: 'Kreditkarte für Gebühren hinterlegen', completed: true }
        ]
      }
    }
  });

  // Workspace 3 Tasks
  await prisma.task.create({
    data: {
      id: 'task-301',
      workspaceId: ws3.id,
      title: 'Firewall-Cluster Upgrade durchführen',
      description: 'Einspielen des kritischen Sicherheits-Patches auf die Fortinet Cluster-Firewalls an den Standorten Zentrale und Außenstelle.',
      status: 'in_progress',
      priority: 'high',
      startDate: '2026-06-08',
      dueDate: '2026-06-14',
      address: 'Haupt-Firewall / Rechenzentrum',
      assignees: {
        connect: [{ id: user2.id }]
      },
      checklist: {
        create: [
          { text: 'Backup der Konfiguration erstellen', completed: true },
          { text: 'Wartungsfenster ankündigen (Freitag 22:00 Uhr)', completed: true },
          { text: 'Firmware auf Backup-Node einspielen', completed: false },
          { text: 'Failover testen und Master patchen', completed: false }
        ]
      },
      comments: {
        create: [
          { authorId: user2.id, text: 'Das Wartungsfenster wurde per E-Mail an alle Mitarbeiter kommuniziert.', timestamp: new Date('2026-06-10T10:00:00Z') }
        ]
      }
    }
  });

  await prisma.task.create({
    data: {
      id: 'task-302',
      workspaceId: ws3.id,
      title: 'Hardware-Rollout Tablets für Wohnungsprüfer',
      description: 'Installation der KOWO-Prüfsoftware, Einrichtung des Mobile Device Managements (MDM) und Ausgabe der iPad Pro Geräte.',
      status: 'planning',
      priority: 'medium',
      startDate: '2026-06-12',
      dueDate: '2026-06-25',
      address: 'IT-Werkstatt / Zentrale',
      assignees: {
        connect: [{ id: user3.id }]
      },
      checklist: {
        create: [
          { text: '15 iPad Pro auspacken & inventarisieren', completed: false },
          { text: 'MDM-Profil (Relution) aufspielen', completed: false },
          { text: 'SIM-Karten aktivieren und einsetzen', completed: false },
          { text: 'Übergabetermine koordinieren', completed: false }
        ]
      }
    }
  });

  console.log('Seeding tickets...');
  await prisma.ticket.create({
    data: {
      id: 't-901',
      title: 'VPN-Zugang gesperrt (Mitarbeiter Homeoffice)',
      description: 'Mein VPN-Token wird nicht mehr akzeptiert. Ich erhalte die Fehlermeldung "User deactivated". Dringend benötigt für Zugriff auf das Mietportal.',
      reporter: 'Brigitte Schmitz (Mietverwaltung)',
      category: 'Berechtigungen',
      priority: 'high',
      status: 'open',
      createdAt: new Date('2026-06-11T06:15:00Z'),
      slaHours: 4
    }
  });

  await prisma.ticket.create({
    data: {
      id: 't-902',
      title: 'Drucker im Kundencenter druckt nur Streifen',
      description: 'Der Hauptdrucker (HP LaserJet Raum 04) zieht Papier ein, aber alle Seiten haben vertikale schwarze Streifen. Toner wurde bereits getauscht.',
      reporter: 'Markus Weber (Kundenbetreuung)',
      category: 'Hardware',
      priority: 'medium',
      status: 'in_progress',
      createdAt: new Date('2026-06-11T05:30:00Z'),
      slaHours: 24
    }
  });

  await prisma.ticket.create({
    data: {
      id: 't-903',
      title: 'Schnittstellenfehler bei Nebenkostendaten-Import',
      description: 'Der automatische Import der Verbrauchswerte für Heizung meldet einen XML-Schema-Validierungsfehler.',
      reporter: 'Helmut Lang (Buchhaltung)',
      category: 'Software',
      priority: 'high',
      status: 'open',
      createdAt: new Date('2026-06-11T07:10:00Z'),
      slaHours: 8
    }
  });

  await prisma.ticket.create({
    data: {
      id: 't-904',
      title: 'Passwort-Reset für E-Mail-Postfach',
      description: 'Ich habe mein Domänen-Passwort vergessen und kann mich nicht mehr bei Outlook Web Access anmelden.',
      reporter: 'Sabine Schulze (Kundenberatung)',
      category: 'Berechtigungen',
      priority: 'low',
      status: 'resolved',
      createdAt: new Date('2026-06-10T14:20:00Z'),
      slaHours: 48
    }
  });

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
