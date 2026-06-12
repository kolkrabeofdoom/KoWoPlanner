import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, Plus, LogOut } from 'lucide-react';
import type { Workspace } from '../data/mockData';

interface HeaderProps {
  currentView: string;
  activeWorkspace: Workspace;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onAddTask: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  activeWorkspace,
  searchTerm,
  setSearchTerm,
  darkMode,
  toggleDarkMode,
  onAddTask,
  onLogout
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notifications
  const notifications = [
    { id: 1, text: 'Neue Zuweisung: "Wasserschaden Bad Decke"', time: 'Vor 10 Min.' },
    { id: 2, text: 'Jacques Derrida hat einen Kommentar hinterlassen', time: 'Vor 1 Std.' },
    { id: 3, text: 'Fälligkeitsdatum naht für Strang A Prüfung', time: 'Morgen fällig' }
  ];

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard & Analysen';
      case 'kanban': return 'Kanban-Board';
      case 'list': return 'Listenansicht';
      case 'calendar': return 'Kalenderansicht';
      case 'gantt': return 'Gantt-Timeline';
      case 'mytasks': return 'Meine Aufgaben';
      case 'support': return 'IT-Support Helpdesk';
      case 'admin': return 'Admin-Panel';
      default: return 'Planung';
    }
  };

  const getBreadcrumbLabel = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'kanban': return 'Kanban';
      case 'list': return 'Liste';
      case 'calendar': return 'Kalender';
      case 'gantt': return 'Gantt';
      case 'mytasks': return 'Meine Aufgaben';
      case 'support': return 'Helpdesk';
      case 'admin': return 'Admin';
      default: return 'Planung';
    }
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      padding: '16px 32px',
      background: 'var(--header-bg)',
      backdropFilter: 'blur(8px)',
      position: 'sticky',
      top: 0,
      zIndex: 20,
      borderBottom: '1px solid var(--border)'
    }}>
      {/* Title & Breadcrumbs from Mockup */}
      <div style={{ flex: 'none' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '7px', 
          fontSize: '12px', 
          color: 'var(--muted)', 
          fontWeight: 500, 
          marginBottom: '3px', 
          whiteSpace: 'nowrap' 
        }}>
          <span>{activeWorkspace.name}</span>
          <span style={{ color: 'var(--faint)' }}>/</span>
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{getBreadcrumbLabel()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
          <h1 style={{ 
            fontFamily: 'Space Grotesk', 
            fontSize: '22px', 
            fontWeight: 600, 
            letterSpacing: '-.02em', 
            color: 'var(--ink)',
            margin: 0
          }}>
            {getViewTitle()}
          </h1>
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.02em' }}>
            — Project-and-Incident-Scheduling-Helper-for-IT-Departments
          </span>
        </div>
      </div>

      {/* Search Bar from Mockup */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          width: '100%', 
          maxWidth: '420px', 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-input)', 
          borderRadius: '12px', 
          padding: '10px 14px', 
          boxShadow: 'var(--shadow-card)',
          cursor: 'text'
        }}>
          <Search size={17} color="#94a3b8" strokeWidth={1.8} />
          <input 
            type="text" 
            placeholder="Aufgaben durchsuchen…" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13.5px',
              color: 'var(--ink)',
              width: '100%',
              fontFamily: 'inherit'
            }}
          />
          <span style={{ 
            marginLeft: 'auto', 
            fontSize: '11px', 
            color: 'var(--faint)', 
            border: '1px solid var(--border-input)', 
            borderRadius: '6px', 
            padding: '1px 6px', 
            fontWeight: 600 
          }}>⌘K</span>
        </label>
      </div>

      {/* Actions from Mockup */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 'none' }}>
        {/* Neue Aufgabe Button */}
        <button 
          onClick={onAddTask}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'var(--primary-btn)', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '11px', 
            padding: '11px 16px', 
            fontFamily: 'inherit', 
            fontSize: '13.5px', 
            fontWeight: 600, 
            cursor: 'pointer', 
            boxShadow: 'var(--btn-shadow)',
            transition: 'background var(--transition-fast)'
          }}
          className="hover-btn-primary"
        >
          <Plus size={16} strokeWidth={2.2} />
          Neue Aufgabe
        </button>

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleDarkMode} 
          title="Dark Mode umschalten" 
          style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '11px', 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border-input)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer', 
            color: 'var(--ink-2)' 
          }}
          className="hover-btn-icon"
        >
          {darkMode ? <Sun size={18} strokeWidth={1.7} /> : <Moon size={18} strokeWidth={1.7} />}
        </button>

        {/* Logout Button */}
        <button 
          onClick={onLogout} 
          title="Abmelden" 
          style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '11px', 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border-input)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer', 
            color: 'var(--ink-2)' 
          }}
          className="hover-btn-icon"
        >
          <LogOut size={18} strokeWidth={1.7} />
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Benachrichtigungen"
            style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '11px', 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border-input)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer', 
              color: 'var(--ink-2)' 
            }}
            className="hover-btn-icon"
          >
            <Bell size={18} strokeWidth={1.7} />
            <span style={{ 
              position: 'absolute', 
              top: '9px', 
              right: '10px', 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: '#ef4444', 
              border: '2px solid var(--bg-card)' 
            }} />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="card animate-fade" style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: '280px',
              padding: '16px',
              zIndex: 150,
              boxShadow: 'var(--shadow-pop)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--ink)' }}>Benachrichtigungen</span>
                <span 
                  style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setShowNotifications(false)}
                >
                  Schließen
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {notifications.map((n) => (
                  <div key={n.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink-2)', fontWeight: 500 }}>{n.text}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

