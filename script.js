// Reveal on scroll
const reveals = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        // animate skill bars
        const bars = entry.target.querySelectorAll('.skill-bar span');
        bars.forEach(b => { b.style.width = b.style.getPropertyValue('--w') || b.dataset.w || '80%'; });
      }
    });
  },
  { threshold: 0.15 }
);

reveals.forEach(el => observer.observe(el));

// Typed subtitle
class Typer {
  constructor(el) { this.el = el; this.phrases = JSON.parse(el.dataset.phrases || '[]'); this.i = 0; this.j = 0; this.deleting = false; this.tick(); }
  tick() {
    const phrase = this.phrases[this.i % this.phrases.length] || '';
    if (!this.deleting) { this.el.textContent = phrase.slice(0, ++this.j); }
    else { this.el.textContent = phrase.slice(0, --this.j); }

    let delay = this.deleting ? 40 : 80;
    if (!this.deleting && this.j === phrase.length) { delay = 1200; this.deleting = true; }
    else if (this.deleting && this.j === 0) { this.deleting = false; this.i++; delay = 300; }

    setTimeout(() => this.tick(), delay);
  }
}
const typedEl = document.getElementById('typed');
if (typedEl) new Typer(typedEl);

// Scroll progress
const progressBar = document.getElementById('progress-bar');
const nav = document.querySelector('.nav');

function updateProgress() {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
  if (progressBar) progressBar.style.width = pct + '%';

  // Add scrolled class to nav for better visibility
  if (nav) {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// Hero particles (simple)
const canvas = document.getElementById('hero-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  function resize() { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
  window.addEventListener('resize', resize); resize();

  function rand(min, max) { return Math.random() * (max - min) + min }
  function init() { particles = []; for (let i = 0; i < 42; i++) { particles.push({ x: rand(0, w), y: rand(0, h), r: rand(0.6, 3.4), vx: rand(-0.3, 0.7), vy: rand(-0.1, 0.6), hue: rand(200, 280) }); } }
  init();

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x > w + 20) p.x = -20; if (p.x < -20) p.x = w + 20;
      if (p.y > h + 20) p.y = -20; if (p.y < -20) p.y = h + 20;
      ctx.beginPath();
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
      g.addColorStop(0, `hsla(${p.hue},80%,60%,0.95)`);
      g.addColorStop(0.2, `hsla(${p.hue},70%,55%,0.5)`);
      g.addColorStop(1, `hsla(${p.hue},60%,50%,0)`);
      ctx.fillStyle = g;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

// Custom cursor
const cursor = document.createElement('div');
cursor.className = 'cursor';
document.body.appendChild(cursor);

// Initialize cursor position to prevent flash at 0,0
cursor.style.left = '-100px';
cursor.style.top = '-100px';

window.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

window.addEventListener('mousedown', () => {
  cursor.style.transform = 'translate(-50%,-50%) scale(1.6)';
  cursor.style.background = 'rgba(99,102,241,0.8)';
});

window.addEventListener('mouseup', () => {
  cursor.style.transform = 'translate(-50%,-50%) scale(1)';
  cursor.style.background = 'rgba(255,255,255,0.8)';
});

// Theme toggle (simple retro mode)
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) { themeToggle.addEventListener('click', () => document.body.classList.toggle('retro')); }

// Easter egg: double-click hero name toggles retro too
const heroName = document.getElementById('hero-name');
if (heroName) heroName.addEventListener('dblclick', () => document.body.classList.toggle('retro'));

// Konami code -> confetti
const KONAMI = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; let konamiIndex = 0;
window.addEventListener('keydown', e => {
  if (e.keyCode === KONAMI[konamiIndex]) { konamiIndex++; if (konamiIndex === KONAMI.length) { triggerConfetti(); konamiIndex = 0; } }
  else konamiIndex = 0;
});

function triggerConfetti() {
  const container = document.getElementById('confetti-container'); if (!container) return;
  const c = document.createElement('canvas'); container.appendChild(c); c.style.position = 'fixed'; c.style.left = 0; c.style.top = 0; c.style.width = '100%'; c.style.height = '100%'; c.style.zIndex = 999999;
  const ctx = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
  const pieces = [];
  function r(min, max) { return Math.random() * (max - min) + min }
  for (let i = 0; i < 180; i++) { pieces.push({ x: r(0, c.width), y: r(-c.height, 0), w: r(6, 14), h: r(8, 20), vx: r(-1.2, 1.2), vy: r(2, 6), rot: r(0, 360), color: `hsl(${r(0, 360)},80%,60%)` }); }

  let raf;
  function frame() { ctx.clearRect(0, 0, c.width, c.height); pieces.forEach(p => { p.x += p.vx; p.y += p.vy; p.rot += 6; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180); ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); }); raf = requestAnimationFrame(frame); }
  frame();
  setTimeout(() => { cancelAnimationFrame(raf); container.removeChild(c); }, 3500);
}
