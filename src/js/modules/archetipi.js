/**
 * Archetipi QPC — l'elenco delle immagini da far cadere.
 *
 * Gli stessi 24 SVG di qpc-archetipi, letti da una cartella con index.json
 * (locale o remota, es. jsDelivr). Qui servono solo gli indirizzi: gli SVG
 * cadono come immagini, così come sono.
 */

/**
 * Carica l'elenco degli archetipi da una cartella con index.json
 * — [{ "file", "name" }, …]
 *
 * @param {Object} [opts]
 * @param {string} [opts.dir='archetipi/'] - Cartella con index.json e gli SVG
 * @returns {Promise<{ items: Array<{ n, name, src }> }>}
 *
 * @example
 * QPC.loadArchetipi({ dir: 'archetipi/' }).then(archetipi => QPC.mouseTail({ archetipi }));
 */
export async function loadArchetipi({ dir = 'archetipi/' } = {}) {
  const base = dir.replace(/\/?$/, '/');
  const res = await fetch(base + 'index.json');
  if (!res.ok) throw new Error(`${base}index.json: ${res.status}`);
  const manifest = await res.json();

  return {
    items: manifest.map((entry, i) => ({ n: i + 1, name: entry.name, src: base + entry.file })),
  };
}
