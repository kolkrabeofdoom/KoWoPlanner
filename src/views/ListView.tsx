import React, { useState } from 'react';
import { 
  SlidersHorizontal, CheckSquare, Trash2, ArrowUpDown, 
  Monitor, Calendar, Play, Check, X
} from 'lucide-react';
import type { Task, User } from '../data/mockData';

interface ListViewProps {
  tasks: Task[];
  users: User[];
  onSelectTask: (task: Task) => void;
  onUpdateBulkStatus: (taskIds: string[], status: Task['status']) => void;
  onDeleteBulkTasks: (taskIds: string[]) => void;
  searchTerm: string;
}

type SortField = 'title' | 'dueDate' | 'priority' | 'status';
type SortOrder = 'asc' | 'desc';

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  users,
  onSelectTask,
  onUpdateBulkStatus,
  onDeleteBulkTasks,
  searchTerm
}) => {
  // Filter states
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Multi-select state
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Toggle selection for a single task
  const handleSelectTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening details modal
    setSelectedTaskIds(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  // Toggle select all tasks currently visible
  const handleSelectAll = (visibleTasks: Task[]) => {
    const visibleIds = visibleTasks.map(t => t.id);
    const allSelected = visibleIds.every(id => selectedTaskIds.includes(id));
    
    if (allSelected) {
      // Uncheck all visible
      setSelectedTaskIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      // Check all visible
      setSelectedTaskIds(prev => {
        const newSelection = [...prev];
        visibleIds.forEach(id => {
          if (!newSelection.includes(id)) newSelection.push(id);
        });
        return newSelection;
      });
    }
  };

  // Priority weight for sorting
  const getPriorityWeight = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  // Status weight for sorting
  const getStatusWeight = (status: Task['status']) => {
    switch (status) {
      case 'planning': return 1;
      case 'in_progress': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (task.address && task.address.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesAssignee = filterAssignee === 'all' || (task.assignees && task.assignees.includes(filterAssignee));
    
    return matchesSearch && matchesPriority && matchesStatus && matchesAssignee;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortField === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (sortField === 'priority') {
      comparison = getPriorityWeight(a.priority) - getPriorityWeight(b.priority);
    } else if (sortField === 'status') {
      comparison = getStatusWeight(a.status) - getStatusWeight(b.status);
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Handle header sorting click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Bulk actions triggers
  const handleBulkStatus = (status: Task['status']) => {
    onUpdateBulkStatus(selectedTaskIds, status);
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = () => {
    if (confirm(`Möchten Sie die ${selectedTaskIds.length} ausgewählten Aufgaben wirklich löschen?`)) {
      onDeleteBulkTasks(selectedTaskIds);
      setSelectedTaskIds([]);
    }
  };

  // Date Label Helper (Simulated time: June 11, 2026)
  const getDueDateLabel = (dueDateStr: string, isCompleted: boolean) => {
    if (!dueDateStr) return null;
    const parts = dueDateStr.split('-');
    if (parts.length < 3) return { text: dueDateStr, isOverdue: false, isUrgent: false };

    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);

    // Format date string as DD.MM.YYYY
    const formattedDate = `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${year}`;

    if (isCompleted) {
      return { text: formattedDate, label: null, isOverdue: false, isUrgent: false };
    }

    // Since our system date is June 11, 2026
    if (year === 2026 && month === 6) {
      if (day === 11) {
        return { text: formattedDate, label: 'Heute fällig', isOverdue: false, isUrgent: true };
      } else if (day === 12) {
        return { text: formattedDate, label: 'Morgen fällig', isOverdue: false, isUrgent: true };
      } else if (day < 11) {
        return { text: formattedDate, label: 'Überfällig', isOverdue: true, isUrgent: true };
      }
    } else if (year < 2026 || (year === 2026 && month < 6)) {
      return { text: formattedDate, label: 'Überfällig', isOverdue: true, isUrgent: true };
    }

    return { text: formattedDate, label: null, isOverdue: false, isUrgent: false };
  };

  const allSelected = sortedTasks.length > 0 && sortedTasks.every(t => selectedTaskIds.includes(t.id));

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Filters Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Status Filter Dropdown */}
        <div style={{ position: 'relative' }}>
          <select 
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-input)',
              borderRadius: '10px',
              padding: '9px 34px 9px 14px',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink-2)',
              cursor: 'pointer',
              outline: 'none',
            }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Status: Alle</option>
            <option value="planning">Status: In Planung</option>
            <option value="in_progress">Status: In Bearbeitung</option>
            <option value="completed">Status: Erledigt</option>
          </select>
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ink-3)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6,9 12,15 18,9"/></svg>
          </div>
        </div>

        {/* Priority Filter Dropdown */}
        <div style={{ position: 'relative' }}>
          <select 
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-input)',
              borderRadius: '10px',
              padding: '9px 34px 9px 14px',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink-2)',
              cursor: 'pointer',
              outline: 'none',
            }}
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">Priorität: Alle</option>
            <option value="low">Priorität: Niedrig</option>
            <option value="medium">Priorität: Mittel</option>
            <option value="high">Priorität: Hoch</option>
            <option value="urgent">Priorität: Dringend</option>
          </select>
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ink-3)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6,9 12,15 18,9"/></svg>
          </div>
        </div>

        {/* Assignee Filter Dropdown */}
        <div style={{ position: 'relative' }}>
          <select 
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-input)',
              borderRadius: '10px',
              padding: '9px 34px 9px 14px',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink-2)',
              cursor: 'pointer',
              outline: 'none',
            }}
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
          >
            <option value="all">Zuständig: Alle</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>Zuständig: {u.name}</option>
            ))}
          </select>
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ink-3)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6,9 12,15 18,9"/></svg>
          </div>
        </div>

        {/* Total stats */}
        <span style={{ marginLeft: 'auto', fontSize: '12.5px', fontWeight: 500, color: 'var(--muted)' }}>
          {sortedTasks.length} {sortedTasks.length === 1 ? 'Aufgabe' : 'Aufgaben'} · sortiert nach {sortField === 'dueDate' ? 'Fälligkeit' : sortField === 'title' ? 'Titel' : sortField === 'priority' ? 'Priorität' : 'Status'}
        </span>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedTaskIds.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--primary-tint)', border: '1px solid var(--border-input)', borderRadius: '12px', padding: '10px 16px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
            {selectedTaskIds.length} {selectedTaskIds.length === 1 ? 'Aufgabe ausgewählt' : 'Aufgaben ausgewählt'}
          </span>
          <span style={{ width: '1px', height: '18px', background: 'var(--border-input)' }} />
          
          <button 
            className="btn btn-secondary" 
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-input)', borderRadius: '9px', padding: '7px 12px', fontSize: '12px', fontWeight: 600, color: 'var(--ink-2)' }}
            onClick={() => handleBulkStatus('completed')}
          >
            Als Erledigt markieren
          </button>
          <button 
            className="btn btn-secondary" 
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-input)', borderRadius: '9px', padding: '7px 12px', fontSize: '12px', fontWeight: 600, color: 'var(--ink-2)' }}
            onClick={() => handleBulkStatus('in_progress')}
          >
            In Bearbeitung setzen
          </button>
          <button 
            className="btn" 
            style={{ background: 'var(--red-tint)', border: 'none', borderRadius: '9px', padding: '7px 12px', fontSize: '12px', fontWeight: 700, color: 'var(--red)', cursor: 'pointer' }}
            onClick={handleBulkDelete}
          >
            Löschen
          </button>
          
          <button 
            title="Auswahl aufheben" 
            style={{ marginLeft: 'auto', width: '28px', height: '28px', border: 'none', background: 'transparent', color: 'var(--ink-3)', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setSelectedTaskIds([])}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Grid Card Layout (No table tag) */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '10px 24px 14px', boxShadow: 'var(--shadow-card)' }}>
        
        {/* Table Header Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '36px minmax(0,1fr) 136px 104px 104px 110px', gap: '0 12px', alignItems: 'center', padding: '12px 0 10px', borderBottom: '1px solid var(--border-soft)' }}>
          {/* Checkbox Header */}
          <div onClick={() => handleSelectAll(sortedTasks)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {allSelected ? (
              <span style={{ width: '18px', height: '18px', borderRadius: '6px', background: 'var(--primary-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={11} stroke="#fff" strokeWidth={3} />
              </span>
            ) : (
              <span style={{ width: '18px', height: '18px', borderRadius: '6px', border: '1.5px solid var(--border-input)', display: 'block' }} />
            )}
          </div>
          
          {/* Column Sort Buttons */}
          <button onClick={() => handleSort('title')} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: '10.5px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: sortField === 'title' ? 'var(--primary)' : 'var(--muted)', cursor: 'pointer', padding: 0 }}>
            Aufgabe
            <ArrowUpDown size={11} />
          </button>
          
          <button onClick={() => handleSort('status')} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: '10.5px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: sortField === 'status' ? 'var(--primary)' : 'var(--muted)', cursor: 'pointer', padding: 0 }}>
            Status
            <ArrowUpDown size={11} />
          </button>
          
          <button onClick={() => handleSort('priority')} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: '10.5px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: sortField === 'priority' ? 'var(--primary)' : 'var(--muted)', cursor: 'pointer', padding: 0 }}>
            Priorität
            <ArrowUpDown size={11} />
          </button>
          
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10.5px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Zuständige
          </span>
          
          <button onClick={() => handleSort('dueDate')} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: '10.5px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: sortField === 'dueDate' ? 'var(--primary)' : 'var(--muted)', cursor: 'pointer', padding: 0 }}>
            Fälligkeit
            <ArrowUpDown size={11} />
          </button>
        </div>

        {/* Table Rows */}
        {sortedTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Keine Aufgaben gefunden, die den Filtern entsprechen.
          </div>
        ) : (
          sortedTasks.map((task) => {
            const safeAssignees = task.assignees || [];
            const assignees = users.filter(u => safeAssignees.includes(u.id));
            const safeChecklist = task.checklist || [];
            const totalCheck = safeChecklist.length;
            const completedCheck = safeChecklist.filter(c => c.completed).length;
            const isSelected = selectedTaskIds.includes(task.id);
            const isCompleted = task.status === 'completed';

            // Generate subtitle string
            const subtitleParts = [];
            if (task.address) {
              subtitleParts.push(task.address);
            }
            if (totalCheck > 0) {
              subtitleParts.push(`${completedCheck}/${totalCheck} Unteraufgaben`);
            }
            const subtitle = subtitleParts.join(' · ');

            // Calculate Due Date status labels
            const dateInfo = getDueDateLabel(task.dueDate || '', isCompleted);

            return (
              <div 
                key={task.id} 
                onClick={() => onSelectTask(task)}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '36px minmax(0,1fr) 136px 104px 104px 110px', 
                  gap: '0 12px', 
                  alignItems: 'center', 
                  padding: '13px 0', 
                  borderBottom: '1px solid var(--border-soft)',
                  opacity: isCompleted ? 0.65 : 1,
                  background: isSelected ? 'var(--primary-tint)' : 'transparent',
                  transition: 'background var(--transition-fast)',
                  cursor: 'pointer'
                }}
                className="hover-timeline-row"
              >
                {/* Selection Checkbox Cell */}
                <div onClick={(e) => handleSelectTask(task.id, e)} style={{ display: 'flex', alignItems: 'center' }}>
                  {isSelected ? (
                    <span style={{ width: '18px', height: '18px', borderRadius: '6px', background: 'var(--primary-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Check size={11} stroke="#fff" strokeWidth={3} />
                    </span>
                  ) : (
                    <span style={{ width: '18px', height: '18px', borderRadius: '6px', border: '1.5px solid var(--border-input)', display: 'block', cursor: 'pointer' }} />
                  )}
                </div>

                {/* Title and details */}
                <div style={{ minWidth: 0 }}>
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
                    {task.title}
                  </div>
                  {subtitle && (
                    <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {subtitle}
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div>
                  {task.status === 'completed' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--green)', background: 'var(--green-tint)', padding: '4px 10px', borderRadius: '999px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)' }} />
                      Erledigt
                    </span>
                  )}
                  {task.status === 'in_progress' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-tint)', padding: '4px 10px', borderRadius: '999px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                      In Bearbeitung
                    </span>
                  )}
                  {task.status === 'planning' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--amber)', background: 'var(--amber-tint)', padding: '4px 10px', borderRadius: '999px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)' }} />
                      In Planung
                    </span>
                  )}
                </div>

                {/* Priority Badge */}
                <div>
                  {task.priority === 'urgent' && (
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.05em', color: 'var(--red)', background: 'var(--red-tint)', padding: '4px 9px', borderRadius: '7px' }}>
                      URGENT
                    </span>
                  )}
                  {task.priority === 'high' && (
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.05em', color: 'var(--amber-deep)', background: 'var(--amber-tint)', padding: '4px 9px', borderRadius: '7px' }}>
                      HIGH
                    </span>
                  )}
                  {task.priority === 'medium' && (
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.05em', color: 'var(--primary)', background: 'var(--primary-tint)', padding: '4px 9px', borderRadius: '7px' }}>
                      MEDIUM
                    </span>
                  )}
                  {task.priority === 'low' && (
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.05em', color: 'var(--ink-3)', background: 'var(--chip)', padding: '4px 9px', borderRadius: '7px' }}>
                      LOW
                    </span>
                  )}
                </div>

                {/* Assignees stack */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {assignees.map((user, uIdx) => (
                    <div 
                      key={user.id}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: user.color,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 700,
                        border: '2px solid var(--bg-card)',
                        marginLeft: uIdx > 0 ? '-8px' : '0',
                        zIndex: 5 - uIdx
                      }}
                      title={user.name}
                    >
                      {user.avatarInitials}
                    </div>
                  ))}
                  {assignees.length === 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>-</span>
                  )}
                </div>

                {/* Due Date Cell with status notifications */}
                <div>
                  {dateInfo ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ 
                        fontSize: '12.5px', 
                        fontWeight: dateInfo.isUrgent ? 700 : 600, 
                        color: dateInfo.isOverdue ? 'var(--red)' : 'var(--ink-2)', 
                        fontVariantNumeric: 'tabular-nums' 
                      }}>
                        {dateInfo.text}
                      </div>
                      {dateInfo.label && (
                        <div style={{ 
                          fontSize: '11px', 
                          fontWeight: 600, 
                          color: dateInfo.isOverdue ? 'var(--red)' : 'var(--amber)', 
                          marginTop: '1px' 
                        }}>
                          {dateInfo.label}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

