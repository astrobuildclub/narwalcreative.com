/*
  Lenis smooth scroll, gekoppeld aan de GSAP-ticker en ScrollTrigger.

  Eén instantie voor de hele ClientRouter-levensduur (zie _standards/TRANSITIONS.md §4):
  - astro:before-preparation → stop(): geen scroll-inertie tijdens het wisselen.
  - astro:page-load          → start() + resize() + ScrollTrigger.refresh().
  De scrollpositie zet Astro zelf (boven bij vooruit, hersteld bij terug); Lenis
  neemt die over via zijn native scroll-listener, dus geen eigen scrollTo hier.

  Bewust géén onLeave-hook uit page-transitions.ts: elke hook schakelt de CSS
  view transition uit. En géén autoToggle: die werkt via inline overflow en
  classes op <html>, en Astro vervangt de attributen van <html> bij elke swap.
  stop()/start() zetten de lenis-classes zelf terug.
*/
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(0);

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

const lenis = new Lenis({
  autoRaf: false,
  anchors: true,
  allowNestedScroll: true,
  stopInertiaOnNavigate: true,
});
window.__lenis = lenis;

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));

document.addEventListener('astro:before-preparation', () => lenis.stop());
document.addEventListener('astro:page-load', () => {
  lenis.start();
  // Na de swap is de pagina-hoogte anders; wacht één frame op de layout.
  requestAnimationFrame(() => {
    lenis.resize();
    ScrollTrigger.refresh();
  });
});

export function getLenis() {
  return lenis;
}
