export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isInInitialView(el: Element) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < vh * 0.92 && rect.bottom > 0;
}

/**
 * Voer `fn` uit zodra de pagina klaar is om te tonen:
 * - tijdens een ClientRouter-navigatie (`data-navigating` op <html>, gezet door
 *   page-transitions.ts) pas na `page:transition-end`;
 * - tijdens de intro bij de eerste load (`data-intro=""`, Intro.astro) pas
 *   wanneer de overlay begint weg te faden (`intro:leave`).
 * Zo onthult content boven de vouw niet al achter de transitie of de intro.
 */
export function whenPageReady(fn: () => void) {
  const root = document.documentElement;
  const waitFor = root.hasAttribute('data-navigating')
    ? 'page:transition-end'
    : root.getAttribute('data-intro') === ''
      ? 'intro:leave'
      : null;

  if (waitFor) document.addEventListener(waitFor, () => fn(), { once: true });
  else fn();
}

export function createInViewController() {
  const observers: IntersectionObserver[] = [];

  function playWhenVisible(el: Element, play: () => void) {
    const run = () => {
      if (!document.contains(el)) return;
      play();
    };

    if (!('IntersectionObserver' in window) || isInInitialView(el)) {
      whenPageReady(run);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        run();
      },
      {
        threshold: 0,
        rootMargin: '0px 0px -8% 0px',
      },
    );

    io.observe(el);
    observers.push(io);
  }

  function cleanup() {
    observers.forEach((observer) => observer.disconnect());
    observers.length = 0;
  }

  return { playWhenVisible, cleanup };
}
