import React, { useState } from 'react';
import { Plus, SlidersHorizontal } from 'lucide-react';
import type { Task, User } from '../data/mockData';
import { TaskCard } from '../components/TaskCard';

interface KanbanViewProps {
  tasks: Task[];
  users: User[];
  onSelectTask: (task: Task) => void;
  onAddTask: (status?: Task['status']) => void;
  onUpdateTaskStatus: (taskId: string, status: Task['status']) => void;
  searchTerm: string;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  users,
  onSelectTask,
  onAddTask,
  onUpdateTaskStatus,
  searchTerm
}) => {
  // Filter states
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

  // Drag-over hover state for column coloring
  const [draggedOverColumn, setDraggedOverColumn] = useState<Task['status'] | null>(null);

  // Apply filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (task.address && task.address.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'all' || (task.assignees && task.assignees.includes(filterAssignee));
    
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const columns: { id: Task['status']; title: string }[] = [
    { id: 'planning', title: 'In Planung' },
    { id: 'in_progress', title: 'In Bearbeitung' },
    { id: 'completed', title: 'Erledigt' }
  ];

  // Drag events
  const handleDragOver = (e: React.DragEvent, colId: Task['status']) => {
    e.preventDefault();
    if (draggedOverColumn !== colId) {
      setDraggedOverColumn(colId);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, colId: Task['status']) => {
    e.preventDefault();
    setDraggedOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onUpdateTaskStatus(taskId, colId);
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header bar with filters and statistics */}
      <div className="board-header-bar">
        
        {/* Filters */}
        <div className="filters-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <SlidersHorizontal size={14} />
            <span>Filter:</span>
          </div>

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

        {/* Board Stats Summary */}
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Angezeigt: <strong style={{ color: 'var(--text-primary)' }}>{filteredTasks.length}</strong> von {tasks.length} Aufgaben
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="board-container">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          const isDragHover = draggedOverColumn === col.id;

          return (
            <div 
              key={col.id} 
              className={`kanban-column ${isDragHover ? 'drag-hover' : ''}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column Header */}
              <div className="column-header">
                <div className="column-title-wrapper">
                  <span className="column-title">{col.title}</span>
                  <span className="column-counter">{colTasks.length}</span>
                </div>
                <button 
                  className="theme-toggle-btn" 
                  style={{ padding: '4px', borderRadius: '4px' }}
                  onClick={() => onAddTask(col.id)}
                  title="Aufgabe in dieser Spalte erstellen"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Column Tasks */}
              <div className="column-cards">
                {colTasks.length === 0 ? (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: '32px 16px',
                    border: '1px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    backgroundColor: 'rgba(255,255,255,0.01)',
                    marginTop: '4px'
                  }}>
                    Keine Aufgaben
                    <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>Ziehen Sie eine Aufgabe hierher</span>
                  </div>
                ) : (
                  colTasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onClick={() => onSelectTask(task)} 
                      users={users}
                    />
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
