/* ==========================================================================
   SIH 2026 - CINEMATIC BACKGROUND CANVAS ENGINE
   Ambient tech particles, constellation mesh, & slow orbital glows.
   ========================================================================== */

let canvas = null;
let ctx = null;
let width = 0;
let height = 0;
let particles = [];
let lightBeams = [];
let animFrameId = null;
let isPaused = false;

const PARTICLE_COUNT = 70;
const MAX_DISTANCE = 130;

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

class Particle {
  constructor(canvasWidth, canvasHeight) {
    this.reset(canvasWidth, canvasHeight);
  }

  reset(w, h) {
    this.x = Math.random() * (w || 1000);
    this.y = Math.random() * (h || 800);
    this.vx = randomRange(-0.35, 0.35);
    this.vy = randomRange(-0.35, 0.35);
    this.radius = randomRange(1.2, 2.8);
    this.alpha = randomRange(0.2, 0.8);
    this.baseAlpha = this.alpha;
    this.pulseSpeed = randomRange(0.005, 0.02);
    this.pulseAngle = Math.random() * Math.PI * 2;

    const colorChoices = ['0, 242, 254', '121, 40, 202', '255, 255, 255', '79, 70, 229'];
    this.rgb = colorChoices[Math.floor(Math.random() * colorChoices.length)];
  }

  update(w, h) {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) this.x = w;
    if (this.x > w) this.x = 0;
    if (this.y < 0) this.y = h;
    if (this.y > h) this.y = 0;

    this.pulseAngle += this.pulseSpeed;
    this.alpha = this.baseAlpha + Math.sin(this.pulseAngle) * 0.2;
  }

  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(${this.rgb}, ${Math.max(0, this.alpha)})`;
    context.shadowBlur = 10;
    context.shadowColor = `rgba(${this.rgb}, 0.8)`;
    context.fill();
    context.shadowBlur = 0;
  }
}

class LightBeam {
  constructor(w, h) {
    this.x = Math.random() * (w || 1000);
    this.y = Math.random() * (h || 800);
    this.radius = randomRange(250, 450);
    this.angle = Math.random() * Math.PI * 2;
    this.speed = randomRange(0.001, 0.003);
    this.color = Math.random() > 0.5 ? '0, 242, 254' : '121, 40, 202';
  }

  update(w, h) {
    this.angle += this.speed;
    this.x = w / 2 + Math.cos(this.angle) * (w * 0.25);
    this.y = h / 2 + Math.sin(this.angle * 0.8) * (h * 0.2);
  }

  draw(context) {
    const grad = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    grad.addColorStop(0, `rgba(${this.color}, 0.12)`);
    grad.addColorStop(0.5, `rgba(${this.color}, 0.04)`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    context.fillStyle = grad;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
  }
}

export function initBackgroundCanvas(canvasElement) {
  canvas = canvasElement;
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resize();

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  render();
}

function handleVisibilityChange() {
  if (document.hidden) {
    isPaused = true;
    if (animFrameId) cancelAnimationFrame(animFrameId);
  } else {
    if (isPaused) {
      isPaused = false;
      render();
    }
  }
}

function resize() {
  if (!canvas) return;
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initParticles();
}

function initParticles() {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle(width, height));
  }
  lightBeams = [new LightBeam(width, height), new LightBeam(width, height), new LightBeam(width, height)];
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MAX_DISTANCE) {
        const alpha = (1 - dist / MAX_DISTANCE) * 0.25;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }
}

function drawGrid() {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
  ctx.lineWidth = 1;
  const gridSize = 80;

  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function render() {
  if (!ctx || isPaused) return;
  ctx.clearRect(0, 0, width, height);

  drawGrid();

  lightBeams.forEach(beam => {
    beam.update(width, height);
    beam.draw(ctx);
  });

  drawConnections();
  particles.forEach(p => {
    p.update(width, height);
    p.draw(ctx);
  });

  animFrameId = requestAnimationFrame(render);
}
