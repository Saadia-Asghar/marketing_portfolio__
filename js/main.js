(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Scroll-triggered fade-in */
  const revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  /* Subtle periodic glitch on hero title */
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle && !prefersReducedMotion) {
    setInterval(() => {
      heroTitle.classList.add('glitch-active');
      setTimeout(() => heroTitle.classList.remove('glitch-active'), 400);
    }, 6000);
  }

  /* Nav background on scroll */
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener(
      'scroll',
      () => {
        nav.style.background =
          window.scrollY > 80
            ? 'rgba(11, 12, 16, 0.95)'
            : 'linear-gradient(180deg, rgba(11, 12, 16, 0.92) 0%, transparent 100%)';
      },
      { passive: true }
    );
  }

  /* Smooth anchor offset for fixed nav */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* Live timecode on creative reel video */
  const reelVideos = document.querySelectorAll('.creative-reel__video, .highlight-reel__video');
  const timecode = document.querySelector('.creative-reel__timecode');
  const featuredVideo = document.querySelector('.creative-reel__video');

  if (featuredVideo && timecode) {
    const pad = (n) => String(Math.floor(n)).padStart(2, '0');
    const updateTimecode = () => {
      const t = featuredVideo.currentTime || 0;
      timecode.textContent = `${pad(t / 3600)}:${pad((t % 3600) / 60)}:${pad(t % 60)}:${pad((t % 1) * 24)}`;
    };
    featuredVideo.addEventListener('timeupdate', updateTimecode);
    featuredVideo.addEventListener('loadedmetadata', updateTimecode);
  }

  reelVideos.forEach((video) => {
    video.addEventListener('play', () => {
      reelVideos.forEach((other) => {
        if (other !== video && !other.paused) other.pause();
      });
    });
  });

  /* Terminal character rain */
  const termRain = document.getElementById('term-rain');
  const glyphs = '01{}[]<>|/\\@#$*&~═→█░▓▒01010101';
  if (termRain && !prefersReducedMotion) {
    const cols = Math.min(18, Math.floor(window.innerWidth / 80));
    for (let i = 0; i < cols; i++) {
      const col = document.createElement('div');
      col.className = 'term-rain__col';
      col.style.left = `${(i / cols) * 100 + Math.random() * 4}%`;
      col.style.animationDuration = `${12 + Math.random() * 18}s`;
      col.style.animationDelay = `${Math.random() * -20}s`;
      let text = '';
      const len = 8 + Math.floor(Math.random() * 14);
      for (let j = 0; j < len; j++) {
        text += glyphs[Math.floor(Math.random() * glyphs.length)] + '\n';
      }
      col.textContent = text;
      termRain.appendChild(col);
    }
  }

  /* Terminal boot typing sequence */
  const bootSequence = [
    { cmd: 'type-cmd-1', text: 'whoami', out: '.term-boot__out--1', next: 'type-cmd-2', line: '.term-boot__line--2' },
    { cmd: 'type-cmd-2', text: 'status --brand', out: '.term-boot__out--2', next: 'type-cmd-3', line: '.term-boot__line--3' },
    { cmd: 'type-cmd-3', text: 'load --scenes', out: '.term-boot__out--3', next: null, line: null },
  ];

  function typeText(el, text, speed, done) {
    if (!el || prefersReducedMotion) {
      if (el) el.textContent = text;
      if (done) done();
      return;
    }
    let i = 0;
    const tick = () => {
      el.textContent = text.slice(0, i);
      i++;
      if (i <= text.length) {
        setTimeout(tick, speed);
      } else if (done) {
        done();
      }
    };
    tick();
  }

  function runBootStep(index) {
    if (index >= bootSequence.length) return;
    const step = bootSequence[index];
    const cmdEl = document.getElementById(step.cmd);
    typeText(cmdEl, step.text, 55, () => {
      const out = document.querySelector(step.out);
      if (out) out.classList.add('is-visible');
      if (step.line) {
        const line = document.querySelector(step.line);
        if (line) line.classList.add('is-visible');
      }
      if (step.next) {
        setTimeout(() => runBootStep(index + 1), 400);
      }
    });
  }

  if (!prefersReducedMotion) {
    setTimeout(() => runBootStep(0), 600);
  } else {
    bootSequence.forEach((step) => {
      const cmdEl = document.getElementById(step.cmd);
      if (cmdEl) cmdEl.textContent = step.text;
      document.querySelector(step.out)?.classList.add('is-visible');
      document.querySelector(step.line)?.classList.add('is-visible');
    });
  }

  /* Status bar: clock + scroll % */
  const clockEl = document.getElementById('term-clock');
  const scrollEl = document.getElementById('scroll-pct');

  if (clockEl) {
    const updateClock = () => {
      const now = new Date();
      clockEl.textContent = [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map((n) => String(n).padStart(2, '0'))
        .join(':');
    };
    updateClock();
    setInterval(updateClock, 1000);
  }

  if (scrollEl) {
    window.addEventListener(
      'scroll',
      () => {
        const doc = document.documentElement;
        const pct = Math.round((window.scrollY / (doc.scrollHeight - doc.clientHeight)) * 100) || 0;
        scrollEl.textContent = String(pct);
      },
      { passive: true }
    );
  }
})();
