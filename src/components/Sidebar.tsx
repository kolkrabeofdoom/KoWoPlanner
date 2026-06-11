import React from 'react';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  List, 
  Calendar, 
  CheckSquare, 
  Briefcase,
  Shield,
  Milestone,
  LifeBuoy
} from 'lucide-react';
import type { Workspace, User } from '../data/mockData';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  setActiveWorkspaceId: (id: string) => void;
  currentUser: User;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  workspaces,
  activeWorkspaceId,
  setActiveWorkspaceId,
  currentUser
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kanban', label: 'Kanban-Board', icon: KanbanSquare },
    { id: 'list', label: 'Listenansicht', icon: List },
    { id: 'calendar', label: 'Kalenderansicht', icon: Calendar },
    { id: 'gantt', label: 'Gantt-Timeline', icon: Milestone },
    { id: 'mytasks', label: 'Meine Aufgaben', icon: CheckSquare },
    { id: 'support', label: 'IT-Support Helpdesk', icon: LifeBuoy },
    // Admin panel is only available to administrators (enforced again server-side)
    ...(currentUser.isAdmin ? [{ id: 'admin', label: 'Admin-Panel', icon: Shield }] : []),
  ];

  return (
    <aside className="app-sidebar">
      {/* Sidebar Header from Mockup */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '22px 22px 18px' }}>
        <img 
          src="/kitten_logo.png" 
          alt="PISHI Kitten Logo" 
          style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '11px', 
            objectFit: 'cover',
            boxShadow: '0 4px 12px rgba(10,143,214,0.35)',
            border: '1px solid var(--border)'
          }} 
        />
        <div>
          <div 
            style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '16px', color: '#f8fafc', letterSpacing: '-.01em' }}
            title="PISHI-Project-and-Incident-Scheduling-Helper-for-IT-Departments Public"
          >
            PISHI
          </div>
          <div style={{ fontSize: '10.5px', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: '#5b6678', marginTop: '2px' }}>
            IT &amp; Helpdesk
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '4px 14px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
              style={isActive ? {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 12px',
                borderRadius: '11px',
                fontSize: '13.5px',
                fontWeight: 600,
                color: 'var(--primary)',
                background: 'var(--sb-active)',
                boxShadow: 'inset 3px 0 0 var(--primary)',
                cursor: 'pointer'
              } : {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 12px',
                borderRadius: '11px',
                fontSize: '13.5px',
                fontWeight: 500,
                color: 'var(--sb-item)',
                cursor: 'pointer'
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Workspaces list */}
      <div style={{ padding: '18px 26px 8px', fontSize: '10.5px', fontWeight: 700, letterSpacing: '.13em', textTransform: 'uppercase', color: 'var(--sb-heading)' }}>
        Arbeitsbereiche
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 14px' }}>
        {workspaces.map((ws) => {
          const isActive = activeWorkspaceId === ws.id;
          const dotColor = isActive ? 'var(--primary)' : '#475569';
          return (
            <div
              key={ws.id}
              className={`nav-item-ws ${isActive ? 'active' : ''}`}
              onClick={() => setActiveWorkspaceId(ws.id)}
              style={isActive ? {
                display: 'flex',
                alignItems: 'center',
                gap: '11px',
                padding: '8px 12px',
                borderRadius: '11px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#cbd5e1',
                background: 'var(--sb-item-hover)',
                cursor: 'pointer'
              } : {
                display: 'flex',
                alignItems: 'center',
                gap: '11px',
                padding: '8px 12px',
                borderRadius: '11px',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--sb-ws)',
                cursor: 'pointer'
              }}
            >
              <span style={{ 
                width: '7px', 
                height: '7px', 
                borderRadius: '50%', 
                backgroundColor: dotColor, 
                flex: 'none',
                boxShadow: isActive ? '0 0 0 3px var(--primary-tint)' : 'none'
              }}></span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ws.name.replace('KoWo ', '')}
              </span>
            </div>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div style={{ marginTop: 'auto', padding: '14px', borderTop: '1px solid var(--sb-border)' }}>
        <div className="sidebar-user-profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '12px' }}>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '50%', 
            background: currentUser.color || 'linear-gradient(135deg, #38bdf8, #0a8fd6)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 700, 
            fontSize: '13px', 
            color: '#fff', 
            flex: 'none' 
          }}>
            {currentUser.avatarInitials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser.role}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

