import React, { useState } from 'react';
import { UserPlus, Edit2, Trash2, Shield, Key, Eye, EyeOff } from 'lucide-react';
import type { User } from '../data/mockData';

interface AdminViewProps {
  users: User[];
  onSaveUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  users,
  onSaveUser,
  onDeleteUser
}) => {
  // Editing state
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Techniker');
  const [color, setColor] = useState('#0ea5e9');
  const [initials, setInitials] = useState('');
  const [password, setPassword] = useState('••••••••');
  
  const [showPassword, setShowPassword] = useState(false);

  // Color options
  const colorOptions = [
    { value: '#0ea5e9', label: 'Cyan' },
    { value: '#8b5cf6', label: 'Violett' },
    { value: '#10b981', label: 'Grün' },
    { value: '#f59e0b', label: 'Orange' },
    { value: '#ef4444', label: 'Rot' },
    { value: '#ec4899', label: 'Rosa' },
    { value: '#64748b', label: 'Slate' }
  ];

  // Auto-generate initials from name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingUser) {
      const parts = val.trim().split(' ');
      if (parts.length >= 2) {
        setInitials((parts[0][0] + parts[1][0]).toUpperCase());
      } else if (parts.length === 1 && parts[0].length > 1) {
        setInitials(parts[0].substring(0, 2).toUpperCase());
      } else {
        setInitials('');
      }
    }
  };

  // Start editing a user
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setColor(user.color);
    setInitials(user.avatarInitials);
    setPassword('wertZ765!'); // Simulated loaded password
  };

  // Cancel edit/reset form
  const handleCancel = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('Techniker');
    setColor('#0ea5e9');
    setInitials('');
    setPassword('••••••••');
  };

  // Save / Add user
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !initials.trim()) {
      alert('Bitte füllen Sie Name, E-Mail und Kürzel aus.');
      return;
    }

    const savedUser: User = {
      id: editingUser ? editingUser.id : `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      color,
      avatarInitials: initials.trim().substring(0, 2).toUpperCase()
    };

    onSaveUser(savedUser);
    handleCancel();
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    if (userId === 'user-1') {
      alert('Der aktive Administrator-Account (Frank Kröner) kann nicht gelöscht werden.');
      return;
    }
    if (confirm(`Möchten Sie den Account von "${userName}" wirklich löschen? Der Benutzer wird auch aus allen Aufgabenzuweisungen entfernt.`)) {
      onDeleteUser(userId);
    }
  };

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '24px' }}>
        <p className="page-subtitle">Verwalten Sie KOWOBAU Teammitglieder, Berechtigungen und Passwörter</p>
      </div>

      <div className="task-modal-layout">
        
        {/* Left Side: Users Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Aktive Accounts</h3>
          </div>
          <table className="list-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Avatar</th>
                <th>Name / E-Mail</th>
                <th>Rolle</th>
                <th style={{ width: '130px', textAlign: 'right' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ cursor: 'default' }}>
                  <td>
                    <div 
                      style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        backgroundColor: user.color, 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}
                    >
                      {user.avatarInitials}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>{user.role}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        className="theme-toggle-btn" 
                        style={{ padding: '6px', borderRadius: '6px' }}
                        onClick={() => handleEditClick(user)}
                        title="Bearbeiten"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        className="theme-toggle-btn" 
                        style={{ padding: '6px', borderRadius: '6px', color: 'var(--danger)' }}
                        onClick={() => handleDeleteClick(user.id, user.name)}
                        disabled={user.id === 'user-1'}
                        title={user.id === 'user-1' ? 'Admin-Account' : 'Löschen'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Side: Add / Edit Form */}
        <div className="card">
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
            <UserPlus size={18} color="var(--primary)" />
            {editingUser ? 'Account bearbeiten' : 'Neuen Account anlegen'}
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            
            {/* Name */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Vollständiger Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="z.B. Max Mustermann"
                required
              />
            </div>

            {/* Email */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">E-Mail-Adresse</label>
              <input 
                type="email" 
                className="form-control" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="z.B. m.mustermann@kowobau.de"
                required
              />
            </div>

            {/* Initials & Color Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Kürzel (max. 2)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={initials}
                  onChange={(e) => setInitials(e.target.value.substring(0,2).toUpperCase())}
                  placeholder="MM"
                  maxLength={2}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Rolle</label>
                <select 
                  className="form-control" 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Projektleiter KOWOBAU">Projektleiter KOWOBAU</option>
                  <option value="Kundenbetreuerin">Kundenbetreuerin</option>
                  <option value="Hausmeister / Handwerker">Hausmeister / Handwerker</option>
                  <option value="Technikerin Instandhaltung">Technikerin Instandhaltung</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
            </div>

            {/* Password (simulated security) */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={12} />
                <span>Passwort festlegen</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="form-control" 
                  style={{ width: '100%', paddingRight: '40px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Color circles selection */}
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Profilfarbe</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {colorOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: opt.value,
                      border: color === opt.value ? '2px solid var(--text-primary)' : '1px solid transparent',
                      boxShadow: color === opt.value ? '0 0 0 2px var(--bg-card)' : 'none',
                      cursor: 'pointer',
                      transition: 'transform var(--transition-fast)'
                    }}
                    onClick={() => setColor(opt.value)}
                    title={opt.label}
                  />
                ))}
              </div>
            </div>

            {/* Form actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ flex: 1, fontSize: '0.85rem' }}
              >
                {editingUser ? 'Änderungen speichern' : 'Account erstellen'}
              </button>
              {(editingUser || name) && (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCancel}
                  style={{ fontSize: '0.85rem' }}
                >
                  Abbrechen
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
