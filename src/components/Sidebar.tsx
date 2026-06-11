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
    { id: 'admin', label: 'Admin-Panel', icon: Shield },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">IT</div>
        <span className="sidebar-title">IT-Planner</span>
      </div>

      <div className="sidebar-nav">
        {/* Nav Items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </div>
          );
        })}

        {/* Separator / Workspace Title */}
        <div style={{ margin: '24px 0 8px 16px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          Arbeitsbereiche
        </div>

        {/* Workspace select items */}
        {workspaces.map((ws) => (
          <div
            key={ws.id}
            className={`nav-item ${activeWorkspaceId === ws.id ? 'active' : ''}`}
            onClick={() => setActiveWorkspaceId(ws.id)}
            style={{ paddingLeft: '16px', gap: '10px' }}
          >
            <Briefcase size={16} />
            <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {ws.name.replace('KoWo ', '')}
            </span>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar" style={{ backgroundColor: currentUser.color }}>
            {currentUser.avatarInitials}
          </div>
          <div className="user-info">
            <span className="user-name">{currentUser.name}</span>
            <span className="user-role">{currentUser.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
