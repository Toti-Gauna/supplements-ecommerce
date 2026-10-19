declare global { interface Window { __trailerAudio?: AudioContext } }

/**
 * Safari y Chrome solo dejan crear el audio dentro de un toque. "Ver trailer" (en la tienda) lo crea acá, en su clic, y el reproductor lo
 * toma cuando termina de cargar: así el trailer arranca solo y con sonido. Sin toque previo (un link directo) sigue la puerta de siempre.
 */
export function primeTrailerAudio(): void {
  try {
    window.__trailerAudio ??= new AudioContext({ latencyHint: "playback" });
    void window.__trailerAudio.resume();
  } catch { /* sin audio: el reproductor muestra la puerta */ }
}

/** El contexto creado por el toque, si quedó funcionando; si no, se descarta. */
export async function takePrimedAudio(): Promise<AudioContext | null> {
  const ctx = window.__trailerAudio;
  delete window.__trailerAudio;
  if (!ctx) return null;
  try { await Promise.race([ctx.resume(), new Promise((r) => setTimeout(r, 400))]); } catch { /* se evalúa abajo */ }
  if (ctx.state === "running") return ctx;
  void ctx.close();
  return null;
}
