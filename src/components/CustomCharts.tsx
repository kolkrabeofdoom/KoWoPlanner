import React from 'react';
import type { Task, User } from '../data/mockData';

interface ChartProps {
  tasks?: Task[];
  users?: User[];
}

// 1. Doughnut Chart for Statuses
export const StatusDoughnutChart: React.FC<ChartProps> = ({ tasks = [] }) => {
  const safeTasks = tasks || [];
  const total = safeTasks.length;
  const planning = safeTasks.filter(t => t && t.status === 'planning').length;
  const inProgress = safeTasks.filter(t => t && t.status === 'in_progress').length;
  const completed = safeTasks.filter(t => t && t.status === 'completed').length;

  // Circle dimensions
  const radius = 50;
  const circ = 2 * Math.PI * radius; // ~314.16

  const pctPlanning = total > 0 ? (planning / total) * 100 : 0;
  const pctInProgress = total > 0 ? (inProgress / total) * 100 : 0;
  const pctCompleted = total > 0 ? (completed / total) * 100 : 0;

  // Stroke dashes
  const dashPlanning = (pctPlanning / 100) * circ;
  const dashInProgress = (pctInProgress / 100) * circ;
  const dashCompleted = (pctCompleted / 100) * circ;

  // Offset accumulators
  const offsetCompleted = 0;
  const offsetInProgress = dashCompleted;
  const offsetPlanning = dashCompleted + dashInProgress;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div className="chart-container">
        {total === 0 ? (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Keine Daten</div>
        ) : (
          <>
            <svg width="140" height="140" viewBox="0 0 120 120">
              {/* Background ring */}
              <circle cx="60" cy="60" r={radius} fill="transparent" stroke="var(--border-light)" strokeWidth="14" />
              
              {/* Completed slice (Green) */}
              {dashCompleted > 0 && (
                <circle 
                  cx="60" cy="60" r={radius} 
                  fill="transparent" 
                  stroke="var(--success)" 
                  strokeWidth="14" 
                  strokeDasharray={`${dashCompleted} ${circ}`} 
                  strokeDashoffset={-offsetCompleted}
                  transform="rotate(-90 60 60)"
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              )}

              {/* In Progress slice (Cyan/Primary) */}
              {dashInProgress > 0 && (
                <circle 
                  cx="60" cy="60" r={radius} 
                  fill="transparent" 
                  stroke="var(--primary)" 
                  strokeWidth="14" 
                  strokeDasharray={`${dashInProgress} ${circ}`} 
                  strokeDashoffset={-offsetInProgress}
                  transform="rotate(-90 60 60)"
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              )}

              {/* Planning slice (Amber/Warning) */}
              {dashPlanning > 0 && (
                <circle 
                  cx="60" cy="60" r={radius} 
                  fill="transparent" 
                  stroke="var(--warning)" 
                  strokeWidth="14" 
                  strokeDasharray={`${dashPlanning} ${circ}`} 
                  strokeDashoffset={-offsetPlanning}
                  transform="rotate(-90 60 60)"
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              )}
            </svg>
            <div className="ring-center-text">
              <span className="ring-value">{total}</span>
              <span className="ring-label">Gesamt</span>
            </div>
          </>
        )}
      </div>

      <div className="chart-legend" style={{ width: '100%', maxWidth: '200px' }}>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'var(--success)' }} />
          <span style={{ flex: 1 }}>Erledigt</span>
          <span style={{ fontWeight: 700 }}>{completed}</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'var(--primary)' }} />
          <span style={{ flex: 1 }}>In Bearbeitung</span>
          <span style={{ fontWeight: 700 }}>{inProgress}</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'var(--warning)' }} />
          <span style={{ flex: 1 }}>In Planung</span>
          <span style={{ fontWeight: 700 }}>{planning}</span>
        </div>
      </div>
    </div>
  );
};

// 2. Horizontal Workload Bar Chart
export const TeamWorkloadChart: React.FC<ChartProps> = ({ tasks = [], users = [] }) => {
  const safeUsers = users || [];
  const safeTasks = tasks || [];

  // Count tasks per user
  const workloadData = safeUsers.map(user => {
    // Only count active tasks (planning / in_progress)
    const count = safeTasks.filter(t => t && t.assignees && t.assignees.includes(user.id) && t.status !== 'completed').length;
    return {
      user,
      count
    };
  });

  const maxCount = Math.max(...workloadData.map(d => d.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', padding: '10px 0' }}>
      {workloadData.length === 0 ? (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>Keine Daten</div>
      ) : (
        workloadData.map(({ user, count }) => {
          const percent = (count / maxCount) * 100;
          return (
            <div key={user.id} className="trade-bar-item">
              <div className="trade-bar-label">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div 
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      backgroundColor: user.color, 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 700
                    }}
                  >
                    {user.avatarInitials}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {count} {count === 1 ? 'Aufgabe' : 'Aufgaben'}
                </span>
              </div>
              <div className="trade-bar-progress-bg">
                <div 
                  className="trade-bar-progress" 
                  style={{ 
                    width: `${percent}%`, 
                    backgroundColor: user.color 
                  }} 
                />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

// 3. Priority Vertical Column Chart
export const PriorityChart: React.FC<ChartProps> = ({ tasks = [] }) => {
  const safeTasks = tasks || [];
  const low = safeTasks.filter(t => t && t.priority === 'low').length;
  const medium = safeTasks.filter(t => t && t.priority === 'medium').length;
  const high = safeTasks.filter(t => t && t.priority === 'high').length;
  const urgent = safeTasks.filter(t => t && t.priority === 'urgent').length;

  const maxVal = Math.max(low, medium, high, urgent, 1);

  const priorities = [
    { label: 'Niedrig', count: low, color: 'var(--info)' },
    { label: 'Mittel', count: medium, color: 'var(--warning)' },
    { label: 'Hoch', count: high, color: 'var(--danger)' },
    { label: 'Dringend', count: urgent, color: 'var(--purple)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '220px', justifyContent: 'flex-end' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '170px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
        {priorities.map((p, idx) => {
          const heightPercent = (p.count / maxVal) * 150; // max height of 150px
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>{p.count}</span>
              <div 
                style={{ 
                  width: '28px', 
                  height: `${Math.max(heightPercent, 4)}px`, 
                  backgroundColor: p.color, 
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.8s ease-out'
                }} 
                title={`${p.label}: ${p.count}`}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: '8px' }}>
        {priorities.map((p, idx) => (
          <span key={idx} style={{ width: '20%', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
};
