import React, { useState } from 'react';
import { 
  SlidersHorizontal, CheckSquare, Trash2, ArrowUpDown, 
  Monitor, Calendar, Play
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

  // Status mapping to german
  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'planning': return 'In Planung';
      case 'in_progress': return 'In Bearbeitung';
      case 'completed': return 'Erledigt';
      default: return status;
    }
  };

  const getPriorityText = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return 'Niedrig';
      case 'medium': return 'Mittel';
      case 'high': return 'Hoch';
      case 'urgent': return 'Dringend';
      default: return priority;
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

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Filters & Header Toolbar */}
      <div className="board-header-bar">
        
        {/* Filters */}
        <div className="filters-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <SlidersHorizontal size={14} />
            <span>Filter:</span>
          </div>

          {/* Status Filter */}
          <select 
            className="form-control" 
            style={{ padding: '6px 12px', fontSize: '0.85rem', minWidth: '130px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Alle Stati</option>
            <option value="planning">Status: In Planung</option>
            <option value="in_progress">Status: In Bearbeitung</option>
            <option value="completed">Status: Erledigt</option>
          </select>

          {/* Priority Filter */}
          <select 
            className="form-control" 
            style={{ padding: '6px 12px', fontSize: '0.85rem', minWidth: '130px' }}
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">Alle Prioritäten</option>
            <option value="low">Priorität: Niedrig</option>
            <option value="medium">Priorität: Mittel</option>
            <option value="high">Priorität: Hoch</option>
            <option value="urgent">Priorität: Dringend</option>
          </select>

          {/* Assignee Filter */}
          <select 
            className="form-control" 
            style={{ padding: '6px 12px', fontSize: '0.85rem', minWidth: '150px' }}
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
          >
            <option value="all">Alle Mitarbeiter</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>Mitarbeiter: {u.name}</option>
            ))}
          </select>
        </div>

        {/* Total stats */}
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Ergebnisse: <strong style={{ color: 'var(--text-primary)' }}>{sortedTasks.length}</strong> Aufgaben
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedTaskIds.length > 0 && (
        <div className="list-bulk-actions">
          <span className="list-bulk-text">
            {selectedTaskIds.length} {selectedTaskIds.length === 1 ? 'Aufgabe ausgewählt' : 'Aufgaben ausgewählt'}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px', color: 'var(--success)', borderColor: 'var(--success)' }}
              onClick={() => handleBulkStatus('completed')}
            >
              <CheckSquare size={14} />
              Als Erledigt markieren
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px', color: 'var(--primary)', borderColor: 'var(--primary)' }}
              onClick={() => handleBulkStatus('in_progress')}
            >
              <Play size={14} />
              In Bearbeitung setzen
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
              onClick={handleBulkDelete}
            >
              <Trash2 size={14} />
              Ausgewählte löschen
            </button>
          </div>
        </div>
      )}

      {/* List Table Grid Card */}
      <div className="card list-table-card">
        <table className="list-table">
          <thead>
            <tr>
              <th style={{ width: '40px', paddingRight: 0 }}>
                <input 
                  type="checkbox" 
                  className="list-table-checkbox" 
                  checked={sortedTasks.length > 0 && sortedTasks.every(t => selectedTaskIds.includes(t.id))}
                  onChange={() => handleSelectAll(sortedTasks)}
                />
              </th>
              
              <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Aufgabe
                  <ArrowUpDown size={12} />
                </div>
              </th>

              <th onClick={() => handleSort('status')} style={{ cursor: 'pointer', width: '150px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Status
                  <ArrowUpDown size={12} />
                </div>
              </th>

              <th onClick={() => handleSort('priority')} style={{ cursor: 'pointer', width: '130px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Priorität
                  <ArrowUpDown size={12} />
                </div>
              </th>

              <th>System / Ort</th>
              
              <th style={{ width: '130px' }}>Zuständig</th>
              
              <th onClick={() => handleSort('dueDate')} style={{ cursor: 'pointer', width: '140px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Fälligkeit
                  <ArrowUpDown size={12} />
                </div>
              </th>

              <th style={{ width: '110px' }}>Checklist</th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Keine Aufgaben gefunden, die den Filtern entsprechen.
                </td>
              </tr>
            ) : (
              sortedTasks.map((task) => {
                const safeAssignees = task.assignees || [];
                const assignees = users.filter(u => safeAssignees.includes(u.id));
                const safeChecklist = task.checklist || [];
                const totalCheck = safeChecklist.length;
                const completedCheck = safeChecklist.filter(c => c.completed).length;
                const checkPercent = totalCheck > 0 ? Math.round((completedCheck / totalCheck) * 100) : 0;
                const isSelected = selectedTaskIds.includes(task.id);
                const isOverdue = task.status !== 'completed' && task.dueDate && task.dueDate < new Date().toISOString().split('T')[0];

                return (
                  <tr 
                    key={task.id} 
                    onClick={() => onSelectTask(task)}
                    style={{ backgroundColor: isSelected ? 'var(--primary-alpha)' : '' }}
                  >
                    {/* Selection Checkbox */}
                    <td onClick={(e) => e.stopPropagation()} style={{ paddingRight: 0 }}>
                      <input 
                        type="checkbox" 
                        className="list-table-checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectTask(task.id, e as any)}
                      />
                    </td>

                    {/* Task Title */}
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</span>
                    </td>

                    {/* Status Badge */}
                    <td>
                      <span className={`badge badge-${task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'primary' : 'warning'}`}>
                        {getStatusText(task.status)}
                      </span>
                    </td>

                    {/* Priority Badge */}
                    <td>
                      <span className={`badge badge-${task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}`}>
                        {getPriorityText(task.priority)}
                      </span>
                    </td>

                     {/* System / Location */}
                     <td>
                       {task.address ? (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                           <Monitor size={12} color="var(--text-muted)" />
                           <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                             {task.address}
                           </span>
                         </div>
                       ) : (
                         <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                       )}
                     </td>

                    {/* Assignees stack */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {assignees.map(user => (
                          <div 
                            key={user.id}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: user.color,
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              border: '2px solid var(--bg-card)',
                              marginLeft: '-6px'
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
                    </td>

                    {/* Due Date */}
                    <td>
                      {task.dueDate ? (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          fontSize: '0.85rem',
                          color: isOverdue ? 'var(--danger)' : 'var(--text-secondary)',
                          fontWeight: isOverdue ? 700 : 500
                        }}>
                          <Calendar size={12} />
                          <span>
                            {new Date(task.dueDate).toLocaleDateString('de-DE')}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                      )}
                    </td>

                    {/* Checklist stats */}
                    <td>
                      {totalCheck > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{completedCheck}/{totalCheck} ({checkPercent}%)</span>
                          <div style={{ height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', backgroundColor: 'var(--success)', width: `${checkPercent}%` }} />
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                      )}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
