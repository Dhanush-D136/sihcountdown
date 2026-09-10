import React from 'react';

export default function ControlBar({
  status,
  isMuted,
  onToggleSound,
  isEventMode,
  onToggleEventMode,
  onResetTimer,
}) {
  let statusText = 'PRE-LAUNCH STATE';
  let statusDotClass = 'status-dot';

  if (status === 'RUNNING') {
    statusText = '24-HOUR HACKATHON ACTIVE';
    statusDotClass = 'status-dot running';
  } else if (status === 'COMPLETED') {
    statusText = 'HACKATHON COMPLETE';
    statusDotClass = 'status-dot completed';
  }

  return (
    <div className="control-bar" id="controlBar">
      <div className="control-left">
        <button
          onClick={onResetTimer}
          className="control-btn control-btn-subtle"
          title="Reset Timer to Initial Pre-Launch State"
          aria-label="Reset Timer"
          style={{ padding: '0.35rem 0.75rem' }}
        >
          <i className="fa-solid fa-rotate-left"></i>
          <span className="btn-text">RESET</span>
        </button>

        <span className="status-badge" id="headerStatusBadge">
          <span className={statusDotClass}></span>
          <span id="headerStatusText">{statusText}</span>
        </span>
      </div>

      <div className="control-right">
        <button
          onClick={onToggleSound}
          className={`control-btn ${!isMuted ? 'control-btn-primary' : ''}`}
          title="Toggle Sci-Fi SFX"
          aria-label="Toggle Sound"
        >
          <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
          <span className="btn-text">{isMuted ? 'SOUND OFF' : 'SOUND ON'}</span>
        </button>

        <button
          onClick={onToggleEventMode}
          className="control-btn control-btn-primary"
          title="Toggle Auditorium Event Mode (Hotkey: F)"
          aria-label="Toggle Event Mode"
        >
          <i className={`fa-solid ${isEventMode ? 'fa-compress' : 'fa-expand'}`}></i>
          <span className="btn-text">{isEventMode ? 'EXIT EVENT MODE' : 'ENTER EVENT MODE'}</span>
        </button>
      </div>
    </div>
  );
}
