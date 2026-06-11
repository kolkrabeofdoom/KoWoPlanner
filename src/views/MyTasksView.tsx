import React from 'react';
import { 
  CheckCircle, Play, Monitor, Calendar, 
  ClipboardCheck 
} from 'lucide-react';
import type { Task } from '../data/mockData';

interface MyTasksViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, status: Task['status']) => void;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  tasks,
  onSelectTask,
  onUpdateTaskStatus
}) => {
  // Filter tasks assigned to current user Frank Kröner (user-1)
  const myTasks = tasks.filter(t => t && t.assignees && t.assignees.includes('user-1'));

  const activeTasks = myTasks.filter(t => t.status === 'in_progress');
  const plannedTasks = myTasks.filter(t => t.status === 'planning');
  const completedTasks = myTasks.filter(t => t.status === 'completed');

  const getPriorityBadgeClass = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'badge-danger';
      case 'high': return 'badge-danger';
      case 'medium': return 'badge-warning';
      case 'low': return 'badge-info';
      default: return 'badge-secondary';
    }
  };

  const getPriorityText = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'Dringend';
      case 'high': return 'Hoch';
      case 'medium': return 'Mittel';
      case 'low': return 'Niedrig';
      default: return priority;
    }
  };

  const renderTaskRow = (t: Task) => {
    const safeChecklist = t.checklist || [];
    const totalCheck = safeChecklist.length;
    const completedCheck = safeChecklist.filter(c => c.completed).length;
    const checkPercent = totalCheck > 0 ? Math.round((completedCheck / totalCheck) * 100) : 0;
    const isOverdue = t.status !== 'completed' && t.dueDate && t.dueDate < new Date().toISOString().split('T')[0];

    return (
      <div 
        key={t.id} 
        className="card card-hover" 
        style={{ 
          padding: '16px', 
          display: 'flex', 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: '16px',
          cursor: 'pointer',
          borderLeft: `4px solid var(--${t.priority === 'urgent' ? 'danger' : t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'info'})`
        }}
        onClick={() => onSelectTask(t)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {t.title}
            </span>
            <span className={`badge ${getPriorityBadgeClass(t.priority)}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
              {getPriorityText(t.priority)}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {t.address && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <Monitor size={12} color="var(--text-muted)" />
                {t.address}
              </span>
            )}
            {t.dueDate && (
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                fontSize: '0.8rem', 
                color: isOverdue ? 'var(--danger)' : 'var(--text-secondary)',
                fontWeight: isOverdue ? 700 : 500
              }}>
                <Calendar size={12} />
                Fällig: {new Date(t.dueDate).toLocaleDateString('de-DE')}
              </span>
            )}
          </div>
        </div>

        {/* Progress bar / Checklist counter */}
        {totalCheck > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100px', flexShrink: 0 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{completedCheck}/{totalCheck} Check</span>
            <div style={{ height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', backgroundColor: 'var(--success)', width: `${checkPercent}%` }} />
            </div>
          </div>
        )}

        {/* Action button inside list */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          {t.status === 'planning' && (
            <button 
              className="btn btn-secondary" 
              style={{ padding: '6px 10px', fontSize: '0.75rem', gap: '4px' }}
              onClick={() => onUpdateTaskStatus(t.id, 'in_progress')}
              title="In Bearbeitung setzen"
            >
              <Play size={12} />
              <span>Starten</span>
            </button>
          )}
          {t.status === 'in_progress' && (
            <button 
              className="btn btn-primary" 
              style={{ padding: '6px 10px', fontSize: '0.75rem', gap: '4px', backgroundColor: 'var(--success)' }}
              onClick={() => onUpdateTaskStatus(t.id, 'completed')}
              title="Als Erledigt markieren"
            >
              <CheckCircle size={12} />
              <span>Erledigen</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Intro Hero banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--bg-sidebar), #1e293b)', 
        color: 'white', 
        padding: '24px', 
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ color: 'white', fontSize: '1.35rem', margin: 0, fontFamily: 'var(--font-heading)' }}>
            Guten Tag, Frank Kröner
          </h2>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
            Sie haben heute <strong style={{ color: 'white' }}>{activeTasks.length} aktive Aufgaben</strong> in Bearbeitung und {plannedTasks.length} Aufgaben in Planung.
          </p>
        </div>
        <div style={{ 
          width: '56px', 
          height: '56px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--primary-alpha)', 
          border: '1px solid var(--primary-border)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'var(--primary)'
        }}>
          <ClipboardCheck size={28} />
        </div>
      </div>

      {/* Columns: In Bearbeitung, In Planung, Erledigt */}
      <div className="grid-cols-3" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '24px' }}>
        
        {/* Column 1: In Bearbeitung */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
            In Bearbeitung ({activeTasks.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', backgroundColor: 'var(--bg-card)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Keine aktiven Aufgaben.
              </div>
            ) : (
              activeTasks.map(renderTaskRow)
            )}
          </div>
        </div>

        {/* Column 2: In Planung */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--warning)' }} />
            Anstehend / In Planung ({plannedTasks.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {plannedTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', backgroundColor: 'var(--bg-card)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Keine geplanten Aufgaben.
              </div>
            ) : (
              plannedTasks.map(renderTaskRow)
            )}
          </div>
        </div>

        {/* Column 3: Erledigt */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
            Kürzlich Erledigt ({completedTasks.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {completedTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', backgroundColor: 'var(--bg-card)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Noch keine Aufgaben abgeschlossen.
              </div>
            ) : (
              completedTasks.slice(0, 5).map(renderTaskRow)
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
