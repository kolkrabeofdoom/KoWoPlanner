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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '800px' }}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? 'Aufgabe bearbeiten' : 'Neue Aufgabe erstellen'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Layout */}
        <div className="task-modal-layout">
          
          {/* Main Left Section */}
          <div className="task-modal-main">
            {/* Title Input */}
            <div className="form-group">
              <label className="form-label">Titel der Aufgabe</label>
              <input 
                type="text" 
                className="form-control" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Zählerstände ablesen"
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Beschreibung / Details</label>
              <textarea 
                className="form-control" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschreiben Sie hier die Details der Aufgabe..."
                rows={4}
              />
            </div>

            {/* Checklist Section */}
            <div>
              <h3 className="modal-section-title">
                <CheckSquare size={16} />
                Unteraufgaben ({completedCheck}/{totalCheck})
              </h3>
              
              {totalCheck > 0 && (
                <div>
                  <div className="checklist-progress-bar-bg">
                    <div className="checklist-progress-bar-fill" style={{ width: `${checkPercent}%` }} />
                  </div>
                  
                  <div className="checklist-items">
                    {checklist.map((item) => (
                      <div key={item.id} className="checklist-item">
                        <input 
                          type="checkbox" 
                          checked={item.completed} 
                          onChange={() => handleToggleChecklist(item.id)}
                        />
                        <span className={item.completed ? 'completed' : 'checklist-item-text'}>
                          {item.text}
                        </span>
                        <button 
                          className="checklist-item-delete" 
                          onClick={() => handleDeleteChecklist(item.id)}
                          title="Löschen"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add checklist item */}
              <form onSubmit={handleAddChecklist} className="checklist-add-form">
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  placeholder="Unteraufgabe hinzufügen..." 
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  Hinzufügen
                </button>
              </form>
            </div>

            {/* Comments Feed */}
            <div style={{ marginTop: '12px' }}>
              <h3 className="modal-section-title">
                <MessageSquare size={16} />
                Kommunikationsverlauf ({comments.length})
              </h3>

              <div className="comments-list">
                {comments.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px 0' }}>
                    Noch keine Kommentare vorhanden. Schreiben Sie ein Update!
                  </p>
                ) : (
                  comments.map((c) => {
                    const author = users.find(u => u.id === c.authorId) || {
                      name: 'Unbekannt',
                      avatarInitials: '?',
                      role: 'Mitarbeiter',
                      color: 'var(--text-muted)'
                    };
                    return (
                      <div key={c.id} className="comment-bubble">
                        <div className="comment-author-avatar" style={{ backgroundColor: author.color, color: 'white' }}>
                          {author.avatarInitials}
                        </div>
                        <div className="comment-details">
                          <div className="comment-meta">
                            <span className="comment-author">{author.name} <small style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({author.role})</small></span>
                            <span className="comment-time">{formatCommentTime(c.timestamp)}</span>
                          </div>
                          <p className="comment-text">{c.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Write Comment */}
              <form onSubmit={handleAddComment} className="comment-form">
                <textarea
                  className="form-control"
                  placeholder="Schreiben Sie einen Kommentar oder Update..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                />
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', fontSize: '0.85rem', padding: '6px 14px' }}>
                  <MessageCircle size={14} />
                  Kommentar senden
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar Right Settings */}
          <div className="task-modal-sidebar">
            {/* Status Selector */}
            <div className="sidebar-meta-row">
              <span className="sidebar-meta-label">Fortschrittstatus</span>
              <select 
                className="form-control" 
                value={status} 
                onChange={(e) => setStatus(e.target.value as Task['status'])}
              >
                <option value="planning">In Planung</option>
                <option value="in_progress">In Bearbeitung</option>
                <option value="completed">Erledigt</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div className="sidebar-meta-row">
              <span className="sidebar-meta-label">Priorität</span>
              <select 
                className="form-control" 
                value={priority} 
                onChange={(e) => setPriority(e.target.value as Task['priority'])}
              >
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
                <option value="urgent">Urgent / Dringend</option>
              </select>
            </div>

            {/* Start & Due Dates */}
            <div className="sidebar-meta-row">
              <span className="sidebar-meta-label">Startdatum</span>
              <div style={{ position: 'relative' }}>
                <input 
                  type="date" 
                  className="form-control" 
                  style={{ width: '100%' }}
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <div className="sidebar-meta-row">
              <span className="sidebar-meta-label">Fälligkeitsdatum</span>
              <input 
                type="date" 
                className="form-control" 
                style={{ width: '100%' }}
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* System / Location */}
            <div className="sidebar-meta-row">
              <span className="sidebar-meta-label">System / Ort</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                <Monitor size={16} color="var(--text-muted)" />
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ width: '100%', padding: '6px 8px' }}
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="z.B. SAP RE-FX, AWS Cloud, IT-Büro"
                />
              </div>
            </div>

            {/* Assignees (Multiple selection) */}
            <div className="sidebar-meta-row">
              <span className="sidebar-meta-label">Zuständigkeiten</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto', padding: '4px 0' }}>
                {users.map(user => (
                  <label key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={assignees.includes(user.id)} 
                      onChange={() => handleToggleAssignee(user.id)}
                      style={{ cursor: 'pointer' }}
                    />
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
                        fontSize: '0.6rem',
                        fontWeight: 700
                      }}
                    >
                      {user.avatarInitials}
                    </div>
                    <span>{user.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Attachments */}
            <div className="sidebar-meta-row">
              <span className="sidebar-meta-label">Dokumente & Links</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {attachments.map((file, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }} title={file}>{file}</span>
                    <button 
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                      onClick={() => handleDeleteAttachment(idx)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                {/* Add attachment */}
                <form onSubmit={handleAddAttachment} style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ fontSize: '0.75rem', padding: '4px 6px', flex: 1 }}
                    placeholder="Dateiname / Link..." 
                    value={newAttachment}
                    onChange={(e) => setNewAttachment(e.target.value)}
                  />
                  <button type="submit" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                    <Plus size={10} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '24px' }}>
          <div>
            {isEdit && onDelete && (
              <button 
                type="button" 
                className="btn btn-danger" 
                style={{ fontSize: '0.85rem' }}
                onClick={() => {
                  if (confirm('Möchten Sie diese Aufgabe wirklich löschen?')) {
                    onDelete(task.id);
                  }
                }}
              >
                <Trash2 size={14} />
                Aufgabe löschen
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ fontSize: '0.85rem' }}>
              Abbrechen
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave} style={{ fontSize: '0.85rem' }}>
              Speichern
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
