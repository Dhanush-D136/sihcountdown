import React from 'react';

export default function CompletionSection({ onOpenResetModal }) {
  return (
    <div className="completion-container" id="completionContainer">
      <div className="completion-content">
        <div className="completion-badge">
          <i className="fa-solid fa-trophy"></i> CHALLENGE COMPLETE
        </div>
        <h2 className="completion-title">TIME'S UP</h2>
        <h3 className="completion-subtitle">SMART INDIA HACKATHON 2026</h3>
        <p className="completion-desc">24 HOURS OF INNOVATION COMPLETE</p>
        <div className="completion-college">
          Vel Tech High Tech Dr. Rangarajan Dr. Sakunthala Engineering College
        </div>
        <div className="completion-actions">
          <button onClick={onOpenResetModal} className="control-btn control-btn-primary">
            <i className="fa-solid fa-rotate"></i> RE-OPEN COUNTDOWN
          </button>
        </div>
      </div>
    </div>
  );
}
