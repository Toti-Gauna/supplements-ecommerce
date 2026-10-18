// Ayudas del exportador de trailers (scripts/trailer-export.mjs): ffmpeg y medición. Sin dependencias de la app.
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";

/** Normalización de volumen para redes y email: −14 LUFS integrado, techo −2 dBTP antes del AAC (que suma ≈ 1 dB de pico: queda por debajo de −1). */
export const LOUDNORM = "loudnorm=I=-14:TP=-2:LRA=11";

export function ffmpegAvailable() {
  return spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0;
}

/** Corre ffmpeg y espera a que termine (rechaza con el final del log si falla). */
export function run(args) {
  return new Promise((resolve, reject) => {
    const p = spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => { err += d; });
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg ${code}: ${err.slice(-600)}`))));
  });
}

/** Abre un ffmpeg que recibe cuadros JPEG por stdin (`image2pipe`) y los une con el audio en un MP4 H.264 + AAC. */
export function videoEncoder({ fps, audio, out, crf = 17 }) {
  const args = [
    "-hide_banner", "-loglevel", "error", "-y",
    "-framerate", String(fps), "-f", "image2pipe", "-c:v", "mjpeg", "-i", "-",
    "-i", audio,
    "-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart",
    "-c:a", "aac", "-b:a", "192k", "-shortest", out,
  ];
  const p = spawn("ffmpeg", args, { stdio: ["pipe", "ignore", "pipe"] });
  let err = "";
  p.stderr.on("data", (d) => { err += d; });
  const done = new Promise((resolve, reject) => p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg ${code}: ${err.slice(-600)}`)))));
  return { write: (buf) => new Promise((ok, ko) => { p.stdin.write(buf, (e) => (e ? ko(e) : ok())); }), end: () => { p.stdin.end(); return done; } };
}

/** Duración (s) de un archivo, con ffprobe. */
export function duration(file) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" });
  return Number(r.stdout.trim());
}

/** Versión liviana para email: 720p a 30 fps, calidad constante (CRF 23) con la tasa de bits topada para no pasar de `maxMB`. */
export async function emailVersion({ input, out, maxMB = 9.5 }) {
  const kbps = Math.floor((maxMB * 8192) / duration(input)) - 112; // presupuesto total menos el audio
  await run([
    "-i", input, "-vf", "scale=1280:-2,fps=30", "-c:v", "libx264", "-preset", "slow", "-crf", "23",
    "-maxrate", `${kbps}k`, "-bufsize", `${kbps * 2}k`, "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "112k", "-movflags", "+faststart", out,
  ]);
  return fs.statSync(out).size / 1048576;
}
