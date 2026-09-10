/* ==========================================================================
   SIH 2026 - STANDALONE AUDIO ENGINE & SYNTHESIZER (ZERO BACKEND)
   Instant 0ms launch sound playback connected to discovered static audio.
   ========================================================================== */

let audioCtx = null;
let isMuted = false;
let launchAudioBuffer = null;
let launchAudioElement = null;
let isAudioPreloaded = false;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function loadMuteState() {
  try {
    const saved = localStorage.getItem('SIH_2026_SOUND_MUTED');
    if (saved !== null) {
      isMuted = saved === 'true';
    }
  } catch (e) {}
  return isMuted;
}

export function setMuted(muted) {
  isMuted = muted;
  try {
    localStorage.setItem('SIH_2026_SOUND_MUTED', muted ? 'true' : 'false');
  } catch (e) {}
}

export function getIsMuted() {
  return isMuted;
}

// Preload static launch sound on initial page load
export function preloadLaunchAudio() {
  if (isAudioPreloaded) return;
  isAudioPreloaded = true;

  try {
    loadMuteState();

    // Discovered audio file path
    const primaryAudioPath = '/Music/The_Moment_of_Activation (1).mp3';
    const fallbackPaths = [
      '/Music/The_Moment_of_Activation.mp3',
      '/The_Moment_of_Activation.mp3',
      '/Music/hackathon-launch.wav',
      '/hackathon-launch.wav'
    ];

    // 1. HTML5 Audio Element Preload
    launchAudioElement = new Audio();
    launchAudioElement.preload = 'auto';
    launchAudioElement.src = primaryAudioPath;

    let fallbackIndex = 0;
    launchAudioElement.addEventListener('error', () => {
      if (fallbackIndex < fallbackPaths.length) {
        launchAudioElement.src = fallbackPaths[fallbackIndex];
        fallbackIndex++;
        launchAudioElement.load();
      }
    });
    launchAudioElement.load();

    // 2. Web Audio API Buffer Decode in parallel for instant 0ms fallback
    fetch(primaryAudioPath)
      .then(res => {
        if (!res.ok) return fetch('/Music/The_Moment_of_Activation.mp3');
        return res;
      })
      .then(res => {
        if (!res.ok) return fetch('/hackathon-launch.wav');
        return res;
      })
      .then(res => res.arrayBuffer())
      .then(data => {
        const ctx = getAudioContext();
        if (ctx) {
          ctx.decodeAudioData(data, buffer => {
            launchAudioBuffer = buffer;
          });
        }
      })
      .catch(() => {});
  } catch (e) {}
}

export function playLaunchCeremonySound() {
  if (isMuted) return;

  const ctx = getAudioContext();

  // 1. Play preloaded HTML5 audio element immediately (0ms)
  if (launchAudioElement) {
    try {
      launchAudioElement.currentTime = 0;
      const playPromise = launchAudioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          playWebAudioBuffer(ctx);
        });
      }
    } catch (e) {
      playWebAudioBuffer(ctx);
    }
  } else {
    playWebAudioBuffer(ctx);
  }

  // 2. Synthesize deep bass drop & brass synth chords
  if (ctx) {
    synthesizeLaunchChords(ctx);
  }
}

function playWebAudioBuffer(ctx) {
  if (!ctx || !launchAudioBuffer) return;
  try {
    const source = ctx.createBufferSource();
    source.buffer = launchAudioBuffer;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.75, ctx.currentTime);
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);
  } catch (e) {}
}

function synthesizeLaunchChords(ctx) {
  const now = ctx.currentTime;

  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(80, now);
  subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
  subGain.gain.setValueAtTime(0.35, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  subOsc.connect(subGain);
  subGain.connect(ctx.destination);
  subOsc.start(now);
  subOsc.stop(now + 0.6);

  const chordFreqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
  chordFreqs.forEach((freq, idx) => {
    const brassOsc = ctx.createOscillator();
    const brassGain = ctx.createGain();
    brassOsc.type = idx % 2 === 0 ? 'triangle' : 'sawtooth';
    brassOsc.frequency.setValueAtTime(freq, now + 0.32);

    brassGain.gain.setValueAtTime(0.001, now + 0.32);
    brassGain.gain.linearRampToValueAtTime(0.12, now + 0.35);
    brassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    brassOsc.connect(brassGain);
    brassGain.connect(ctx.destination);
    brassOsc.start(now + 0.32);
    brassOsc.stop(now + 1.8);
  });
}

export function playClickSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

export function playTickSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.03);

  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.03);
}

export function playVictoryFanfare() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12);

    gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.12);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + index * 0.12 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + index * 0.12);
    osc.stop(ctx.currentTime + index * 0.12 + 0.8);
  });
}
