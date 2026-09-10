import React from 'react';

export default function Header() {
  return (
    <header className="header-section" id="headerSection">
      <div className="branding-bar">
        {/* Vel Tech Logo Container */}
        <div className="logo-box veltech-logo-box">
          <img
            src="/Vel_Tech_Logo_Clean.png"
            alt="Vel Tech High Tech Dr. Rangarajan Dr. Sakunthala Engineering College Logo"
            className="brand-logo veltech-img"
          />
        </div>

        <div className="branding-divider">
          <div className="divider-line"></div>
          <div className="divider-gem">✦</div>
          <div className="divider-line"></div>
        </div>

        {/* SIH Logo Container */}
        <div className="logo-box sih-logo-box">
          <img
            src="/SIH_Logo_Clean.png"
            alt="Smart India Hackathon 2026 Logo"
            className="brand-logo sih-img"
          />
        </div>
      </div>

      <div className="college-info-block">
        <h2 className="college-title-main">Vel Tech High Tech</h2>
        <h3 className="college-title-sub">Dr. Rangarajan Dr. Sakunthala Engineering College</h3>
        <h4 className="college-title-tag">An Autonomous Institution</h4>
        <div className="event-title-badge">
          <span className="badge-accent">NATIONAL INITIATIVE</span>
          <span className="badge-text">INTERNAL HACKATHON</span>
        </div>
      </div>
    </header>
  );
}
