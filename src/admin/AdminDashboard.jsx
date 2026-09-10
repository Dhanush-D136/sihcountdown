import React, { useEffect, useState } from 'react';

const API_BASE_URL = (import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  : '';

export default function AdminDashboard({ username, onLogout }) {
  const [eventState, setEventState] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Timer edit state
  const [editH, setEditH] = useState(24);
  const [editM, setEditM] = useState(0);
  const [editS, setEditS] = useState(0);

  // Announcement state
  const [annHeading, setAnnHeading] = useState('');
  const [annDetails, setAnnDetails] = useState('');
  const [annDuration, setAnnDuration] = useState(60);
  const [annPriority, setAnnPriority] = useState('NORMAL');

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/event/status`);
      if (res.ok) {
        const data = await res.json();
        setEventState(data);
      }
    } catch (e) {}
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/audit_logs`);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchStatus();
    fetchAuditLogs();
    const interval = setInterval(fetchStatus, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleControlAction = async (action) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/event/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) fetchStatus();
    } catch (e) {}
  };

  const handleEditTimer = async (e) => {
    e.preventDefault();
    const totalSeconds = (parseInt(editH) || 0) * 3600 + (parseInt(editM) || 0) * 60 + (parseInt(editS) || 0);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/event/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration_seconds: totalSeconds }),
      });
      if (res.ok) fetchStatus();
    } catch (e) {}
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!annHeading || !annDetails) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/announcements/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heading: annHeading,
          details: annDetails,
          duration_seconds: parseInt(annDuration) || 60,
          priority: annPriority,
          sound_enabled: 1,
        }),
      });
      if (res.ok) {
        setAnnHeading('');
        setAnnDetails('');
        fetchStatus();
      }
    } catch (e) {}
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/logout`, { method: 'POST' });
    } catch (e) {}
    onLogout();
  };

  const status = eventState ? eventState.status : 'NOT_STARTED';
  const remSec = eventState ? (eventState.remaining_seconds || 0) : 86400;
  const hours = Math.floor(remSec / 3600);
  const minutes = Math.floor((remSec % 3600) / 60);
  const seconds = remSec % 60;

  return (
    <div className="admin-wrapper" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      {/* Admin Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800 }}>SIH 2026 COMMAND CENTER</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Logged in as: <strong style={{ color: 'var(--accent-cyan)' }}>{username}</strong></span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a href="/" className="admin-btn admin-btn-subtle">
            <i className="fa-solid fa-desktop"></i> VIEW PUBLIC DISPLAY
          </a>
          <button onClick={handleLogout} className="admin-btn admin-btn-subtle">
            <i className="fa-solid fa-right-from-bracket"></i> LOGOUT
          </button>
        </div>
      </div>

      {/* Control Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', width: '100%' }}>
        {/* State Card */}
        <div style={{ background: 'rgba(13,20,41,0.7)', border: '1px solid var(--glass-border)', padding: '1.8rem', borderRadius: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>EVENT TIMER CONTROL</h3>
          <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-digits)', fontWeight: 800, textAlign: 'center', margin: '1rem 0' }}>
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {status === 'NOT_STARTED' && (
              <button onClick={() => handleControlAction('START')} className="admin-btn admin-btn-primary">
                <i className="fa-solid fa-play"></i> START HACKATHON
              </button>
            )}
            {status === 'RUNNING' && (
              <button onClick={() => handleControlAction('PAUSE')} className="admin-btn admin-btn-subtle" style={{ borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' }}>
                <i className="fa-solid fa-pause"></i> PAUSE
              </button>
            )}
            {status === 'PAUSED' && (
              <button onClick={() => handleControlAction('RESUME')} className="admin-btn admin-btn-primary">
                <i className="fa-solid fa-play"></i> RESUME
              </button>
            )}
            <button onClick={() => handleControlAction('RESET')} className="admin-btn admin-btn-subtle" style={{ borderColor: 'rgba(239,68,68,0.5)', color: '#ff4d4d' }}>
              <i className="fa-solid fa-rotate-left"></i> RESET
            </button>
          </div>
        </div>

        {/* Set Duration Form */}
        <div style={{ background: 'rgba(13,20,41,0.7)', border: '1px solid var(--glass-border)', padding: '1.8rem', borderRadius: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>SET TIMER DURATION</h3>
          <form onSubmit={handleEditTimer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="number" min="0" max="99" value={editH} onChange={(e) => setEditH(e.target.value)} placeholder="HH" style={{ width: '33%', padding: '0.6rem', borderRadius: '8px', background: '#070d1f', border: '1px solid #1e293b', color: '#fff', textAlign: 'center' }} />
              <input type="number" min="0" max="59" value={editM} onChange={(e) => setEditM(e.target.value)} placeholder="MM" style={{ width: '33%', padding: '0.6rem', borderRadius: '8px', background: '#070d1f', border: '1px solid #1e293b', color: '#fff', textAlign: 'center' }} />
              <input type="number" min="0" max="59" value={editS} onChange={(e) => setEditS(e.target.value)} placeholder="SS" style={{ width: '33%', padding: '0.6rem', borderRadius: '8px', background: '#070d1f', border: '1px solid #1e293b', color: '#fff', textAlign: 'center' }} />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary">UPDATE TIMER DURATION</button>
          </form>
        </div>

        {/* Broadcast Announcement Form */}
        <div style={{ background: 'rgba(13,20,41,0.7)', border: '1px solid var(--glass-border)', padding: '1.8rem', borderRadius: '20px', gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>BROADCAST LIVE ANNOUNCEMENT</h3>
          <form onSubmit={handleCreateAnnouncement} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <input type="text" placeholder="Announcement Heading" value={annHeading} onChange={(e) => setAnnHeading(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '10px', background: '#070d1f', border: '1px solid #1e293b', color: '#fff' }} />
            <input type="text" placeholder="Detailed Message" value={annDetails} onChange={(e) => setAnnDetails(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '10px', background: '#070d1f', border: '1px solid #1e293b', color: '#fff' }} />
            <select value={annPriority} onChange={(e) => setAnnPriority(e.target.value)} style={{ padding: '0.8rem', borderRadius: '10px', background: '#070d1f', border: '1px solid #1e293b', color: '#fff' }}>
              <option value="NORMAL">NORMAL PRIORITY</option>
              <option value="IMPORTANT">IMPORTANT PRIORITY</option>
              <option value="URGENT">URGENT PRIORITY</option>
            </select>
            <button type="submit" className="admin-btn admin-btn-primary" style={{ gridColumn: '1 / -1' }}>
              <i className="fa-solid fa-bullhorn"></i> BROADCAST ANNOUNCEMENT NOW
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
