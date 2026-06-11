import React, { useState } from 'react';
import { SlidersHorizontal, Monitor, Check } from 'lucide-react';
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

  const getPriorityText = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'URGENT';
      case 'high': return 'HIGH';
      case 'medium': return 'MEDIUM';
      case 'low': return 'LOW';
      default: return '';
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Filters Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        {/* Priority Filter */}
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

        {/* Assignee Filter */}
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
            <option value="all">Mitarbeiter: Alle</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>Mitarbeiter: {u.name}</option>
            ))}
          </select>
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ink-3)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6,9 12,15 18,9"/></svg>
          </div>
        </div>

        <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-tint)', padding: '4px 11px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
          Heute: 11. Juni
        </div>

        {/* Legend */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11.5px', fontWeight: 600, color: 'var(--ink-3)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '14px', height: '7px', borderRadius: '999px', background: 'var(--gold)' }}></span>In Planung
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '14px', height: '7px', borderRadius: '999px', background: 'var(--primary)' }}></span>In Bearbeitung
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '14px', height: '7px', borderRadius: '999px', background: 'var(--green)' }}></span>Erledigt
          </span>
        </div>
      </div>

      {/* Gantt Timeline Card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '20px 24px', boxShadow: 'var(--shadow-card)', overflowX: 'auto' }}>
        
        {/* Day Header Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', alignItems: 'end', paddingBottom: '10px', borderBottom: '1px solid var(--border-soft)', minWidth: '1150px' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Aufgabe
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(30, 1fr)' }}>
            {daysArray.map(day => {
              const isWeekend = [6, 7, 13, 14, 20, 21, 27, 28].includes(day); // June weekends
              if (day === 11) {
                return (
                  <span key={day} style={{ display: 'flex', justifyContent: 'center' }}>
                    <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--primary-btn)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                      11
                    </span>
                  </span>
                );
              }
              return (
                <span 
                  key={day} 
                  style={{ 
                    textAlign: 'center', 
                    fontSize: '10px', 
                    fontWeight: 600, 
                    color: isWeekend ? 'var(--faint)' : 'var(--ink-3)', 
                    fontVariantNumeric: 'tabular-nums' 
                  }}
                >
                  {day}
                </span>
              );
            })}
          </div>
        </div>

        {/* Rows Wrapper with absolute vertical lines positioning */}
        <div style={{ position: 'relative', minWidth: '1150px' }}>
          
          {/* Vertical Shading overlays (weekends + today marker) */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '250px', right: 0, pointerEvents: 'none', display: 'flex' }}>
            {/* Weekends overlay stripes */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '16.666%', width: '6.667%', background: 'var(--well)' }}></div>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '40%', width: '6.667%', background: 'var(--well)' }}></div>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '63.333%', width: '6.667%', background: 'var(--well)' }}></div>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '86.666%', width: '6.667%', background: 'var(--well)' }}></div>
            
            {/* Today vertical line */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '35%', width: '2px', background: 'var(--primary)', opacity: 0.65 }}></div>
          </div>

          {/* Grid Rows mapping */}
          {filteredTasks.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Keine Aufgaben gefunden.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const startDay = parseDayString(task.startDate);
              const endDay = parseDayString(task.dueDate, true);
              const isCompleted = task.status === 'completed';
              const isOverdue = task.status !== 'completed' && task.dueDate && task.dueDate < '2026-06-11';

              const safeAssignees = task.assignees || [];
              const assignees = users.filter(u => safeAssignees.includes(u.id));

              const safeChecklist = task.checklist || [];
              const totalCheck = safeChecklist.length;
              const completedCheck = safeChecklist.filter(c => c.completed).length;
              const checkPercent = totalCheck > 0 ? Math.round((completedCheck / totalCheck) * 100) : 0;

              // Priority style settings
              let priorityBg = 'var(--chip)';
              let priorityColor = 'var(--ink-3)';
              if (task.priority === 'urgent') {
                priorityBg = 'var(--red-tint)';
                priorityColor = 'var(--red)';
              } else if (task.priority === 'high') {
                priorityBg = 'var(--amber-tint)';
                priorityColor = 'var(--amber-deep)';
              } else if (task.priority === 'medium') {
                priorityBg = 'var(--primary-tint)';
                priorityColor = 'var(--primary)';
              }

              // Status timeline colors
              let barBg = 'var(--gold)';
              if (isCompleted) {
                barBg = 'var(--green)';
              } else if (task.status === 'in_progress') {
                barBg = 'var(--primary)';
              }

              return (
                <div 
                  key={task.id}
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '250px 1fr', 
                    alignItems: 'center', 
                    padding: '13px 0', 
                    borderBottom: '1px solid var(--border-soft)',
                    cursor: 'pointer' 
                  }}
                  onClick={() => onSelectTask(task)}
                  className="hover-timeline-row"
                >
                  {/* Left Column: Task information */}
                  <div style={{ minWidth: 0, paddingRight: '18px' }}>
                    <div style={{ 
                      fontSize: '13px', 
                      fontWeight: 600, 
                      color: isCompleted ? 'var(--ink-2)' : 'var(--ink)', 
                      textDecoration: isCompleted ? 'line-through' : 'none',
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis' 
                    }}>
                      {task.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '5px' }}>
                      <span style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '.05em', color: priorityColor, background: priorityBg, padding: '2px 7px', borderRadius: '6px' }}>
                        {getPriorityText(task.priority)}
                      </span>
                      
                      {/* Assignees circles stack */}
                      <div style={{ display: 'flex' }}>
                        {assignees.map((user, uIdx) => (
                          <div 
                            key={user.id}
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: user.color,
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '8.5px',
                              fontWeight: 700,
                              border: '1.5px solid var(--bg-card)',
                              marginLeft: uIdx > 0 ? '-6px' : '0',
                              zIndex: 5 - uIdx
                            }}
                            title={user.name}
                          >
                            {user.avatarInitials}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: 30 days grid timeline bar */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(30, 1fr)', height: '30px', alignItems: 'center' }}>
                    <div 
                      style={{ 
                        gridColumn: `${startDay} / ${endDay + 1}`, 
                        height: '18px', 
                        borderRadius: '999px', 
                        background: barBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCompleted ? 'flex-end' : 'flex-start',
                        paddingRight: isCompleted ? '7px' : '0',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: task.priority === 'urgent' && !isCompleted ? '0 0 0 2px var(--red-tint)' : 'none',
                        transition: 'transform var(--transition-fast), filter var(--transition-fast)'
                      }}
                      className="gantt-task-bar"
                      title={`${task.title} (${task.startDate} bis ${task.dueDate})`}
                    >
                      {/* Completed checkmark inside the bar */}
                      {isCompleted && (
                        <Check size={11} stroke="#fff" strokeWidth={3} />
                      )}

                      {/* In Bearbeitung progress fill overlay */}
                      {task.status === 'in_progress' && totalCheck > 0 && (
                        <div 
                          style={{ 
                            position: 'absolute', 
                            inset: 0, 
                            width: `${checkPercent}%`, 
                            background: 'rgba(255, 255, 255, 0.28)' 
                          }} 
                        />
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Legend / Info Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-soft)', fontSize: '12px', color: 'var(--muted)' }}>
          <span style={{ width: '14px', height: '2px', background: 'var(--primary)', opacity: 0.65, borderRadius: '2px' }}></span>
          Heute-Marker (11. Juni 2026, simulierte Systemzeit) · helle Füllung = erledigter Anteil der Unteraufgaben · graue Spalten = Wochenende
        </div>
      </div>

    </div>
  );
};
