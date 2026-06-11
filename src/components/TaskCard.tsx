import React from 'react';
import { Calendar, CheckSquare, MessageSquare, Paperclip, Monitor } from 'lucide-react';
import type { Task, User } from '../data/mockData';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  users: User[];
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, users = [] }) => {
  const safeUsers = users || [];
  const safeAssignees = task.assignees || [];
  const assignees = safeUsers.filter(u => safeAssignees.includes(u.id));

  // Checklist calculations
  const safeChecklist = task.checklist || [];
  const totalChecklist = safeChecklist.length;
  const completedChecklist = safeChecklist.filter(item => item.completed).length;
  const checklistPercent = totalChecklist > 0 ? (completedChecklist / totalChecklist) * 100 : 0;

  // Format date helper (DD. Month in German)
  const formatDateGerman = (dateStr: string) => {
    if (!dateStr) return '';
    const months = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];
    const date = new Date(dateStr);
    return `${date.getDate()}. ${months[date.getMonth()]}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'var(--red)';
      case 'high': return 'var(--amber-deep)';
      case 'medium': return 'var(--primary)';
      default: return 'var(--ink-3)';
    }
  };

  const getPriorityTint = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'var(--red-tint)';
      case 'high': return 'var(--amber-tint)';
      case 'medium': return 'var(--primary-tint)';
      default: return 'var(--chip)';
    }
  };

  const getPriorityText = (priority: string) => {
    return priority.toUpperCase();
  };

  // Drag start handler
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const isUrgent = task.priority === 'urgent' && task.status !== 'completed';
  const borderStyle = isUrgent ? '1px solid var(--red-border)' : '1px solid var(--border)';
  const bgStyle = isUrgent ? 'var(--red-card)' : 'var(--bg-card)';

  return (
    <div 
      style={{
        background: bgStyle,
        border: borderStyle,
        borderRadius: '14px',
        padding: '16px',
        boxShadow: 'var(--shadow-card)',
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        gap: '0px',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
      }}
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="kanban-task-card"
    >
      {/* Card Header: Priority badge & Due date */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ 
          fontSize: '10px', 
          fontWeight: 700, 
          letterSpacing: '.05em', 
          color: getPriorityColor(task.priority), 
          background: getPriorityTint(task.priority), 
          padding: '4px 9px', 
          borderRadius: '7px' 
        }}>
          {task.status === 'completed' ? 'ERLEDIGT' : getPriorityText(task.priority)}
        </span>
        
        {task.dueDate && (
          <span style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px', 
            fontSize: '11.5px', 
            fontWeight: 600, 
            color: isUrgent ? 'var(--red)' : 'var(--ink-3)' 
          }}>
            <Calendar size={13} strokeWidth={1.8} />
            {formatDateGerman(task.dueDate)}
          </span>
        )}
      </div>

      {/* Title */}
      <div style={{ 
        fontSize: '14px', 
        fontWeight: 600, 
        color: task.status === 'completed' ? 'var(--ink-2)' : 'var(--ink)', 
        lineHeight: 1.4, 
        margin: '11px 0 5px',
        textDecoration: task.status === 'completed' ? 'line-through' : 'none'
      }}>
        {task.title}
      </div>

      {/* Address / Location */}
      {task.address && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--muted)', fontWeight: 500 }}>
          <Monitor size={13} strokeWidth={1.7} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.address}</span>
        </div>
      )}

      {/* Checklist Progress Bar */}
      {totalChecklist > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
          <div style={{ flex: 1, height: '5px', borderRadius: '999px', background: 'var(--track)', overflow: 'hidden' }}>
            <div style={{ 
              width: `${checklistPercent}%`, 
              height: '100%', 
              background: task.status === 'completed' ? 'var(--green)' : 'var(--primary)', 
              borderRadius: '999px',
              transition: 'width 0.3s ease-out'
            }} />
          </div>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            color: task.status === 'completed' ? 'var(--green)' : 'var(--ink-3)', 
            fontVariantNumeric: 'tabular-nums' 
          }}>{completedChecklist}/{totalChecklist}</span>
        </div>
      )}

      {/* Card Footer */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginTop: '13px', 
        paddingTop: '13px', 
        borderTop: '1px solid var(--border-soft)' 
      }}>
        {/* Assignees stack */}
        <div style={{ display: 'flex' }}>
          {assignees.map((user, idx) => (
            <div 
              key={user.id} 
              style={{ 
                width: '26px', 
                height: '26px', 
                borderRadius: '50%', 
                backgroundColor: user.color || 'var(--primary)', 
                color: '#fff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '10px', 
                fontWeight: 700, 
                border: '2px solid var(--bg-card)',
                marginLeft: idx > 0 ? '-8px' : '0px',
                flexShrink: 0
              }}
              title={user.name}
            >
              {user.avatarInitials}
            </div>
          ))}
          {assignees.length === 0 && (
            <span style={{ fontSize: '11.5px', color: 'var(--muted)', fontStyle: 'italic' }}>Unzugewiesen</span>
          )}
        </div>

        {/* Indicators on the right */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--muted)' }}>
          {task.comments && task.comments.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 600 }}>
              <MessageSquare size={13} strokeWidth={1.8} />
              {task.comments.length}
            </span>
          )}
          {task.attachments && task.attachments.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 600 }}>
              <Paperclip size={13} strokeWidth={1.8} />
              {task.attachments.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

