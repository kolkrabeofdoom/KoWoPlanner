import React from 'react';
import { 
  ClipboardList, CheckCircle2, AlertTriangle, 
  Clock, Monitor, ArrowRight
} from 'lucide-react';
import type { Task, User } from '../data/mockData';
import { StatusDoughnutChart, TeamWorkloadChart, PriorityChart } from '../components/CustomCharts';

interface DashboardViewProps {
  tasks: Task[];
  users: User[];
  onSelectTask: (task: Task) => void;
  setCurrentView: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  tasks, 
  users,
  onSelectTask,
  setCurrentView
}) => {
  // Stat calculations
  const totalTasks = tasks.length;
  const openTasks = tasks.filter(t => t.status !== 'completed').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  
  // Urgent/high priority tasks that are NOT completed
  const urgentTasks = tasks.filter(t => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'completed');

  // Today's timeline tasks (sorted by due date, showing next 4)
  const timelineTasks = [...tasks]
    .filter(t => t.status !== 'completed')
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 4);

  // Overdue calculation (dueDate < today and not completed)
  const todayStr = '2026-06-11'; // Simulated system date from specification
  const overdueTasksCount = tasks.filter(t => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr).length;

  const getGermanMonth = (dateStr: string) => {
    const months = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];
    const date = new Date(dateStr);
    return months[date.getMonth()];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'var(--red)';
      case 'high': return 'var(--orange)';
      case 'medium': return 'var(--primary)';
      default: return 'var(--muted)';
    }
  };

  const getPriorityText = (priority: string) => {
    return priority.toUpperCase();
  };

  const getPriorityTint = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'var(--red-tint)';
      case 'high': return 'var(--amber-tint)';
      case 'medium': return 'var(--primary-tint)';
      default: return 'var(--chip)';
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* KPI Stats Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        
        {/* Total Card */}
        <div 
          className="card card-hover" 
          style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
          onClick={() => setCurrentView('list')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              Gesamtanzahl
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--chip)', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={18} />
            </div>
          </div>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: '42px', fontWeight: 600, lineHeight: 1, letterSpacing: '-.03em', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', margin: '14px 0 8px' }}>
            {totalTasks}
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--ink-3)', fontWeight: 500 }}>
            Erstellte Aufgaben im Workspace
          </div>
        </div>

        {/* Open Card */}
        <div 
          className="card card-hover" 
          style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
          onClick={() => setCurrentView('kanban')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              Offene Aufgaben
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-tint)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: '42px', fontWeight: 600, lineHeight: 1, letterSpacing: '-.03em', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', margin: '14px 0 8px' }}>
            {openTasks}
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--ink-3)', fontWeight: 500 }}>
            In Arbeit &amp; Planung
          </div>
        </div>

        {/* Completed Card */}
        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              Erledigt
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--green-tint)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: '42px', fontWeight: 600, lineHeight: 1, letterSpacing: '-.03em', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', margin: '14px 0 12px' }}>
            {completedTasks}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1, height: '6px', borderRadius: '999px', background: 'var(--track)', overflow: 'hidden' }}>
              <div style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`, height: '100%', borderRadius: '999px', background: 'var(--green)' }}></div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Urgent Card */}
        <div 
          className="card card-hover" 
          style={{ 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            borderColor: urgentTasks.length > 0 ? 'var(--red-border)' : 'var(--border)'
          }}
        >
          {urgentTasks.length > 0 && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--red)' }}></div>}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: urgentTasks.length > 0 ? 'var(--red)' : 'var(--muted)' }}>
              Eskalationen / Notfälle
            </div>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '10px', 
              background: urgentTasks.length > 0 ? 'var(--red-tint)' : 'var(--chip)', 
              color: urgentTasks.length > 0 ? 'var(--red)' : 'var(--ink-3)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: '42px', fontWeight: 600, lineHeight: 1, letterSpacing: '-.03em', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', margin: '14px 0 8px' }}>
            {urgentTasks.length}
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--ink-3)', fontWeight: 500 }}>
            <span style={{ color: overdueTasksCount > 0 ? 'var(--red)' : 'var(--green)', fontWeight: 700 }}>{overdueTasksCount}</span> überfällig · {urgentTasks.length - overdueTasksCount} in SLA-Frist
          </div>
        </div>
      </div>

      {/* BODY GRID from Mockup */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ flex: 1.9, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Doughnut Chart */}
            <div className="card" style={{ padding: '22px 24px' }}>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: '15px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.01em' }}>
                Aufgaben-Verteilung
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                Nach aktuellem Status
              </div>
              <StatusDoughnutChart tasks={tasks} />
            </div>

            {/* Priorities Chart */}
            <div className="card" style={{ padding: '22px 24px' }}>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: '15px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.01em' }}>
                Verteilung Prioritäten
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                Offene Aufgaben nach Dringlichkeit
              </div>
              <PriorityChart tasks={tasks} />
            </div>
          </div>

          {/* Next Deadlines List */}
          <div className="card" style={{ padding: '22px 24px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: '15px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.01em' }}>
                  Nächste Deadlines
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                  Chronologisch sortiert
                </div>
              </div>
              <button 
                onClick={() => setCurrentView('calendar')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '12.5px', 
                  fontWeight: 600, 
                  color: 'var(--primary)', 
                  textDecoration: 'none', 
                  padding: '7px 12px', 
                  borderRadius: '9px', 
                  border: '1px solid var(--border-input)',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
                className="hover-btn-icon"
              >
                <span>Zum Kalender</span>
                <ArrowRight size={14} strokeWidth={2} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {timelineTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
                  Keine anstehenden Fristen.
                </div>
              ) : (
                timelineTasks.map((t) => {
                  const daysRemaining = t.dueDate ? Math.ceil((new Date(t.dueDate).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24)) : 0;
                  const dayNum = t.dueDate ? new Date(t.dueDate).getDate() : '';
                  const monthName = t.dueDate ? getGermanMonth(t.dueDate) : '';
                  
                  return (
                    <div 
                      key={t.id} 
                      onClick={() => onSelectTask(t)}
                      style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '13px 6px', borderBottom: '1px solid var(--border-soft)', cursor: 'pointer' }}
                      className="hover-timeline-row"
                    >
                      <div style={{ width: '46px', textAlign: 'center', flex: 'none' }}>
                        <div style={{ fontFamily: 'Space Grotesk', fontSize: '17px', fontWeight: 600, color: 'var(--ink)', lineHeight: 1 }}>
                          {dayNum}
                        </div>
                        <div style={{ fontSize: '10.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)' }}>
                          {monthName}
                        </div>
                      </div>
                      
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getPriorityColor(t.priority), flex: 'none' }}></span>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {t.title}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>
                          {t.address || 'Zentrale'}
                        </div>
                      </div>
                      
                      <span style={{ 
                        fontSize: '10px', 
                        fontWeight: 700, 
                        letterSpacing: '.05em', 
                        color: getPriorityColor(t.priority), 
                        background: getPriorityTint(t.priority), 
                        padding: '4px 9px', 
                        borderRadius: '7px' 
                      }}>
                        {getPriorityText(t.priority)}
                      </span>
                      
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: 600, 
                        color: daysRemaining < 0 ? 'var(--red)' : daysRemaining <= 1 ? 'var(--amber)' : 'var(--ink-3)', 
                        width: '84px', 
                        textAlign: 'right' 
                      }}>
                        {daysRemaining < 0 
                          ? 'Überfällig' 
                          : daysRemaining === 0 
                            ? 'Heute fällig' 
                            : daysRemaining === 1 
                              ? 'Morgen fällig' 
                              : `in ${daysRemaining} Tagen`}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Urgent Notfälle Card */}
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '8px', background: 'var(--red-tint)', color: 'var(--red)' }}>
                <AlertTriangle size={15} />
              </span>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: '15px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.01em' }}>
                Dringende Notfälle
              </div>
              <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 700, color: 'var(--red)', background: 'var(--red-tint)', borderRadius: '999px', padding: '2px 9px' }}>
                {urgentTasks.length} aktiv
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {urgentTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
                  🎉 Keine kritischen Aufgaben ausstehend!
                </div>
              ) : (
                urgentTasks.map((t) => {
                  const completedSub = t.checklist.filter(c => c.completed).length;
                  const totalSub = t.checklist.length;
                  const percentSub = totalSub > 0 ? (completedSub / totalSub) * 100 : 0;
                  const formattedDate = t.dueDate ? new Date(t.dueDate).toLocaleDateString('de-DE') : '';

                  return (
                    <div 
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      style={{ 
                        border: '1px solid var(--red-border)', 
                        background: 'var(--red-card)', 
                        borderRadius: '14px', 
                        padding: '14px 15px',
                        cursor: 'pointer' 
                      }}
                      className="hover-urgent-card"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
                        <span style={{ 
                          fontSize: '10px', 
                          fontWeight: 700, 
                          letterSpacing: '.06em', 
                          color: t.priority === 'urgent' ? 'var(--red)' : 'var(--amber-deep)', 
                          background: t.priority === 'urgent' ? 'var(--red-tint)' : 'var(--amber-tint)', 
                          padding: '3px 8px', 
                          borderRadius: '6px' 
                        }}>
                          {getPriorityText(t.priority)}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                          {formattedDate}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.35 }}>
                        {t.title}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                        <Monitor size={14} color="#94a3b8" />
                        <span style={{ fontSize: '11.5px', color: 'var(--ink-3)', fontWeight: 500 }}>
                          {t.address || 'Zentrale'}
                        </span>
                        <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 600, color: 'var(--ink-2)' }}>
                          {completedSub}/{totalSub} Unteraufgaben
                        </span>
                      </div>
                      
                      <div style={{ height: '5px', borderRadius: '999px', background: 'var(--red-track)', overflow: 'hidden', marginTop: '8px' }}>
                        <div style={{ 
                          width: `${percentSub}%`, 
                          height: '100%', 
                          background: t.priority === 'urgent' ? 'var(--red)' : 'var(--orange)', 
                          borderRadius: '999px',
                          transition: 'width 0.5s ease-out'
                        }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button 
              onClick={() => setCurrentView('list')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '7px', 
                padding: '11px', 
                borderRadius: '11px', 
                border: '1px solid var(--border-input)', 
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '12.5px', 
                fontWeight: 600, 
                color: 'var(--ink-2)', 
                marginTop: 'auto',
                width: '100%',
                transition: 'background var(--transition-fast)'
              }}
              className="hover-btn-icon"
            >
              Alle Notfälle anzeigen
            </button>
          </div>

          {/* Team capacity list */}
          <div className="card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: '15px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.01em' }}>
                Team-Auslastung
              </div>
              <span style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: 500 }}>
                offene Aufgaben
              </span>
            </div>
            <TeamWorkloadChart tasks={tasks} users={users} />
          </div>
        </div>
      </div>
    </div>
  );
};

