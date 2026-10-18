// Ayudas del exportador de trailers (scripts/trailer-export.mjs): ffmpeg y medición. Sin dependencias de la app.
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/** Normalización de volumen para redes y email: −14 LUFS integrado, techo −1,5 dBTP. */
export const LOUDNORM = "loudnorm=I=-14:TP=-1.5:LRA=11";

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

/** Versión liviana para email: 720p a 30 fps con la tasa de bits justa para pesar menos de `maxMB` (2 pasadas). */
export async function emailVersion({ input, out, maxMB = 9.5 }) {
  const secs = duration(input);
  const kbps = Math.floor((maxMB * 8192) / secs) - 112; // presupuesto total menos el audio
  const common = ["-i", input, "-vf", "scale=1280:-2,fps=30", "-c:v", "libx264", "-preset", "slow", "-b:v", `${kbps}k`, "-maxrate", `${Math.floor(kbps * 1.3)}k`, "-bufsize", `${kbps * 2}k`, "-pix_fmt", "yuv420p"];
  const log = path.join(os.tmpdir(), `trailer-pass-${process.pid}`);
  await run([...common, "-pass", "1", "-passlogfile", log, "-an", "-f", "mp4", "/dev/null"]);
  await run([...common, "-pass", "2", "-passlogfile", log, "-c:a", "aac", "-b:a", "112k", "-movflags", "+faststart", out]);
  for (const f of fs.readdirSync(os.tmpdir()).filter((x) => x.startsWith(`trailer-pass-${process.pid}`))) fs.rmSync(path.join(os.tmpdir(), f));
  return fs.statSync(out).size / 1048576;
}
