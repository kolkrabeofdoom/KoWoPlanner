import React, { useState } from 'react';
import { 
  X, CheckSquare, MessageSquare, Monitor, Trash2, Plus, MessageCircle
} from 'lucide-react';
import type { Task, ChecklistItem, Comment, User } from '../data/mockData';
import { useStore } from '../store/useStore';

interface TaskModalProps {
  task: Task | null; // If null, we are creating a new task
  workspaceId: string;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  users: User[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  workspaceId,
  onClose,
  onSave,
  onDelete,
  users
}) => {
  const isEdit = !!task;
  const currentUser = useStore(state => state.user);

  // Form states
  const [title, setTitle] = useState(task ? task.title : '');
  const [description, setDescription] = useState(task ? task.description : '');
  const [status, setStatus] = useState<Task['status']>(task ? task.status : 'planning');
  const [priority, setPriority] = useState<Task['priority']>(task ? task.priority : 'medium');
  const [assignees, setAssignees] = useState<string[]>(task ? task.assignees : []);
  const [startDate, setStartDate] = useState(task ? task.startDate : '');
  const [dueDate, setDueDate] = useState(task ? task.dueDate : '');
  const [address, setAddress] = useState(task ? task.address : '');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(task && task.checklist ? task.checklist : []);
  const [comments, setComments] = useState<Comment[]>(task && task.comments ? task.comments : []);
  const [attachments, setAttachments] = useState<string[]>(task && task.attachments ? task.attachments : []);

  // Temporary item states
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newAttachment, setNewAttachment] = useState('');

  // Checklist actions
  const handleToggleChecklist = (id: string) => {
    setChecklist(prev => 
      prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    );
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;
    const newItem: ChecklistItem = {
      id: `ch-${Date.now()}`,
      text: newChecklistItem.trim(),
      completed: false
    };
    setChecklist(prev => [...prev, newItem]);
    setNewChecklistItem('');
  };

  const handleDeleteChecklist = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  // Comment actions
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    // The "c-" id marks the comment as unsaved; the server assigns the
    // real id and takes the author from the JWT when the task is saved.
    const newComm: Comment = {
      id: `c-${Date.now()}`,
      authorId: currentUser.id,
      text: newComment.trim(),
      timestamp: new Date().toISOString()
    };
    setComments(prev => [...prev, newComm]);
    setNewComment('');
  };

  // Assignee selection toggle
  const handleToggleAssignee = (userId: string) => {
    setAssignees(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  // Attachments actions
  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttachment.trim()) return;
    setAttachments(prev => [...prev, newAttachment.trim()]);
    setNewAttachment('');
  };

  const handleDeleteAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Save changes
  const handleSave = () => {
    if (!title.trim()) {
      alert('Bitte geben Sie einen Titel ein.');
      return;
    }

    const savedTask: Task = {
      id: task ? task.id : `task-${Date.now()}`,
      workspaceId: task ? task.workspaceId : workspaceId,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignees,
      startDate,
      dueDate,
      address: address.trim(),
      checklist,
      comments,
      attachments
    };

    onSave(savedTask);
  };

  // Calculation helpers
  const totalCheck = checklist.length;
  const completedCheck = checklist.filter(c => c.completed).length;
  const checkPercent = totalCheck > 0 ? Math.round((completedCheck / totalCheck) * 100) : 0;

  // Format Comment Time Helper
  const formatCommentTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'var(--scrim)', backdropFilter: 'blur(2.5px)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 24px', overflowY: 'auto' }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '1000px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', boxShadow: 'var(--shadow-modal)', overflow: 'hidden' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 26px', borderBottom: '1px solid var(--border-soft)' }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '18px', fontWeight: 600, letterSpacing: '-.01em', color: 'var(--ink)', margin: 0 }}>
            {isEdit ? 'Aufgabe bearbeiten' : 'Neue Aufgabe erstellen'}
          </h2>
          {isEdit && (
            <>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '11px', 
                fontWeight: 700, 
                color: status === 'completed' ? 'var(--green)' : status === 'in_progress' ? 'var(--primary)' : 'var(--amber-deep)', 
                background: status === 'completed' ? 'var(--green-tint)' : status === 'in_progress' ? 'var(--primary-tint)' : 'var(--amber-tint)', 
                padding: '4px 10px', 
                borderRadius: '999px' 
              }}>
                <span style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  background: status === 'completed' ? 'var(--green)' : status === 'in_progress' ? 'var(--primary)' : 'var(--amber-deep)' 
                }}></span>
                {status === 'completed' ? 'Erledigt' : status === 'in_progress' ? 'In Bearbeitung' : 'In Planung'}
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: 500 }}>
                {task.id}
              </span>
            </>
          )}
          <button onClick={onClose} title="Schließen" style={{ marginLeft: 'auto', width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)', border: 'none', background: 'transparent', cursor: 'pointer' }} className="hover-btn-icon">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px' }}>
          
          {/* Main Left Section */}
          <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Title Input */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>Titel der Aufgabe</div>
              <input 
                type="text" 
                className="form-control" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="z. B. Zählerstände ablesen"
                style={{
                  width: '100%', 
                  background: 'var(--bg-subtle)', 
                  border: '1px solid var(--border-input)', 
                  borderRadius: '10px', 
                  padding: '11px 13px', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: 'var(--ink)', 
                  outline: 'none'
                }}
                required
              />
            </div>

            {/* Description */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>Beschreibung / Details</div>
              <textarea 
                className="form-control" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Beschreiben Sie hier die Details der Aufgabe..." 
                rows={3}
                style={{
                  width: '100%', 
                  background: 'var(--bg-subtle)', 
                  border: '1px solid var(--border-input)', 
                  borderRadius: '10px', 
                  padding: '11px 13px', 
                  fontSize: '13.5px', 
                  color: 'var(--ink)', 
                  outline: 'none',
                  resize: 'vertical',
                  lineHeight: 1.55
                }}
              />
            </div>

            {/* Checklist Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>
                  <CheckSquare size={14} strokeWidth={1.9} />
                  Unteraufgaben
                </div>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>
                  {completedCheck}/{totalCheck}
                </span>
                <div style={{ flex: 1, height: '6px', borderRadius: '999px', background: 'var(--track)', overflow: 'hidden' }}>
                  <div style={{ width: `${checkPercent}%`, height: '100%', background: 'var(--green)', borderRadius: '999px' }} />
                </div>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--green)' }}>{checkPercent}%</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {checklist.map((item) => (
                  <div 
                    key={item.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '11px', 
                      padding: '9px 12px', 
                      border: '1px solid var(--border-soft)', 
                      borderRadius: '10px', 
                      background: item.completed ? 'var(--bg-subtle)' : 'var(--bg-card)' 
                    }}
                    className={item.completed ? '' : 'hover-timeline-row'}
                  >
                    <span 
                      onClick={() => handleToggleChecklist(item.id)}
                      style={{ 
                        width: '18px', 
                        height: '18px', 
                        borderRadius: '6px', 
                        background: item.completed ? 'var(--green)' : 'var(--bg-card)', 
                        border: item.completed ? 'none' : '1.5px solid var(--border-input)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flex: 'none', 
                        cursor: 'pointer' 
                      }}
                    >
                      {item.completed && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="5,13 10,18 19,7"/></svg>
                      )}
                    </span>
                    <span style={{ 
                      fontSize: '13px', 
                      fontWeight: 500, 
                      color: item.completed ? 'var(--muted)' : 'var(--ink)', 
                      textDecoration: item.completed ? 'line-through' : 'none', 
                      textDecorationThickness: '1px',
                      flex: 1
                    }}>
                      {item.text}
                    </span>
                    <button 
                      onClick={() => handleDeleteChecklist(item.id)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--muted)', 
                        cursor: 'pointer', 
                        padding: 0, 
                        display: 'flex', 
                        alignItems: 'center' 
                      }}
                      title="Löschen"
                      className="hover-opacity"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add checklist item */}
              <form onSubmit={handleAddChecklist} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Unteraufgabe hinzufügen…" 
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  style={{ 
                    flex: 1, 
                    background: 'var(--bg-subtle)', 
                    border: '1px solid var(--border-input)', 
                    borderRadius: '10px', 
                    padding: '9px 13px', 
                    fontSize: '13px', 
                    color: 'var(--ink)', 
                    outline: 'none' 
                  }}
                />
                <button 
                  type="submit" 
                  style={{ 
                    background: 'var(--chip)', 
                    border: 'none', 
                    borderRadius: '10px', 
                    padding: '9px 16px', 
                    fontFamily: 'Plus Jakarta Sans', 
                    fontSize: '12.5px', 
                    fontWeight: 700, 
                    color: 'var(--ink-2)', 
                    cursor: 'pointer' 
                  }}
                  className="hover-btn-secondary"
                >
                  Hinzufügen
                </button>
              </form>
            </div>

            {/* Comments Feed */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--ink-2)', marginBottom: '10px' }}>
                <MessageSquare size={14} strokeWidth={1.9} />
                Kommunikationsverlauf
                <span style={{ fontSize: '11.5px', color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums', marginLeft: '4px' }}>
                  ({comments.length})
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {comments.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic', padding: '12px 0' }}>
                    Noch keine Kommentare vorhanden. Schreiben Sie ein Update!
                  </p>
                ) : (
                  comments.map((c) => {
                    const author = users.find(u => u.id === c.authorId) || {
                      name: 'Mitarbeiter',
                      avatarInitials: 'MA',
                      role: 'KOWOBAU',
                      color: 'var(--ink-3)'
                    };
                    return (
                      <div key={c.id} style={{ display: 'flex', gap: '12px', background: 'var(--bg-subtle)', border: '1px solid var(--border-soft)', borderRadius: '12px', padding: '12px 14px' }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          backgroundColor: author.color, 
                          color: '#fff', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '11px', 
                          fontWeight: 700, 
                          flex: 'none' 
                        }}>
                          {author.avatarInitials}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>{author.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{author.role}</span>
                            <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                              {formatCommentTime(c.timestamp)}
                            </span>
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--ink-2)', marginTop: '4px', lineHeight: 1.5 }}>
                            {c.text}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Write Comment */}
              <form onSubmit={handleAddComment} style={{ marginTop: '10px' }}>
                <textarea
                  placeholder="Schreiben Sie einen Kommentar oder ein Update…"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  style={{ 
                    width: '100%', 
                    background: 'var(--bg-subtle)', 
                    border: '1px solid var(--border-input)', 
                    borderRadius: '10px', 
                    padding: '10px 13px', 
                    fontSize: '13px', 
                    color: 'var(--ink)', 
                    outline: 'none', 
                    resize: 'vertical', 
                    lineHeight: 1.5 
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="submit" style={{ 
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
                  }} className="hover-btn-primary">
                    <MessageCircle size={13} strokeWidth={1.9} style={{ marginRight: '2px' }} />
                    Kommentar senden
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar Right Settings */}
          <div style={{ background: 'var(--bg-subtle)', borderLeft: '1px solid var(--border-soft)', padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Status Selector */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>Fortschrittsstatus</div>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as Task['status'])}
                style={{ 
                  width: '100%', 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border-input)', 
                  borderRadius: '10px', 
                  padding: '10px 11px', 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  color: 'var(--ink)', 
                  outline: 'none' 
                }}
              >
                <option value="planning">In Planung</option>
                <option value="in_progress">In Bearbeitung</option>
                <option value="completed">Erledigt</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>Priorität</div>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value as Task['priority'])}
                style={{ 
                  width: '100%', 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border-input)', 
                  borderRadius: '10px', 
                  padding: '10px 11px', 
                  fontSize: '13px', 
                  fontWeight: 600, 
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

            {/* Start & Due Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>Start</div>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ 
                    width: '100%', 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border-input)', 
                    borderRadius: '10px', 
                    padding: '9px 10px', 
                    fontSize: '12.5px', 
                    fontWeight: 600, 
                    color: 'var(--ink)', 
                    outline: 'none' 
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>Fällig</div>
                <input 
                  type="date" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ 
                    width: '100%', 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border-input)', 
                    borderRadius: '10px', 
                    padding: '9px 10px', 
                    fontSize: '12.5px', 
                    fontWeight: 600, 
                    color: 'var(--ink)', 
                    outline: 'none' 
                  }}
                />
              </div>
            </div>

            {/* System / Location */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>System / Ort</div>
              <input 
                type="text" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                placeholder="z.B. SAP RE-FX, IT-Büro"
                style={{ 
                  width: '100%', 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border-input)', 
                  borderRadius: '10px', 
                  padding: '10px 13px', 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  color: 'var(--ink)', 
                  outline: 'none' 
                }}
              />
            </div>

            {/* Assignees */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>Zuständigkeiten</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {users.map(u => {
                  const isAssigned = assignees.includes(u.id);
                  return (
                    <div 
                      key={u.id}
                      onClick={() => handleToggleAssignee(u.id)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        padding: '7px 10px', 
                        borderRadius: '9px', 
                        cursor: 'pointer',
                        background: isAssigned ? 'var(--primary-tint)' : 'transparent',
                        transition: 'background var(--transition-fast)'
                      }}
                      className={isAssigned ? '' : 'hover-timeline-row'}
                    >
                      <span style={{ 
                        width: '17px', 
                        height: '17px', 
                        borderRadius: '5px', 
                        background: isAssigned ? 'var(--primary-btn)' : 'var(--bg-card)', 
                        border: isAssigned ? 'none' : '1.5px solid var(--border-input)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 'none'
                      }}>
                        {isAssigned && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round"><polyline points="5,13 10,18 19,7"/></svg>
                        )}
                      </span>
                      <div style={{ 
                        width: '26px', 
                        height: '26px', 
                        borderRadius: '50%', 
                        backgroundColor: u.color, 
                        color: '#fff', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '10px', 
                        fontWeight: 700, 
                        flex: 'none' 
                      }}>
                        {u.avatarInitials}
                      </div>
                      <span style={{ 
                        fontSize: '13px', 
                        fontWeight: isAssigned ? 600 : 500, 
                        color: isAssigned ? 'var(--ink)' : 'var(--ink-2)' 
                      }}>
                        {u.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attachments */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>Dokumente &amp; Links</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {attachments.map((file, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '9px', 
                      background: 'var(--bg-card)', 
                      border: '1px solid var(--border-input)', 
                      borderRadius: '9px', 
                      padding: '8px 11px',
                      minWidth: 0
                    }}
                    className="hover-card-border"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}><path d="M21 12.8V8a5 5 0 0 0-10 0v9a3.2 3.2 0 0 0 6.4 0V9"/></svg>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: 600, 
                      color: 'var(--ink-2)', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      flex: 1
                    }} title={file}>
                      {file}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteAttachment(idx); }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}
                      className="hover-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleAddAttachment} style={{ display: 'flex', gap: '7px', marginTop: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Dateiname / Link…" 
                  value={newAttachment}
                  onChange={(e) => setNewAttachment(e.target.value)}
                  style={{ 
                    flex: 1, 
                    minWidth: 0, 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border-input)', 
                    borderRadius: '9px', 
                    padding: '8px 11px', 
                    fontSize: '12px', 
                    color: 'var(--ink)', 
                    outline: 'none' 
                  }}
                />
                <button 
                  type="submit" 
                  title="Hinzufügen" 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '9px', 
                    background: 'var(--chip)', 
                    border: 'none', 
                    color: 'var(--ink-2)', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    flex: 'none' 
                  }}
                  className="hover-btn-secondary"
                >
                  <Plus size={14} strokeWidth={2.2} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 26px', borderTop: '1px solid var(--border-soft)' }}>
          {isEdit && onDelete && (
            <button 
              type="button" 
              onClick={() => {
                if (confirm('Möchten Sie diese Aufgabe wirklich löschen?')) {
                  onDelete(task.id);
                }
              }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '7px', 
                background: 'var(--red-tint)', 
                border: 'none', 
                borderRadius: '10px', 
                padding: '10px 15px', 
                fontFamily: 'Plus Jakarta Sans', 
                fontSize: '12.5px', 
                fontWeight: 700, 
                color: 'var(--red)', 
                cursor: 'pointer' 
              }}
              className="hover-opacity"
            >
              <Trash2 size={13} strokeWidth={1.9} />
              Aufgabe löschen
            </button>
          )}
          <button 
            type="button" 
            onClick={onClose}
            style={{ 
              marginLeft: 'auto', 
              display: 'flex', 
              alignItems: 'center', 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border-input)', 
              borderRadius: '10px', 
              padding: '10px 16px', 
              fontSize: '13px', 
              fontWeight: 600, 
              color: 'var(--ink-2)', 
              cursor: 'pointer' 
            }}
            className="hover-btn-secondary"
          >
            Abbrechen
          </button>
          <button 
            type="button" 
            onClick={handleSave}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '7px', 
              background: 'var(--primary-btn)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '10px', 
              padding: '10px 18px', 
              fontSize: '13px', 
              fontWeight: 700, 
              cursor: 'pointer',
              boxShadow: 'var(--btn-shadow)' 
            }}
            className="hover-btn-primary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="5,13 10,18 19,7"/></svg>
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
};
