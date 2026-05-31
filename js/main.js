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
  const reelVideo = document.querySelector('.creative-reel__video');
  const timecode = document.querySelector('.creative-reel__timecode');
  if (reelVideo && timecode) {
    const pad = (n) => String(Math.floor(n)).padStart(2, '0');
    const updateTimecode = () => {
      const t = reelVideo.currentTime || 0;
      const h = pad(t / 3600);
      const m = pad((t % 3600) / 60);
      const s = pad(t % 60);
      const f = pad((t % 1) * 24);
      timecode.textContent = `${h}:${m}:${s}:${f}`;
    };
    reelVideo.addEventListener('timeupdate', updateTimecode);
    reelVideo.addEventListener('loadedmetadata', updateTimecode);
  }
})();
