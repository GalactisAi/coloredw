/* ============================================================
   COLORED Interior Designs — Main JavaScript
   Lenis smooth scroll · GSAP ScrollTrigger · Swup transitions
   ============================================================ */

let lenis;

document.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initPageEntrance();
  initHeader();
  initMobileMenu();
  initGSAPReveals();
  initFAQ();
  initAnchorScroll();
  initProjectFilters();
  initCounterAnimation();
  initSpecialties();
  initProcessPage();
  initSwup();
});

/* ---------- Swup Page Transitions (Vertical Slide + Beige Overlay) ---------- */
function initSwup() {
  const swup = new Swup({
    containers: ['#swup'],
    animateHistoryBrowsing: true,
  });

  swup.hooks.on('visit:start', () => {
    const toggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav__links');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    if (toggle && navLinks && navLinks.classList.contains('mobile-open')) {
      toggle.classList.remove('active');
      navLinks.classList.remove('mobile-open');
      if (mobileOverlay) mobileOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
    navLinks?.querySelectorAll('.nav__dropdown.dropdown-open').forEach(d => {
      d.classList.remove('dropdown-open');
    });

    ScrollTrigger.getAll().forEach(t => t.kill());
    if (lenis) { lenis.destroy(); lenis = null; }
  });

  swup.hooks.replace('animation:out:await', async () => {
    const container = document.querySelector('#swup');
    const overlay = document.querySelector('.page-overlay');

    const tl = gsap.timeline();
    tl.to(overlay, { opacity: 0.6, duration: 0.4, ease: 'power2.inOut' }, 0);
    tl.to(container, { y: -120, opacity: 0, duration: 0.5, ease: 'power3.in' }, 0);
    await tl;
  });

  swup.hooks.on('content:replace', () => {
    window.scrollTo(0, 0);
  });

  swup.hooks.replace('animation:in:await', async () => {
    const container = document.querySelector('#swup');
    const overlay = document.querySelector('.page-overlay');

    gsap.set(container, { y: 120, opacity: 0 });

    const tl = gsap.timeline();
    tl.to(container, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', clearProps: 'all' }, 0);
    tl.to(overlay, { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 0.1);
    await tl;
  });

  swup.hooks.on('visit:end', () => {
    initLenis();
    initHeader();
    initGSAPReveals();
    initFAQ();
    initAnchorScroll();
    initProjectFilters();
    initCounterAnimation();
    initSpecialties();
    initProcessPage();
    updateActiveNav();

    const hash = window.location.hash;
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        setTimeout(() => {
          const offset = document.querySelector('.header')?.offsetHeight || 80;
          if (lenis) {
            lenis.scrollTo(target, { offset: -offset, duration: 1.4 });
          } else {
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }, 100);
      }
    }
  });
}

/* ---------- Update Active Nav Link ---------- */
function updateActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('#')[0].split('?')[0];
    link.classList.toggle('active', href === path);
  });
  document.querySelectorAll('.nav__dropdown-item').forEach(link => {
    const href = (link.getAttribute('href') || '').split('#')[0].split('?')[0];
    link.classList.toggle('active', href === path);
  });
}

/* ---------- Lenis Smooth Scroll + GSAP Sync ---------- */
function initLenis() {
  gsap.registerPlugin(ScrollTrigger);

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

/* ---------- Page Entrance Animation ---------- */
function initPageEntrance() {
  window.scrollTo(0, 0);
  if (lenis) lenis.scrollTo(0, { immediate: true });

  const curtain = document.querySelector('.page-curtain');
  const isHome = !!document.querySelector('.hero');
  const isProcess = !!document.querySelector('.prc-hero');
  const heroTarget = isHome
    ? document.querySelector('.hero__content')
    : isProcess
      ? document.querySelector('.prc-hero__content')
      : document.querySelector('.page-hero');

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      if (curtain) curtain.style.display = 'none';
      ScrollTrigger.refresh();
    },
  });

  if (curtain) {
    tl.to(curtain, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut',
    });
  }

  if (heroTarget) {
    const children = heroTarget.children;
    gsap.set(children, { opacity: 0, y: 25 });

    tl.to(children, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.08,
    }, curtain ? '-=0.35' : '0');
  }

  const header = document.querySelector('.header');
  if (header) {
    gsap.fromTo(header,
      { y: -10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.05, clearProps: 'transform' }
    );
  }
}

/* ---------- Sticky Header ---------- */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const check = () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  };

  if (lenis) {
    lenis.on('scroll', check);
  } else {
    window.addEventListener('scroll', check, { passive: true });
  }
  check();
}

/* ---------- Mobile Menu ---------- */
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav__links');
  if (!toggle || !navLinks) return;

  let overlay = document.querySelector('.mobile-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    document.body.appendChild(overlay);
  }

  const isMobile = () => window.innerWidth <= 768;

  function closeMobileMenu() {
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('mobile-open');
    overlay.classList.remove('active');
    document.body.classList.remove('menu-is-open');
    if (lenis) lenis.start();
    navLinks.querySelectorAll('.nav__dropdown.dropdown-open').forEach(d => {
      d.classList.remove('dropdown-open');
    });
  }

  function openMobileMenu() {
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    navLinks.classList.add('mobile-open');
    overlay.classList.add('active');
    document.body.classList.add('menu-is-open');
    if (lenis) lenis.stop();
  }

  toggle.addEventListener('click', () => {
    navLinks.classList.contains('mobile-open') ? closeMobileMenu() : openMobileMenu();
  });

  overlay.addEventListener('click', closeMobileMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('mobile-open')) {
      closeMobileMenu();
      toggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (!isMobile() && navLinks.classList.contains('mobile-open')) {
      closeMobileMenu();
    }
  });

  navLinks.querySelectorAll('.nav__dropdown-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      if (!isMobile()) return;
      e.preventDefault();
      e.stopPropagation();
      const dropdown = trigger.closest('.nav__dropdown');
      const isOpen = dropdown.classList.contains('dropdown-open');
      navLinks.querySelectorAll('.nav__dropdown.dropdown-open').forEach(d => {
        if (d !== dropdown) d.classList.remove('dropdown-open');
      });
      dropdown.classList.toggle('dropdown-open', !isOpen);
    });
  });

  navLinks.querySelectorAll('.nav__link').forEach(link => {
    if (link.classList.contains('nav__dropdown-trigger')) return;
    link.addEventListener('click', () => { if (isMobile()) closeMobileMenu(); });
  });

  navLinks.querySelectorAll('.nav__dropdown-item').forEach(link => {
    link.addEventListener('click', () => { if (isMobile()) closeMobileMenu(); });
  });
}

/* ---------- GSAP ScrollTrigger Reveals ---------- */
function initGSAPReveals() {
  const reveals = document.querySelectorAll('.reveal');
  const revealsLeft = document.querySelectorAll('.reveal-left');
  const revealsRight = document.querySelectorAll('.reveal-right');

  const baseConfig = {
    duration: 0.8,
    ease: 'power3.out',
  };

  reveals.forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      {
        ...baseConfig,
        opacity: 1,
        y: 0,
        delay: el.dataset.delay || 0,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      }
    );
  });

  revealsLeft.forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, x: -40 },
      {
        ...baseConfig,
        opacity: 1,
        x: 0,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      }
    );
  });

  revealsRight.forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, x: 40 },
      {
        ...baseConfig,
        opacity: 1,
        x: 0,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      }
    );
  });

  document.querySelectorAll(
    '.stats-grid, .grid-3, .pillar-grid, .testimonials-grid, .projects-grid, .blog-grid, .values-grid, .team-grid, .process-steps, .wcu__specialties, .partners-grid'
  ).forEach((grid) => {
    const children = grid.children;
    if (!children.length) return;

    gsap.fromTo(children,
      { opacity: 0, y: 25 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: grid,
          start: 'top 85%',
          once: true,
        },
      }
    );
  });
}

/* ---------- FAQ Accordion ---------- */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach((item) => {
    const question = item.querySelector('.faq-item__question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      items.forEach((i) => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
}

/* ---------- Anchor Scroll (via Lenis) ---------- */
function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = document.querySelector('.header')?.offsetHeight || 80;
      if (lenis) {
        lenis.scrollTo(target, { offset: -offset, duration: 1.4 });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ---------- Project Filters ---------- */
function initProjectFilters() {
  const filters = document.querySelectorAll('.project-filter');
  const cards = document.querySelectorAll('.project-card');
  if (!filters.length || !cards.length) return;

  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      filters.forEach((f) => f.classList.remove('active'));
      filter.classList.add('active');

      const category = filter.dataset.filter;

      cards.forEach((card) => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = '';
          gsap.to(card, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
        } else {
          gsap.to(card, {
            opacity: 0, y: 10, duration: 0.3, ease: 'power2.in',
            onComplete: () => { card.style.display = 'none'; }
          });
        }
      });
    });
  });
}

/* ---------- Counter Animation (ScrollTrigger) ---------- */
function initCounterAnimation() {
  const counters = document.querySelectorAll('.stat-item__number');
  if (!counters.length) return;

  counters.forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;

    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.fromTo(el, { innerText: 0 }, {
          innerText: target,
          duration: 2,
          ease: 'power2.out',
          snap: { innerText: 1 },
          onUpdate() {
            el.textContent = prefix + Math.round(parseFloat(el.innerText)) + suffix;
          },
        });
      },
    });
  });
}

/* ---------- Specialties Accordion ---------- */
function initSpecialties() {
  const items = document.querySelectorAll('.wcu__specialty');
  if (!items.length) return;

  items.forEach((item) => {
    const header = item.querySelector('.wcu__specialty-header');
    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      items.forEach((i) => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
}

/* ---------- Process Page — Cinematic Scroll ---------- */
function initProcessPage() {
  const steps = document.querySelectorAll('.prc-step');
  if (!steps.length) return;

  const heroBg = document.querySelector('.prc-hero__bg-letter');
  if (heroBg) {
    gsap.to(heroBg, {
      y: 120,
      scale: 1.1,
      scrollTrigger: {
        trigger: '.prc-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
      },
    });
  }

  const heroContent = document.querySelector('.prc-hero__content');
  if (heroContent) {
    gsap.to(heroContent, {
      y: -60,
      opacity: 0,
      scrollTrigger: {
        trigger: '.prc-hero',
        start: '60% top',
        end: 'bottom top',
        scrub: 0.6,
      },
    });
  }

  steps.forEach((step) => {
    const num = step.querySelector('.prc-step__number');
    const content = step.querySelector('.prc-step__content');
    const accents = step.querySelectorAll('.prc-step__accent');
    const divider = step.querySelector('.prc-step__divider');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: step,
        start: 'top 80%',
        end: 'top 20%',
        scrub: 0.5,
      },
    });

    if (num) {
      tl.fromTo(num,
        { opacity: 0, scale: 0.8, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'power3.out' },
        0
      );
    }

    if (content) {
      const children = content.children;
      tl.fromTo(children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' },
        0.15
      );
    }

    accents.forEach((a, i) => {
      tl.fromTo(a,
        { opacity: 0, scale: 0.5 },
        { opacity: 0.15, scale: 1, duration: 1.2, ease: 'power2.out' },
        0.1 * i
      );
    });

    if (divider) {
      tl.fromTo(divider,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: 'power2.out', transformOrigin: 'left center' },
        0.3
      );
    }

    gsap.to(step.querySelector('.prc-step__inner'), {
      y: -30,
      opacity: 0,
      scrollTrigger: {
        trigger: step,
        start: '80% 30%',
        end: 'bottom top',
        scrub: 0.4,
      },
    });
  });

  const closing = document.querySelector('.prc-closing__content');
  if (closing) {
    gsap.fromTo(closing.children,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.prc-closing',
          start: 'top 70%',
          once: true,
        },
      }
    );
  }

  const closingBg = document.querySelector('.prc-closing__bg-letter');
  if (closingBg) {
    gsap.fromTo(closingBg,
      { scale: 0.9, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        scrollTrigger: {
          trigger: '.prc-closing',
          start: 'top bottom',
          end: 'center center',
          scrub: 0.6,
        },
      }
    );
  }
}
