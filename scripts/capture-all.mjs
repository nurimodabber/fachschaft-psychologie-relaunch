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
    await new Promise(r => setTimeout(r, 500));
    await capture('preview_hero_desktop.png', { x: 0, y: 0, width: 1366, height: 820, scale: 2 });

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

    const mapRectRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const r = document.querySelector('.mapwrap').getBoundingClientRect();
          return JSON.stringify({ x: Math.max(0, r.left), y: Math.max(0, r.top), width: Math.round(r.width), height: Math.round(r.height) });
        })()
      `
    });
    const mapRect = JSON.parse(mapRectRes.result?.value || mapRectRes.result?.description || '{}');
    if(mapRect.width && mapRect.height){
      await capture('preview_map_zoomed.png', {
        x: mapRect.x,
        y: mapRect.y,
        width: mapRect.width,
        height: mapRect.height,
        scale: 2
      });
    } else {
      await capture('preview_map_zoomed.png');
    }

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
