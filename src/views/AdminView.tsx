import React, { useState } from 'react';
import { UserPlus, Edit2, Trash2, Shield, Key, Eye, EyeOff } from 'lucide-react';
import type { User } from '../data/mockData';

interface AdminViewProps {
  users: User[];
  currentUserId: string;
  onSaveUser: (user: User, password?: string) => void;
  onDeleteUser: (userId: string) => void;
}

const MIN_PASSWORD_LENGTH = 8;

export const AdminView: React.FC<AdminViewProps> = ({
  users,
  currentUserId,
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
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

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

  // Start editing a user (password stays empty = unchanged)
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setColor(user.color);
    setInitials(user.avatarInitials);
    setIsAdmin(Boolean(user.isAdmin));
    setPassword('');
  };

  // Cancel edit/reset form
  const handleCancel = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('Techniker');
    setColor('#0ea5e9');
    setInitials('');
    setIsAdmin(false);
    setPassword('');
  };

  // Save / Add user
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !initials.trim()) {
      alert('Bitte füllen Sie Name, E-Mail und Kürzel aus.');
      return;
    }

    if (!editingUser && password.length < MIN_PASSWORD_LENGTH) {
      alert(`Bitte vergeben Sie ein Initialpasswort mit mindestens ${MIN_PASSWORD_LENGTH} Zeichen.`);
      return;
    }
    if (editingUser && password && password.length < MIN_PASSWORD_LENGTH) {
      alert(`Das neue Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`);
      return;
    }

    const savedUser: User = {
      id: editingUser ? editingUser.id : `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      color,
      isAdmin,
      avatarInitials: initials.trim().substring(0, 2).toUpperCase()
    };

    onSaveUser(savedUser, password || undefined);
    handleCancel();
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    if (userId === currentUserId) {
      alert('Sie können Ihren eigenen Account nicht löschen.');
      return;
    }
    if (confirm(`Möchten Sie den Account von "${userName}" wirklich löschen? Der Benutzer wird auch aus allen Aufgabenzuweisungen entfernt.`)) {
      onDeleteUser(userId);
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      
      {/* Left Column: Active Accounts */}
      <div style={{ flex: 1.6, minWidth: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ display: 'flex', alignItems: 'center', width: '32px', height: '32px', borderRadius: '10px', background: 'var(--primary-tint)', color: 'var(--primary)', justifyContent: 'center' }}>
            <Shield size={17} strokeWidth={1.8} />
          </span>
          <div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: '15px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.01em' }}>Aktive Accounts</div>
            <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '1px' }}>Teammitglieder, Berechtigungen &amp; Passwörter</div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 700, color: 'var(--ink-3)', background: 'var(--chip)', borderRadius: '999px', padding: '3px 10px' }}>
            {users.length} Mitglieder
          </span>
        </div>

        {/* Table Header Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 90px', gap: '0 16px', alignItems: 'center', marginTop: '20px', padding: '0 6px 10px', borderBottom: '1px solid var(--border-soft)' }}>
          <div style={{ fontSize: '10.5px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700 }}>Mitglied</div>
          <div style={{ fontSize: '10.5px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700 }}>Rolle</div>
          <div style={{ fontSize: '10.5px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'right', fontWeight: 700 }}>Aktionen</div>
        </div>

        {/* Rows */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {users.map((user) => (
            <div 
              key={user.id} 
              style={{ display: 'grid', gridTemplateColumns: '1fr 200px 90px', gap: '0 16px', alignItems: 'center', padding: '13px 6px', borderBottom: '1px solid var(--border-soft)', transition: 'background-color var(--transition-fast)' }}
              className="hover-timeline-row"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: user.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12.5px', fontWeight: 700, flex: 'none' }}>
                  {user.avatarInitials}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)' }}>{user.name}</span>
                    {user.isAdmin && (
                      <span style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '.06em', color: 'var(--primary)', background: 'var(--primary-tint)', padding: '2px 7px', borderRadius: '6px' }}>ADMIN</span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.email}
                  </div>
                </div>
              </div>
              
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink-2)', background: 'var(--chip)', padding: '4px 10px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                  {user.role}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button 
                  title="Bearbeiten" 
                  onClick={() => handleEditClick(user)}
                  style={{ width: '32px', height: '32px', borderRadius: '9px', border: '1px solid var(--border-input)', background: 'var(--bg-card)', color: 'var(--ink-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                  className="hover-btn-secondary"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  title={user.id === currentUserId ? 'Eigenes Admin-Konto kann nicht gelöscht werden' : 'Löschen'} 
                  onClick={() => handleDeleteClick(user.id, user.name)}
                  disabled={user.id === currentUserId}
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '9px', 
                    border: '1px solid var(--border-input)', 
                    background: 'var(--bg-card)', 
                    color: 'var(--ink-3)', 
                    cursor: user.id === currentUserId ? 'not-allowed' : 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    opacity: user.id === currentUserId ? 0.35 : 1
                  }} 
                  className={user.id === currentUserId ? '' : 'hover-btn-delete'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', marginTop: '18px', padding: '12px 14px', background: 'var(--bg-subtle)', border: '1px solid var(--border-soft)', borderRadius: '12px' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: '1px' }}>
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="11" x2="12" y2="16.5" />
            <circle cx="12" cy="7.8" r="0.5" fill="var(--muted)" />
          </svg>
          <span style={{ fontSize: '12px', color: 'var(--ink-3)', lineHeight: '1.5' }}>
            Beim Löschen eines Accounts wird das Mitglied automatisch aus allen Aufgaben-Zuweisungen entfernt (kaskadierende Datenlöschung). Das eigene Admin-Konto kann nicht gelöscht werden.
          </span>
        </div>
      </div>

      {/* Right Column: Add / Edit Account Form */}
      <div style={{ flex: 1, minWidth: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ display: 'flex', alignItems: 'center', width: '32px', height: '32px', borderRadius: '10px', background: editingUser ? 'var(--primary-tint)' : 'var(--green-tint)', color: editingUser ? 'var(--primary)' : 'var(--green)', justifyContent: 'center' }}>
            <UserPlus size={17} strokeWidth={1.8} />
          </span>
          <div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: '15px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.01em' }}>
              {editingUser ? 'Account bearbeiten' : 'Neuen Account anlegen'}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '1px' }}>
              {editingUser ? 'Accountdetails und Passwörter anpassen' : 'Zugang für ein neues Teammitglied'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '22px' }}>
          
          {/* Name */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>Vollständiger Name</div>
            <input 
              type="text" 
              className="form-control"
              value={name} 
              onChange={(e) => handleNameChange(e.target.value)} 
              placeholder="z. B. Max Mustermann" 
              style={{ width: '100%', background: 'var(--bg-subtle)', border: '1px solid var(--border-input)', borderRadius: '10px', padding: '10px 13px', fontSize: '13.5px', color: 'var(--ink)', outline: 'none' }}
              required
            />
          </div>

          {/* Email */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>E-Mail-Adresse</div>
            <input 
              type="email" 
              className="form-control"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="z. B. m.mustermann@kowobau.de" 
              style={{ width: '100%', background: 'var(--bg-subtle)', border: '1px solid var(--border-input)', borderRadius: '10px', padding: '10px 13px', fontSize: '13.5px', color: 'var(--ink)', outline: 'none' }}
              required
            />
          </div>

          {/* Initials & Role Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>Kürzel</div>
              <input 
                type="text" 
                className="form-control"
                value={initials} 
                onChange={(e) => setInitials(e.target.value.substring(0,2).toUpperCase())} 
                maxLength={2} 
                placeholder="MM" 
                style={{ width: '100%', background: 'var(--bg-subtle)', border: '1px solid var(--border-input)', borderRadius: '10px', padding: '10px 13px', fontSize: '13.5px', color: 'var(--ink)', outline: 'none', textTransform: 'uppercase' }}
                required
              />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>Rolle</div>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                style={{ width: '100%', background: 'var(--bg-subtle)', border: '1px solid var(--border-input)', borderRadius: '10px', padding: '10px 11px', fontSize: '13.5px', color: 'var(--ink)', outline: 'none' }}
              >
                <option value="IT-Mitarbeiter:in">IT-Mitarbeiter:in</option>
                <option value="Systemadministrator:in">Systemadministrator:in</option>
                <option value="IT-Support &amp; Hardware">IT-Support &amp; Hardware</option>
                <option value="Softwareentwickler:in">Softwareentwickler:in</option>
                <option value="IT-Leiter KOWOBAU">IT-Leiter KOWOBAU</option>
                <option value="Projektleiter KOWOBAU">Projektleiter KOWOBAU</option>
                <option value="Kundenbetreuerin">Kundenbetreuerin</option>
                <option value="Hausmeister / Handwerker">Hausmeister / Handwerker</option>
                <option value="Technikerin Instandhaltung">Technikerin Instandhaltung</option>
                <option value="Administrator">Administrator</option>
                <option value="Systemadministratorin">Systemadministratorin</option>
                <option value="Softwareentwicklerin">Softwareentwicklerin</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
              {editingUser ? 'Neues Passwort (leer lassen = unverändert)' : 'Initialpasswort festlegen'}
            </div>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-control"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder={editingUser ? 'Unverändert' : `Mind. ${MIN_PASSWORD_LENGTH} Zeichen`} 
                style={{ width: '100%', background: 'var(--bg-subtle)', border: '1px solid var(--border-input)', borderRadius: '10px', padding: '10px 42px 10px 13px', fontSize: '13.5px', color: 'var(--ink)', outline: 'none' }}
                autoComplete="new-password"
              />
              <button 
                type="button"
                title={showPassword ? 'Passwort ausblenden' : 'Passwort anzeigen'} 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', width: '30px', height: '30px', border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Admin rights */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: editingUser?.id === currentUserId ? 'not-allowed' : 'pointer', color: 'var(--ink-2)' }}>
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                disabled={editingUser?.id === currentUserId}
                style={{ cursor: 'pointer' }}
              />
              <span>Administrator-Rechte (Benutzerverwaltung)</span>
            </label>
          </div>

          {/* Color selector */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>Profilfarbe</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {colorOptions.map(opt => {
                const isSelected = color === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    title={opt.label}
                    onClick={() => setColor(opt.value)}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: opt.value,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: isSelected ? `0 0 0 2px var(--bg-card), 0 0 0 4px ${opt.value}` : 'none',
                      transition: 'all var(--transition-fast)'
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button 
              type="submit"
              style={{
                flex: 1,
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
                boxShadow: 'var(--btn-shadow)'
              }}
              className="hover-btn-primary"
            >
              {editingUser ? 'Speichern' : 'Account erstellen'}
            </button>
            {(editingUser || name) && (
              <button 
                type="button"
                onClick={handleCancel}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-input)',
                  borderRadius: '11px',
                  padding: '12px 18px',
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: 'var(--ink-2)',
                  cursor: 'pointer'
                }}
                className="hover-btn-secondary"
              >
                Abbrechen
              </button>
            )}
          </div>

        </form>
      </div>

    </div>
  );
};
