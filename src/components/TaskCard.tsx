import React from 'react';
import { Calendar, CheckSquare, MessageSquare } from 'lucide-react';
import type { Task, User } from '../data/mockData';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  users: User[];
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, users = [] }) => {
  // Find assignee users
  const safeUsers = users || [];
  const safeAssignees = task.assignees || [];
  const assignees = safeUsers.filter(u => safeAssignees.includes(u.id));

  // Checklist calculations
  const safeChecklist = task.checklist || [];
  const totalChecklist = safeChecklist.length;
  const completedChecklist = safeChecklist.filter(item => item.completed).length;
  const checklistPercent = totalChecklist > 0 ? (completedChecklist / totalChecklist) * 100 : 0;

  // Format date helper (DD.MM.)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'Niedrig';
      case 'medium': return 'Mittel';
      case 'high': return 'Hoch';
      case 'urgent': return 'Dringend';
      default: return priority;
    }
  };

  // Drag start handler
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      className="ticket-card"
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
    >
      {/* Priority Bar Indicator on the left */}
      <div className={`ticket-priority-indicator priority-${task.priority}`} />

      {/* Card Header: Priority badge & Checklist indicator */}
      <div className="ticket-header">
        <span className={`badge badge-${task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}`}>
          {getPriorityText(task.priority)}
        </span>
        
        {totalChecklist > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <CheckSquare size={12} />
            <span>{completedChecklist}/{totalChecklist}</span>
          </div>
        )}
      </div>

      {/* Task Title */}
      <div className="ticket-title">
        {task.title}
      </div>

      {/* Task System / Location (IT focused) */}
      {task.address && (
        <div className="ticket-address">
          <span>🖥️</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.address}</span>
        </div>
      )}

      {/* Checklist Progress Bar */}
      {totalChecklist > 0 && (
        <div className="ticket-progress-bar">
          <div className="ticket-progress-fill" style={{ width: `${checklistPercent}%` }} />
        </div>
      )}

      {/* Footer: Assignees overlapping avatars + due date */}
      <div className="ticket-footer">
        {/* Assignees Avatars Stack */}
        <div className="ticket-assignees">
          {assignees.map((user) => (
            <div 
              key={user.id} 
              className="assignee-avatar-stack" 
              style={{ backgroundColor: user.color, color: '#fff' }}
              title={`${user.name} (${user.role})`}
            >
              {user.avatarInitials}
            </div>
          ))}
          {assignees.length === 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Unzugewiesen</span>
          )}
        </div>

        {/* Due Date & Comments Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {task.comments.length > 0 && (
            <div className="ticket-date" style={{ gap: '2px' }} title={`${task.comments.length} Kommentare`}>
              <MessageSquare size={12} />
              <span>{task.comments.length}</span>
            </div>
          )}
          
          {task.dueDate && (
            <div className="ticket-date">
              <Calendar size={12} />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
