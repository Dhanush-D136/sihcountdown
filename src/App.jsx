import React, { useEffect, useState, useRef, lazy, Suspense } from 'react';
import BackgroundCanvas from './components/BackgroundCanvas';
import FXCanvas from './components/FXCanvas';
import Header from './components/Header';
import ControlBar from './components/ControlBar';
import PrelaunchSection from './components/PrelaunchSection';
import CountdownSection from './components/CountdownSection';
import CompletionSection from './components/CompletionSection';
import AnnouncementOverlay from './components/AnnouncementOverlay';
import LiveClockWidget from './components/LiveClockWidget';
import ResetModal from './components/ResetModal';

import {
  preloadLaunchAudio,
  playLaunchCeremonySound,
  playTickSound,
  playVictoryFanfare,
  loadMuteState,
  setMuted as setAudioMuted,
  getIsMuted,
} from './services/audioEngine';
import { triggerLaunchCeremony, triggerCompletionCeremony } from './services/fxEngine';
import { fetchEventStatus, startEventAsync, initSSEStream } from './services/api';

// Lazy load Admin Panel components for code splitting & minimal public bundle size
const AdminLogin = lazy(() => import('./admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [adminUser, setAdminUser] = useState(null);

  // Application State
  const [serverState, setServerState] = useState(null);
  const [status, setStatus] = useState('NOT_STARTED'); // NOT_STARTED, LAUNCHING, RUNNING, PAUSED, COMPLETED
  const [isMuted, setIsMuted] = useState(false);
  const [isEventMode, setIsEventMode] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Timer Digits
  const [hours, setHours] = useState(24);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  // Offsets & Trackers
  const serverClockOffsetRef = useRef(0);
  const lastDisplayedSecRef = useRef(null);

  // Synchronize view state when server updates arrive
  const renderState = (state) => {
    if (!state) return;
    setServerState(state);

    if (state.server_time) {
      const clientNow = Date.now() / 1000;
      serverClockOffsetRef.current = state.server_time - clientNow;
    }

    if (state.status === 'RUNNING') {
      setStatus('RUNNING');
    } else if (state.status === 'PAUSED') {
      setStatus('PAUSED');
    } else if (state.status === 'COMPLETED') {
      setStatus('COMPLETED');
    } else if (status !== 'LAUNCHING') {
      setStatus('NOT_STARTED');
    }
  };

  // High-precision high-frequency 50ms tick loop
  useEffect(() => {
    const tickLoop = () => {
      if (!serverState && status !== 'LAUNCHING') return;

      const currentStatus = serverState ? serverState.status : status;
      const duration = (serverState && serverState.duration_seconds) || 86400;
      const clientNowSec = Date.now() / 1000;
      const nowServerSec = clientNowSec + serverClockOffsetRef.current;

      let remainingFloat = duration;
      if (currentStatus === 'RUNNING' && serverState && serverState.target_timestamp) {
        remainingFloat = Math.max(0, serverState.target_timestamp - nowServerSec);
      } else if (currentStatus === 'LAUNCHING' && serverState && serverState.start_timestamp) {
        remainingFloat = Math.max(0, (serverState.start_timestamp + duration) - nowServerSec);
      } else if (currentStatus === 'PAUSED' && serverState) {
        remainingFloat = serverState.remaining_seconds || 0;
      } else if (currentStatus === 'COMPLETED') {
        remainingFloat = 0;
      }

      const remainingInt = Math.ceil(remainingFloat);

      if (remainingInt !== lastDisplayedSecRef.current) {
        lastDisplayedSecRef.current = remainingInt;
        const h = Math.floor(remainingInt / 3600);
        const m = Math.floor((remainingInt % 3600) / 60);
        const s = remainingInt % 60;

        setHours(h);
        setMinutes(m);
        setSeconds(s);

        if (currentStatus === 'RUNNING' || currentStatus === 'LAUNCHING') {
          playTickSound();
        }
      }

      if (currentStatus === 'RUNNING' || currentStatus === 'PAUSED' || currentStatus === 'COMPLETED' || currentStatus === 'LAUNCHING') {
        const elapsed = Math.max(0, duration - remainingFloat);
        const pct = Math.min(100, Math.max(0, (elapsed / duration) * 100));
        setProgressPercent(pct);
      }
    };

    const interval = setInterval(tickLoop, 50);
    return () => clearInterval(interval);
  }, [serverState, status]);

  // Initial setup & Audio preloading
  useEffect(() => {
    preloadLaunchAudio();
    setIsMuted(loadMuteState());

    fetchEventStatus().then((st) => renderState(st));
    const cleanupSSE = initSSEStream((st) => renderState(st));

    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      cleanupSSE();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // INSTANT CLIENT START HANDLER (0ms visual delay)
  const handleStartClick = () => {
    // 1. Immediately (0ms) trigger sound playback & visual launch ceremony
    playLaunchCeremonySound();
    setStatus('LAUNCHING');

    triggerLaunchCeremony(() => {
      setStatus((prev) => (prev === 'LAUNCHING' ? 'RUNNING' : prev));
    });

    // 2. In parallel: send asynchronous start request to backend API
    startEventAsync().then((res) => {
      if (res && res.event) {
        renderState(res.event);
      }
    });
  };

  // Toggle Sound
  const handleToggleSound = () => {
    const nextMuted = !isMuted;
    setAudioMuted(nextMuted);
    setIsMuted(nextMuted);
  };

  // Toggle Fullscreen Event Mode
  const handleToggleEventMode = () => {
    const nextMode = !isEventMode;
    setIsEventMode(nextMode);
    if (nextMode) {
      document.body.classList.add('event-mode');
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      document.body.classList.remove('event-mode');
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Check Admin Routes
  if (currentPath.startsWith('/admin')) {
    return (
      <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#00f2fe' }}>Loading Command Center...</div>}>
        {adminUser ? (
          <AdminDashboard username={adminUser} onLogout={() => setAdminUser(null)} />
        ) : (
          <AdminLogin onLoginSuccess={(name) => setAdminUser(name)} />
        )}
      </Suspense>
    );
  }

  return (
    <>
      {/* Canvas Layers & Background FX */}
      <BackgroundCanvas />
      <FXCanvas />

      {/* Top Floating Control Bar */}
      <ControlBar
        status={status}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        isEventMode={isEventMode}
        onToggleEventMode={handleToggleEventMode}
        onOpenResetModal={() => setIsResetModalOpen(true)}
      />

      {/* Main Content Layout Container */}
      <main className="main-wrapper" id="mainWrapper">
        <Header />

        <section className="hero-section" id="heroSection">
          <div className="event-main-header">
            <div className="sih-tagline">MINISTRY OF EDUCATION • INNOVATION CELL • AICTE</div>
            <h1 className="main-event-title">
              <span className="title-primary">SMART INDIA HACKATHON</span>
              <span className="title-year">2026</span>
            </h1>
            <div className="subtitle-bar">
              <span className="sub-pill">24 HOURS</span>
              <span className="sub-dot">•</span>
              <span className="sub-pill">INNOVATION</span>
              <span className="sub-dot">•</span>
              <span className="sub-pill">TECHNOLOGY</span>
              <span className="sub-dot">•</span>
              <span className="sub-pill">IMPACT</span>
            </div>
          </div>

          {/* PRE-LAUNCH STATE */}
          {status === 'NOT_STARTED' && (
            <PrelaunchSection onStartClick={handleStartClick} />
          )}

          {/* ACTIVE COUNTDOWN STATE (LAUNCHING or RUNNING or PAUSED) */}
          {(status === 'LAUNCHING' || status === 'RUNNING' || status === 'PAUSED') && (
            <CountdownSection
              hours={hours}
              minutes={minutes}
              seconds={seconds}
              progressPercent={progressPercent}
              startTimestamp={serverState ? serverState.start_timestamp : null}
              targetTimestamp={serverState ? serverState.target_timestamp : null}
            />
          )}

          {/* COMPLETION STATE */}
          {status === 'COMPLETED' && (
            <CompletionSection onOpenResetModal={() => setIsResetModalOpen(true)} />
          )}
        </section>

        {/* Footer Event Information */}
        <footer className="event-info-section" id="eventInfoSection">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon"><i className="fa-solid fa-building-columns"></i></div>
              <div className="info-text">
                <div className="info-title">ORGANIZING INSTITUTION</div>
                <div className="info-value">Vel Tech High Tech Dr. Rangarajan Dr. Sakunthala Engineering College</div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon"><i className="fa-solid fa-microchip"></i></div>
              <div className="info-text">
                <div className="info-title">EVENT FOCUS</div>
                <div className="info-value">Smart India Hackathon 2026 – Internal Hackathon</div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon"><i className="fa-solid fa-stopwatch"></i></div>
              <div className="info-text">
                <div className="info-title">DURATION</div>
                <div className="info-value">24 Hours Continuous Innovation</div>
              </div>
            </div>
          </div>

          <div className="event-footer-note">
            <span><i className="fa-solid fa-keyboard"></i> Hotkeys: <strong>Space</strong> (Start) • <strong>F</strong> (Event Mode) • <strong>M</strong> (Mute Sound)</span>
          </div>
        </footer>
      </main>

      {/* Realtime Announcement Overlay */}
      {serverState && serverState.active_announcement && (
        <AnnouncementOverlay announcement={serverState.active_announcement} />
      )}

      {/* Admin Reset Modal */}
      <ResetModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} />

      {/* Live Bottom-Right Date & Time Clock Widget */}
      <LiveClockWidget />
    </>
  );
}
