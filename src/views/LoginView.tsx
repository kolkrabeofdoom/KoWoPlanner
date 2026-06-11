import React, { useState } from 'react';
import { Shield, Key, Mail, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

export const LoginView: React.FC = () => {
  const login = useStore(state => state.login);
  const loading = useStore(state => state.loading);
  const error = useStore(state => state.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    await login(email.trim(), password.trim());
  };

  const handleQuickLogin = async (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('PASSWORT');
    await login(quickEmail, 'PASSWORT');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, var(--primary-light), var(--bg-primary))',
      padding: '20px'
    }}>
      <div className="card" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '40px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        animation: 'fadeIn 0.5s ease-out'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            marginBottom: '16px',
            boxShadow: '0 8px 16px rgba(14, 165, 233, 0.3)'
          }}>
            <Shield size={28} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}>
            KoWoPlanner
          </h2>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            IT-Projektplaner & Helpdesk • KOWOBAU
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--danger)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            color: 'var(--danger)',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={12} />
              <span>E-Mail-Adresse</span>
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="z.B. frank.kroener@kowobau.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={12} />
              <span>Passwort</span>
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.95rem',
              fontWeight: 600,
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            disabled={loading}
          >
            {loading ? 'Anmelden...' : 'Anmelden'}
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-light)', paddingTop: '24px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
            Schnellanmeldung (Demo)
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => handleQuickLogin('frank.kroener@kowobau.de')}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.75rem', justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
              disabled={loading}
            >
              💼 Frank Kröner (IT-Leiter)
            </button>
            <button
              onClick={() => handleQuickLogin('sabine.schmidt@kowobau.de')}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.75rem', justifyContent: 'flex-start', textAlign: 'left', width: '100%' }}
              disabled={loading}
            >
              🛠️ Sabine Schmidt (SysAdmin)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
