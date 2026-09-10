import React, { useEffect, useState } from 'react';

function formatTimeOfDay(ts) {
  if (!ts) return '--:--';
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function AnnouncementOverlay({ announcement }) {
  const [progressPct, setProgressPct] = useState(100);
  const [remainingSec, setRemainingSec] = useState(60);

  useEffect(() => {
    if (!announcement) return;

    let animId;
    const duration = announcement.duration_seconds || 60;
    const displayedTs = announcement.displayed_timestamp || (Date.now() / 1000);

    const updateProgress = () => {
      const nowSec = Date.now() / 1000;
      const elapsed = nowSec - displayedTs;
      const rem = Math.max(0, duration - elapsed);
      const pct = Math.min(100, Math.max(0, (rem / duration) * 100));

      setProgressPct(pct);
      setRemainingSec(Math.ceil(rem));

      if (rem > 0) {
        animId = requestAnimationFrame(updateProgress);
      }
    };

    animId = requestAnimationFrame(updateProgress);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [announcement]);

  if (!announcement) return null;

  const priority = announcement.priority || 'NORMAL';
  const timeText = announcement.time_label || formatTimeOfDay(announcement.displayed_timestamp);

  return (
    <div id="announcementOverlay" className="announcement-overlay">
      <div className="announcement-glass-card" id="annGlassCard">
        <div className="ann-card-header">
          <span className={`ann-badge ${priority}`} id="annPriorityBadge">
            {priority}
          </span>
          <div className="ann-time-tag" id="annTimeTag">
            <i className="fa-solid fa-clock"></i> <span>{timeText}</span>
          </div>
        </div>

        <h2 className="ann-title" id="annHeading">
          {announcement.heading}
        </h2>

        <p className="ann-details" id="annDetails">
          {announcement.details}
        </p>

        <div className="ann-card-footer">
          <div className="ann-progress-bar">
            <div
              className="ann-progress-fill"
              id="annProgressFill"
              style={{ width: `${progressPct.toFixed(1)}%` }}
            ></div>
          </div>
          <span className="ann-timer-text" id="annTimerText">
            <i className="fa-solid fa-hourglass-half"></i> Auto-dismissing in {remainingSec}s
          </span>
        </div>
      </div>
    </div>
  );
}
