import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Alterna ambas versiones en el mismo navegador para controlar la variación de carga de la máquina.
const urls = {
  antes: process.env.CAROUSEL_URL_BEFORE || 'http://localhost:4174/supplements-ecommerce/',
  despues: process.env.CAROUSEL_URL_AFTER || 'http://localhost:4173/supplements-ecommerce/',
};
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
async function measure(url) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  await context.addInitScript(() => {
    sessionStorage.setItem('volta-demo:splash-seen', '1');
    localStorage.setItem('volta-demo:theme-preview', JSON.stringify({ state: { previewId: 'original' }, version: 0 }));
    window.__metrics = { lcp: 0, cls: 0 };
    new PerformanceObserver((list) => { for (const e of list.getEntries()) window.__metrics.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__metrics.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await page.goto(url);
  await page.waitForTimeout(2500);
  const metrics = await page.evaluate(() => ({ ...window.__metrics, fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime }));
  await context.close();
  return metrics;
}
const warmup = {};
for (const phase of ['antes', 'despues']) warmup[phase] = await measure(urls[phase]);
const count = 15;
const samples = [];
for (let i = 0; i < count; i++) {
  const sample = { iteration: i + 1 };
  for (const phase of i % 2 ? ['despues', 'antes'] : ['antes', 'despues']) sample[phase] = await measure(urls[phase]);
  samples.push(sample);
}
const median = (phase, key) => [...samples].sort((a, b) => a[phase][key] - b[phase][key])[Math.floor(count / 2)][phase][key];
const result = {
  measuredAt: new Date().toISOString(), browser: browser.version(), baselineCommit: process.env.CAROUSEL_BASE_SHA,
  viewport: '390×844', cpu: 4, cache: 'disabled in every context', network: 'local static exports; no network throttle',
  splash: 'already seen', method: '15 alternating pairs after one warmup visit per version; fresh context per visit; 2500ms after load',
  urls, warmup, samples,
  median: Object.fromEntries(['antes', 'despues'].map((phase) => [phase, Object.fromEntries(['lcp', 'fcp', 'cls'].map((key) => [key, median(phase, key)]))])),
};
const output = path.join(path.dirname(fileURLToPath(import.meta.url)), '../docs/img/rediseno/carrusel/rendimiento-pareado.json');
fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
console.log(result.median);
await browser.close();
