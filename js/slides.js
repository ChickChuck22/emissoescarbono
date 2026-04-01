/* ============================================================
   SLIDES.JS — Slide Engine (Keyboard, Transitions, Progress)
   GRUPO 5: Emissões, Carbono e Práticas ESG
   ============================================================ */

class SlideEngine {
  constructor() {
    this.slides = document.querySelectorAll('.slide');
    this.totalSlides = this.slides.length;
    this.currentIndex = 0;
    this.isAnimating = false;
    this.hintTimeout = null;

    this.progressBar = document.querySelector('.slide-progress-bar');
    this.counter = document.querySelector('.slide-counter');
    this.prevBtn = document.getElementById('slide-prev');
    this.nextBtn = document.getElementById('slide-next');
    this.dotsContainer = document.querySelector('.slide-dots');
    this.hintEl = document.querySelector('.keyboard-hint');
    this.fullscreenBtn = document.getElementById('slide-fullscreen');

    this.init();
  }

  init() {
    this.buildDots();
    this.showSlide(0);
    this.bindEvents();
    this.hideHintAfterDelay();
  }

  buildDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';
    this.slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slide-dot';
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => this.goTo(i));
      this.dotsContainer.appendChild(dot);
    });
  }

  showSlide(index) {
    if (this.isAnimating) return;

    const prev = this.slides[this.currentIndex];
    const next = this.slides[index];

    if (prev === next) return;

    this.isAnimating = true;

    // Exit current
    if (prev) {
      prev.classList.add('exit');
      
      // Pause video if exists in previous slide
      const video = prev.querySelector('video');
      if (video) video.pause();

      setTimeout(() => {
        prev.classList.remove('active', 'exit');
      }, 500);
    }

    // Enter next
    this.currentIndex = index;
    next.classList.add('active');

    setTimeout(() => {
      this.isAnimating = false;
    }, 550);

    this.updateUI();
  }

  goTo(index) {
    if (index < 0 || index >= this.totalSlides) return;
    this.showSlide(index);
  }

  next() {
    if (this.currentIndex < this.totalSlides - 1) {
      this.goTo(this.currentIndex + 1);
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.goTo(this.currentIndex - 1);
    }
  }

  updateUI() {
    // Progress bar
    const progress = ((this.currentIndex + 1) / this.totalSlides) * 100;
    if (this.progressBar) {
      this.progressBar.style.width = `${progress}%`;
    }

    // Counter
    if (this.counter) {
      this.counter.innerHTML = `<span class="current">${this.currentIndex + 1}</span> / ${this.totalSlides}`;
    }

    // Buttons
    if (this.prevBtn) this.prevBtn.disabled = this.currentIndex === 0;
    if (this.nextBtn) this.nextBtn.disabled = this.currentIndex === this.totalSlides - 1;

    // Dots
    const dots = this.dotsContainer?.querySelectorAll('.slide-dot');
    dots?.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentIndex);
    });

    // Page title
    const slide = this.slides[this.currentIndex];
    const slideTitle = slide?.querySelector('.slide-title, .cover-title, .end-title');
    if (slideTitle) {
      document.title = `GRUPO 5 ESG — ${slideTitle.textContent.trim().substring(0, 40)}`;
    }
  }

  bindEvents() {
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          this.next();
          this.resetHint();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          this.prev();
          this.resetHint();
          break;
        case 'Home':
          e.preventDefault();
          this.goTo(0);
          break;
        case 'End':
          e.preventDefault();
          this.goTo(this.totalSlides - 1);
          break;
        case 'f':
        case 'F':
          this.toggleFullscreen();
          break;
        case 'Escape':
          if (document.fullscreenElement) document.exitFullscreen();
          break;
      }
    });

    // Button clicks
    this.prevBtn?.addEventListener('click', () => this.prev());
    this.nextBtn?.addEventListener('click', () => this.next());

    // Fullscreen
    this.fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());
    document.addEventListener('fullscreenchange', () => this.onFullscreenChange());

    // Touch/Swipe support
    this.initSwipe();

    // Mouse wheel
    let wheelThrottle = false;
    window.addEventListener('wheel', (e) => {
      if (wheelThrottle) return;
      wheelThrottle = true;
      if (e.deltaY > 30) this.next();
      else if (e.deltaY < -30) this.prev();
      setTimeout(() => { wheelThrottle = false; }, 800);
    }, { passive: true });
  }

  initSwipe() {
    let startX = 0;
    let startY = 0;

    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx < 0) this.next();
        else this.prev();
      }
    }, { passive: true });
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  onFullscreenChange() {
    if (this.fullscreenBtn) {
      this.fullscreenBtn.textContent = document.fullscreenElement ? '⛶' : '⛶';
      this.fullscreenBtn.title = document.fullscreenElement ? 'Sair da tela cheia (F)' : 'Tela cheia (F)';
    }
  }

  hideHintAfterDelay() {
    if (!this.hintEl) return;
    this.hintTimeout = setTimeout(() => {
      this.hintEl.classList.add('hidden');
    }, 5000);
  }

  resetHint() {
    if (!this.hintEl) return;
    clearTimeout(this.hintTimeout);
    this.hintEl.classList.remove('hidden');
    this.hideHintAfterDelay();
  }
}

// ─── Init on DOM ready ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const engine = new SlideEngine();

  // Expose for debugging
  window.slideEngine = engine;
});
