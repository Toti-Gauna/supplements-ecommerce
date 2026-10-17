import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(scriptDir, '../docs/img/rediseno/carrusel');
const url = process.env.CAROUSEL_URL || 'http://localhost:4173/supplements-ecommerce/';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || '/usr/bin/chromium';
fs.mkdirSync(root, {recursive:true});
const phase = process.argv[2] || 'antes';
(async () => {
 const browser = await chromium.launch({executablePath,headless:true,args:['--no-sandbox']});
 let photo;
 if (!process.argv.includes('--metrics-only')) for (const [width,height] of [[1440,900],[390,844]]) for (const [mode,label] of [['dark','oscuro'],['light','claro']]) {
  const context = await browser.newContext({viewport:{width,height},reducedMotion:'reduce',deviceScaleFactor:1});
  await context.addInitScript(mode => {localStorage.setItem('volta-theme', mode);localStorage.setItem('volta-demo:theme-preview',JSON.stringify({state:{previewId:'original'},version:0}));sessionStorage.setItem('volta-demo:splash-seen','1');},mode);
  const page = await context.newPage();
  for (const [route,labelRoute] of [['','inicio'],['admin-demo/contenido/carrusel/','editor']]) {
   await page.goto(url+route);
   await page.waitForLoadState('networkidle');
   await page.screenshot({path:`${root}/${phase}-${labelRoute}-${width}-${label}.png`});
   if (phase === 'despues' && !route && width === 1440 && !photo) photo = await page.locator('svg.rack-shot').first().screenshot();
   if(route) { await page.locator('#hero-form-title').scrollIntoViewIfNeeded();await page.screenshot({path:`${root}/${phase}-editor-controles-${width}-${label}.png`}); }
  }
  if (phase === 'despues' && photo) {
   await page.getByLabel('Subir imagen propia', {exact:true}).setInputFiles({name:'rack.png',mimeType:'image/png',buffer:photo});
   await page.getByRole('textbox', {name:'Texto alternativo',exact:true}).fill('Envase en el rack con luz de estudio');
   await page.getByRole('slider', {name:'Acercar',exact:true}).press('ArrowRight');
   await page.locator('[data-hero-preview]').scrollIntoViewIfNeeded();
   await page.screenshot({path:`${root}/despues-imagen-propia-editor-${width}-${label}.png`});
   await page.getByRole('slider', {name:'Acercar',exact:true}).scrollIntoViewIfNeeded();
   await page.screenshot({path:`${root}/despues-encuadre-${width}-${label}.png`});
   await page.getByRole('button', {name:'Guardar carrusel'}).click();
   await page.goto(url);await page.waitForLoadState('networkidle');
   await page.screenshot({path:`${root}/despues-imagen-propia-inicio-${width}-${label}.png`});
  }
  await context.close();
 }
 if (process.argv.includes('--capture-only')) { await browser.close(); return; }
 const samples=[];
 for(let i=0;i<7;i++) {
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:'no-preference'});
  await context.addInitScript(() => {
   sessionStorage.setItem('volta-demo:splash-seen','1');localStorage.setItem('volta-demo:theme-preview',JSON.stringify({state:{previewId:'original'},version:0}));
   window.__metrics={lcp:0,cls:0};
   new PerformanceObserver(list=>{for(const e of list.getEntries())window.__metrics.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
   new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__metrics.cls+=e.value;}).observe({type:'layout-shift',buffered:true});
  });
  const page=await context.newPage();const cdp=await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  await page.goto(url);await page.waitForTimeout(2500);
  samples.push(await page.evaluate(()=>({...window.__metrics,fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime})));
  await context.close();
 }
 const median=key=>[...samples].sort((a,b)=>a[key]-b[key])[3][key];
 const result={phase,viewport:'390×844',cpu:4,cache:'disabled',network:'local static export; no network throttle',splash:'already seen',samples,median:{lcp:median('lcp'),cls:median('cls'),fcp:median('fcp')}};
 fs.writeFileSync(`${root}/rendimiento-${phase}.json`,JSON.stringify(result,null,2)+'\n');console.log(result);
 await browser.close();
})();
