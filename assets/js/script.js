/* =====================================================
   GRANDVASTU — Interactions & Animations
   ===================================================== */
(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Preloader ---------- */
  window.addEventListener('load', () => {
    const pre = $('#preloader');
    if (!pre) return;
    setTimeout(() => pre.classList.add('is-hidden'), 700);
    setTimeout(() => pre.remove(), 1700);
  });

  /* ---------- Year ---------- */
  const yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Sticky header shadow ---------- */
  const header = $('#header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 30);
    const back = $('#backTop');
    if (back) back.classList.toggle('is-visible', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  const ham = $('#hamburger');
  const nav = $('#nav');
  const navClose = $('#navClose');
  let backdrop = $('.nav__backdrop');
  if (nav && !backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav__backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
  }
  const toggleNav = (open) => {
    if (!nav || !ham) return;
    const willOpen = typeof open === 'boolean' ? open : !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', willOpen);
    ham.classList.toggle('is-open', willOpen);
    if (backdrop) backdrop.classList.toggle('is-open', willOpen);
    ham.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    document.body.style.overflow = willOpen ? 'hidden' : '';
  };
  if (ham) ham.addEventListener('click', () => toggleNav());
  if (navClose) navClose.addEventListener('click', () => toggleNav(false));
  if (backdrop) backdrop.addEventListener('click', () => toggleNav(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav && nav.classList.contains('is-open')) toggleNav(false);
  });
  $$('#nav .nav__link, #nav .nav__cta, #nav .nav__submenu a').forEach(a => {
    a.addEventListener('click', () => {
      if (window.innerWidth <= 980) toggleNav(false);
    });
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980 && nav && nav.classList.contains('is-open')) toggleNav(false);
  });

  /* ---------- Active nav link on scroll (anchor links only) ---------- */
  const sections = $$('section[id]');
  const anchorNavLinks = $$('.nav__link[href^="#"]');
  if (anchorNavLinks.length) {
    const setActive = () => {
      const y = window.scrollY + 120;
      let active = '';
      sections.forEach(s => {
        if (s.offsetTop <= y && s.offsetTop + s.offsetHeight > y) active = s.id;
      });
      anchorNavLinks.forEach(l => {
        const href = l.getAttribute('href');
        l.classList.toggle('is-active', href === `#${active}`);
      });
    };
    window.addEventListener('scroll', setActive, { passive: true });
  }

  /* ---------- Multi-page active nav (defensive) ---------- */
  // If any nav link's pathname matches the current page, ensure it carries .is-active.
  const path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const SERVICE_PAGES = new Set(['vastu.html', 'astrology.html', 'healing.html', 'numerology.html']);
  $$('.nav .nav__link').forEach(link => {
    const href = (link.getAttribute('href') || '').toLowerCase();
    if (!href || href.startsWith('#')) return;
    const file = href.split('/').pop();
    // direct match
    if (file === path) link.classList.add('is-active');
    // services dropdown parent stays active for any service sub-page
    if (file === 'vastu.html' && SERVICE_PAGES.has(path)) link.classList.add('is-active');
  });

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
      io.observe(el);
    });
    // Safety fallback — reveal anything still hidden after 6s.
    setTimeout(() => reveals.forEach(el => el.classList.add('is-visible')), 6000);
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Counter animation ---------- */
  const counters = $$('.counter');
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target || '0', 10);
    const dur = 1800;
    const start = performance.now();
    const fmt = new Intl.NumberFormat();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt.format(Math.floor(target * eased));
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = fmt.format(target);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const cIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { animateCounter(e.target); cIo.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(c => cIo.observe(c));
  } else {
    counters.forEach(c => animateCounter(c));
  }

  /* ---------- Hero rotating words ---------- */
  const cycleWords = $$('.hero__cycle-word');
  if (cycleWords.length > 1) {
    let idx = 0;
    setInterval(() => {
      const cur = cycleWords[idx];
      const next = cycleWords[(idx + 1) % cycleWords.length];
      cur.classList.remove('is-active');
      cur.classList.add('is-leaving');
      next.classList.add('is-active');
      setTimeout(() => cur.classList.remove('is-leaving'), 700);
      idx = (idx + 1) % cycleWords.length;
    }, 2800);
  }

  /* ---------- Hero particles ---------- */
  const partWrap = $('#heroParticles');
  if (partWrap) {
    const count = window.innerWidth > 768 ? 14 : 7;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.style.left = Math.random() * 100 + '%';
      s.style.top  = Math.random() * 100 + '%';
      s.style.animationDelay = (Math.random() * 6) + 's';
      s.style.animationDuration = (8 + Math.random() * 8) + 's';
      s.style.opacity = (0.3 + Math.random() * 0.6).toFixed(2);
      s.style.transform = `scale(${0.6 + Math.random() * 1.4})`;
      partWrap.appendChild(s);
    }
  }

  /* ---------- Testimonial slider ---------- */
  const track = $('#testiTrack');
  const dotsWrap = $('#testiDots');
  if (track) {
    const cards = $$('.testi__card', track);
    const total = cards.length;
    const getPerView = () => {
      const w = window.innerWidth;
      if (w < 640) return 1;
      if (w < 980) return 2;
      return 3;
    };
    let perView = getPerView();
    let pos = 0;
    const maxPos = () => Math.max(0, total - perView);

    // dots
    const buildDots = () => {
      dotsWrap.innerHTML = '';
      const n = maxPos() + 1;
      for (let i = 0; i < n; i++) {
        const d = document.createElement('button');
        d.className = 'testi__dot';
        if (i === pos) d.classList.add('is-active');
        d.setAttribute('aria-label', `Go to slide ${i + 1}`);
        d.addEventListener('click', () => { pos = i; render(); });
        dotsWrap.appendChild(d);
      }
    };
    const render = () => {
      pos = Math.max(0, Math.min(pos, maxPos()));
      const card = cards[0];
      const gap = parseFloat(getComputedStyle(track).gap) || 24;
      const cardW = card.getBoundingClientRect().width + gap;
      track.style.transform = `translateX(${-pos * cardW}px)`;
      $$('.testi__dot', dotsWrap).forEach((d, i) => d.classList.toggle('is-active', i === pos));
    };
    const next = () => { pos = pos >= maxPos() ? 0 : pos + 1; render(); };
    const prev = () => { pos = pos <= 0 ? maxPos() : pos - 1; render(); };

    $('.testi__nav--next').addEventListener('click', next);
    $('.testi__nav--prev').addEventListener('click', prev);

    // touch swipe
    let startX = 0, dragging = false;
    track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; dragging = true; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      if (!dragging) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) (dx < 0 ? next() : prev());
      dragging = false;
    });

    // autoplay
    let autoplay = setInterval(next, 5500);
    track.parentElement.addEventListener('mouseenter', () => clearInterval(autoplay));
    track.parentElement.addEventListener('mouseleave', () => autoplay = setInterval(next, 5500));

    // resize
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        const np = getPerView();
        if (np !== perView) { perView = np; pos = 0; buildDots(); }
        render();
      }, 120);
    });

    buildDots();
    render();
  }

  /* ---------- Card tilt (subtle) ---------- */
  if (window.matchMedia('(hover: hover)').matches) {
    $$('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-10px) perspective(800px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Custom cursor (desktop) ---------- */
  const cursor = $('#cursor');
  if (cursor && window.matchMedia('(hover: hover)').matches && window.innerWidth > 980) {
    let cx = -100, cy = -100, tx = -100, ty = -100;
    document.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      cursor.style.opacity = '1';
    });
    document.addEventListener('mouseleave', () => cursor.style.opacity = '0');
    const loop = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    $$('a, button, [data-tilt], .nav__link, .testi__dot').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  /* ---------- Back to top ---------- */
  const back = $('#backTop');
  if (back) back.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Contact form ---------- */
  const form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // basic native validation
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const success = $('#formSuccess');
      success.classList.add('is-visible');
      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.innerHTML;
      btn.innerHTML = '<span>Sending&hellip;</span>';
      btn.disabled = true;
      setTimeout(() => {
        form.reset();
        btn.innerHTML = orig;
        btn.disabled = false;
        setTimeout(() => success.classList.remove('is-visible'), 6000);
      }, 1100);
    });

    // Floating label support: ensure inputs/textarea have placeholder for :placeholder-shown,
    // and toggle .is-filled on parent .field for selects (which don't support :placeholder-shown).
    $$('.field input, .field textarea', form).forEach(el => el.setAttribute('placeholder', ' '));
    $$('.field select', form).forEach(sel => {
      const sync = () => sel.closest('.field')?.classList.toggle('is-filled', !!sel.value);
      sel.addEventListener('change', sync);
      sync();
    });
  }

  /* ---------- Smooth scroll for anchor links (with header offset) ---------- */
  const headerH = () => (header ? header.getBoundingClientRect().height : 0);
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - headerH() + 1;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------- Cosmos comet randomization ---------- */
  $$('.cosmos__comet').forEach((c, i) => {
    const top = (8 + Math.random() * 30).toFixed(1);
    const delay = (Math.random() * 8).toFixed(1);
    const dur = (10 + Math.random() * 8).toFixed(1);
    c.style.top = top + '%';
    c.style.animationDelay = delay + 's';
    c.style.animationDuration = dur + 's';
  });

  /* ---------- Parallax mandalas ---------- */
  const heroBg = $('.hero__bg');
  if (heroBg && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 14;
      const y = (e.clientY / window.innerHeight - 0.5) * 14;
      const lg = $('.hero__mandala--lg');
      const sm = $('.hero__mandala--sm');
      if (lg) lg.style.transform = `translate(${x}px, ${y}px)`;
      if (sm) sm.style.transform = `translate(${-x}px, ${-y}px)`;
    });
  }
})();
