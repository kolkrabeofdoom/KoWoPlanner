import React from 'react';
import { 
  CheckCircle, Play, Monitor, Calendar, 
  ClipboardCheck, Check
} from 'lucide-react';
import type { Task, Workspace } from '../data/mockData';

interface MyTasksViewProps {
  tasks: Task[];
  workspaces: Workspace[];
  onSelectTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, status: Task['status']) => void;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  tasks,
  workspaces,
  onSelectTask,
  onUpdateTaskStatus
}) => {
  // Filter tasks assigned to current user Frank Kröner (user-1)
  const myTasks = tasks.filter(t => t && t.assignees && t.assignees.includes('user-1'));

  const openTasks = myTasks.filter(t => t.status !== 'completed');
  const completedTasks = myTasks.filter(t => t.status === 'completed');

  // Month translation helper
  const getMonthGerman = (monthNum: number) => {
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    return months[monthNum - 1] || '';
  };

  // Helper to extract day and month
  const getDateParts = (dateStr: string) => {
    if (!dateStr) return { day: '', month: '' };
    const parts = dateStr.split('-');
    if (parts.length < 3) return { day: '', month: '' };
    const day = parseInt(parts[2]);
    const month = parseInt(parts[1]);
    return {
      day: day.toString(),
      month: getMonthGerman(month)
    };
  };

  // Helper to calculate relative due date label (Base: June 11, 2026)
  const getRelativeDateLabel = (dueDateStr: string, isCompleted: boolean) => {
    if (!dueDateStr) return '';
    const parts = dueDateStr.split('-');
    if (parts.length < 3) return dueDateStr;

    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);

    if (isCompleted) {
      // Just return DD.MM.
      return `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.`;
    }

    // June 2026 calculations
    if (year === 2026 && month === 6) {
      if (day === 11) return 'heute';
      if (day === 12) return 'morgen';
      if (day === 10) return 'gestern';
      if (day > 11) {
        return `in ${day - 11} Tagen`;
      } else {
        return `vor ${11 - day} Tagen`;
      }
    }

    // General fallback
    const dueTime = new Date(year, month - 1, day).getTime();
    const baseTime = new Date(2026, 5, 11).getTime();
    const diffDays = Math.round((dueTime - baseTime) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'heute';
    if (diffDays === 1) return 'morgen';
    if (diffDays === -1) return 'gestern';
    if (diffDays > 1) return `in ${diffDays} Tagen`;
    return `vor ${Math.abs(diffDays)} Tagen`;
  };

  // Get workspace badge styling
  const getWorkspaceBadgeStyle = (wsId: string) => {
    const ws = workspaces.find(w => w.id === wsId);
    const wsName = ws ? ws.name : '';

    if (wsId === 'ws-2') {
      // Mieter-Portal is purple in mockups
      return { text: wsName, color: 'var(--purple)', bg: 'var(--purple-tint)', dot: 'var(--purple)' };
    } else if (wsId === 'ws-3') {
      return { text: wsName, color: 'var(--green)', bg: 'var(--green-tint)', dot: 'var(--green)' };
    }
    // Default ws-1
    return { text: wsName, color: 'var(--primary)', bg: 'var(--primary-tint)', dot: 'var(--primary)' };
  };

  const renderTaskRow = (t: Task) => {
    const isCompleted = t.status === 'completed';
    const { day, month } = getDateParts(t.dueDate || t.startDate || '');

    const safeChecklist = t.checklist || [];
    const totalCheck = safeChecklist.length;
    const completedCheck = safeChecklist.filter(c => c.completed).length;
    const checkPercent = totalCheck > 0 ? Math.round((completedCheck / totalCheck) * 100) : 0;

    const wsStyle = getWorkspaceBadgeStyle(t.workspaceId);
    const relativeDate = getRelativeDateLabel(t.dueDate || '', isCompleted);

    return (
      <div 
        key={t.id} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px', 
          padding: '14px 6px', 
          borderBottom: '1px solid var(--border-soft)',
          cursor: 'pointer',
          opacity: isCompleted ? 0.65 : 1
        }}
        onClick={() => onSelectTask(t)}
        className="hover-timeline-row"
      >
        {/* Date block */}
        <div style={{ width: '46px', textAlign: 'center', flex: 'none' }}>
          <div style={{ 
            fontFamily: 'Space Grotesk', 
            fontSize: '17px', 
            fontWeight: 600, 
            color: isCompleted ? 'var(--ink-2)' : 'var(--ink)', 
            lineHeight: 1 
          }}>
            {day || '-'}
          </div>
          <div style={{ 
            fontSize: '10.5px', 
            fontWeight: 600, 
            textTransform: 'uppercase', 
            letterSpacing: '.05em', 
            color: 'var(--muted)',
            marginTop: '2px'
          }}>
            {month || '-'}
          </div>
        </div>

        {/* Title & Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            fontSize: '13.5px', 
            fontWeight: 600, 
            color: isCompleted ? 'var(--ink-2)' : 'var(--ink)',
            textDecoration: isCompleted ? 'line-through' : 'none',
            textDecorationColor: 'var(--faint)',
            textDecorationThickness: '1px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {t.title}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
            {/* Workspace Label Badge */}
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '5px', 
              fontSize: '10.5px', 
              fontWeight: 700, 
              color: wsStyle.color, 
              background: wsStyle.bg, 
              padding: '2px 8px', 
              borderRadius: '6px' 
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: wsStyle.dot }} />
              {wsStyle.text}
            </span>
            {t.address && (
              <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                {t.address}
              </span>
            )}
          </div>
        </div>

        {/* Subtasks Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '120px', flex: 'none' }}>
          <div style={{ flex: 1, height: '5px', borderRadius: '999px', background: 'var(--track)', overflow: 'hidden' }}>
            <div style={{ 
              width: `${checkPercent}%`, 
              height: '100%', 
              background: isCompleted ? 'var(--green)' : 'var(--primary)', 
              borderRadius: '999px' 
            }} />
          </div>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            color: isCompleted ? 'var(--green)' : 'var(--ink-3)', 
            fontVariantNumeric: 'tabular-nums' 
          }}>
            {completedCheck}/{totalCheck}
          </span>
        </div>

        {/* Priority Badge */}
        <div style={{ flex: 'none', width: '90px' }}>
          {t.priority === 'urgent' && (
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.05em', color: 'var(--red)', background: 'var(--red-tint)', padding: '4px 9px', borderRadius: '7px' }}>URGENT</span>
          )}
          {t.priority === 'high' && (
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.05em', color: 'var(--amber-deep)', background: 'var(--amber-tint)', padding: '4px 9px', borderRadius: '7px' }}>HIGH</span>
          )}
          {t.priority === 'medium' && (
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.05em', color: 'var(--primary)', background: 'var(--primary-tint)', padding: '4px 9px', borderRadius: '7px' }}>MEDIUM</span>
          )}
          {t.priority === 'low' && (
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.05em', color: 'var(--ink-3)', background: 'var(--chip)', padding: '4px 9px', borderRadius: '7px' }}>LOW</span>
          )}
        </div>

        {/* Status Badge */}
        <div style={{ flex: 'none', width: '130px' }}>
          {isCompleted ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--green)', background: 'var(--green-tint)', padding: '4px 10px', borderRadius: '999px' }}>
              <Check size={11} stroke="var(--green)" strokeWidth={3} style={{ marginRight: '-2px' }} />
              Erledigt
            </span>
          ) : t.status === 'in_progress' ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-tint)', padding: '4px 10px', borderRadius: '999px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
              In Bearbeitung
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--amber)', background: 'var(--amber-tint)', padding: '4px 10px', borderRadius: '999px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)' }} />
              In Planung
            </span>
          )}
        </div>

        {/* Relative Date string */}
        <div style={{ 
          fontSize: '12px', 
          fontWeight: 600, 
          color: isCompleted ? 'var(--muted)' : 'var(--ink-3)', 
          width: '74px', 
          textAlign: 'right', 
          flex: 'none' 
        }}>
          {relativeDate}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1060px' }}>
      
      {/* Greeting and stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '18px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.01em', margin: 0 }}>
            Guten Morgen, Frank 👋
          </h2>
          <div style={{ fontSize: '12.5px', color: 'var(--ink-3)', marginTop: '2px' }}>
            Donnerstag, 11. Juni 2026 · Deine Aufgaben über alle Arbeitsbereiche
          </div>
        </div>
        
        {/* Stats boxes on the right */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '999px', padding: '7px 14px', fontSize: '12px', fontWeight: 700, color: 'var(--ink-2)' }}>
            <span style={{ fontFamily: 'Space Grotesk', fontSize: '14px', color: 'var(--ink)' }}>{myTasks.length}</span> zugewiesen
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '999px', padding: '7px 14px', fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
            <span style={{ fontFamily: 'Space Grotesk', fontSize: '14px' }}>{openTasks.length}</span> offen
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '999px', padding: '7px 14px', fontSize: '12px', fontWeight: 700, color: 'var(--green)' }}>
            <span style={{ fontFamily: 'Space Grotesk', fontSize: '14px' }}>{completedTasks.length}</span> erledigt
          </span>
        </div>
      </div>

      {/* OFFEN SECTION CARD */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '22px 24px', boxShadow: 'var(--shadow-card)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span>
          <span style={{ fontFamily: 'Space Grotesk', fontSize: '15px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.01em' }}>Offen</span>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ink-3)', background: 'var(--chip)', borderRadius: '999px', padding: '1px 8px' }}>
            {openTasks.length}
          </span>
        </div>

        {/* List of open tasks */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {openTasks.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Keine offenen Aufgaben zugewiesen.
            </div>
          ) : (
            openTasks.map(renderTaskRow)
          )}
        </div>
      </div>

      {/* ERLEDIGT SECTION CARD */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '22px 24px', boxShadow: 'var(--shadow-card)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)' }}></span>
          <span style={{ fontFamily: 'Space Grotesk', fontSize: '15px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.01em' }}>Erledigt</span>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ink-3)', background: 'var(--chip)', borderRadius: '999px', padding: '1px 8px' }}>
            {completedTasks.length}
          </span>
        </div>

        {/* List of completed tasks */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {completedTasks.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Noch keine Aufgaben abgeschlossen.
            </div>
          ) : (
            completedTasks.map(renderTaskRow)
          )}
        </div>
      </div>

    </div>
  );
};
