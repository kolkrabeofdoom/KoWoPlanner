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

  // Calculate degrees for conic-gradient
  const pctPlanning = total > 0 ? (planning / total) * 100 : 0;
  const pctInProgress = total > 0 ? (inProgress / total) * 100 : 0;
  const pctCompleted = total > 0 ? (completed / total) * 100 : 0;

  const degCompleted = (pctCompleted / 100) * 360;
  const degInProgress = (pctInProgress / 100) * 360;

  // Build gradient string
  // completed (green), inProgress (primary), planning (gold)
  const gradient = total > 0 
    ? `conic-gradient(var(--green) 0deg ${degCompleted}deg, var(--primary) ${degCompleted}deg ${degCompleted + degInProgress}deg, var(--gold) ${degCompleted + degInProgress}deg 360deg)`
    : 'var(--track)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '22px', marginTop: '18px', width: '100%' }}>
      <div style={{
        position: 'relative',
        width: '124px',
        height: '124px',
        flex: 'none',
        borderRadius: '50%',
        background: gradient
      }}>
        <div style={{
          position: 'absolute',
          inset: '15px',
          borderRadius: '50%',
          background: 'var(--bg-card)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 0 0 1px var(--track)'
        }}>
          <span style={{ fontFamily: 'Space Grotesk', fontSize: '30px', fontWeight: 600, color: 'var(--ink)', lineHeight: 1, letterSpacing: '-.02em' }}>
            {total}
          </span>
          <span style={{ fontSize: '10.5px', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '2px' }}>
            Gesamt
          </span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '3px', backgroundColor: 'var(--green)', flex: 'none' }} />
          <span style={{ fontSize: '13px', color: 'var(--ink-2)', fontWeight: 500, flex: 1 }}>Erledigt</span>
          <span style={{ fontFamily: 'Space Grotesk', fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{completed}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '3px', backgroundColor: 'var(--primary)', flex: 'none' }} />
          <span style={{ fontSize: '13px', color: 'var(--ink-2)', fontWeight: 500, flex: 1 }}>In Bearbeitung</span>
          <span style={{ fontFamily: 'Space Grotesk', fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{inProgress}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '3px', backgroundColor: 'var(--gold)', flex: 'none' }} />
          <span style={{ fontSize: '13px', color: 'var(--ink-2)', fontWeight: 500, flex: 1 }}>In Planung</span>
          <span style={{ fontFamily: 'Space Grotesk', fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{planning}</span>
        </div>
      </div>
    </div>
  );
};

// 2. Horizontal Workload Bar List (matches Right Rail workload list)
export const TeamWorkloadChart: React.FC<ChartProps> = ({ tasks = [], users = [] }) => {
  const safeUsers = users || [];
  const safeTasks = tasks || [];

  const workloadData = safeUsers.map(user => {
    const count = safeTasks.filter(t => t && t.assignees && t.assignees.includes(user.id) && t.status !== 'completed').length;
    return { user, count };
  });

  const maxCount = Math.max(...workloadData.map(d => d.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '18px' }}>
      {workloadData.map(({ user, count }) => {
        const percent = (count / maxCount) * 100;
        return (
          <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '34px', 
              height: '34px', 
              borderRadius: '50%', 
              backgroundColor: user.color || 'var(--primary)', 
              color: '#fff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '12px', 
              fontWeight: 700, 
              flex: 'none' 
            }}>{user.avatarInitials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{user.name}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-3)' }}>{count}</span>
              </div>
              <div style={{ height: '6px', borderRadius: '999px', backgroundColor: 'var(--track)', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${percent}%`, 
                  height: '100%', 
                  borderRadius: '999px', 
                  background: count > 0 ? 'var(--primary)' : 'var(--faint)',
                  transition: 'width 0.8s ease-out'
                }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 3. Priority Vertical Column Chart (matches Mockup priority columns chart)
export const PriorityChart: React.FC<ChartProps> = ({ tasks = [] }) => {
  const safeTasks = tasks || [];
  const low = safeTasks.filter(t => t && t.priority === 'low').length;
  const medium = safeTasks.filter(t => t && t.priority === 'medium').length;
  const high = safeTasks.filter(t => t && t.priority === 'high').length;
  const urgent = safeTasks.filter(t => t && t.priority === 'urgent').length;

  const maxVal = Math.max(low, medium, high, urgent, 1);

  const priorities = [
    { label: 'Niedrig', count: low, color: 'var(--faint)' },
    { label: 'Mittel', count: medium, color: 'var(--primary)' },
    { label: 'Hoch', count: high, color: 'var(--gold)' },
    { label: 'Dringend', count: urgent, color: 'var(--red)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        justifyContent: 'space-around', 
        gap: '14px', 
        height: '130px', 
        marginTop: '14px', 
        padding: '0 4px' 
      }}>
        {priorities.map((p, idx) => {
          const heightPercent = (p.count / maxVal) * 100;
          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontFamily: 'Space Grotesk', fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{p.count}</span>
              <div style={{ 
                width: '100%', 
                maxWidth: '30px', 
                height: `${Math.max(heightPercent, 8)}%`, 
                borderRadius: '8px 8px 4px 4px', 
                backgroundColor: p.color,
                transition: 'height 0.8s ease-out'
              }} title={`${p.label}: ${p.count}`} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', gap: '14px', marginTop: '10px', borderTop: '1px solid var(--border-soft)', paddingTop: '10px' }}>
        {priorities.map((p, idx) => (
          <span key={idx} style={{ flex: 1, textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
};
