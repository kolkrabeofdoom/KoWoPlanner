import React, { useState } from 'react';
import { Key, Mail, AlertCircle } from 'lucide-react';
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
      padding: '24px',
      backgroundColor: 'var(--bg-app)',
      backgroundImage: 'radial-gradient(900px 600px at 85% -5%, var(--primary-tint) 0%, transparent 65%)',
      color: 'var(--ink)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '22px',
        padding: '40px',
        boxShadow: 'var(--shadow-pop)',
        animation: 'fadeIn 0.5s ease-out'
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '30px' }}>
          <img 
            src="/kitten_logo.png" 
            alt="PISHI Kitten Logo" 
            style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '18px', 
              objectFit: 'cover',
              boxShadow: '0 8px 18px rgba(10, 143, 214, 0.35)',
              border: '1px solid var(--border)',
              marginBottom: '16px'
            }} 
          />
          <h2 
            style={{ fontFamily: 'Space Grotesk', fontSize: '26px', fontWeight: 600, letterSpacing: '-.02em', color: 'var(--ink)', margin: 0 }}
            title="PISHI-Project-and-Incident-Scheduling-Helper-for-IT-Departments Public"
          >
            PISHI
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '6px', fontWeight: 500 }}>
            IT-Projektplaner &amp; Helpdesk · KOWOBAU
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--red-tint)',
            border: '1px solid var(--red-border)',
            padding: '12px 16px',
            borderRadius: '11px',
            marginBottom: '20px',
            color: 'var(--red)',
            fontSize: '13px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
              <Mail size={12} strokeWidth={2} />
              <span>E-Mail-Adresse</span>
            </label>
            <input
              type="email"
              placeholder="z. B. michel.foucault@verbietetdieafd.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-input)',
                borderRadius: '11px',
                padding: '12px 14px',
                fontFamily: 'inherit',
                fontSize: '13.5px',
                color: 'var(--ink)',
                outline: 'none',
                transition: 'border-color var(--transition-fast)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
              <Key size={12} strokeWidth={2} />
              <span>Passwort</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-input)',
                borderRadius: '11px',
                padding: '12px 14px',
                fontFamily: 'inherit',
                fontSize: '13.5px',
                color: 'var(--ink)',
                outline: 'none',
                transition: 'border-color var(--transition-fast)'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'var(--primary-btn)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '13px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'var(--btn-shadow)',
              marginTop: '4px',
              width: '100%',
              transition: 'background var(--transition-fast)'
            }}
            className="hover-btn-primary"
          >
            {loading ? 'Anmelden...' : 'Anmelden'}
          </button>
        </form>

        {/* Quick Demo Logins from Mockup */}
        <div style={{ marginTop: '30px', borderTop: '1px solid var(--border-soft)', paddingTop: '22px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: '12px' }}>
            Schnellanmeldung (Demo)
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('michel.foucault@verbietetdieafd.de')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-input)',
                borderRadius: '12px',
                padding: '10px 14px',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                fontFamily: 'inherit',
                transition: 'border-color var(--transition-fast), background var(--transition-fast)'
              }}
              className="quick-login-btn"
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0ea5e9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flex: 'none' }}>MF</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Michel Foucault</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>IT-Leiter KOWOBAU · Admin</div>
              </div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,6 15,12 9,18"/></svg>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('jacques.derrida@verbietetdieafd.de')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-input)',
                borderRadius: '12px',
                padding: '10px 14px',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                fontFamily: 'inherit',
                transition: 'border-color var(--transition-fast), background var(--transition-fast)'
              }}
              className="quick-login-btn"
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flex: 'none' }}>JD</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Jacques Derrida</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Systemadministratorin</div>
              </div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,6 15,12 9,18"/></svg>
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: 'var(--faint)', fontWeight: 500 }}>
          Version 1.0.0 (Beta) · Simulierte Systemzeit: 11. Juni 2026
        </div>
      </div>
    </div>
  );
};

