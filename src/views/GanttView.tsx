import React, { useState } from 'react';
import { SlidersHorizontal, Monitor } from 'lucide-react';
import type { Task, User } from '../data/mockData';

interface GanttViewProps {
  tasks: Task[];
  users: User[];
  onSelectTask: (task: Task) => void;
}

export const GanttView: React.FC<GanttViewProps> = ({
  tasks,
  users,
  onSelectTask
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

  // We focus on June 2026 (matching our mock data range)
  const totalDays = 30;
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Parse date into June 2026 day (1 to 30)
  const parseDayString = (dateStr: string, isEnd = false): number => {
    if (!dateStr) return isEnd ? 30 : 1;
    const parts = dateStr.split('-');
    if (parts.length < 3) return isEnd ? 30 : 1;
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);

    if (year === 2026 && month === 6) {
      return day;
    }
    // Clamping dates outside of June 2026
    if (year < 2026 || (year === 2026 && month < 6)) {
      return 1;
    }
    return 30;
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'all' || (task.assignees && task.assignees.includes(filterAssignee));
    return matchesPriority && matchesAssignee;
  });

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'var(--danger)';
      case 'high': return 'var(--danger)';
      case 'medium': return 'var(--warning)';
      case 'low': return 'var(--info)';
      default: return 'var(--primary)';
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

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Filter toolbar */}
      <div className="board-header-bar">
        <div className="filters-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <SlidersHorizontal size={14} />
            <span>Filter:</span>
          </div>

          {/* Priority filter */}
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

          {/* Assignee filter */}
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

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Angezeigt: <strong style={{ color: 'var(--text-primary)' }}>{filteredTasks.length}</strong> von {tasks.length} Aufgaben
        </div>
      </div>

      {/* Gantt Container Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Split layout container */}
        <div style={{ display: 'flex', minWidth: '100%', overflowX: 'auto' }}>
          
          {/* Left: Task Titles Fixed Side */}
          <div style={{ 
            width: '280px', 
            flexShrink: 0, 
            borderRight: '1px solid var(--border-color)', 
            backgroundColor: 'var(--bg-card)',
            zIndex: 10
          }}>
            {/* Header Cell */}
            <div style={{ 
              height: '48px', 
              padding: '12px 16px', 
              borderBottom: '1px solid var(--border-color)', 
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center'
            }}>
              IT-Aufgabe / System
            </div>

            {/* Task rows */}
            {filteredTasks.map(task => {
              return (
                <div 
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="gantt-row-title-cell"
                  style={{
                    height: '60px',
                    padding: '10px 16px',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background-color var(--transition-fast)'
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.title}
                  </span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span className={`badge badge-${task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}`} style={{ fontSize: '0.6rem', padding: '1px 4px' }}>
                      {getPriorityText(task.priority)}
                    </span>
                    {task.address && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Monitor size={10} />
                        {task.address}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div style={{ padding: '24px 16px', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Keine Aufgaben
              </div>
            )}
          </div>

          {/* Right: Timeline Calendar Grid Side */}
          <div style={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            minWidth: '900px', // forces horizontal scroll on small screens
            position: 'relative'
          }}>
            
            {/* June 2026 Days Header */}
            <div style={{ 
              height: '48px', 
              display: 'flex', 
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)'
            }}>
              {daysArray.map(day => {
                const isWeekend = [6, 7, 13, 14, 20, 21, 27, 28].includes(day); // June weekends
                return (
                  <div 
                    key={day}
                    style={{
                      flex: 1,
                      borderRight: '1px solid var(--border-light)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: day === 11 ? 800 : 500, // Today is June 11th
                      color: day === 11 ? 'var(--primary)' : isWeekend ? 'var(--text-muted)' : 'var(--text-secondary)',
                      backgroundColor: day === 11 ? 'var(--primary-alpha)' : isWeekend ? 'var(--bg-app)' : 'transparent',
                      minWidth: '30px'
                    }}
                  >
                    <span>{day}</span>
                    <span style={{ fontSize: '0.55rem', textTransform: 'uppercase' }}>
                      {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][new Date(2026, 5, day).getDay()]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Timeline Rows with plotted task bars */}
            {filteredTasks.map(task => {
              const startDay = parseDayString(task.startDate);
              const endDay = parseDayString(task.dueDate, true);

              // Grid positioning percentages
              const leftOffset = ((startDay - 1) / totalDays) * 100;
              const barWidth = ((endDay - startDay + 1) / totalDays) * 100;

              return (
                <div 
                  key={task.id}
                  style={{
                    height: '60px',
                    borderBottom: '1px solid var(--border-light)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {/* Grid background lines */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', pointerEvents: 'none' }}>
                    {daysArray.map(day => (
                      <div 
                        key={day} 
                        style={{ 
                          flex: 1, 
                          borderRight: '1px solid var(--border-light)', 
                          height: '100%',
                          minWidth: '30px',
                          backgroundColor: day === 11 ? 'rgba(14, 165, 233, 0.02)' : 'transparent' 
                        }} 
                      />
                    ))}
                  </div>

                  {/* Task bar */}
                  <div 
                    onClick={() => onSelectTask(task)}
                    className="gantt-task-bar"
                    style={{
                      position: 'absolute',
                      left: `${leftOffset}%`,
                      width: `${barWidth}%`,
                      height: '32px',
                      backgroundColor: getPriorityColor(task.priority),
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 10px',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)',
                      zIndex: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      transition: 'transform var(--transition-fast), filter var(--transition-fast)'
                    }}
                    title={`${task.title} (${task.startDate} bis ${task.dueDate})`}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div style={{ height: '60px', borderBottom: '1px solid var(--border-light)' }} />
            )}
          </div>
        </div>

      </div>

      {/* Helper Legend */}
      <div className="card" style={{ padding: '12px 16px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Farbcode Prioritäten:</span>
        <div style={{ display: 'flex', gap: '14px', fontSize: '0.75rem', fontWeight: 600 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--danger)' }} /> Hoch / Dringend
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--warning)' }} /> Mittel
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--info)' }} /> Niedrig
          </span>
        </div>
        
        <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          * Heute markiert als hervorgehobene Spalte (11. Juni 2026)
        </div>
      </div>
    </div>
  );
};
