import React, { useState } from 'react';

export default function PrelaunchSection({ onStartClick }) {
  const [isStarting, setIsStarting] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    if (isStarting) return;
    setIsStarting(true);

    // Call instant start callback
    onStartClick();
  };

  return (
    <div className="prelaunch-container" id="prelaunchContainer">
      <h2 className="prelaunch-title">
        <span className="title-glow">THE COUNTDOWN</span> BEGINS
      </h2>
      <p class="prelaunch-description">
        24 Hours of Non-Stop Coding, Problem Solving, & Prototype Development
      </p>

      <div className="start-button-wrapper">
        <button
          onClick={handleClick}
          disabled={isStarting}
          className="start-btn"
          aria-label="Start Hackathon 24 Hour Countdown"
          style={isStarting ? { pointerEvents: 'none', opacity: 0.85 } : {}}
        >
          <div className="btn-glow-border"></div>
          <div className="btn-shine"></div>
          <div className="btn-content">
            <i className={`fa-solid ${isStarting ? 'fa-spinner fa-spin' : 'fa-bolt'} btn-icon`}></i>
            <span className="btn-main-text">
              {isStarting ? 'STARTING...' : 'START HACKATHON'}
            </span>
            <i className="fa-solid fa-arrow-right btn-arrow"></i>
          </div>
        </button>
        <span className="start-subtext">
          <i className="fa-solid fa-play"></i> Press to begin the 24-hour challenge
        </span>
      </div>
    </div>
  );
}
