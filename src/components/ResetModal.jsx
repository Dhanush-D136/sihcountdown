import React from 'react';

export default function ResetModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div id="publicResetModal" className="admin-modal-overlay">
      <div className="admin-modal-card">
        <div className="modal-header">
          <i className="fa-solid fa-lock modal-icon-warning"></i>
          <h3>Reset Countdown?</h3>
        </div>
        <div className="modal-body">
          <p>Resetting the official event countdown requires Administrator authorization.</p>
          <p style={{ marginTop: '0.5rem', opacity: 0.85 }}>
            Unauthorized visitors cannot modify the official event timer.
          </p>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="admin-btn admin-btn-subtle">
            CANCEL
          </button>
          <a href="/admin/login" className="admin-btn admin-btn-primary">
            ADMIN LOGIN
          </a>
        </div>
      </div>
    </div>
  );
}
