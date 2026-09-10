import React, { useEffect, useState } from 'react';

function pad2(num) {
  return String(num).padStart(2, '0');
}

function formatTimeOfDay(ts) {
  if (!ts) return '--:--';
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function CountdownSection({
  hours,
  minutes,
  seconds,
  progressPercent = 0,
  startTimestamp,
  targetTimestamp,
}) {
  const [tickH, setTickH] = useState(false);
  const [tickM, setTickM] = useState(false);
  const [tickS, setTickS] = useState(false);

  useEffect(() => {
    setTickH(true);
    const t = setTimeout(() => setTickH(false), 350);
    return () => clearTimeout(t);
  }, [hours]);

  useEffect(() => {
    setTickM(true);
    const t = setTimeout(() => setTickM(false), 350);
    return () => clearTimeout(t);
  }, [minutes]);

  useEffect(() => {
    setTickS(true);
    const t = setTimeout(() => setTickS(false), 350);
    return () => clearTimeout(t);
  }, [seconds]);

  const pct = Math.min(100, Math.max(0, progressPercent || 0));

  return (
    <div className="countdown-container" id="countdownContainer">
      <div className="timer-grid">
        {/* HOURS CARD */}
        <div className="timer-card" id="cardHours">
          <div className="card-glass-bg"></div>
          <div className="card-glow"></div>
          <div className="card-border-sweep"></div>
          <div className="card-body">
            <div className="digit-wrapper">
              <span className={`digit ${tickH ? 'digit-tick' : ''}`}>
                {pad2(hours)}
              </span>
            </div>
            <div className="timer-label">HOURS</div>
          </div>
          <div className="card-footer-glow"></div>
        </div>

        <div className="timer-colon">:</div>

        {/* MINUTES CARD */}
        <div className="timer-card" id="cardMinutes">
          <div className="card-glass-bg"></div>
          <div className="card-glow"></div>
          <div className="card-border-sweep"></div>
          <div className="card-body">
            <div className="digit-wrapper">
              <span className={`digit ${tickM ? 'digit-tick' : ''}`}>
                {pad2(minutes)}
              </span>
            </div>
            <div className="timer-label">MINUTES</div>
          </div>
          <div className="card-footer-glow"></div>
        </div>

        <div className="timer-colon">:</div>

        {/* SECONDS CARD */}
        <div className="timer-card timer-card-active" id="cardSeconds">
          <div className="card-glass-bg"></div>
          <div className="card-glow"></div>
          <div className="card-border-sweep"></div>
          <div className="card-body">
            <div className="digit-wrapper">
              <span className={`digit ${tickS ? 'digit-tick' : ''}`}>
                {pad2(seconds)}
              </span>
            </div>
            <div className="timer-label">SECONDS</div>
          </div>
          <div className="card-footer-glow"></div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-wrapper">
        <div className="progress-info">
          <span className="progress-label">
            <i className="fa-solid fa-clock"></i> HACKATHON ELAPSED PROGRESS
          </span>
          <span className="progress-percentage">{pct.toFixed(1)}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct.toFixed(2)}%` }}>
            <div className="progress-glow"></div>
          </div>
        </div>
        <div className="progress-timestamps">
          <span>START: {formatTimeOfDay(startTimestamp)}</span>
          <span>FINISH: {formatTimeOfDay(targetTimestamp)}</span>
        </div>
      </div>
    </div>
  );
}
