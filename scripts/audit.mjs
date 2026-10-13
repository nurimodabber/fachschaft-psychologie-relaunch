import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

const AXE_SRC = readFileSync(new URL('./axe.min.js', import.meta.url), 'utf8');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3000/';
const ROUTES = [
  { name: 'Startseite', hash: '#/' },
  { name: 'Infos zum Studium', hash: '#/studium' },
  { name: 'Kontakt & Anfahrt', hash: '#/fachschaft/kontakt' },
  { name: 'Aktuelles', hash: '#/aktuelles' }
];

async function main(){
  console.log('🚀 Starte Google Chrome Headless für axe-core Audit...');
  const profileDir = `/tmp/chrome-test-profile-${Date.now()}`;
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    'http://localhost:3000/#/'
  ], { stdio: 'ignore' });

  // Retry fetching until Chrome is ready
  let listRes = null;
  for(let i=0; i<20; i++){
    await new Promise(r => setTimeout(r, 300));
    try {
      listRes = await fetch('http://127.0.0.1:9222/json/list');
      if(listRes.ok) break;
    } catch(e){}
  }
  if(!listRes) throw new Error('Chrome Remote Debugging Port nicht erreichbar.');
  try {
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
    const tabWsUrl = pageTab?.webSocketDebuggerUrl;
    if(!tabWsUrl) throw new Error('Kein Chrome DevTools Tab gefunden.');

    const ws = new WebSocket(tabWsUrl);
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
    // Wait for initial load
    await new Promise(r => setTimeout(r, 1000));

    console.log('🧭 Teste Seiten in Dark und Light Mode sowie Menü-Drawer...\n');
    const results = [];

    const THEMES = [
      { name: 'Dunkel (Standard)', code: "document.documentElement.dataset.theme = 'dark';" },
      { name: 'Hell', code: "document.documentElement.dataset.theme = 'light';" }
    ];

    for(const theme of THEMES){
      await send('Runtime.evaluate', { expression: theme.code });
      for(const route of ROUTES){
        // Navigate via hash change
        await send('Runtime.evaluate', {
          expression: `window.location.hash = ${JSON.stringify(route.hash)};`
        });

        await new Promise(r => setTimeout(r, 400));

        // Inject axe-core
        await send('Runtime.evaluate', { expression: AXE_SRC });

        const axeRunScript = `
          new Promise((resolve) => {
            axe.run(document, {
              runOnly: {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
              }
            }).then(results => {
              resolve(JSON.stringify({
                violations: results.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map(n => ({ target: n.target, failureSummary: n.failureSummary })) })),
                passes: results.passes.length,
                incomplete: results.incomplete.length
              }));
            });
          })
        `;

        const evalRes = await send('Runtime.evaluate', {
          expression: axeRunScript,
          awaitPromise: true,
          returnByValue: true
        });

        let rawVal = evalRes.result?.result?.value || evalRes.result?.value;
        let axeData = { violations: [], passes: 0, incomplete: 0 };
        if(rawVal){
          axeData = JSON.parse(rawVal);
        }

        results.push({
          theme: theme.name,
          route: route.name,
          hash: route.hash,
          violations: axeData.violations,
          passes: axeData.passes,
          incomplete: axeData.incomplete
        });
      }
    }

    // Zusätzlicher Test: Menü Drawer geöffnet
    for(const theme of THEMES){
      await send('Runtime.evaluate', { expression: `${theme.code} $('#openMenu').click();` });
      await new Promise(r => setTimeout(r, 400));
      await send('Runtime.evaluate', { expression: AXE_SRC });
      const axeRunScript = `
        new Promise((resolve) => {
          axe.run(document, {
            runOnly: {
              type: 'tag',
              values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
            }
          }).then(results => {
            resolve(JSON.stringify({
              violations: results.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map(n => ({ target: n.target, failureSummary: n.failureSummary })) })),
              passes: results.passes.length,
              incomplete: results.incomplete.length
            }));
          });
        })
      `;
      const evalRes = await send('Runtime.evaluate', { expression: axeRunScript, awaitPromise: true, returnByValue: true });
      let rawVal = evalRes.result?.result?.value || evalRes.result?.value;
      let axeData = rawVal ? JSON.parse(rawVal) : { violations: [], passes: 0, incomplete: 0 };
      results.push({
        theme: theme.name,
        route: 'Menü-Drawer (offen)',
        hash: '#drawer',
        violations: axeData.violations,
        passes: axeData.passes,
        incomplete: axeData.incomplete
      });
      await send('Runtime.evaluate', { expression: "$('#drawer').close();" });
    }

    ws.close();

    console.log('📊 --- AXE-CORE AUDIT ERGEBNISSE ---');
    console.log('-------------------------------------------------------------------------------------------------------');
    console.log('| Thema                | Seite                | Route               | Passes | Incomp. | Violations     |');
    console.log('-------------------------------------------------------------------------------------------------------');
    let totalViolations = 0;
    for(const r of results){
      const vText = r.violations.length === 0 ? '0 (Keine Fehler 🎉)' : `${r.violations.length} Fehler`;
      totalViolations += r.violations.length;
      console.log(`| ${r.theme.padEnd(20)} | ${r.route.padEnd(20)} | ${r.hash.padEnd(19)} | ${String(r.passes).padEnd(6)} | ${String(r.incomplete).padEnd(7)} | ${vText.padEnd(14)} |`);
      if(r.violations.length > 0){
        for(const v of r.violations){
          console.log(`    ❌ [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} Elemente)`);
          for(const n of v.nodes.slice(0, 4)){
            console.log(`       Target: ${n.target.join(' ')}`);
            console.log(`       Failure: ${n.failureSummary}`);
          }
        }
      }
    }
    console.log('-------------------------------------------------------------------------------------------------------\n');

    if(totalViolations > 0){
      process.exitCode = 1;
    }

  } finally {
    chrome.kill();
  }
}

main().catch(err => {
  console.error('Audit Fehler:', err);
  process.exit(1);
});
