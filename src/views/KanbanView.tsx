import React, { useState } from 'react';
import { Plus, SlidersHorizontal, ChevronDown } from 'lucide-react';
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
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
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

  const columns: { id: Task['status']; title: string; color: string }[] = [
    { id: 'planning', title: 'In Planung', color: 'var(--gold)' },
    { id: 'in_progress', title: 'In Bearbeitung', color: 'var(--primary)' },
    { id: 'completed', title: 'Erledigt', color: 'var(--green)' }
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
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>
      
      {/* Toolbar from Mockup */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ink-3)' }}>
          <SlidersHorizontal size={16} strokeWidth={1.8} />
          <span>Filter</span>
        </div>

        {/* Priority Filter Wrapper */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select 
            style={{ 
              appearance: 'none',
              background: 'var(--bg-card)', 
              border: '1px solid var(--border-input)', 
              borderRadius: '10px', 
              padding: '9px 34px 9px 14px', 
              fontFamily: 'inherit', 
              fontSize: '13px', 
              fontWeight: 600, 
              color: 'var(--ink-2)', 
              cursor: 'pointer',
              outline: 'none'
            }}
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">Alle Prioritäten</option>
            <option value="low">Priorität: Niedrig</option>
            <option value="medium">Priorität: Mittel</option>
            <option value="high">Priorität: Hoch</option>
            <option value="urgent">Priorität: Dringend</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '12px', pointerEvents: 'none', color: 'var(--ink-3)' }} />
        </div>

        {/* Assignee Filter Wrapper */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select 
            style={{ 
              appearance: 'none',
              background: 'var(--bg-card)', 
              border: '1px solid var(--border-input)', 
              borderRadius: '10px', 
              padding: '9px 34px 9px 14px', 
              fontFamily: 'inherit', 
              fontSize: '13px', 
              fontWeight: 600, 
              color: 'var(--ink-2)', 
              cursor: 'pointer',
              outline: 'none'
            }}
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
          >
            <option value="all">Alle Mitarbeiter</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '12px', pointerEvents: 'none', color: 'var(--ink-3)' }} />
        </div>

        <span style={{ marginLeft: 'auto', fontSize: '12.5px', fontWeight: 500, color: 'var(--muted)' }}>
          {filteredTasks.length} von {tasks.length} Aufgaben angezeigt
        </span>
      </div>

      {/* Board Columns Grid from Mockup */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', alignItems: 'start', flex: 1 }}>
        {columns.map((col) => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          const isDragHover = draggedOverColumn === col.id;

          return (
            <div 
              key={col.id} 
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              style={{
                background: isDragHover ? 'var(--bg-hover)' : 'var(--well)',
                borderRadius: '16px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minHeight: '450px',
                border: isDragHover ? '1.5px dashed var(--primary)' : '1.5px solid transparent',
                transition: 'background var(--transition-fast), border var(--transition-fast)'
              }}
            >
              {/* Column Header from Mockup */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '4px 8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color, flex: 'none' }}></span>
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>
                  {col.title}
                </span>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ink-3)', background: 'var(--chip)', borderRadius: '999px', padding: '1px 8px' }}>
                  {colTasks.length}
                </span>
                <button 
                  onClick={() => onAddTask(col.id)}
                  style={{ 
                    marginLeft: 'auto', 
                    width: '26px', 
                    height: '26px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    background: 'transparent', 
                    color: 'var(--muted)', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    transition: 'background var(--transition-fast)'
                  }}
                  className="hover-btn-icon"
                  title="Aufgabe erstellen"
                >
                  <Plus size={15} strokeWidth={2} />
                </button>
              </div>

              {/* Task Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {colTasks.length === 0 ? (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: '32px 16px',
                    border: '1.5px dashed var(--border-input)',
                    borderRadius: '14px',
                    color: 'var(--muted)',
                    fontSize: '12px',
                    textAlign: 'center',
                    backgroundColor: 'transparent',
                    marginTop: '4px'
                  }}>
                    Keine Aufgaben
                    <span style={{ fontSize: '11px', marginTop: '4px', opacity: 0.7 }}>Ziehen Sie eine Aufgabe hierher</span>
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

              {/* Quick Add Button at the bottom */}
              <button 
                onClick={() => onAddTask(col.id)}
                style={{ 
                  border: '1.5px dashed var(--border-input)', 
                  background: 'transparent', 
                  borderRadius: '12px', 
                  padding: '11px', 
                  fontFamily: 'inherit', 
                  fontSize: '12.5px', 
                  fontWeight: 600, 
                  color: 'var(--muted)', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '7px',
                  transition: 'background var(--transition-fast), color var(--transition-fast)'
                }}
                className="hover-btn-icon"
              >
                <Plus size={14} strokeWidth={2.2} />
                Aufgabe hinzufügen
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

