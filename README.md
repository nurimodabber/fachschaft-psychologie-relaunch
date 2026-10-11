# Fachschaft Psychologie Universität Heidelberg – Website Relaunch

Offizielle, moderne Webpräsenz der **Fachschaft Psychologie an der Universität Heidelberg**.

Entworfen mit einer ruhigen, fotografischen und großzügigen Designsprache (Apple-inspiriert), akzentuiert durch das traditionelle Universitätsrot (`#a3192d`) und optimiert für alle Endgeräte (Desktop, Tablet, Smartphone) sowie Hell- und Dunkelmodus.

---

## 🚀 Schnellstart (Lokal ausführen)

Es gibt mehrere Möglichkeiten, die Website lokal zu öffnen und zu testen:

### Option 1: Schneller lokaler Webserver (empfohlen)
Mit dem integrierten Python-Webserver (auf Mac/Linux/Windows meist vorinstalliert):
```bash
# Startet den Server auf Port 3000
python3 -m http.server 3000
```
Öffne anschließend [http://localhost:3000](http://localhost:3000) im Browser.

### Option 2: Mit Node / npm & Vite
Falls Node.js installiert ist, steht eine moderne Entwicklungsumgebung bereit:
```bash
npm install
npm run dev
```
Startet den Vite-Dev-Server mit Hot-Reloading unter [http://localhost:3000](http://localhost:3000).

### Option 3: Direkt im Browser öffnen
Du kannst `index.html` auch direkt mit Doppelklick in Safari, Chrome oder Firefox öffnen.

---

## 📁 Projektstruktur

```
Fachschaft Website/
├── index.html                   # Haupt-Einstiegspunkt (semantisch, barrierefrei, SEO & Social-Meta)
├── 404.html                     # Fallback für statische Hosts (GitHub Pages, etc.)
├── package.json                 # npm-Skripte für Vite und lokale Entwicklung
├── vite.config.js               # Vite-Konfiguration für Bundling & Preview
├── README.md                    # Diese Dokumentation
│
├── css/
│   └── style.css                # Gesamtes Designsystem, CSS-Variablen, Light/Dark-Theme, Responsive Layouts
│
├── js/
│   ├── data.js                  # Zentraler Datenkatalog: 32 Inhaltsseiten, Neuigkeiten, Gremien, FAQ, Räume
│   └── app.js                   # Client-seitiger Router, Suche, Theme-Manager, Interaktive Widgets
│
├── assets/
│   ├── favicon.svg              # Vektor-Favicon mit Heidelberger Universitätsrot & Psi-Siegel (ψ)
│   ├── fonts/
│   │   └── geist.woff2          # Selbstgehosteter Geist-Font (DSGVO-konform, kein Google-CDN)
│   └── images/
│       ├── hero.webp            # Startseiten-Hero: Blick vom Heidelberger Schloss bei Sonnenuntergang
│       ├── city.webp            # Heidelberg im Abendlicht
│       ├── valley.webp          # Neckartal & Rheinebene bei Sonnenuntergang
│       └── night.webp           # Heidelberger Schlossbeleuchtung & Feuerwerk
│
└── original/
    └── Fachschaft Psychologie Heidelberg – Relaunch.html  # Unberührtes Backup des ursprünglichen Prototyps
```

---

## 🌟 Hauptfunktionen

1. **SPA Hash-Routing (`#/`):**
   - 32 vollständige Unterseiten in den vier Hauptbereichen:
     - **Fachschaft:** Wer wir sind, Aktive, Sprechstunden, Kontakt, Downloads & Protokolle
     - **Studium:** Bachelor, Master, EKS (Orientierungswoche), Approbation, Ausland, Praktika, Lehrgestaltung, FAQ, Wichtige Links
     - **Leben am Institut:** Psycho-Party, BlackBox, Pumpkin-Party, Wechslertreffen, Institutsgrillen, Ersti-Wochenende, PsychoKino
     - **Hochschulpolitik (HoPo):** Fachrat, Fakultätsrat, Fachschaftsrat (FSR), StuRa, QSM-Kommission, Prüfungsausschuss, PsyFaKo
2. **Blitzschnelle Volltextsuche (`Cmd+K` oder `/`):**
   - Tastaturgesteuerte Suche über alle Seiten, FAQs, News-Beiträge und Räume hinweg mit Hervorhebung der Treffer.
3. **Live-Sitzungs-Countdown:**
   - Berechnet automatisch die nächste Fachschaftssitzung (jeden Montag 18–20 Uhr), zeigt Live-Status an und bietet 1-Klick-Links zu BigBlueButton und Kalender-Import (.ics / Google Kalender).
4. **Interaktiver Raumfinder:**
   - Echtzeit-Filter für Räume im Psychologischen Institut (Hauptstraße 47–51, Vorder- & Hintergebäude) mit Lageplänen.
5. **Amtszeiten- & Gremien-Tabs:**
   - Umschalten zwischen aktuellen und vergangenen Besetzungen von Fachschaftsräten, Kommissionen und Alumni.
6. **Dark Mode & Light Mode:**
   - Automatische Erkennung der Systemeinstellung mit manueller Umschaltmöglichkeit (Light, Dark, System) und Speicherung in `localStorage`.
7. **Performance & Datenschutz:**
   - Alle Schriften (`Geist`) und Bilder liegen lokal vor (100% DSGVO-konform, keine externen Google-Fonts-Tracker).
   - Die ursprüngliche 1,66 MB HTML-Datei wurde modularisiert: Die HTML-Ladezeit sank um über 95%.

---

## ✏️ Inhalte bearbeiten & pflegen

Alle Texte und Daten sind übersichtlich in [`js/data.js`](js/data.js) strukturiert:

### Einen neuen News-Beitrag hinzufügen
Füge im Array `POSTS` in `js/data.js` einen neuen Eintrag oben ein:
```javascript
{
  id: 'fruehjahrs-vollversammlung-2027',
  d: '2027-04-15', // Datum im Format YYYY-MM-DD
  t: 'Einladung zur Frühjahrs-Vollversammlung',
  lead: 'Kurze Zusammenfassung für die Startseite und Vorschau...',
  body: `<p>Ausführlicher Text mit Absätzen und Links...</p>`
}
```

### Raum- oder Sprechstundendaten anpassen
- **Sprechstunden & Keller:** In `PAGES['fachschaft/kontakt']` in `js/data.js`.
- **Räume & Hörsäle:** Im Array `ROOMS` in `js/data.js`.

---

## 🌐 Veröffentlichung (Deployment)

### Auf GitHub Pages hosten
1. Repository auf GitHub pushen.
2. In den Repository-Einstellungen unter **Settings > Pages**:
   - Source: `Deploy from a branch`
   - Branch: `main` / `root`
3. Fertig! Die Website ist unter `https://<username>.github.io/<repo>/` erreichbar. Die Datei `404.html` stellt sicher, dass Direktlinks sauber weitergeleitet werden.

### Auf Vercel oder Netlify hosten
- Das Repository einfach mit Vercel oder Netlify verbinden.
- Build-Befehl: Leer lassen (statisches Hosting) oder `npm run build`
- Output-Verzeichnis: `.` (bzw. `dist`)

### Auf dem Universitätsserver / StuRa-Webspace hosten
- Alle Dateien (`index.html`, `404.html`, Ordner `css/`, `js/`, `assets/`) per SFTP/SCP in das Web-Verzeichnis des Fachschafts-Servers kopieren (z. B. `https://fs-psychologie.stura.uni-heidelberg.de/`).

---

## 📄 Lizenz & Bildnachweise

- **Texte & Gestaltung:** [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.de) – Fachschaft Psychologie Universität Heidelberg
- **Bilder:**
  - Hero (Heidelberger Schloss): Samuel Scherer (CC BY-SA 4.0)
  - Heidelberg Skyline & Neckartal: Fachschaft MathPhysInfo Heidelberg (CC BY-SA 4.0)
  - Schlossbeleuchtung: Fachschaft MathPhysInfo / ZaPF 2018 (CC BY-SA 4.0)
- **Kartendaten:** © [OpenStreetMap](https://www.openstreetmap.org/copyright) Mitwirkende
