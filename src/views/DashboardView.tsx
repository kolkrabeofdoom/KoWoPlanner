import React from 'react';
import { 
  ClipboardList, CheckCircle2, AlertTriangle, 
  Clock, Monitor, ArrowRight
} from 'lucide-react';
import type { Task, User } from '../data/mockData';
import { StatusDoughnutChart, TeamWorkloadChart, PriorityChart } from '../components/CustomCharts';

interface DashboardViewProps {
  tasks: Task[];
  users: User[];
  onSelectTask: (task: Task) => void;
  setCurrentView: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  tasks, 
  users,
  onSelectTask,
  setCurrentView
}) => {
  // Stat calculations
  const totalTasks = tasks.length;
  const openTasks = tasks.filter(t => t.status !== 'completed').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  
  // Urgent/high priority tasks that are NOT completed
  const urgentTasks = tasks.filter(t => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'completed');

  // Today's timeline tasks (sorted by due date, showing next 4)
  const timelineTasks = [...tasks]
    .filter(t => t.status !== 'completed')
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 4);

  // Overdue calculation (dueDate < today and not completed)
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasksCount = tasks.filter(t => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr).length;

  return (
    <div className="animate-fade">
      {/* Page Title Header in parent view */}
      <div style={{ marginBottom: '24px' }}>
        <p className="page-subtitle">Projektfortschritt und Kapazitäten im Überblick</p>
      </div>

      {/* KPI Stats Cards */}
      <div className="dashboard-grid">
        {/* Total Card */}
        <div className="card stat-card card-hover">
          <div className="stat-value-group">
            <span className="stat-label">Gesamtanzahl</span>
            <span className="stat-value">{totalTasks}</span>
            <span className="stat-trend" style={{ color: 'var(--text-muted)' }}>Erstellte Aufgaben</span>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary-alpha)', color: 'var(--primary)' }}>
            <ClipboardList size={22} />
          </div>
        </div>

        {/* Open Card */}
        <div className="card stat-card card-hover">
          <div className="stat-value-group">
            <span className="stat-label">Offene Aufgaben</span>
            <span className="stat-value">{openTasks}</span>
            <span className="stat-trend" style={{ color: 'var(--text-secondary)' }}>
              In Arbeit & Planung
            </span>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary-alpha)', color: 'var(--primary)' }}>
            <Clock size={22} />
          </div>
        </div>

        {/* Completed Card */}
        <div className="card stat-card card-hover">
          <div className="stat-value-group">
            <span className="stat-label">Erledigte Aufgaben</span>
            <span className="stat-value">{completedTasks}</span>
            <span className="stat-trend up">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% Erfolgsquote
            </span>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-alpha)', color: 'var(--success)' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Urgent Card */}
        <div className="card stat-card card-hover" style={{ borderColor: urgentTasks.length > 0 ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)' }}>
          <div className="stat-value-group">
            <span className="stat-label">Eskalationen / Notfälle</span>
            <span className="stat-value" style={{ color: urgentTasks.length > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
              {urgentTasks.length}
            </span>
            <span className="stat-trend" style={{ color: overdueTasksCount > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
              {overdueTasksCount} überfällig
            </span>
          </div>
          <div className="stat-icon" style={{ 
            backgroundColor: urgentTasks.length > 0 ? 'var(--danger-alpha)' : 'var(--border-light)', 
            color: urgentTasks.length > 0 ? 'var(--danger)' : 'var(--text-muted)' 
          }}>
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Charts & Graphs Grid */}
      <div className="dashboard-sections">
        
        {/* Left column: Analytics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Charts Row */}
          <div className="grid-cols-3" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '24px' }}>
            {/* Status Pie Chart */}
            <div className="card">
              <h3 className="section-title" style={{ fontSize: '1rem', marginBottom: '12px' }}>Aufgaben-Verteilung</h3>
              <StatusDoughnutChart tasks={tasks} users={users} />
            </div>

            {/* Team Capacity */}
            <div className="card">
              <h3 className="section-title" style={{ fontSize: '1rem', marginBottom: '12px' }}>Team-Auslastung <small style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Offen)</small></h3>
              <TeamWorkloadChart tasks={tasks} users={users} />
            </div>

            {/* Priorities */}
            <div className="card">
              <h3 className="section-title" style={{ fontSize: '1rem', marginBottom: '12px' }}>Verteilung Prioritäten</h3>
              <PriorityChart tasks={tasks} users={users} />
            </div>
          </div>

          {/* Timeline & Schedule Widget */}
          <div className="card timeline-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="section-title" style={{ margin: 0 }}>Nächste Deadlines</h3>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}
                onClick={() => setCurrentView('calendar')}
              >
                <span>Zum Kalender</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="timeline-list">
              {timelineTasks.length === 0 ? (
                <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Keine anstehenden Fristen.</p>
              ) : (
                timelineTasks.map((t) => {
                  const daysRemaining = t.dueDate ? Math.ceil((new Date(t.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;
                  return (
                    <div 
                      key={t.id} 
                      className="timeline-item"
                      style={{ cursor: 'pointer' }}
                      onClick={() => onSelectTask(t)}
                    >
                      <div className={`timeline-marker`} style={{ 
                        backgroundColor: t.priority === 'urgent' ? 'var(--danger)' : t.priority === 'high' ? 'var(--danger)' : 'var(--primary)' 
                      }} />
                      
                      <div className="timeline-time">
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }) : 'Keine'}
                      </div>
                      
                      <div className="timeline-content">
                        <div className="timeline-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{t.title}</span>
                          <span className={`badge badge-${t.priority === 'urgent' ? 'danger' : t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'info'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                            {t.priority}
                          </span>
                        </div>
                        <div className="timeline-desc" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                          {t.address && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Monitor size={12} /> {t.address}
                            </span>
                          )}
                          <span style={{ color: daysRemaining < 0 ? 'var(--danger)' : daysRemaining <= 2 ? 'var(--warning)' : 'var(--text-muted)' }}>
                            {daysRemaining < 0 ? 'Überfällig!' : daysRemaining === 0 ? 'Heute fällig' : daysRemaining === 1 ? 'Morgen fällig' : `in ${daysRemaining} Tagen`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right column: Side cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Urgent Panel */}
          <div className="card alert-card" style={{ flex: 1 }}>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: urgentTasks.length > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
              <AlertTriangle size={18} />
              Dringende Notfälle ({urgentTasks.length})
            </h3>
            
            <div className="alert-list">
              {urgentTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  🎉 Keine kritischen Aufgaben ausstehend!
                </div>
              ) : (
                urgentTasks.map((t) => (
                  <div 
                    key={t.id} 
                    className="alert-item"
                    onClick={() => onSelectTask(t)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="alert-header">
                      <span>{t.priority.toUpperCase()}</span>
                      <span>{t.dueDate ? new Date(t.dueDate).toLocaleDateString('de-DE') : ''}</span>
                    </div>
                    <div className="alert-title">{t.title}</div>
                    <div className="alert-meta">
                      <span>🖥️ {t.address}</span>
                      <span>{t.checklist.filter(c => c.completed).length}/{t.checklist.length} Unteraufgaben</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--primary-alpha))' }}>
            <h4 style={{ margin: '0 0 8px 0', fontWeight: 700, fontSize: '0.95rem' }}>KoWoBAU Status-Update</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Dies ist der interaktive Prototyp für die KoWoPlanner Plattform basierend auf der funktionalen Spezifikation. Sie können Aufgaben per Drag-and-Drop verschieben, bearbeiten, kommentieren und neue Checklisten anlegen.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
              <span>Version 1.0.0 (Beta)</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
