/* ==========================================================================
   Portfolio — chef d'orchestre
   GSAP + ScrollTrigger + Lenis + Three.js
   ========================================================================== */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initTerminal } from './terminal.js';

gsap.registerPlugin(ScrollTrigger);

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const data = JSON.parse($('#site-data')?.textContent || '{}');
const FX = data.fx || {};
const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isWide = () => window.innerWidth >= 900;

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* --------------------------------------------------------------------------
   Smooth scroll
   -------------------------------------------------------------------------- */
const lenis = new Lenis({
  duration: reduced ? 0 : 1.15,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: !reduced,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop();

/* --------------------------------------------------------------------------
   Utilitaires de texte
   -------------------------------------------------------------------------- */
function splitChars(el) {
  const text = el.textContent.trim();
  el.textContent = '';
  return [...text].map((ch) => {
    const wrap = document.createElement('span');
    wrap.className = 'char-wrap';
    wrap.setAttribute('aria-hidden', 'true');
    const c = document.createElement('span');
    c.className = 'char';
    c.textContent = ch === ' ' ? ' ' : ch;
    wrap.appendChild(c);
    el.appendChild(wrap);
    return c;
  });
}

function splitWords(root) {
  const words = [];
  if (!root) return words;
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const s = document.createElement('span');
          s.className = 'word';
          s.textContent = part;
          frag.appendChild(s);
          words.push(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  walk(root);
  return words;
}

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01ABCDEFX';
function scramble(el, to, duration = 0.8) {
  const len = Math.max(el.textContent.length, to.length);
  const o = { p: 0 };
  if (el.__scr) gsap.killTweensOf(el.__scr);
  el.__scr = o;
  return gsap.to(o, {
    p: 1, duration, ease: 'none',
    onUpdate() {
      let s = '';
      for (let i = 0; i < len; i++) {
        if (i < o.p * len) s += to[i] ?? '';
        else if (to[i] === ' ') s += ' ';
        else s += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = s;
    },
    onComplete() { el.textContent = to; },
  });
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-on'), 2600);
}

/* --------------------------------------------------------------------------
   Découpage initial
   -------------------------------------------------------------------------- */
const heroChars = $$('[data-split-chars]').flatMap(splitChars);
const manifestoWords = splitWords($('[data-reveal-words]'));

/* --------------------------------------------------------------------------
   Preloader
   -------------------------------------------------------------------------- */
function runLoader() {
  const LOG = FX.loader || [];
  return new Promise((resolve) => {
    const out = $('#loaderLog');
    const countEl = $('#loaderCount');
    const bar = $('#loaderBar');
    const o = { v: 0 };
    let shown = 0;
    const add = () => {
      const txt = LOG[shown++];
      const d = document.createElement('div');
      d.innerHTML = `<span class="${txt.startsWith('✓') ? 'ok' : 'acc'}">${txt}</span>`;
      out.appendChild(d);
    };
    gsap.timeline({ onComplete: resolve })
      .to(o, {
        v: 100,
        duration: reduced ? 0.4 : 2.1,
        ease: 'power2.inOut',
        onUpdate() {
          countEl.textContent = String(Math.round(o.v)).padStart(3, '0');
          bar.style.transform = `scaleX(${o.v / 100})`;
          const target = Math.min(LOG.length, Math.floor((o.v / 100) * LOG.length + 0.5));
          while (shown < target) add();
        },
      })
      .add(() => { while (shown < LOG.length) add(); })
      .to({}, { duration: 0.35 });
  });
}

/* --------------------------------------------------------------------------
   Scène WebGL
   -------------------------------------------------------------------------- */
let scene = null;
async function bootScene() {
  try {
    await document.fonts.load('800 100px Syne');
  } catch { /* police de secours */ }
  try {
    // Three.js est chargé à part, pendant le preloader
    const { createScene } = await import('./scene.js');
    scene = createScene($('#webgl'), { mobile: isTouch || !isWide() });
  } catch (e) {
    console.warn('[portfolio] WebGL indisponible, mode dégradé.', e);
    document.body.classList.add('no-webgl');
  }
}

/* états de la scène par section
   formes : 0 sphère · 1 disque-onde · 2 ADN · 3 nœud · 4 </> */
const SCENES = {
  hero:      { shape: 0, x: 0,    y: 0,    scale: 1,    opacity: 1,    spinY: 0.08 },
  manifesto: { shape: 1, x: 0,    y: -1.2, scale: 1,    opacity: 0.5,  tilt: 0.42, wave: 1, spinY: 0.03 },
  work:      { shape: 2, x: 0,    y: 0,    scale: 1,    opacity: 0.5,  spinX: 0.35, alignY: Math.PI },
  stack:     { shape: 3, x: -2.4, y: 0.2,  scale: 0.75, opacity: 0.55, spinY: 0.12, spinX: 0.05 },
  journey:   { shape: 0, x: -3,   y: 0.4,  scale: 0.6,  opacity: 0.38, spinY: 0.1 },
  services:  { shape: 3, x: 3,    y: 0.4,  scale: 0.7,  opacity: 0.35, spinY: 0.1 },
  academy:   { shape: 1, x: 0,    y: -1.4, scale: 1.05, opacity: 0.4,  tilt: 0.5, wave: 1, spinY: 0.03 },
  youtube:   { shape: 0, x: 3.2,  y: 0.6,  scale: 0.55, opacity: 0.45, spinY: 0.14 },
  contact:   { shape: 4, x: 3.1,  y: -0.3, scale: 0.78, opacity: 0.65, alignY: Math.PI * 2, alignX: Math.PI * 2 },
};

/* --------------------------------------------------------------------------
   Intro
   -------------------------------------------------------------------------- */
function intro() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.to('.loader__inner', { opacity: 0, y: -40, duration: 0.6, ease: 'power3.in' })
    .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'expo.inOut' }, '-=0.15')
    .add(() => scene?.intro(3.2), '-=1.0')
    .add(() => {
      document.body.classList.remove('is-loading');
      $('#loader')?.remove();
      lenis.start();
      ScrollTrigger.refresh();
    })
    .from(heroChars, { yPercent: 118, rotate: 8, duration: 1.5, stagger: 0.05 }, '-=0.7')
    .from('.hero__tag', { opacity: 0, x: -30, duration: 1.2 }, '-=1.1')
    .from('.hero__meta > *, .hero__bottom > *', { opacity: 0, y: 24, duration: 1.2, stagger: 0.07 }, '-=1.2')
    .from('.nav > *', { opacity: 0, y: -20, duration: 1, stagger: 0.06 }, '<')
    .add(startRotator, '-=0.8');
}

/* --------------------------------------------------------------------------
   Hero : rotator + typo variable qui réagit au curseur
   -------------------------------------------------------------------------- */
function startRotator() {
  const el = $('#rotator');
  const words = FX.rotator || [];
  if (!el || words.length < 2) return;
  let i = 0;
  setInterval(() => {
    i = (i + 1) % words.length;
    scramble(el, words[i], 0.9);
  }, 2600);
}

/* le nom vient du CMS : sa taille s'adapte pour ne jamais déborder de l'écran */
function fitHero() {
  const title = $('.hero__title');
  if (!title) return;
  title.style.fontSize = '';
  // mesure à la graisse maximale (les lettres s'épaississent au survol / sur mobile)
  const saved = heroChars.map((c) => c.style.getPropertyValue('--w'));
  heroChars.forEach((c) => c.style.setProperty('--w', isTouch ? '720' : '800'));
  const lines = $$('.hero__line', title);
  const avail = title.clientWidth;
  const widest = Math.max(...lines.map((l) => l.scrollWidth));
  heroChars.forEach((c, i) => c.style.setProperty('--w', saved[i]));
  if (widest > avail) {
    title.style.fontSize = `${(parseFloat(getComputedStyle(title).fontSize) * avail) / widest * 0.98}px`;
  }
}

function heroWeight() {
  if (isTouch) {
    // sur mobile : la graisse « respire » toute seule
    heroChars.forEach((c, i) => {
      gsap.fromTo(c, { '--w': 450 }, { '--w': 720, duration: 1.6, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.12 });
    });
    return;
  }
  const setters = heroChars.map((c) => gsap.quickTo(c, '--w', { duration: 0.8, ease: 'power3.out' }));
  window.addEventListener('pointermove', (e) => {
    if (window.scrollY > window.innerHeight) return;
    heroChars.forEach((c, i) => {
      const r = c.getBoundingClientRect();
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      setters[i](420 + Math.max(0, 1 - d / 420) * 380);
    });
  });
  heroChars.forEach((c) => gsap.set(c, { '--w': 640 }));
}

/* --------------------------------------------------------------------------
   Curseur custom + boutons magnétiques
   -------------------------------------------------------------------------- */
function cursor() {
  if (isTouch) return;
  document.documentElement.classList.add('has-cursor');
  const root = $('.cursor');
  const dot = $('.cursor__dot');
  const ring = $('.cursor__ring');
  const label = $('.cursor__label');
  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const rp = { ...pos };
  const dx = gsap.quickSetter(dot, 'x', 'px');
  const dy = gsap.quickSetter(dot, 'y', 'px');
  const rx = gsap.quickSetter(ring, 'x', 'px');
  const ry = gsap.quickSetter(ring, 'y', 'px');
  window.addEventListener('pointermove', (e) => {
    pos.x = e.clientX; pos.y = e.clientY;
    dx(pos.x); dy(pos.y);
  });
  gsap.ticker.add(() => {
    rp.x += (pos.x - rp.x) * 0.18;
    rp.y += (pos.y - rp.y) * 0.18;
    rx(rp.x); ry(rp.y);
  });
  document.addEventListener('pointerover', (e) => {
    const field = e.target.closest('input, textarea, select');
    const lab = e.target.closest('[data-cursor]');
    const link = e.target.closest('a, button');
    root.classList.remove('is-label', 'is-hover', 'is-text');
    if (field) root.classList.add('is-text');
    else if (lab) { label.textContent = lab.dataset.cursor; root.classList.add('is-label'); }
    else if (link) root.classList.add('is-hover');
  });
  document.addEventListener('pointerleave', () => root.classList.add('is-hidden'));
  document.addEventListener('pointerenter', () => root.classList.remove('is-hidden'));
}

function magnetic() {
  if (isTouch) return;
  $$('[data-magnetic]').forEach((el) => {
    const s = parseFloat(el.dataset.magnetic) || 0.3;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.35)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.35)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * s);
      yTo((e.clientY - (r.top + r.height / 2)) * s);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

function scrambleLinks() {
  $$('[data-scramble]').forEach((el) => {
    const txt = el.textContent;
    el.addEventListener('pointerenter', () => scramble(el, txt, 0.5));
  });
}

/* --------------------------------------------------------------------------
   Navigation
   -------------------------------------------------------------------------- */
function nav() {
  const navEl = $('#nav');
  const prog = $('#progress');
  lenis.on('scroll', (l) => {
    prog.style.transform = `scaleX(${l.progress || 0})`;
    scene?.setVelocity(l.velocity);
    if (document.body.classList.contains('menu-open')) return;
    if (l.direction === 1 && l.scroll > 240) navEl.classList.add('is-hidden');
    else if (l.direction === -1) navEl.classList.remove('is-hidden');
  });

  // ancres internes
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id === '#top' ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      closeMenu();
      lenis.scrollTo(target, { duration: 1.8 });
    });
  });

  // horloge Lomé
  const clock = $('#clock');
  const fmt = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Lome', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const tick = () => { clock.textContent = fmt.format(new Date()); };
  tick(); setInterval(tick, 1000);

  // menu mobile
  const burger = $('#burger');
  const menu = $('#menu');
  burger.addEventListener('click', () => (document.body.classList.contains('menu-open') ? closeMenu() : openMenu()));
  function openMenu() {
    document.body.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    lenis.stop();
    gsap.timeline()
      .set(menu, { visibility: 'visible' })
      .to(menu, { clipPath: 'circle(150% at calc(100% - 40px) 40px)', duration: 0.9, ease: 'expo.inOut' })
      .from('.menu__links a', { yPercent: 100, opacity: 0, stagger: 0.06, duration: 0.8, ease: 'expo.out' }, '-=0.45');
  }
  function closeMenu() {
    if (!document.body.classList.contains('menu-open')) return;
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    lenis.start();
    gsap.to(menu, { clipPath: 'circle(0% at calc(100% - 40px) 40px)', duration: 0.7, ease: 'expo.inOut', onComplete: () => gsap.set(menu, { visibility: 'hidden' }) });
  }
}

/* --------------------------------------------------------------------------
   Projets : scroll horizontal (desktop) / empilé (mobile)
   -------------------------------------------------------------------------- */
function work() {
  const track = $('#workTrack');
  if (!track) return;
  const projects = $$('.project', track);
  const idxEl = $('#workIdx');
  const bar = $('#workBar');
  const mm = gsap.matchMedia();

  mm.add('(min-width: 900px)', () => {
    const dist = () => track.scrollWidth - window.innerWidth;
    const tween = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.work',
        pin: true,
        start: 'top top',
        end: () => '+=' + dist(),
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          bar.style.transform = `scaleX(${self.progress})`;
          const x = self.progress * dist() + window.innerWidth * 0.5;
          let idx = 0;
          projects.forEach((p, i) => { if (p.offsetLeft <= x) idx = i + 1; });
          idxEl.textContent = String(idx).padStart(2, '0');
          scene?.setOffset((0.5 - self.progress) * 5);
        },
        onLeave: () => scene?.setOffset(0),
        onLeaveBack: () => scene?.setOffset(0),
      },
    });

    projects.forEach((p) => {
      gsap.from($$('.project__info > *', p), {
        y: 70, opacity: 0, duration: 1.1, stagger: 0.07, ease: 'power4.out',
        scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 70%', toggleActions: 'play none none reverse' },
      });
      gsap.fromTo($('.project__visual', p),
        { rotateY: -28, rotateX: 6, xPercent: 18, scale: 0.88, opacity: 0.3 },
        { rotateY: 0, rotateX: 0, xPercent: 0, scale: 1, opacity: 1, ease: 'none',
          scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left right', end: 'center 55%', scrub: true } });
    });
    gsap.from('.work__outro > *', {
      y: 60, opacity: 0, stagger: 0.1, duration: 1, ease: 'power4.out',
      scrollTrigger: { trigger: '.work__outro', containerAnimation: tween, start: 'left 75%', toggleActions: 'play none none reverse' },
    });
  });

  mm.add('(max-width: 899px)', () => {
    projects.forEach((p) => {
      gsap.from($$('.project__info > *', p), {
        y: 40, opacity: 0, duration: 1, stagger: 0.06, ease: 'power3.out',
        scrollTrigger: { trigger: $('.project__info', p), start: 'top 85%' },
      });
      gsap.from($('.window', p), {
        y: 60, rotateX: 18, opacity: 0, duration: 1.2, ease: 'power3.out', transformPerspective: 900,
        scrollTrigger: { trigger: p, start: 'top 85%' },
      });
    });
  });

  // inclinaison 3D des fenêtres
  if (!isTouch) {
    $$('[data-tilt]').forEach((el) => {
      const win = $('.window', el);
      const rx = gsap.quickTo(win, 'rotationX', { duration: 0.9, ease: 'power3.out' });
      const ry = gsap.quickTo(win, 'rotationY', { duration: 0.9, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * 14);
        rx(-(py - 0.5) * 10);
        win.style.setProperty('--gx', `${px * 100}%`);
        win.style.setProperty('--gy', `${py * 100}%`);
      });
      el.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }
}

/* --------------------------------------------------------------------------
   Révélations au scroll
   -------------------------------------------------------------------------- */
function reveals() {
  $$('.h2, .contact__title').forEach((h) => {
    gsap.from($$('.ln > span', h), {
      yPercent: 115, rotate: 3, duration: 1.3, stagger: 0.09, ease: 'expo.out',
      scrollTrigger: { trigger: h, start: 'top 85%' },
    });
  });

  $$('.section-label, .section-intro').forEach((l) => {
    gsap.from(l, { opacity: 0, y: 20, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: l, start: 'top 90%' } });
  });

  // manifeste mot à mot
  if (manifestoWords.length) {
    gsap.fromTo(manifestoWords, { opacity: 0.1 }, {
      opacity: 1, stagger: 0.05, ease: 'none',
      scrollTrigger: { trigger: '.manifesto__text', start: 'top 78%', end: 'bottom 50%', scrub: true },
    });
  }
  if ($('.manifesto__more')) {
    gsap.from('.manifesto__photo', { clipPath: 'inset(100% 0 0 0)', duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.manifesto__more', start: 'top 80%' } });
    gsap.from('.manifesto__photo img', { scale: 1.25, duration: 1.8, ease: 'expo.out', clearProps: 'transform', scrollTrigger: { trigger: '.manifesto__more', start: 'top 80%' } });
    gsap.from('.manifesto__rest p', { y: 40, opacity: 0, stagger: 0.12, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.manifesto__more', start: 'top 80%' } });
  }

  // compteurs
  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count;
    const o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 2.4, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString(data.locale === 'en' ? 'en-US' : 'fr-FR'); } }),
    });
  });
  gsap.from('.stat', { y: 50, opacity: 0, stagger: 0.1, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.stats', start: 'top 85%' } });

  // compétences + terminal
  gsap.from('.skills > div', { x: -40, opacity: 0, stagger: 0.08, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.skills', start: 'top 85%' } });
  gsap.from('.terminal', { y: 80, opacity: 0, rotateX: 12, transformPerspective: 1000, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.terminal', start: 'top 85%' } });

  // parcours
  gsap.fromTo('.journey__line span', { scaleY: 0 }, {
    scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: '.journey__list', start: 'top 65%', end: 'bottom 65%', scrub: true },
  });
  $$('.job').forEach((j) => {
    gsap.from(j.children, { y: 50, opacity: 0, duration: 1.1, stagger: 0.07, ease: 'power3.out', scrollTrigger: { trigger: j, start: 'top 82%' } });
    ScrollTrigger.create({ trigger: j, start: 'top 65%', end: 'bottom 65%', toggleClass: 'is-active' });
  });
  gsap.from('.edu__item', { y: 40, opacity: 0, stagger: 0.12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.edu', start: 'top 88%' } });

  // services
  gsap.from('.service', { y: 90, opacity: 0, stagger: 0.1, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.services__grid', start: 'top 82%' } });
  $$('[data-spotlight]').forEach((c) => {
    c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', `${e.clientX - r.left}px`);
      c.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  // formations, vidéos
  gsap.from('.academy__row', { y: 40, opacity: 0, stagger: 0.07, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.academy__list', start: 'top 85%' } });
  gsap.from('.video', { y: 70, opacity: 0, stagger: 0.12, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.yt__grid', start: 'top 85%' } });
  gsap.from('.yt__subs', { scale: 0.8, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.yt__subs', start: 'top 90%' } });

  // contact
  gsap.from('.contact__actions > *', { y: 40, opacity: 0, stagger: 0.07, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.contact__grid', start: 'top 85%' } });
  gsap.from('.form', { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.form', start: 'top 88%' } });
  gsap.from('.socials li', { y: 30, opacity: 0, stagger: 0.06, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.socials', start: 'top 92%' } });

  // nom géant du footer : ajusté à la largeur puis rempli au scroll
  const giant = $('.footer__giant');
  if (giant) {
    const fitGiant = () => {
      giant.style.fontSize = '100px';
      giant.style.fontSize = `${(giant.parentElement.clientWidth / giant.scrollWidth) * 100}px`;
    };
    fitGiant();
    window.addEventListener('resize', fitGiant);
    gsap.fromTo(giant, { '--p': '0%' }, {
      '--p': '100%', ease: 'none',
      scrollTrigger: { trigger: giant, start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
    gsap.from(giant, { yPercent: 40, ease: 'none', scrollTrigger: { trigger: giant, start: 'top bottom', end: 'bottom bottom', scrub: true } });
  }

  // hero : parallaxe de sortie
  gsap.to('.hero__title', {
    yPercent: -18, opacity: 0.15, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
}

/* --------------------------------------------------------------------------
   Bandes défilantes pilotées par la vitesse du scroll
   -------------------------------------------------------------------------- */
function marquees() {
  $$('.marquee').forEach((m) => {
    const inner = $('.marquee__inner', m);
    inner.innerHTML += inner.innerHTML + inner.innerHTML;
    const dir = +m.dataset.dir || 1;
    let x = 0;
    let boost = 0;
    let sign = 1;
    gsap.ticker.add((t, dt) => {
      const w = inner.scrollWidth / 3;
      if (!w) return;
      const v = lenis.velocity || 0;
      boost += (Math.min(Math.abs(v), 60) * 0.12 - boost) * 0.08;
      if (Math.abs(v) > 0.5) sign = Math.sign(v);
      x -= (1 + boost) * dir * sign * dt * 0.06;
      if (x <= -w) x += w;
      if (x > 0) x -= w;
      inner.style.transform = `translate3d(${x}px,0,0)`;
    });
  });
}

/* --------------------------------------------------------------------------
   Scène ↔ sections
   -------------------------------------------------------------------------- */
function sceneTriggers() {
  if (!scene) return;
  $$('[data-scene]').forEach((sec) => {
    const st = SCENES[sec.dataset.scene];
    if (!st) return;
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => { if (self.isActive) scene.go(st); },
    });
  });
}

/* --------------------------------------------------------------------------
   YouTube : la vidéo n'est chargée qu'au clic (performance, sans cookies)
   -------------------------------------------------------------------------- */
function youtubeLite() {
  $$('.yt-lite').forEach((button) => {
    button.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${button.dataset.videoId}?autoplay=1&rel=0`;
      iframe.title = button.dataset.videoTitle ?? 'YouTube';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      button.replaceWith(iframe);
    });
  });
}

/* --------------------------------------------------------------------------
   Contact : copie de l'email + formulaire (WhatsApp ou messagerie, sans backend)
   -------------------------------------------------------------------------- */
function contact() {
  const btn = $('#copyEmail');
  btn?.addEventListener('click', async () => {
    const email = btn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      toast(FX.copied);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });

  const form = $('#contact-form');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const fd = new FormData(form);
    const { email, whatsapp, greeting, signature } = form.dataset;
    const field = (name) => String(fd.get(name) ?? '').trim();
    const subject = field('subject');
    const body = [greeting, '', field('message'), '', `${signature} ${field('name')} (${field('email')})`].join('\n');
    if (event.submitter?.value === 'email') {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else {
      window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(`*${subject}*\n\n${body}`)}`, '_blank', 'noopener');
    }
  });
}

/* --------------------------------------------------------------------------
   Easter eggs
   -------------------------------------------------------------------------- */
let palette = 'signal';
function setTogo(on) {
  palette = on ? 'togo' : 'signal';
  scene?.setPalette(palette);
  const root = document.documentElement.style;
  root.setProperty('--accent', on ? '#ffce00' : '#ffc53d');
  root.setProperty('--accent-2', on ? '#e8112d' : '#ff4d2e');
  root.setProperty('--ok', on ? '#00a86b' : '#3ddc97');
}

function easterEggs() {
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let k = 0;
  window.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select')) return;
    k = e.key === KONAMI[k] ? k + 1 : (e.key === KONAMI[0] ? 1 : 0);
    if (k === KONAMI.length) {
      k = 0;
      setTogo(palette !== 'togo');
      toast(palette === 'togo' ? FX.togoOn : FX.togoOff);
    }
  });

  console.log(
    `%c FT %c ${data.locale === 'en' ? 'Digging through the code? We should talk.' : 'Tu fouilles le code ? On devrait parler.'} → ${data.email}`,
    'background:#ffc53d;color:#000;font-weight:800;padding:4px 6px;border-radius:4px',
    'color:#ffc53d;padding:4px'
  );
}

/* --------------------------------------------------------------------------
   Terminal
   -------------------------------------------------------------------------- */
function terminal() {
  const root = $('#terminal');
  if (!root) return;
  const term = initTerminal({
    root,
    data,
    onHire: () => {
      toast(FX.hired);
      lenis.scrollTo('#contact', { duration: 2.2 });
    },
    onTogo: () => setTogo(true),
    onSignal: () => setTogo(false),
  });
  ScrollTrigger.create({ trigger: root, start: 'top 70%', once: true, onEnter: () => setTimeout(() => term.demo(), 700) });
}

/* --------------------------------------------------------------------------
   Démarrage
   -------------------------------------------------------------------------- */
(async function boot() {
  await Promise.all([runLoader(), bootScene(), document.fonts.ready]);

  fitHero();
  window.addEventListener('resize', fitHero);
  cursor();
  magnetic();
  scrambleLinks();
  nav();
  heroWeight();
  work();          // le pin doit être créé avant les autres déclencheurs
  reveals();
  marquees();
  sceneTriggers();
  youtubeLite();
  contact();
  terminal();
  easterEggs();

  scene?.go(SCENES.hero);
  intro();

  let rw = window.innerWidth;
  window.addEventListener('resize', () => {
    if (Math.abs(window.innerWidth - rw) > 80) { rw = window.innerWidth; ScrollTrigger.refresh(); }
  });
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
