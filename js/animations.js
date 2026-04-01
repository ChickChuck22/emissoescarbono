/* ============================================================
   ANIMATIONS.JS — Particles, Scroll Reveal, Counters
   GRUPO 5: Emissões, Carbono e Práticas ESG
   ============================================================ */

// ─── Scroll Reveal ───────────────────────────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });
}

// ─── Number Counter Animation ─────────────────────────────────
function animateCounter(el, target, duration = 2000, suffix = '') {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
    const current = Math.round(start + (target - start) * eased);
    el.textContent = current.toLocaleString('pt-BR') + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function initCounters() {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const duration = parseInt(el.dataset.duration) || 1800;
        animateCounter(el, target, duration, suffix);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-target]').forEach(el => {
    counterObserver.observe(el);
  });
}

// ─── Canvas Particle System ───────────────────────────────────
function initParticles(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + 20;
      this.size = Math.random() * 3 + 1;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.speedY = -(Math.random() * 0.8 + 0.3);
      this.opacity = 0;
      this.maxOpacity = Math.random() * 0.4 + 0.1;
      this.lifespan = Math.random() * 300 + 200;
      this.life = 0;
      this.type = Math.random() > 0.7 ? 'leaf' : 'dot';
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.02;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;
      this.rotation += this.rotSpeed;

      const progress = this.life / this.lifespan;
      if (progress < 0.2) {
        this.opacity = (progress / 0.2) * this.maxOpacity;
      } else if (progress > 0.8) {
        this.opacity = ((1 - progress) / 0.2) * this.maxOpacity;
      } else {
        this.opacity = this.maxOpacity;
      }

      if (this.life >= this.lifespan || this.y < -20) this.reset();
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      if (this.type === 'leaf') {
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 2, this.size, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#34D399';
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  function createParticles(count = 60) {
    particles = [];
    for (let i = 0; i < count; i++) {
      const p = new Particle();
      p.life = Math.random() * p.lifespan; // stagger starts
      p.y = Math.random() * canvas.height;
      particles.push(p);
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(animate);
  }

  resize();
  createParticles(50);
  animate();

  window.addEventListener('resize', () => {
    resize();
    createParticles(50);
  });

  return () => cancelAnimationFrame(animId);
}

// ─── Floating DOM Particles (for slides bg) ───────────────────
function createFloatingParticles(container, count = 15) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 2;
    const delay = Math.random() * 10;
    const duration = Math.random() * 15 + 10;
    const x = Math.random() * 100;

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x}%;
      animation-duration: ${duration}s;
      animation-delay: -${delay}s;
      opacity: ${Math.random() * 0.4 + 0.1};
    `;
    container.appendChild(p);
  }
}

// ─── Nav Scroll Effect ────────────────────────────────────────
function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
}

// ─── Back to Top ──────────────────────────────────────────────
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
}

// ─── Active Nav Link Scroll Spy ───────────────────────────────
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(section => observer.observe(section));
}

// ─── Init All ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initCounters();
  initNavScroll();
  initBackToTop();
  initScrollSpy();
  initParticles('hero-canvas');
});
