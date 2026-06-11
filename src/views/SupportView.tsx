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
      return { text: 'Gelöst', color: 'var(--green)', bg: 'var(--green-tint)' };
    }

    const now = new Date('2026-06-11T07:30:00Z').getTime();
    const created = new Date(ticket.createdAt).getTime();
    const elapsedHours = (now - created) / (1000 * 60 * 60);
    const remaining = ticket.slaHours - elapsedHours;

    const roundedRemaining = Math.max(0, Math.round(remaining * 10) / 10);

    if (remaining <= 0) {
      return { text: 'SLA Überschritten!', color: 'var(--red)', bg: 'var(--red-tint)' };
    } else if (remaining <= 8) {
      return { text: `SLA · ${roundedRemaining} Std. verbleibend`, color: 'var(--amber-deep)', bg: 'var(--amber-tint)' };
    } else {
      return { text: `SLA · ${roundedRemaining} Std. verbleibend`, color: 'var(--green)', bg: 'var(--green-tint)' };
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

  const parseReporter = (reporterName: string) => {
    const match = reporterName.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      return { name: match[1], dept: match[2] };
    }
    return { name: reporterName, dept: '' };
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      
      {/* Left Column: Form to submit ticket */}
      <div style={{ 
        width: '380px', 
        flex: 'none', 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border)', 
        borderRadius: '18px', 
        padding: '24px', 
        boxShadow: 'var(--shadow-card)', 
        position: 'sticky', 
        top: '96px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '32px', 
            height: '32px', 
            borderRadius: '10px', 
            background: 'var(--primary-tint)', 
            color: 'var(--primary)' 
          }}>
            <LifeBuoy size={17} strokeWidth={1.8} />
          </span>
          <div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: '15px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.01em' }}>
              Support-Meldung erfassen
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '1px' }}>
              SLA wird automatisch berechnet
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '22px' }}>
          
          {/* Title */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>Titel / Problem</div>
            <input 
              type="text" 
              className="form-control" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z. B. Outlook startet nicht"
              style={{
                width: '100%', 
                background: 'var(--bg-subtle)', 
                border: '1px solid var(--border-input)', 
                borderRadius: '10px', 
                padding: '10px 13px', 
                fontSize: '13.5px', 
                color: 'var(--ink)', 
                outline: 'none'
              }}
              required
            />
          </div>

          {/* Reporter */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>Melder / Abteilung</div>
            <input 
              type="text" 
              className="form-control" 
              value={reporter}
              onChange={(e) => setReporter(e.target.value)}
              placeholder="z. B. Brigitte Schmitz (Mietverwaltung)"
              style={{
                width: '100%', 
                background: 'var(--bg-subtle)', 
                border: '1px solid var(--border-input)', 
                borderRadius: '10px', 
                padding: '10px 13px', 
                fontSize: '13.5px', 
                color: 'var(--ink)', 
                outline: 'none'
              }}
              required
            />
          </div>

          {/* Description */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>Problembeschreibung</div>
            <textarea 
              className="form-control" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Genaue Fehlerbeschreibung oder Anforderung…"
              rows={4}
              style={{
                width: '100%', 
                background: 'var(--bg-subtle)', 
                border: '1px solid var(--border-input)', 
                borderRadius: '10px', 
                padding: '10px 13px', 
                fontSize: '13.5px', 
                color: 'var(--ink)', 
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.5
              }}
              required
            />
          </div>

          {/* Category & Priority Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>Kategorie</div>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as Ticket['category'])}
                style={{
                  width: '100%', 
                  background: 'var(--bg-subtle)', 
                  border: '1px solid var(--border-input)', 
                  borderRadius: '10px', 
                  padding: '10px 11px', 
                  fontSize: '13.5px', 
                  color: 'var(--ink)', 
                  outline: 'none'
                }}
              >
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Netzwerk">Network</option>
                <option value="Berechtigungen">Permissions</option>
              </select>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>Priorität</div>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as Ticket['priority'])}
                style={{
                  width: '100%', 
                  background: 'var(--bg-subtle)', 
                  border: '1px solid var(--border-input)', 
                  borderRadius: '10px', 
                  padding: '10px 11px', 
                  fontSize: '13.5px', 
                  color: 'var(--ink)', 
                  outline: 'none'
                }}
              >
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
                <option value="urgent">Dringend</option>
              </select>
            </div>
          </div>

          {/* SLA Time */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>SLA-Lösungszeit (Stunden)</div>
            <input 
              type="number" 
              className="form-control" 
              value={slaHours}
              onChange={(e) => setSlaHours(Number(e.target.value))}
              min={1}
              style={{
                width: '100%', 
                background: 'var(--bg-subtle)', 
                border: '1px solid var(--border-input)', 
                borderRadius: '10px', 
                padding: '10px 13px', 
                fontSize: '13.5px', 
                color: 'var(--ink)', 
                outline: 'none'
              }}
              required
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              background: 'var(--primary-btn)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '11px', 
              padding: '12px', 
              fontFamily: 'Plus Jakarta Sans', 
              fontSize: '13.5px', 
              fontWeight: 600, 
              cursor: 'pointer', 
              boxShadow: 'var(--btn-shadow)', 
              marginTop: '2px' 
            }}
            className="hover-btn-primary"
          >
            <Send size={15} strokeWidth={1.9} />
            <span>Ticket einreichen</span>
          </button>
        </form>

        {/* Mascot Card */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px dashed var(--border)',
          borderRadius: '14px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <img 
            src="/kitten_logo.png" 
            alt="PISHI Mascot" 
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--primary)',
              flexShrink: 0
            }}
          />
          <div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
              Hallo, ich bin Pishi! 🐾
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '4px', lineHeight: 1.4 }}>
              Dein IT-Support-Kätzchen. Ich helfe dir, Tickets im Auge zu behalten und sie in Aufgaben zu verwandeln!
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Tickets List */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Header Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', background: 'var(--well)', borderRadius: '11px', padding: '3px', gap: '2px' }}>
            {(['all', 'open', 'in_progress', 'resolved'] as const).map(tab => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    border: 'none',
                    background: isActive ? 'var(--bg-card)' : 'transparent',
                    boxShadow: isActive ? 'var(--shadow-card)' : 'none',
                    borderRadius: '9px',
                    padding: '7px 14px',
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: '12.5px',
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? 'var(--ink)' : 'var(--ink-3)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {tab === 'all' && 'Alle'}
                  {tab === 'open' && 'Offen'}
                  {tab === 'in_progress' && 'In Arbeit'}
                  {tab === 'resolved' && 'Gelöst'}
                </button>
              );
            })}
          </div>
          
          {/* Search Input inside list header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border-input)', 
            borderRadius: '10px', 
            padding: '6px 12px', 
            maxWidth: '220px', 
            flex: 1 
          }}>
            <Laptop size={13} color="var(--muted)" />
            <input 
              type="text" 
              placeholder="Suchen..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                border: 'none', 
                background: 'transparent', 
                outline: 'none', 
                fontSize: '12px', 
                width: '100%', 
                color: 'var(--ink)' 
              }}
            />
          </div>

          <span style={{ marginLeft: 'auto', fontSize: '12.5px', fontWeight: 500, color: 'var(--muted)' }}>
            {filteredTickets.length} Tickets · {filteredTickets.filter(t => t.status !== 'resolved').length} offen
          </span>
        </div>

        {/* Tickets List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredTickets.map(ticket => {
            const sla = getSlaDetails(ticket);
            const isConverting = convertingTicketId === ticket.id;
            const { name, dept } = parseReporter(ticket.reporter);

            return (
              <div 
                key={ticket.id}
                style={{ 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '16px', 
                  padding: '20px 22px', 
                  boxShadow: 'var(--shadow-card)',
                  opacity: ticket.status === 'resolved' ? 0.7 : 1,
                  transition: 'box-shadow var(--transition-fast)'
                }}
                className="hover-card"
              >
                {/* Top: Header metadata */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontFamily: 'Space Grotesk', fontSize: '12.5px', fontWeight: 600, color: 'var(--muted)' }}>
                    #{ticket.id}
                  </span>
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: 700, 
                    letterSpacing: '.05em', 
                    color: 'var(--ink-3)', 
                    background: 'var(--chip)', 
                    padding: '4px 9px', 
                    borderRadius: '7px',
                    textTransform: 'uppercase'
                  }}>
                    {ticket.category === 'Berechtigungen' ? 'BERECHTIGUNGEN' : ticket.category.toUpperCase()}
                  </span>
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: 700, 
                    letterSpacing: '.05em', 
                    color: ticket.priority === 'urgent' || ticket.priority === 'high' ? 'var(--red)' : ticket.priority === 'medium' ? 'var(--primary)' : 'var(--ink-3)', 
                    background: ticket.priority === 'urgent' || ticket.priority === 'high' ? 'var(--red-tint)' : ticket.priority === 'medium' ? 'var(--primary-tint)' : 'var(--chip)', 
                    padding: '4px 9px', 
                    borderRadius: '7px' 
                  }}>
                    {ticket.priority === 'urgent' ? 'DRINGEND' : ticket.priority.toUpperCase()}
                  </span>
                  {ticket.status === 'in_progress' && (
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: 700, 
                      letterSpacing: '.05em', 
                      color: 'var(--primary)', 
                      background: 'var(--primary-tint)', 
                      padding: '4px 9px', 
                      borderRadius: '7px' 
                    }}>
                      IN ARBEIT
                    </span>
                  )}

                  <span style={{ 
                    marginLeft: 'auto', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    fontSize: '11.5px', 
                    fontWeight: 700, 
                    color: sla.color, 
                    background: sla.bg, 
                    padding: '5px 11px', 
                    borderRadius: '999px' 
                  }}>
                    {ticket.status === 'resolved' ? (
                      <CheckCircle size={13} strokeWidth={2.2} />
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><polyline points="12,7 12,12 16,14"/></svg>
                    )}
                    {sla.text}
                  </span>
                </div>

                {/* Middle: Title & description */}
                <div>
                  <h4 style={{ 
                    fontSize: '15px', 
                    fontWeight: 650, 
                    color: 'var(--ink)', 
                    margin: '10px 0 4px', 
                    letterSpacing: '-.005em',
                    textDecoration: ticket.status === 'resolved' ? 'line-through' : 'none',
                    textDecorationColor: 'var(--faint)',
                    textDecorationThickness: '1px'
                  }}>
                    {ticket.title}
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--ink-3)', lineHeight: '1.5', maxWidth: '72ch', margin: 0 }}>
                    {ticket.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>
                    <User size={13} strokeWidth={1.8} />
                    <span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{name}</span> {dept && `· ${dept}`}
                    <span style={{ color: 'var(--faint)' }}>•</span>
                    Erstellt: {new Date(ticket.createdAt).toLocaleDateString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Bottom: Action buttons or inline conversion panel */}
                {ticket.status !== 'resolved' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-soft)' }}>
                    {ticket.status === 'open' && (
                      <button 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          background: 'var(--bg-card)', 
                          border: '1px solid var(--border-input)', 
                          borderRadius: '9px', 
                          padding: '8px 14px', 
                          fontFamily: 'Plus Jakarta Sans', 
                          fontSize: '12.5px', 
                          fontWeight: 600, 
                          color: 'var(--ink-2)', 
                          cursor: 'pointer' 
                        }}
                        className="hover-btn-secondary"
                        onClick={() => onUpdateTicketStatus(ticket.id, 'in_progress')}
                      >
                        <Play size={13} strokeWidth={2} />
                        Annehmen
                      </button>
                    )}
                    
                    <button 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        background: 'var(--green-tint)', 
                        border: 'none', 
                        borderRadius: '9px', 
                        padding: '8px 14px', 
                        fontFamily: 'Plus Jakarta Sans', 
                        fontSize: '12.5px', 
                        fontWeight: 700, 
                        color: 'var(--green)', 
                        cursor: 'pointer' 
                      }}
                      className="hover-opacity"
                      onClick={() => onUpdateTicketStatus(ticket.id, 'resolved')}
                    >
                      <CheckCircle size={13} strokeWidth={2.2} />
                      Lösen
                    </button>

                    {!isConverting && (
                      <button 
                        style={{ 
                          marginLeft: 'auto', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '7px', 
                          background: 'var(--primary-btn)', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '9px', 
                          padding: '8px 15px', 
                          fontFamily: 'Plus Jakarta Sans', 
                          fontSize: '12.5px', 
                          fontWeight: 700, 
                          cursor: 'pointer' 
                        }}
                        className="hover-btn-primary"
                        onClick={() => handleStartConversion(ticket.id)}
                      >
                        In Aufgabe umwandeln
                        <ArrowRight size={13} strokeWidth={2.2} style={{ marginLeft: '4px' }} />
                      </button>
                    )}
                  </div>
                )}

                {/* Inline Task Conversion Panel */}
                {isConverting && (
                  <div 
                    style={{ 
                      marginTop: '14px', 
                      padding: '16px', 
                      backgroundColor: 'var(--bg-subtle)', 
                      borderRadius: '12px', 
                      border: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      animation: 'fadeIn var(--transition-fast)',
                      zIndex: 10
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '12px', fontFamily: 'Space Grotesk', textTransform: 'uppercase', color: 'var(--ink-2)', letterSpacing: '.05em' }}>Aufgaben-Parameter festlegen</strong>
                      <button 
                        style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        onClick={() => setConvertingTicketId(null)}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }}>
                      {/* Target Workspace */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>IT-Projekt</span>
                        <select 
                          style={{ 
                            padding: '8px 10px', 
                            fontSize: '12.5px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-input)',
                            borderRadius: '8px',
                            color: 'var(--ink)',
                            outline: 'none'
                          }}
                          value={targetWorkspaceId}
                          onChange={(e) => setTargetWorkspaceId(e.target.value)}
                        >
                          {workspaces.map(ws => (
                            <option key={ws.id} value={ws.id}>{ws.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Assignee */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Zuweisen an</span>
                        <select 
                          style={{ 
                            padding: '8px 10px', 
                            fontSize: '12.5px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-input)',
                            borderRadius: '8px',
                            color: 'var(--ink)',
                            outline: 'none'
                          }}
                          value={targetAssigneeId}
                          onChange={(e) => setTargetAssigneeId(e.target.value)}
                        >
                          {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Due Date */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Fälligkeit</span>
                        <input 
                          type="date"
                          style={{ 
                            padding: '8px 10px', 
                            fontSize: '12.5px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-input)',
                            borderRadius: '8px',
                            color: 'var(--ink)',
                            outline: 'none'
                          }}
                          value={targetDueDate}
                          onChange={(e) => setTargetDueDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-end', marginTop: '4px' }}>
                      <button 
                        style={{ 
                          padding: '8px 14px', 
                          fontSize: '12px',
                          fontWeight: 600,
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-input)',
                          borderRadius: '8px',
                          color: 'var(--ink-2)',
                          cursor: 'pointer'
                        }}
                        className="hover-btn-secondary"
                        onClick={() => setConvertingTicketId(null)}
                      >
                        Abbrechen
                      </button>
                      <button 
                        style={{ 
                          padding: '8px 16px', 
                          fontSize: '12px',
                          fontWeight: 700,
                          background: 'var(--green)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          cursor: 'pointer'
                        }}
                        className="hover-opacity"
                        onClick={handleConfirmConversion}
                      >
                        Übernehmen &amp; Erstellen
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })}

          {filteredTickets.length === 0 && (
            <div style={{ 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border)', 
              borderRadius: '16px', 
              padding: '32px', 
              textAlign: 'center', 
              color: 'var(--muted)', 
              fontSize: '0.85rem' 
            }}>
              📭 Keine Tickets in dieser Kategorie vorhanden.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
