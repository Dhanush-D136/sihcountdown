import React, { useState } from 'react';

const API_BASE_URL = (import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  : '';

export default function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('Vel Tech SIH');
  const [password, setPassword] = useState('veltechsmarthack123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.username || username);
      } else {
        setErrorMsg(data.error || 'Invalid administrator username or password');
      }
    } catch (err) {
      setErrorMsg('Network error connecting to backend API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-login-view">
        <div className="admin-branding">
          <div className="branding-bar">
            <div className="logo-box">
              <img src="/Vel_Tech_Logo_Clean.png" alt="Vel Tech Logo" className="brand-logo" />
            </div>
            <div className="branding-divider">
              <div className="divider-line"></div>
              <div className="divider-gem"></div>
              <div className="divider-line"></div>
            </div>
            <div className="logo-box">
              <img src="/SIH_Logo_Clean.png" alt="SIH Logo" className="brand-logo" />
            </div>
          </div>
        </div>

        <div className="admin-login-card">
          <div className="login-card-header">
            <div className="admin-shield-icon">
              <i className="fa-solid fa-user-shield"></i>
            </div>
            <h2 className="login-card-title">COMMAND CENTER AUTHENTICATION</h2>
            <p className="login-card-subtitle">SIH 2026 Authoritative Administrator Login</p>
          </div>

          {errorMsg && (
            <div className="admin-alert admin-alert-error" style={{ color: '#ff4d4d', background: 'rgba(239,68,68,0.15)', padding: '0.8rem', borderRadius: '12px' }}>
              <i className="fa-solid fa-triangle-exclamation"></i> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                ADMINISTRATOR USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--glass-border)', color: '#fff' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                SECURITY PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.8rem 2.8rem 0.8rem 1rem', borderRadius: '12px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--glass-border)', color: '#fff' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="admin-btn admin-btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.9rem' }}
            >
              <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-right-to-bracket'}`}></i>
              <span>{loading ? 'AUTHENTICATING...' : 'AUTHENTICATE & ENTER'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
