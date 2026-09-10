/* ==========================================================================
   SIH 2026 - LAUNCH CEREMONY & FIREWORKS FX ENGINE
   Physics-based particles, confetti, light bursts, & celebratory fireworks.
   ========================================================================== */

let canvas = null;
let ctx = null;
let width = 0;
let height = 0;
let particles = [];
let fireworks = [];
let isRunning = false;
let animFrameId = null;

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

class FXParticle {
  constructor(x, y, type = 'confetti', color) {
    this.x = x;
    this.y = y;
    this.type = type; // 'confetti', 'rising-spark', 'geometric', 'firework-spark'

    const angle = Math.random() * Math.PI * 2;
    const speed = type === 'firework-spark' ? randomRange(4, 12) : randomRange(5, 18);

    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    if (type === 'rising-spark') {
      this.vx = randomRange(-2, 2);
      this.vy = randomRange(-8, -16);
    } else if (type === 'confetti') {
      this.vy -= randomRange(2, 6);
    }

    this.gravity = type === 'rising-spark' ? -0.1 : (type === 'firework-spark' ? 0.25 : 0.4);
    this.drag = 0.96;
    this.alpha = 1;
    this.decay = randomRange(0.008, 0.025);
    this.rotation = Math.random() * Math.PI * 2;
    this.vRot = randomRange(-0.2, 0.2);
    this.size = randomRange(4, 10);

    const colors = ['#00f2fe', '#4facfe', '#7928ca', '#ff0080', '#fbbf24', '#ffffff', '#10b981'];
    this.color = color || colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.vx *= this.drag;
    this.vy *= this.drag;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;

    this.rotation += this.vRot;
    this.alpha -= this.decay;
  }

  draw(context) {
    if (this.alpha <= 0) return;

    context.save();
    context.translate(this.x, this.y);
    context.rotate(this.rotation);
    context.globalAlpha = Math.max(0, this.alpha);

    if (this.type === 'confetti') {
      context.fillStyle = this.color;
      context.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 1.5);
    } else if (this.type === 'geometric') {
      context.strokeStyle = this.color;
      context.lineWidth = 2;
      context.beginPath();
      context.rect(-this.size / 2, -this.size / 2, this.size, this.size);
      context.stroke();
    } else {
      context.fillStyle = this.color;
      context.shadowBlur = 12;
      context.shadowColor = this.color;
      context.beginPath();
      context.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
  }
}

class Firework {
  constructor(canvasWidth, canvasHeight) {
    this.x = randomRange(canvasWidth * 0.15, canvasWidth * 0.85);
    this.y = canvasHeight;
    this.targetY = randomRange(canvasHeight * 0.15, canvasHeight * 0.5);
    this.speed = randomRange(12, 18);
    this.angle = -Math.PI / 2 + randomRange(-0.2, 0.2);
    this.vx = Math.cos(this.angle) * this.speed;
    this.vy = Math.sin(this.angle) * this.speed;
    this.exploded = false;
    const colors = ['#00f2fe', '#7928ca', '#ff0080', '#fbbf24', '#ffffff'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    if (!this.exploded) {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.2;

      if (this.vy >= 0 || this.y <= this.targetY) {
        this.explode();
      }
    }
  }

  explode() {
    this.exploded = true;
    const sparkCount = randomRange(40, 70);
    for (let i = 0; i < sparkCount; i++) {
      particles.push(new FXParticle(this.x, this.y, 'firework-spark', this.color));
    }
  }

  draw(context) {
    if (!this.exploded) {
      context.save();
      context.fillStyle = this.color;
      context.shadowBlur = 15;
      context.shadowColor = this.color;
      context.beginPath();
      context.arc(this.x, this.y, 3, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
  }
}

export function initFXCanvas(canvasElement) {
  canvas = canvasElement;
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
}

function resize() {
  if (!canvas) return;
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

function renderLoop() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, width, height);

  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].draw(ctx);
    if (fireworks[i].exploded) {
      fireworks.splice(i, 1);
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw(ctx);
    if (particles[i].alpha <= 0) {
      particles.splice(i, 1);
    }
  }

  if (particles.length > 0 || fireworks.length > 0 || isRunning) {
    animFrameId = requestAnimationFrame(renderLoop);
  } else {
    isRunning = false;
  }
}

function ensureAnimation() {
  if (!isRunning) {
    isRunning = true;
    renderLoop();
  }
}

// INSTANT CLIENT LAUNCH CEREMONY (0ms response)
export function triggerLaunchCeremony(onComplete) {
  ensureAnimation();

  const originLeft = { x: width * 0.1, y: height * 0.8 };
  const originRight = { x: width * 0.9, y: height * 0.8 };
  const originCenter = { x: width * 0.5, y: height * 0.5 };

  for (let i = 0; i < 120; i++) {
    particles.push(new FXParticle(originLeft.x, originLeft.y, 'confetti'));
    particles.push(new FXParticle(originRight.x, originRight.y, 'confetti'));
  }

  for (let i = 0; i < 60; i++) {
    particles.push(new FXParticle(originCenter.x, originCenter.y, 'geometric'));
  }

  for (let i = 0; i < 80; i++) {
    particles.push(new FXParticle(randomRange(0, width), height, 'rising-spark'));
  }

  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      fireworks.push(new Firework(width, height));
      ensureAnimation();
    }, i * 300);
  }

  const flash = document.getElementById('flashOverlay');
  if (flash) {
    setTimeout(() => {
      flash.classList.add('active');
      setTimeout(() => flash.classList.remove('active'), 500);
    }, 1800);
  }

  if (typeof onComplete === 'function') {
    setTimeout(onComplete, 2200);
  }
}

export function triggerFireworksBurst() {
  ensureAnimation();
  for (let i = 0; i < 4; i++) {
    fireworks.push(new Firework(width, height));
  }
}

export function triggerCompletionCeremony() {
  ensureAnimation();

  let burstCount = 0;
  const interval = setInterval(() => {
    triggerFireworksBurst();
    for (let i = 0; i < 40; i++) {
      particles.push(new FXParticle(randomRange(0, width), randomRange(0, height * 0.6), 'confetti'));
    }
    burstCount++;
    if (burstCount > 10) clearInterval(interval);
  }, 400);

  const flash = document.getElementById('flashOverlay');
  if (flash) {
    flash.classList.add('active');
    setTimeout(() => flash.classList.remove('active'), 700);
  }
}
