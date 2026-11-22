/**
 * QPC Mouse Tail — muovendo il puntatore cadono gli archetipi.
 *
 * Markup atteso:
 *   <section class="qpc-mouse-tail">…contenuto…</section>
 *
 * Ogni volta che il puntatore percorre un tratto (larghezza / step) cade un
 * archetipo: entra con un rimbalzo elastico, prende la spinta laterale dal
 * movimento, arriva sul fondo, rimbalza ed esce. Gli archetipi si alternano
 * in ordine.
 *
 * Le misure sono quelle della sezione, non della finestra: a tutta pagina è
 * lo stesso, incorporata in una pagina funziona lo stesso.
 *
 * gsap è globale: dalla CDN su CodePen, iniettato da webpack nella build del sito.
 */

/**
 * Monta il mouse tail
 * @param {Object} opts
 * @param {{ items: Array }} opts.archetipi - da loadArchetipi()
 * @param {Element} [opts.el] - .qpc-mouse-tail (default: il primo della pagina)
 * @param {number} [opts.step=8] - cade un archetipo ogni larghezza/step px di movimento
 * @param {number} [opts.stepTouch=6] - lo stesso sugli schermi touch: serve meno strada
 * @param {number} [opts.margin=200] - più vicino di così al fondo non cade niente, in px
 * @returns {Element} el
 */
export function createMouseTail({ archetipi, el, step = 8, stepTouch = 6, margin = 200 } = {}) {
  if (!el) mos('.qpc-mouse-tail', s => { el ||= s; }); // il primo della pagina

  const srcs = archetipi.items.map(it => it.src);
  srcs.forEach(src => { new Image().src = src; }); // precaricate: la prima caduta non aspetta la rete

  const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
  const divisor = window.matchMedia('(hover: none)').matches ? stepTouch : step;

  let incr = 0;
  let oldX = 0;
  let oldY = 0;
  let first = true;
  let index = 0;

  function move(clientX, clientY) {
    if (rm.matches) return;

    // lette a ogni movimento e non una volta sola: dopo un resize restano giuste
    const box = el.getBoundingClientRect();
    const x = gsap.utils.clamp(0, box.width, clientX - box.left);
    const y = gsap.utils.clamp(0, box.height, clientY - box.top);

    if (first) {
      first = false;
      oldX = x;
      oldY = y;
      return;
    }

    incr += Math.abs(x - oldX) + Math.abs(y - oldY);

    if (incr > box.width / divisor) {
      incr = 0;
      drop(x, y, x - oldX, box.height);
    }

    oldX = x;
    oldY = y;
  }

  // uscendo (o staccando il dito) si riparte da capo: rientrando da un punto
  // lontano, la distanza "saltata" farebbe cadere subito un archetipo lanciato di lato
  function reset() {
    first = true;
    incr = 0;
  }

  function drop(x, y, deltaX, H) {
    if (y > H - margin) return;

    const image = document.createElement('img');
    image.src = srcs[index];
    image.alt = '';
    image.draggable = false;
    image.className = 'qpc-mouse-tail__media';
    index = (index + 1) % srcs.length;
    el.appendChild(image);

    const tl = gsap.timeline({ onComplete: () => image.remove() });

    // entra: più grande e un po' ruotato, poi si assesta con un rimbalzo elastico
    tl.fromTo(image, {
      xPercent: -50 + (Math.random() - 0.5) * 80,
      yPercent: -50 + (Math.random() - 0.5) * 10,
      scaleX: 1.3,
      scaleY: 1.3,
      rotation: (Math.random() - 0.5) * 20,
    }, {
      scaleX: 1,
      scaleY: 1,
      ease: 'elastic.out(2, 0.6)',
      duration: 0.4,
    });

    // la spinta laterale è il doppio dell'ultimo movimento del puntatore
    tl.fromTo(image, { x }, {
      x: '+=' + deltaX * 2,
      rotation: 0,
      ease: 'power1.in',
      duration: 0.4,
    }, '<');

    // cade: il bordo basso si ferma esattamente sul fondo, insieme allo scale 0.9
    tl.fromTo(image, { y }, {
      y: '+=' + (H - y),
      scale: 0.9,
      yPercent: -95,
      ease: 'back.in(1.1)',
      duration: 0.4,
    }, '<');

    // rimbalza ed esce: più è caduto dall'alto, più lo slancio
    tl.to(image, {
      x: '+=' + deltaX * 1.6,
      rotation: (Math.random() - 0.5) * 40,
      ease: 'power1.in',
      duration: 0.3,
    });
    tl.to(image, {
      yPercent: 150,
      ease: 'back.in(' + (1.5 + (1 - y / H)) + ')',
      duration: 0.3,
    }, '<');
  }

  el.addEventListener('mousemove', e => move(e.clientX, e.clientY));
  el.addEventListener('mouseleave', reset);
  ['touchstart', 'touchmove'].forEach(type => el.addEventListener(type, e => {
    const touch = e.touches[0];
    if (touch) move(touch.clientX, touch.clientY);
  }, { passive: true }));
  el.addEventListener('touchend', reset, { passive: true });

  return el;
}
