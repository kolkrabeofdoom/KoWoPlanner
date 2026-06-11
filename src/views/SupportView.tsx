import React, { useState } from 'react';
import { 
  LifeBuoy, CheckCircle, Play, UserPlus, ArrowRight,
  Laptop, Send, User, X
} from 'lucide-react';
import type { Ticket, User as UserType, Workspace } from '../data/mockData';

interface SupportViewProps {
  tickets: Ticket[];
  users: UserType[];
  workspaces: Workspace[];
  onCreateTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'status'>) => void;
  onUpdateTicketStatus: (ticketId: string, status: Ticket['status']) => void;
  onConvertTicketToTask: (ticketId: string, workspaceId: string, assigneeId: string, dueDate: string) => void;
}

export const SupportView: React.FC<SupportViewProps> = ({
  tickets,
  users,
  workspaces,
  onCreateTicket,
  onUpdateTicketStatus,
  onConvertTicketToTask
}) => {
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reporter, setReporter] = useState('');
  const [category, setCategory] = useState<Ticket['category']>('Hardware');
  const [priority, setPriority] = useState<Ticket['priority']>('medium');
  const [slaHours, setSlaHours] = useState(24);

  // Filter states
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Conversion overlay state
  const [convertingTicketId, setConvertingTicketId] = useState<string | null>(null);
  const [targetWorkspaceId, setTargetWorkspaceId] = useState('ws-1');
  const [targetAssigneeId, setTargetAssigneeId] = useState('');
  const [targetDueDate, setTargetDueDate] = useState('2026-06-18');

  // Submit new ticket
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !reporter.trim() || !description.trim()) {
      alert('Bitte füllen Sie alle erforderlichen Felder aus.');
      return;
    }

    onCreateTicket({
      title: title.trim(),
      description: description.trim(),
      reporter: reporter.trim(),
      category,
      priority,
      slaHours: Number(slaHours) || 24
    });

    // Reset form
    setTitle('');
    setDescription('');
    setReporter('');
    setCategory('Hardware');
    setPriority('medium');
    setSlaHours(24);
  };

  // Convert ticket trigger
  const handleStartConversion = (ticketId: string) => {
    setConvertingTicketId(ticketId);
    // Default to first user if none selected
    if (users.length > 0 && !targetAssigneeId) {
      setTargetAssigneeId(users[0].id);
    }
  };

  const handleConfirmConversion = () => {
    if (!convertingTicketId || !targetAssigneeId || !targetWorkspaceId) return;
    onConvertTicketToTask(convertingTicketId, targetWorkspaceId, targetAssigneeId, targetDueDate);
    setConvertingTicketId(null);
  };

  // SLA Calculation Helper (Simulation Base Time: June 11, 2026, 07:30:00 UTC)
  const getSlaDetails = (ticket: Ticket) => {
    if (ticket.status === 'resolved') {
      return { text: 'Gelöst', color: 'var(--success)', badgeClass: 'badge-success' };
    }

    const now = new Date('2026-06-11T07:30:00Z').getTime();
    const created = new Date(ticket.createdAt).getTime();
    const elapsedHours = (now - created) / (1000 * 60 * 60);
    const remaining = ticket.slaHours - elapsedHours;

    const roundedRemaining = Math.max(0, Math.round(remaining * 10) / 10);

    if (remaining <= 0) {
      return { text: 'SLA Überschritten!', color: 'var(--danger)', badgeClass: 'badge-danger' };
    } else if (remaining <= 2) {
      return { text: `${roundedRemaining} Std. (Kritisch)`, color: 'var(--danger)', badgeClass: 'badge-danger' };
    } else if (remaining <= 8) {
      return { text: `${roundedRemaining} Std. (Achtung)`, color: 'var(--warning)', badgeClass: 'badge-warning' };
    } else {
      return { text: `${roundedRemaining} Std. verbleibend`, color: 'var(--success)', badgeClass: 'badge-success' };
    }
  };

  // Filter logic
  const filteredTickets = tickets.filter(ticket => {
    const matchesTab = activeTab === 'all' || ticket.status === activeTab;
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.reporter.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getPriorityBadgeClass = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'urgent': return 'badge-danger';
      case 'high': return 'badge-danger';
      case 'medium': return 'badge-warning';
      case 'low': return 'badge-info';
      default: return 'badge-secondary';
    }
  };

  const getCategoryColor = (cat: Ticket['category']) => {
    switch (cat) {
      case 'Hardware': return '#10b981'; // green
      case 'Software': return '#0ea5e9'; // cyan
      case 'Netzwerk': return '#8b5cf6'; // purple
      case 'Berechtigungen': return '#f59e0b'; // amber
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '24px' }}>
        <p className="page-subtitle">Verwalten Sie eingehende Störungsmeldungen und wandeln Sie diese direkt in IT-Projekt-Aufgaben um</p>
      </div>

      <div className="task-modal-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* Left Column: Form to submit ticket */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
            <LifeBuoy size={18} color="var(--primary)" />
            Support-Meldung erfassen
          </h3>

          <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
            
            {/* Title */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Titel / Problem</label>
              <input 
                type="text" 
                className="form-control" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Outlook startet nicht"
                required
              />
            </div>

            {/* Reporter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Melder / Abteilung</label>
              <input 
                type="text" 
                className="form-control" 
                value={reporter}
                onChange={(e) => setReporter(e.target.value)}
                placeholder="z.B. Brigitte Schmidt (Mietverwaltung)"
                required
              />
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Problembeschreibung</label>
              <textarea 
                className="form-control" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Genaue Fehlerbeschreibung oder Anforderung..."
                rows={3}
                required
              />
            </div>

            {/* Category & Priority Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Kategorie</label>
                <select 
                  className="form-control" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Ticket['category'])}
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Netzwerk">Netzwerk</option>
                  <option value="Berechtigungen">Berechtigungen</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Priorität</label>
                <select 
                  className="form-control" 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Ticket['priority'])}
                >
                  <option value="low">Niedrig</option>
                  <option value="medium">Mittel</option>
                  <option value="high">Hoch</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* SLA Time */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">SLA Lösungszeit (Stunden)</label>
              <input 
                type="number" 
                className="form-control" 
                value={slaHours}
                onChange={(e) => setSlaHours(Number(e.target.value))}
                min={1}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', marginTop: '6px' }}
            >
              <Send size={14} />
              <span>Ticket einreichen</span>
            </button>
          </form>
        </div>

        {/* Right Column: Ticket Management Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Header toolbar */}
          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            {/* Search */}
            <div className="header-search" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '300px', flex: 1 }}>
              <Laptop size={14} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Tickets suchen..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '100%', color: 'var(--text-primary)' }}
              />
            </div>

            {/* View filter tabs */}
            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--border-light)', padding: '3px', borderRadius: '8px', marginLeft: 'auto' }}>
              {(['all', 'open', 'in_progress', 'resolved'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: activeTab === tab ? 700 : 500,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                    backgroundColor: activeTab === tab ? 'var(--primary)' : 'transparent',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {tab === 'all' && 'Alle'}
                  {tab === 'open' && 'Offen'}
                  {tab === 'in_progress' && 'In Arbeit'}
                  {tab === 'resolved' && 'Gelöst'}
                </button>
              ))}
            </div>
          </div>

          {/* Tickets List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredTickets.map(ticket => {
              const sla = getSlaDetails(ticket);
              const isConverting = convertingTicketId === ticket.id;

              return (
                <div 
                  key={ticket.id}
                  className="card"
                  style={{ 
                    padding: '16px 20px', 
                    borderLeft: `4px solid ${getCategoryColor(ticket.category)}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative'
                  }}
                >
                  {/* Top: Header metadata */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>#{ticket.id}</span>
                      <span 
                        className="badge" 
                        style={{ 
                          backgroundColor: `${getCategoryColor(ticket.category)}20`, 
                          color: getCategoryColor(ticket.category), 
                          fontSize: '0.65rem',
                          padding: '2px 8px'
                        }}
                      >
                        {ticket.category}
                      </span>
                      <span className={`badge ${getPriorityBadgeClass(ticket.priority)}`} style={{ fontSize: '0.6rem', padding: '1px 6px' }}>
                        {ticket.priority.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SLA:</span>
                      <span className={`badge ${sla.badgeClass}`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                        {sla.text}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Title & description */}
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{ticket.title}</h4>
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{ticket.description}</p>
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={10} />
                      <span>Melder: <strong>{ticket.reporter}</strong></span>
                      <span style={{ margin: '0 4px' }}>•</span>
                      <span>Erstellt: {new Date(ticket.createdAt).toLocaleDateString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Bottom: Action buttons or inline conversion panel */}
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    
                    {/* Status updater */}
                    <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                      {ticket.status === 'open' && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px' }}
                          onClick={() => onUpdateTicketStatus(ticket.id, 'in_progress')}
                        >
                          <Play size={10} />
                          Annehmen
                        </button>
                      )}
                      {ticket.status !== 'resolved' && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px', color: 'var(--success)', borderColor: 'var(--success)' }}
                          onClick={() => onUpdateTicketStatus(ticket.id, 'resolved')}
                        >
                          <CheckCircle size={10} />
                          Lösen
                        </button>
                      )}
                    </div>

                    {/* Convert Button */}
                    {ticket.status !== 'resolved' && !isConverting && (
                      <button
                        className="btn btn-primary"
                        style={{ padding: '5px 10px', fontSize: '0.75rem', gap: '4px', backgroundColor: 'var(--primary)' }}
                        onClick={() => handleStartConversion(ticket.id)}
                      >
                        <UserPlus size={10} />
                        <span>In Aufgabe umwandeln</span>
                        <ArrowRight size={10} />
                      </button>
                    )}
                  </div>

                  {/* Inline Task Conversion Panel */}
                  {isConverting && (
                    <div 
                      style={{ 
                        marginTop: '8px', 
                        padding: '12px', 
                        backgroundColor: 'var(--border-light)', 
                        borderRadius: 'var(--radius-sm)', 
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        animation: 'fadeIn var(--transition-fast)',
                        zIndex: 10
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Aufgaben-Parameter festlegen</strong>
                        <button 
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                          onClick={() => setConvertingTicketId(null)}
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
                        {/* Target Workspace */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>IT-Projekt</span>
                          <select 
                            className="form-control" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            value={targetWorkspaceId}
                            onChange={(e) => setTargetWorkspaceId(e.target.value)}
                          >
                            {workspaces.map(ws => (
                              <option key={ws.id} value={ws.id}>{ws.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Assignee */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>Zuweisen an</span>
                          <select 
                            className="form-control" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            value={targetAssigneeId}
                            onChange={(e) => setTargetAssigneeId(e.target.value)}
                          >
                            {users.map(u => (
                              <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Due Date */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>Fälligkeit</span>
                          <input 
                            type="date"
                            className="form-control"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            value={targetDueDate}
                            onChange={(e) => setTargetDueDate(e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-end', marginTop: '4px' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={() => setConvertingTicketId(null)}
                        >
                          Abbrechen
                        </button>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '4px 12px', fontSize: '0.75rem', backgroundColor: 'var(--success)' }}
                          onClick={handleConfirmConversion}
                        >
                          Übernehmen & Erstellen
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}

            {filteredTickets.length === 0 && (
              <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                📭 Keine Tickets in dieser Kategorie vorhanden.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
