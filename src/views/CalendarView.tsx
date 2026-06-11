import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { Task } from '../data/mockData';

interface CalendarViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onAddTaskAtDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onSelectTask,
  onAddTaskAtDate
}) => {
  // Current visible date (default: June 2026, to match the mock data range!)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 11)); // June 11, 2026

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month names in German
  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  // Calendar generation logic
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => {
    // JS getDay() returns 0 for Sunday, 1 for Monday...
    // Map to: 0 for Monday, 1 for Tuesday... 6 for Sunday
    const day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInCurrentMonth = getDaysInMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const calendarCells: { date: Date; isCurrentMonth: boolean; dateString: string }[] = [];

  // 1. Fill previous month days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, d);
    calendarCells.push({
      date: prevMonthDate,
      isCurrentMonth: false,
      dateString: prevMonthDate.toISOString().split('T')[0]
    });
  }

  // 2. Fill current month days
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    const currMonthDate = new Date(year, month, i);
    calendarCells.push({
      date: currMonthDate,
      isCurrentMonth: true,
      dateString: currMonthDate.toISOString().split('T')[0]
    });
  }

  // 3. Fill next month days to complete 42 cells (7x6 grid)
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthDate = new Date(year, month + 1, i);
    calendarCells.push({
      date: nextMonthDate,
      isCurrentMonth: false,
      dateString: nextMonthDate.toISOString().split('T')[0]
    });
  }

  // Navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 5, 11)); // Reset to June 2026 (matching mock data time)
  };

  // Helper to check if date is today (June 11, 2026)
  const isToday = (dateStr: string) => {
    return dateStr === '2026-06-11';
  };

  // Helper to get priority styling for calendar task blocks
  const getTaskCalendarStyles = (task: Task) => {
    if (task.status === 'completed') {
      return {
        bg: 'var(--green-tint)',
        text: 'var(--green)',
        dot: 'var(--green)',
        completedSymbol: ' ✓'
      };
    }

    switch (task.priority) {
      case 'urgent':
        return { bg: 'var(--red-tint)', text: 'var(--red)', dot: 'var(--red)', completedSymbol: '' };
      case 'high':
        return { bg: 'var(--amber-tint)', text: 'var(--amber-deep)', dot: 'var(--orange)', completedSymbol: '' };
      case 'medium':
        return { bg: 'var(--primary-tint)', text: 'var(--primary)', dot: 'var(--primary)', completedSymbol: '' };
      case 'low':
      default:
        return { bg: 'var(--chip)', text: 'var(--ink-3)', dot: 'var(--muted)', completedSymbol: '' };
    }
  };

  return (
    <div className="calendar-wrapper animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Month Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          title="Vorheriger Monat" 
          style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-input)', color: 'var(--ink-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={handlePrevMonth}
        >
          <ChevronLeft size={15} />
        </button>
        <button 
          title="Nächster Monat" 
          style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-input)', color: 'var(--ink-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={handleNextMonth}
        >
          <ChevronRight size={15} />
        </button>
        
        <span style={{ fontFamily: 'Space Grotesk', fontSize: '17px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.01em', marginLeft: '4px' }}>
          {monthNames[month]} {year}
        </span>
        
        <button 
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-input)', borderRadius: '9px', padding: '7px 13px', fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}
          onClick={handleToday}
        >
          Heute
        </button>

        {/* Legend */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11.5px', fontWeight: 600, color: 'var(--ink-3)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '3px', background: 'var(--red)' }}></span>Dringend
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '3px', background: 'var(--orange)' }}></span>Hoch
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '3px', background: 'var(--primary)' }}></span>Mittel
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '3px', background: 'var(--muted)' }}></span>Niedrig
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '3px', background: 'var(--green)' }}></span>Erledigt
          </span>
        </div>
      </div>

      {/* Calendar Card Wrapper */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '20px 22px', boxShadow: 'var(--shadow-card)' }}>
        
        {/* Weekdays Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', marginBottom: '8px' }}>
          {weekdays.map((day, idx) => {
            const isWeekend = idx >= 5;
            return (
              <div 
                key={idx} 
                style={{ 
                  fontSize: '10.5px', 
                  fontWeight: 700, 
                  letterSpacing: '.08em', 
                  textTransform: 'uppercase', 
                  color: isWeekend ? 'var(--faint)' : 'var(--muted)',
                  padding: '0 10px' 
                }}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Days Grid Container */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '1px', background: 'var(--border-soft)', border: '1px solid var(--border-soft)', borderRadius: '12px', overflow: 'hidden' }}>
          {calendarCells.map((cell, idx) => {
            const dayTasks = tasks.filter(t => t.dueDate === cell.dateString);
            const today = isToday(cell.dateString);
            
            // June weekends in 2026 (JSgetDay: 0 is Sunday, 6 is Saturday)
            const dayOfWeek = cell.date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            // Background color for calendar day cell
            let cellBg = 'var(--bg-card)';
            if (today) {
              cellBg = 'var(--primary-tint)';
            } else if (isWeekend) {
              cellBg = 'var(--bg-subtle)';
            }

            return (
              <div 
                key={idx} 
                className="hover-timeline-row"
                style={{ 
                  background: cellBg,
                  minHeight: '106px',
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  cursor: 'pointer',
                  opacity: cell.isCurrentMonth ? 1 : 0.4
                }}
                onClick={() => onAddTaskAtDate(cell.dateString)}
              >
                {/* Day Header row */}
                <div style={{ display: 'flex', justifyContent: today ? 'space-between' : 'flex-end', alignItems: 'center' }}>
                  {today ? (
                    <>
                      <div style={{ fontVariantNumeric: 'tabular-nums', display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                        <span style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%', 
                          background: 'var(--primary-btn)', 
                          color: '#fff', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontFamily: 'Space Grotesk', 
                          fontSize: '12px', 
                          fontWeight: 600 
                        }}>
                          {cell.date.getDate()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <span style={{ 
                      fontFamily: 'Space Grotesk', 
                      fontSize: '13px', 
                      fontWeight: 600, 
                      color: cell.isCurrentMonth ? 'var(--ink-2)' : 'var(--faint)' 
                    }}>
                      {cell.date.getDate()}
                    </span>
                  )}
                </div>

                {/* Today status label */}
                {today && (
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--primary)', textAlign: 'right', marginTop: '-4px' }}>
                    Heute
                  </div>
                )}

                {/* Day Tasks List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                  {dayTasks.map(task => {
                    const tStyle = getTaskCalendarStyles(task);
                    return (
                      <div 
                        key={task.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          background: tStyle.bg, 
                          borderRadius: '7px', 
                          padding: '4px 8px', 
                          overflow: 'hidden',
                          opacity: task.status === 'completed' ? 0.65 : 1
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // prevent adding a task at this day
                          onSelectTask(task);
                        }}
                        title={`${task.title} (${task.priority})`}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: tStyle.dot, flex: 'none' }} />
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 600, 
                          color: tStyle.text, 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          textDecoration: task.status === 'completed' ? 'line-through' : 'none'
                        }}>
                          {task.title}{tStyle.completedSymbol}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', fontSize: '12px', color: 'var(--muted)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Klicke auf einen Tag, um eine neue Aufgabe mit diesem Fälligkeitsdatum anzulegen
        </div>
      </div>
    </div>
  );
};
