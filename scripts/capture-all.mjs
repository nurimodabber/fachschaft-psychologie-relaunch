import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = '/Users/nurimilanmodabber/.gemini/antigravity/brain/58906080-e424-4c64-afee-e4e76e7fd6b1';
const PORT = 9229;

async function main(){
  console.log('📸 Starte Google Chrome für Screenshots...');
  const profileDir = `/tmp/chrome-shot-profile-${Date.now()}`;
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    'http://localhost:3000/#/'
  ], { stdio: 'ignore' });

  let listRes = null;
  for(let i=0; i<25; i++){
    await new Promise(r => setTimeout(r, 250));
    try {
      listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      if(listRes.ok) break;
    } catch(e){}
  }
  if(!listRes){
    chrome.kill();
    throw new Error('Chrome Remote Debugging Port nicht erreichbar.');
  }

  try {
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

    let id = 1;
    const callbacks = new Map();
    ws.onmessage = e => {
      const msg = JSON.parse(e.data);
      if(msg.id && callbacks.has(msg.id)){
        const cb = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        cb(msg);
      }
    };

    await new Promise(res => ws.onopen = res);

    function send(method, params = {}){
      return new Promise(resolve => {
        const reqId = id++;
        callbacks.set(reqId, resolve);
        ws.send(JSON.stringify({ id: reqId, method, params }));
      });
    }

    await send('Runtime.enable');
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1366,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false
    });

    await new Promise(r => setTimeout(r, 1200));

    async function capture(filename, clip = null){
      const opts = { format: 'png', quality: 95 };
      if(clip) opts.clip = clip;
      const res = await send('Page.captureScreenshot', opts);
      if(res.result?.data){
        const buf = Buffer.from(res.result.data, 'base64');
        writeFileSync(`${OUT_DIR}/${filename}`, buf);
        console.log(` Saved: ${filename}`);
      }
    }

    // 1. Hero Desktop
    console.log('Capturing Hero Desktop...');
    await send('Runtime.evaluate', { expression: "window.scrollTo(0, 0); document.documentElement.dataset.theme = 'dark';" });
    await capture('preview_hero_desktop.png', { x: 0, y: 0, width: 1366, height: 820, scale: 2 });
    await capture('preview_hero_desktop_fixed.png', { x: 0, y: 0, width: 1366, height: 820, scale: 2 });

    // 1a. Intro Section Desktop (Dark)
    console.log('Capturing Intro Section Desktop...');
    await send('Runtime.evaluate', {
      expression: `
        const introEl = document.querySelector('.sec-intro');
        if(introEl) introEl.scrollIntoView({ behavior: 'instant', block: 'center' });
      `
    });
    await new Promise(r => setTimeout(r, 500));
    await capture('preview_intro_section.png');

    // 1b. Bento Section Desktop (Dark)
    console.log('Capturing Bento Section Desktop (Dark)...');
    await send('Runtime.evaluate', {
      expression: `
        const bentoEl = document.querySelector('.sec-entries') || document.querySelector('.bento3');
        bentoEl.scrollIntoView({ behavior: 'instant', block: 'start' });
      `
    });
    await new Promise(r => setTimeout(r, 600));
    await capture('preview_bento_desktop_dark.png');

    // 1c. Bento Section Desktop (Light)
    console.log('Capturing Bento Section Desktop (Light)...');
    await send('Runtime.evaluate', { expression: "document.documentElement.dataset.theme = 'light';" });
    await new Promise(r => setTimeout(r, 400));
    await capture('preview_bento_desktop_light.png');
    await send('Runtime.evaluate', { expression: "document.documentElement.dataset.theme = 'dark';" });
    await new Promise(r => setTimeout(r, 300));

    // 2. Menu Desktop
    console.log('Capturing Menu Desktop...');
    await send('Runtime.evaluate', { expression: "$('#openMenu').click();" });
    await new Promise(r => setTimeout(r, 600));
    await capture('preview_menu_desktop.png', { x: 0, y: 0, width: 1366, height: 750, scale: 2 });
    await send('Runtime.evaluate', { expression: "$('#drawer').close();" });
    await new Promise(r => setTimeout(r, 400));

    // 3. Menu Mobile
    console.log('Capturing Menu Mobile...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 500));
    await send('Runtime.evaluate', { expression: "$('#openMenu').click();" });
    await new Promise(r => setTimeout(r, 600));
    await capture('preview_menu_mobile.png', { x: 0, y: 0, width: 390, height: 844, scale: 2 });
    await send('Runtime.evaluate', { expression: "$('#drawer').close();" });
    await new Promise(r => setTimeout(r, 400));

    // 4. Map Zoomed (Desktop)
    console.log('Capturing Map Zoomed...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1366,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false
    });
    await new Promise(r => setTimeout(r, 500));
    await send('Runtime.evaluate', {
      expression: `
        const mapEl = document.querySelector('.mapwrap');
        mapEl.scrollIntoView({ behavior: 'instant', block: 'center' });
      `
    });
    // Give Leaflet tiles time to fetch and render
    await new Promise(r => setTimeout(r, 2200));

    // 4a. Map Line Art (Desktop)
    // 4a. Map Line Art (Desktop)
    console.log('Capturing Map Line Art (Desktop)...');
    await capture('preview_map_lineart.png');

    // 4b. Map Karte (Desktop)
    console.log('Capturing Map Karte (Desktop)...');
    await send('Runtime.evaluate', { expression: "document.querySelector('[data-mstyle=\"karte\"]')?.click();" });
    await new Promise(r => setTimeout(r, 1600));
    await capture('preview_map_karte.png');

    // 4c. Map Satellit (Desktop)
    console.log('Capturing Map Satellit (Desktop)...');
    await send('Runtime.evaluate', { expression: "document.querySelector('[data-mstyle=\"satellit\"]')?.click();" });
    await new Promise(r => setTimeout(r, 2200));
    await capture('preview_map_satellit.png');

    // Switch back to Line Art
    await send('Runtime.evaluate', { expression: "document.querySelector('[data-mstyle=\"lineart\"]')?.click();" });
    await new Promise(r => setTimeout(r, 800));

    // 4d. Map Mobile
    console.log('Capturing Map Mobile (390px)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 800));
    await send('Runtime.evaluate', {
      expression: `
        const m = document.querySelector('.mapwrap');
        m.scrollIntoView({ behavior: 'instant', block: 'center' });
      `
    });
    await new Promise(r => setTimeout(r, 1200));
    await capture('preview_map_mobile.png');

    // Restore Desktop Metrics
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1366,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false
    });
    await new Promise(r => setTimeout(r, 400));

    // 5. Subpage Desktop (#/studium)
    console.log('Capturing Subpage Desktop (#/studium)...');
    await send('Runtime.evaluate', { expression: "window.location.hash = '#/studium'; window.scrollTo(0, 0);" });
    await new Promise(r => setTimeout(r, 1000));
    await capture('preview_subpage_desktop.png', { x: 0, y: 0, width: 1366, height: 900, scale: 2 });

    console.log(' Alle Screenshots erfolgreich erstellt!');
    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
