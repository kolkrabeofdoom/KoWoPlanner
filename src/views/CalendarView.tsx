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

  return (
    <div className="calendar-wrapper animate-fade">
      
      {/* Calendar Header with navigation */}
      <div className="calendar-header">
        
        {/* Navigation buttons */}
        <div className="calendar-nav">
          <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={handlePrevMonth}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', minWidth: '150px', textAlign: 'center' }}>
            {monthNames[month]} {year}
          </span>
          <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={handleNextMonth}>
            <ChevronRight size={16} />
          </button>
          
          <button 
            className="btn btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '0.8rem', marginLeft: '12px' }}
            onClick={handleToday}
          >
            Heute (11. Jun 2026)
          </button>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--danger)' }} /> Dringend
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning)' }} /> Hoch/Mittel
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--info)' }} /> Niedrig
          </span>
        </div>
      </div>

      {/* Grid Calendar Card */}
      <div className="card" style={{ padding: '16px' }}>
        
        {/* Weekdays header */}
        <div className="calendar-grid" style={{ marginBottom: '8px' }}>
          {weekdays.map((day, idx) => (
            <div key={idx} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="calendar-grid">
          {calendarCells.map((cell, idx) => {
            // Find tasks due on this date
            const dayTasks = tasks.filter(t => t.dueDate === cell.dateString);
            const today = isToday(cell.dateString);

            return (
              <div 
                key={idx} 
                className={`calendar-day ${cell.isCurrentMonth ? '' : 'other-month'} ${today ? 'today' : ''}`}
                onClick={() => onAddTaskAtDate(cell.dateString)}
              >
                {/* Day header: Number and add button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="day-number">{cell.date.getDate()}</span>
                  {today && <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Heute</span>}
                </div>

                {/* Tasks due on this day */}
                <div className="calendar-tasks-container">
                  {dayTasks.map(task => {
                    const priorityClass = 
                      task.priority === 'urgent' ? 'task-block-urgent' : 
                      task.priority === 'high' ? 'task-block-high' : 
                      task.priority === 'medium' ? 'task-block-medium' : 'task-block-low';
                    
                    return (
                      <div 
                        key={task.id} 
                        className={`calendar-task-block ${priorityClass}`}
                        style={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none', opacity: task.status === 'completed' ? 0.6 : 1 }}
                        onClick={(e) => {
                          e.stopPropagation(); // prevent adding a task at this day
                          onSelectTask(task);
                        }}
                        title={`${task.title} (${task.priority})`}
                      >
                        {task.title}
                      </div>
                    );
                  })}
                </div>

                {/* Small add task overlay link */}
                <span className="calendar-add-icon" style={{ alignSelf: 'flex-end', opacity: 0, fontSize: '0.7rem', color: 'var(--primary)' }}>
                  <Plus size={10} /> Aufgabe
                </span>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
