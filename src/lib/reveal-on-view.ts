/*
  CSS-reveals bij in beeld komen (styles in src/assets/global.css):
  - `main img`                → .fade-on-view
  - [data-stagger-on-view]    → .stagger-on-view-item met --stagger-index
  - [data-reveal-children] / [data-reveal-on-view] → .reveal-on-view

  Init op `astro:page-load` (en DOMContentLoaded bij de eerste load, want Astro
  vuurt de eerste page-load pas na window.load). Wat bij init al in beeld staat,
  onthult via whenPageReady(): bij een navigatie pas na `page:transition-end`.
  Observers worden opgeruimd op `astro:before-swap`.
*/
import { isInInitialView, prefersReducedMotion, whenPageReady } from './gsap-inview';

const IO_OPTIONS: IntersectionObserverInit = { threshold: 0.12, rootMargin: '0px 0px -8% 0px' };
const IMG_IO_OPTIONS: IntersectionObserverInit = { threshold: 0.15, rootMargin: '0px 0px -8% 0px' };

const observers: IntersectionObserver[] = [];

function observeOnce(options: IntersectionObserverInit) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, options);
  observers.push(io);
  return io;
}

/** Direct onthullen als het al in beeld staat, anders bij scrollen. */
function revealWhenVisible(el: Element, io: IntersectionObserver) {
  if (isInInitialView(el)) {
    whenPageReady(() => el.classList.add('is-visible'));
    return;
  }
  io.observe(el);
}

const hasIO = () => 'IntersectionObserver' in window;

function initImageFadeInOnView() {
  if (prefersReducedMotion()) return;

  const processed = 'data-fade-on-view-ready';
  const images = document.querySelectorAll(
    `main img:not([${processed}]):not([data-no-fade-on-view])`,
  );
  if (!images.length) return;

  if (!hasIO()) {
    images.forEach((img) => {
      img.setAttribute(processed, 'true');
      img.classList.add('fade-on-view', 'is-visible');
    });
    return;
  }

  const io = observeOnce(IMG_IO_OPTIONS);
  images.forEach((img) => {
    img.setAttribute(processed, 'true');
    img.classList.add('fade-on-view');
    revealWhenVisible(img, io);
  });
}

function getStaggerTargets(container: Element) {
  const selector = container.getAttribute('data-stagger-selector');
  if (selector) {
    try {
      const selected = Array.from(container.querySelectorAll(selector));
      if (selected.length) return selected;
    } catch {}
  }
  return Array.from(container.children);
}

function initStaggerOnView() {
  const processed = 'data-stagger-ready';
  const containers = document.querySelectorAll(`[data-stagger-on-view]:not([${processed}])`);
  if (!containers.length) return;

  const instant = prefersReducedMotion() || !hasIO();
  const io = instant ? null : observeOnce(IO_OPTIONS);

  containers.forEach((container) => {
    getStaggerTargets(container).forEach((target, index) => {
      target.classList.add('stagger-on-view-item');
      (target as HTMLElement).style.setProperty('--stagger-index', String(index));
    });
    container.setAttribute(processed, 'true');

    if (io) revealWhenVisible(container, io);
    else container.classList.add('is-visible');
  });
}

function initRevealOnView() {
  const processed = 'data-reveal-ready';
  const containerProcessed = 'data-reveal-container-ready';

  document
    .querySelectorAll(`[data-reveal-children]:not([${containerProcessed}])`)
    .forEach((container) => {
      const selector = container.getAttribute('data-reveal-children') || ':scope > *';
      const step = Number(container.getAttribute('data-reveal-step') || 0);
      let items: Element[];
      try {
        items = Array.from(container.querySelectorAll(selector));
      } catch {
        items = Array.from(container.children);
      }

      items.forEach((item, index) => {
        item.classList.add('reveal-on-view');
        item.setAttribute('data-reveal-on-view', '');
        if (step > 0) (item as HTMLElement).style.setProperty('--reveal-delay', `${index * step}ms`);
      });
      container.setAttribute(containerProcessed, 'true');
    });

  const targets = document.querySelectorAll(`[data-reveal-on-view]:not([${processed}])`);
  if (!targets.length) return;

  const instant = prefersReducedMotion() || !hasIO();
  const io = instant ? null : observeOnce(IO_OPTIONS);

  targets.forEach((target) => {
    target.setAttribute(processed, 'true');
    if (io) revealWhenVisible(target, io);
    else target.classList.add('is-visible');
  });
}

function init() {
  initImageFadeInOnView();
  initStaggerOnView();
  initRevealOnView();
}

function cleanup() {
  observers.splice(0).forEach((io) => io.disconnect());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', cleanup);
