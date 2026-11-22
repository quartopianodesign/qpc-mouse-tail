# QPC Mouse Tail

Muovendo il puntatore cadono gli archetipi QPC: entrano con un rimbalzo, prendono la spinta del movimento, toccano il fondo ed escono. Intanto il fondo attraversa la palette, un colore dopo l'altro.
È la terza utility con gli archetipi, dopo [QPC Archetipi](https://github.com/quartopianodesign/qpc-archetipi) e [QPC Marquee](https://github.com/quartopianodesign/qpc-marquee): qui le 24 forme diventano una scia che segue la mano, nata come effetto per il footer del nuovo sito di Quarto Piano.

- **Mouse o dito**: cade un archetipo ogni tratto di movimento (1/8 della larghezza, 1/6 sugli schermi touch)
- **Fondo in fade** fra 7 colori della palette, in un ciclo di 40,5 secondi, circa 5,8 secondi per colore; il testo diventa scuro su giallo e verde
- **Movimento ridotto**: con `prefers-reduced-motion` non cade niente e il fondo resta corallo

## Uso

```html
<section class="qpc-mouse-tail">
  <p><span>Muovi il puntatore</span> <span>e lascia cadere gli archetipi</span></p>
</section>

<script>
  document.addEventListener('DOMContentLoaded', () => {
    QPC.loadArchetipi({ dir: 'archetipi/' })
      .then(archetipi => QPC.mouseTail({ archetipi }))
      .catch(console.error);
  });
</script>
```

Dentro la sezione va il contenuto che si vuole: gli archetipi cadono sopra. `DOMContentLoaded` serve perché lo script inline viene letto prima dello script dell'utility (in `dist/` è `defer`, su CodePen `script.js` sta in fondo): così la chiamata parte quando `QPC` esiste già.

Serve GSAP e un server, anche locale: da `file://` il browser blocca `fetch`.

### Opzioni di `QPC.mouseTail()`

| Opzione | Default | |
| --- | --- | --- |
| `archetipi` | — | il risultato di `QPC.loadArchetipi()` |
| `el` | primo `.qpc-mouse-tail` | la sezione su cui si muove il puntatore |
| `step` | `8` | cade un archetipo ogni larghezza/`step` px di movimento |
| `stepTouch` | `6` | lo stesso sugli schermi touch, dove serve meno strada |
| `margin` | `200` | più vicino di così al fondo non cade niente, in px |

## Come funziona

- **La strada, non il tempo.** Ogni movimento somma la distanza percorsa (in orizzontale e in verticale); quando supera larghezza/`step` cade il prossimo archetipo e il conto riparte. Uscendo dalla sezione o staccando il dito si azzera tutto: rientrando da un punto lontano, la distanza "saltata" farebbe cadere subito un archetipo lanciato di lato.
- **Una timeline GSAP per caduta.** Entrata elastica ingrandita e ruotata, spinta laterale pari al doppio dell'ultimo movimento, caduta con `back.in` fino a far toccare al bordo basso il fondo, rimbalzo ed uscita: più l'archetipo è partito in alto, più lo slancio. A fine timeline l'immagine si rimuove.
- **Misure della sezione, non della finestra.** Larghezza, altezza e posizione del puntatore si leggono a ogni movimento dalla sezione: a tutta pagina è lo stesso, ma funziona anche incorporata in una pagina e dopo un resize.
- **Fondo e testo nella stessa animazione CSS**, così il testo cambia colore insieme al fondo e resta leggibile anche su giallo e verde.

## Struttura

```
src/
  index.html       template unico della pagina
  archetipi/       SVG + index.json (gli stessi di qpc-archetipi)
  js/app.js        entry: API window.QPC + helper mos() + initCode()
  js/modules/      archetipi.js (elenco degli SVG), mouse-tail.js (movimento + cadute),
                   info.js (icona info + modale con il link al repo)
  scss/style.scss  entry: @use di abstracts e components
  scss/abstracts/  _variables (palette), _css-variables (colori della modale), _reset
  scss/components/ un parziale per blocco: _qpc-mouse-tail, _qpc-info
dist/              build del sito (generata, non nel repo)
codepen/           build per CodePen (generata, non nel repo)
```

## Comandi

```bash
npm install
npm run dev     # watch + BrowserSync su localhost:3000 (serve dist/)
npm run build   # dist/ (minificato, gsap incluso) + codepen/ (leggibile, gsap da CDN)
```

## CodePen

`dist/` e `codepen/` non sono nel repo: si generano con `npm install && npm run build`.

`codepen/` contiene i tre file del pen, pronti per CodePen 2.0 o per essere copiati così come sono:

| File | Contenuto |
| --- | --- |
| `index.html` | documento completo: font, `style.css`, gsap dalla CDN, markup, chiamata all'API, `script.js` |
| `style.css` | CSS leggibile, compilato da `src/scss/style.scss` |
| `script.js` | JS leggibile, senza runtime di webpack |

Su CodePen gli SVG arrivano da questo repo via jsDelivr (`dir` nello script di `index.html`).

## Licenza

Codice MIT. Gli archetipi sono parte dell'identità di Quarto Piano Comunicazione. Font: Syne (SIL Open Font License), da Google Fonts.
