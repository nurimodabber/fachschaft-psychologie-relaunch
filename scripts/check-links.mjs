#!/usr/bin/env node
/**
 * scripts/check-links.mjs
 * Überprüft alle externen HTTP/HTTPS-Links in index.html, js/data.js und js/app.js
 * auf Statuscodes, Redirects und 404-Fehler.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const FILES_TO_SCAN = [
  resolve(ROOT, 'index.html'),
  resolve(ROOT, 'js/data.js'),
  resolve(ROOT, 'js/app.js')
];

// Regex zur Extraktion von HTTP(S)-URLs
const URL_REGEX = /https?:\/\/[^\s"'`<>{}|\\^\[\]]+/g;

function extractUrls() {
  const urls = new Set();
  for (const file of FILES_TO_SCAN) {
    try {
      const content = readFileSync(file, 'utf8');
      const matches = content.match(URL_REGEX) || [];
      for (let url of matches) {
        // Bereinigen von nachgestellten Satzzeichen
        url = url.replace(/[.,;:)\]]+$/, '');
        if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) continue;
        urls.add(url);
      }
    } catch (err) {
      console.warn(`Konnte Datei nicht lesen: ${file}`, err.message);
    }
  }

  // Bekannte dynamisch zusammengebaute URLs ergänzen (aus js/data.js)
  const baseP = 'https://fs-psychologie.stura.uni-heidelberg.de/';
  urls.add(baseP + '2024/08/website-updates/');
  urls.add(baseP + '2024/07/blackbox-neue-ausgabe/');
  urls.add(baseP + '2023/05/die-rueckkehr-des-fs-wochenendes-im-april-2023/');
  urls.add(baseP + '2023/01/neu-praktikumsdatenbank-von-studis-fuer-studis/');
  urls.add(baseP + 'category/aktuelles/page/2/');

  return Array.from(urls).sort();
}

async function checkUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    // Zuerst HEAD versuchen
    let res = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 FachschaftLinkChecker/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    // Falls 405 Method Not Allowed oder 403 Forbidden bei HEAD, nochmal mit GET (Range) versuchen
    if (res.status === 405 || (res.status === 403 && !url.includes('facebook') && !url.includes('instagram'))) {
      res = await fetch(url, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 FachschaftLinkChecker/1.0',
          'Range': 'bytes=0-1024'
        }
      });
    }

    clearTimeout(timer);

    const isRedirect = res.status >= 300 && res.status < 400;
    const location = isRedirect ? res.headers.get('location') : null;

    return {
      url,
      status: res.status,
      ok: (res.status >= 200 && res.status < 400) ||
          ((res.status === 403 || res.status === 400 || res.status === 503) &&
           (url.includes('instagram') || url.includes('facebook') || url.includes('google') || url.includes('wg-gesucht') || url.endsWith('/uploads/'))),
      redirect: isRedirect ? location : null,
      error: null
    };
  } catch (err) {
    clearTimeout(timer);
    return {
      url,
      status: 0,
      ok: false,
      redirect: null,
      error: err.name === 'AbortError' ? 'Timeout (>10s)' : err.message
    };
  }
}

async function main() {
  console.log('🔍 Fachschaft Psychologie Link-Checker gestartet...');
  const urls = extractUrls();
  console.log(`Gefundene eindeutige URLs: ${urls.length}\n`);

  const results = [];
  const concurrency = 4;
  let index = 0;

  async function worker() {
    while (index < urls.length) {
      const i = index++;
      const url = urls[i];
      process.stdout.write(`[${i + 1}/${urls.length}] Prüfe: ${url.slice(0, 70)}...\r`);
      const res = await checkUrl(url);
      results.push(res);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  console.log('\n\n--- 📊 ERGEBNIS-ZUSAMMENFASSUNG ---\n');

  const okList = results.filter(r => r.ok && !r.redirect);
  const redirects = results.filter(r => r.redirect);
  const clientErrors = results.filter(r => r.status >= 400 && !r.ok);
  const networkErrors = results.filter(r => !r.ok && r.status === 0);

  console.log(`✅ OK (${okList.length})`);
  for (const r of okList) {
    console.log(`   [${r.status}] ${r.url}`);
  }

  if (redirects.length > 0) {
    console.log(`\n↩️  REDIRECTS (${redirects.length})`);
    for (const r of redirects) {
      console.log(`   [${r.status}] ${r.url}\n      ➔ ${r.redirect}`);
    }
  }

  if (clientErrors.length > 0) {
    console.log(`\n❌ CLIENT ERRORS / 404 (${clientErrors.length})`);
    for (const r of clientErrors) {
      console.log(`   [${r.status}] ${r.url}`);
    }
  }

  if (networkErrors.length > 0) {
    console.log(`\n⚠️  NETZWERKFEHLER / TIMEOUTS (${networkErrors.length})`);
    for (const r of networkErrors) {
      console.log(`   [ERR] ${r.url} (${r.error})`);
    }
  }

  console.log('\n----------------------------------------');
  console.log(`Gesamt: ${urls.length} | OK: ${okList.length} | Redirects: ${redirects.length} | Fehler: ${clientErrors.length + networkErrors.length}`);

  if (clientErrors.length > 0) {
    process.exitCode = 1;
  }
}

main();
