import React, { useEffect, useState, useRef } from 'react';
import BackgroundCanvas from './components/BackgroundCanvas';
import FXCanvas from './components/FXCanvas';
import Header from './components/Header';
import ControlBar from './components/ControlBar';
import PrelaunchSection from './components/PrelaunchSection';
import CountdownSection from './components/CountdownSection';
import CompletionSection from './components/CompletionSection';
import LiveClockWidget from './components/LiveClockWidget';

import {
  preloadLaunchAudio,
  playLaunchCeremonySound,
  playTickSound,
  playVictoryFanfare,
  loadMuteState,
  setMuted as setAudioMuted,
} from './services/audioEngine';
import { triggerLaunchCeremony, triggerCompletionCeremony } from './services/fxEngine';
import { getStoredEventState, saveStoredEventState, clearStoredEventState } from './services/storage';

export default function App() {
  const [eventState, setEventState] = useState(() => getStoredEventState());
  const [status, setStatus] = useState(() => {
    const st = getStoredEventState();
    return st.status || 'NOT_STARTED';
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isEventMode, setIsEventMode] = useState(false);

  // Timer Digits
  const [hours, setHours] = useState(24);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  const lastDisplayedSecRef = useRef(null);
  const completionTriggeredRef = useRef(false);

  // Reset Timer to Prelaunch State
  const handleResetTimer = () => {
    clearStoredEventState();
    const defaultState = {
      status: 'NOT_STARTED',
      eventStartedAt: null,
      eventEndAt: null,
      durationSeconds: 86400,
    };
    setEventState(defaultState);
    setStatus('NOT_STARTED');
    setHours(24);
    setMinutes(0);
    setSeconds(0);
    setProgressPercent(0);
    completionTriggeredRef.current = false;
    lastDisplayedSecRef.current = null;
  };

  // 1. Initial audio preloading & state restoration
  useEffect(() => {
    preloadLaunchAudio();
    setIsMuted(loadMuteState());

    const initialSt = getStoredEventState();
    setEventState(initialSt);
    setStatus(initialSt.status);
  }, []);

  // 2. High-precision 50ms timestamp-based countdown calculation loop
  useEffect(() => {
    const tickLoop = () => {
      if (status !== 'RUNNING' && status !== 'COMPLETED') {
        setHours(24);
        setMinutes(0);
        setSeconds(0);
        setProgressPercent(0);
        return;
      }

      const duration = (eventState && eventState.durationSeconds) || 86400;
      const endTs = eventState && eventState.eventEndAt;

      if (!endTs) return;

      const nowMs = Date.now();
      const remainingMs = Math.max(0, endTs - nowMs);
      const remainingFloat = remainingMs / 1000;
      const remainingInt = Math.ceil(remainingFloat);

      if (remainingInt !== lastDisplayedSecRef.current) {
        lastDisplayedSecRef.current = remainingInt;
        const h = Math.floor(remainingInt / 3600);
        const m = Math.floor((remainingInt % 3600) / 60);
        const s = remainingInt % 60;

        setHours(h);
        setMinutes(m);
        setSeconds(s);

        if (status === 'RUNNING' && remainingInt > 0) {
          playTickSound();
        }
      }

      const elapsedMs = Math.max(0, (duration * 1000) - remainingMs);
      const pct = Math.min(100, Math.max(0, (elapsedMs / (duration * 1000)) * 100));
      setProgressPercent(pct);

      // Handle Natural Completion at 00:00:00
      if (status === 'RUNNING' && remainingMs <= 0) {
        setStatus('COMPLETED');
        const newState = {
          ...eventState,
          status: 'COMPLETED',
        };
        setEventState(newState);
        saveStoredEventState(newState);

        if (!completionTriggeredRef.current) {
          completionTriggeredRef.current = true;
          triggerCompletionCeremony();
          playVictoryFanfare();
        }
      }
    };

    const interval = setInterval(tickLoop, 50);
    return () => clearInterval(interval);
  }, [eventState, status]);

  // 3. INSTANT CLIENT START HANDLER (0ms response, zero backend dependency)
  const handleStartClick = () => {
    playLaunchCeremonySound();
    triggerLaunchCeremony();

    const nowMs = Date.now();
    const durationSec = 86400;
    const endMs = nowMs + (durationSec * 1000);

    const newEventState = {
      status: 'RUNNING',
      eventStartedAt: nowMs,
      eventEndAt: endMs,
      durationSeconds: durationSec,
    };

    saveStoredEventState(newEventState);
    setEventState(newEventState);
    setStatus('RUNNING');
  };

  // Sound Toggle
  const handleToggleSound = () => {
    const nextMuted = !isMuted;
    setAudioMuted(nextMuted);
    setIsMuted(nextMuted);
  };

  // Fullscreen Event Mode Toggle
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

  return (
    <>
      {/* Canvas Layers & Ambient Background FX */}
      <BackgroundCanvas />
      <FXCanvas />

      {/* Top Floating Control Toolbar */}
      <ControlBar
        status={status}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        isEventMode={isEventMode}
        onToggleEventMode={handleToggleEventMode}
        onResetTimer={handleResetTimer}
      />

      {/* Main Web Content Layout */}
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

          {/* INITIAL PRE-LAUNCH STATE */}
          {status === 'NOT_STARTED' && (
            <PrelaunchSection onStartClick={handleStartClick} />
          )}

          {/* ACTIVE 24-HOUR COUNTDOWN STATE */}
          {status === 'RUNNING' && (
            <CountdownSection
              hours={hours}
              minutes={minutes}
              seconds={seconds}
              progressPercent={progressPercent}
              startTimestamp={eventState ? eventState.eventStartedAt : null}
              targetTimestamp={eventState ? eventState.eventEndAt : null}
            />
          )}

          {/* COMPLETION STATE */}
          {status === 'COMPLETED' && (
            <CompletionSection />
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

      {/* Subdued Bottom-Right Local Clock Widget */}
      <LiveClockWidget />
    </>
  );
}
