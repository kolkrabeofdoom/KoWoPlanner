import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, Plus } from 'lucide-react';
import type { Workspace } from '../data/mockData';

interface HeaderProps {
  currentView: string;
  activeWorkspace: Workspace;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onAddTask: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  activeWorkspace,
  searchTerm,
  setSearchTerm,
  darkMode,
  toggleDarkMode,
  onAddTask
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notifications
  const notifications = [
    { id: 1, text: 'Neue Zuweisung: "Wasserschaden Bad Decke"', time: 'Vor 10 Min.' },
    { id: 2, text: 'Sabine Schmidt hat einen Kommentar hinterlassen', time: 'Vor 1 Std.' },
    { id: 3, text: 'Fälligkeitsdatum naht für Strang A Prüfung', time: 'Morgen fällig' }
  ];

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard & Analysen';
      case 'kanban': return 'Kanban-Board';
      case 'list': return 'Aufgabenliste';
      case 'calendar': return 'Kalenderansicht';
      case 'mytasks': return 'Meine Aufgaben';
      default: return 'Planung';
    }
  };

  return (
    <header className="app-header">
      {/* Title & Breadcrumbs */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          <span>{activeWorkspace.name}</span>
          <span>/</span>
          <span style={{ textTransform: 'capitalize' }}>{currentView}</span>
        </div>
        <h1 style={{ fontSize: '1.25rem', margin: '4px 0 0 0', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)' }}>
          {getViewTitle()}
        </h1>
      </div>

      {/* Search Bar */}
      <div className="header-search">
        <Search size={18} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Aufgaben durchsuchen..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="header-actions">
        {/* New Task Button */}
        <button className="header-btn" onClick={onAddTask}>
          <Plus size={16} />
          <span>Neue Aufgabe</span>
        </button>

        {/* Theme Toggle */}
        <button className="theme-toggle-btn" onClick={toggleDarkMode} title="Farbschema umschalten">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button 
            className="theme-toggle-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Benachrichtigungen"
          >
            <Bell size={18} />
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--danger)',
              borderRadius: '50%'
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
              boxShadow: 'var(--shadow-premium)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Benachrichtigungen</span>
                <span 
                  style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setShowNotifications(false)}
                >
                  Schließen
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {notifications.map((n) => (
                  <div key={n.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>{n.text}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</span>
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
