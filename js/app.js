"use strict";




/* ============ Hilfsfunktionen ============ */
const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>[...(r||document).querySelectorAll(s)];
const app=$('#app');
const sec=r=>r.split('/')[0];
const kidsOf=s=>{const n=TREE.find(x=>x[0]===s);return n?n[1]:[];};
const navTitle=r=>({'studium':'Infos zum Studium','leben':'Leben am Institut'}[r]||PAGES[r].t);
const depth=r=>r.split('/').length-1;


/* ============ Nächste Sitzung ============ */
function nextSession(){
  const now=new Date(), d=new Date(now);
  let add=(1-now.getDay()+7)%7;
  const end=new Date(now); end.setHours(20,0,0,0);
  if(add===0&&now>=end) add=7;
  d.setDate(now.getDate()+add); d.setHours(18,0,0,0);
  const live=add===0&&now>=d&&now<end;
  const wd=add===0?'Heute, Montag':add===1?'Morgen, Montag':'Montag';
  return {live,wd,day:d.getDate(),mo:d.toLocaleDateString('de-DE',{month:'long',year:'numeric'}),iso:d.toISOString()};
}

/* ============ Startseite (Zero-Scroll Interactive Portal) ============ */
let currentPortalTab = 'overview';

function setPortalTab(tabName){
  currentPortalTab = tabName;
  const tabs = $$('.portal-tabs .ptab');
  const panels = $$('.portal-view');
  tabs.forEach(t=>{
    const on = t.dataset.tab === tabName;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    if(on) t.classList.add('active'); else t.classList.remove('active');
  });
  panels.forEach(p=>{
    const on = p.id === 'view-' + tabName;
    p.hidden = !on;
    if(on) p.classList.add('active'); else p.classList.remove('active');
  });
}

function home(activeTab){
  if(activeTab) currentPortalTab = activeTab;
  const tab = currentPortalTab || 'overview';
  const s = nextSession(), p0 = POSTS[0], d0 = new Date(p0.d+'T12:00:00');
  const quick = [
    ['studium/bachelor','book','Bachelor'],
    ['studium/master','cap','Master'],
    ['studium/bachelor/eks','users','EKS'],
    ['studium/approbation','heart','Approbation'],
    ['studium/ausland','compass','Ausland'],
    ['studium/praktika','briefcase','Praktika'],
    ['studium/faq','question','FAQ'],
    ['fachschaft/downloads','download','Protokolle']
  ];

  return `
<div class="portal" role="region" aria-label="Portal der Fachschaft Psychologie">

 <nav class="portal-nav" aria-label="Portal-Navigation">
  <div class="portal-tabs" role="tablist">
   <button type="button" role="tab" class="ptab ${tab==='overview'?'active':''}" data-tab="overview" id="tab-overview" aria-controls="view-overview" aria-selected="${tab==='overview'}" tabindex="${tab==='overview'?0:-1}">
    <span class="ptab-icon">${ic('spark')}</span>
    <span class="ptab-label">Übersicht</span>
   </button>
   <button type="button" role="tab" class="ptab ${tab==='why'?'active':''}" data-tab="why" id="tab-why" aria-controls="view-why" aria-selected="${tab==='why'}" tabindex="${tab==='why'?0:-1}">
    <span class="ptab-icon">${ic('users')}</span>
    <span class="ptab-label">Warum mitmachen?</span>
   </button>
   <button type="button" role="tab" class="ptab ${tab==='study'?'active':''}" data-tab="study" id="tab-study" aria-controls="view-study" aria-selected="${tab==='study'}" tabindex="${tab==='study'?0:-1}">
    <span class="ptab-icon">${ic('book')}</span>
    <span class="ptab-label">Studium</span>
   </button>
   <button type="button" role="tab" class="ptab ${tab==='news'?'active':''}" data-tab="news" id="tab-news" aria-controls="view-news" aria-selected="${tab==='news'}" tabindex="${tab==='news'?0:-1}">
    <span class="ptab-icon">${ic('newspaper')}</span>
    <span class="ptab-label">Aktuelles & BlackBox</span>
   </button>
   <button type="button" role="tab" class="ptab ${tab==='campus'?'active':''}" data-tab="campus" id="tab-campus" aria-controls="view-campus" aria-selected="${tab==='campus'}" tabindex="${tab==='campus'?0:-1}">
    <span class="ptab-icon">${ic('pin')}</span>
    <span class="ptab-label">Campus & Räume</span>
   </button>
  </div>
 </nav>

 <div class="portal-stage">

  <!-- ================= TAB 1: ÜBERSICHT ================= -->
  <div class="portal-view ${tab==='overview'?'active':''}" id="view-overview" role="tabpanel" aria-labelledby="tab-overview" ${tab==='overview'?'':'hidden'}>
   <div class="pv-grid pv-overview">
    
    <!-- Hero Bento Card -->
    <article class="pcard pcard-hero rv">
     <div class="pcard-badge">
      <span class="pcard-seal-dot"></span>
      <span>Universität Heidelberg • Psychologisches Institut</span>
     </div>
     <h1 class="phero-title">Deine Stimme am Institut.</h1>
     <p class="phero-lead">Wir sind die gewählte Studierendenvertretung am Psychologischen Institut in Heidelberg. Wir beraten dich im Studium, organisieren Events von der Psychoparty bis zum Ersti-Wochenende und vertreten deine Anliegen.</p>
     <div class="phero-actions">
      <button type="button" class="btn btn-primary" data-switch-tab="why">${ic('users')}Warum mitmachen?</button>
      <button type="button" class="btn btn-ghost" data-switch-tab="study">${ic('book')}Infos zum Studium</button>
      <a class="tlink" href="#/fachschaft">Über uns${ic('chevr')}</a>
     </div>
     <div class="phero-chips">
      <span class="chips-title">Schnellzugriff:</span>
      <div class="chips-list">
       ${quick.map(([h,i,t])=>`<a href="#/${h}" class="chip-pill"><span class="c-ico">${ic(i)}</span><span>${t}</span></a>`).join('')}
      </div>
     </div>
    </article>

    <!-- Side Column: Session + Teasers -->
    <div class="pv-side">
     
     <!-- Session Card -->
     <aside class="pcard pcard-session rv" aria-labelledby="sess-h">
      <div class="pcard-top">
       <span class="pcard-kicker">Wöchentliche Sitzung</span>
       ${s.live?'<span class="live-pill"><span class="live-dot"></span>läuft gerade</span>':'<span class="badge-subtle">Vorlesungszeit</span>'}
      </div>
      <div class="sess-hero">
       <div class="sess-date-badge">
        <span class="sdb-month">${s.mo.split(' ')[0]}</span>
        <span class="sdb-day">${s.day}</span>
        <span class="sdb-wd">${s.wd}</span>
       </div>
       <div class="sess-details">
        <h2 id="sess-h" class="sess-time">Montags, 18–20 Uhr</h2>
        <p class="sess-place">${ic('pin')}<b>Fachschaftskeller</b>, Hauptstraße 47–51</p>
        <p class="sess-note">Durch das Tor in den Innenhof, direkt rechts. Komm einfach vorbei!</p>
       </div>
      </div>
      <div class="sess-actions">
       <a class="btn btn-primary btn-small noext" href="${BBB}">${ic('video')}Online teilnehmen (BBB)</a>
       <a class="tlink btn-small noext" href="${CAL}">${ic('cal')}Alle Termine${ic('chevr')}</a>
      </div>
     </aside>

     <!-- Split Duo Cards -->
     <div class="pv-duo">
      <article class="pcard pcard-mini rv">
       <div class="pcard-top">
        <span class="pcard-kicker">Aktuelles</span>
        <time datetime="${p0.d}">${d0.toLocaleDateString('de-DE',{day:'numeric',month:'short'})}</time>
       </div>
       <h3 class="mini-title"><a class="noext" href="${P+p0.u}">${p0.t}</a></h3>
       <button type="button" class="mini-more" data-switch-tab="news">Alle Meldungen & BlackBox${ic('chevr')}</button>
      </article>

      <article class="pcard pcard-mini rv">
       <div class="pcard-top">
        <span class="pcard-kicker">Orientierung</span>
        <span class="badge-subtle">Altstadt</span>
       </div>
       <h3 class="mini-title">Fachschaftskeller & Räume</h3>
       <button type="button" class="mini-more" data-switch-tab="campus">Karte & Raumfinder${ic('chevr')}</button>
      </article>
     </div>

    </div>

   </div>
  </div>

  <!-- ================= TAB 2: WARUM MITMACHEN? (ZERO-SCROLL 5-PILLAR GRID) ================= -->
  <div class="portal-view ${tab==='why'?'active':''}" id="view-why" role="tabpanel" aria-labelledby="tab-why" ${tab==='why'?'':'hidden'}>
   <div class="pv-why-wrap">
    
    <div class="psection-head rv">
     <div class="psection-badge"><span class="badge-accent">🤝 Aktive Fachschaft</span></div>
     <h2 class="sh2">Warum mitmachen?</h2>
     <p class="sub">Was die Arbeit in der Fachschaft Heidelberg ausmacht – fünf Gründe, montags um 18 Uhr im Keller vorbeizuschauen.</p>
    </div>

    <!-- 5-Card Balanced Bento Grid: 3 top + 2 bottom (No Carousel, Zero Scroll!) -->
    <div class="why-5grid">
     
     <article class="pcard why-card rv">
      <span class="why-icon">${ic('spark')}</span>
      <h3 class="why-title">Mitgestalten</h3>
      <p class="why-desc">Von der legendären Psychoparty bis zum PsychoKino: Du bringst deine eigenen Ideen ein und setzt sie direkt mit uns im Institut um.</p>
     </article>

     <article class="pcard why-card rv">
      <span class="why-icon">${ic('bank')}</span>
      <h3 class="why-title">Hochschulpolitik</h3>
      <p class="why-desc">Erlebe Gremien und Studienkommissionen hautnah. Gestalte Prüfungsordnungen, Lehrevaluationen und Berufungen auf Augenhöhe mit.</p>
     </article>

     <article class="pcard why-card rv">
      <span class="why-icon">${ic('users')}</span>
      <h3 class="why-title">Alle Semester</h3>
      <p class="why-desc">Vernetze dich mit engagierten Studierenden über alle Semester hinweg – vom Erstsemester über den Master bis zur Promotion.</p>
     </article>

     <article class="pcard why-card rv">
      <span class="why-icon">${ic('handshake')}</span>
      <h3 class="why-title">Verantwortung</h3>
      <p class="why-desc">Übernimm Verantwortung für reale Projekte, Budgetverwaltung, Erstsemester-Einführung und die gemeinsamen Interessen aller Studierenden.</p>
     </article>

     <!-- Featured Card: Spaß & Gemeinschaft (Spans across with warm glow highlight) -->
     <article class="pcard why-card why-featured rv">
      <div class="why-feat-badge">Besonders wichtig</div>
      <div class="why-feat-body">
       <span class="why-icon feat-icon">${ic('smiley')}</span>
       <div>
        <h3 class="why-title">Spaß, Zusammenhalt & legendäre Zeiten</h3>
        <p class="why-desc">Fachschaftsarbeit ist vor allem eine richtig gute Zeit. Nach den Sitzungen zusammensitzen, Grillabende am Neckar, Partys und echte Freundschaften fürs ganze Studium.</p>
       </div>
      </div>
     </article>

    </div>

    <!-- Bottom Action Bar -->
    <div class="why-bottom-bar rv">
     <div class="wbb-info">
      <span class="wbb-pin">${ic('pin')}</span>
      <span>Montags 18–20 Uhr • Hauptstraße 47–51 (Innenhof rechts im Keller)</span>
     </div>
     <div class="wbb-actions">
      <a class="btn btn-primary btn-small" href="#/fachschaft/kontakt">${ic('mail')}Kontakt aufnehmen</a>
      <a class="btn btn-ghost btn-small" href="#/fachschaft/aktive">Aktive Fachschaft${ic('chevr')}</a>
      <button type="button" class="btn btn-ghost btn-small" data-switch-tab="overview">Zurück zur Übersicht</button>
     </div>
    </div>

   </div>
  </div>

  <!-- ================= TAB 3: STUDIUM ================= -->
  <div class="portal-view ${tab==='study'?'active':''}" id="view-study" role="tabpanel" aria-labelledby="tab-study" ${tab==='study'?'':'hidden'}>
   <div class="pv-study-wrap">
    
    <div class="psection-head rv">
     <div class="psection-badge"><span class="badge-accent">🎓 Studienberatung</span></div>
     <h2 class="sh2">Infos zum Studium</h2>
     <p class="sub">Alles Wichtige zu Bewerbung, Studienaufbau, Prüfungen, Praktika und Auslandssemestern.</p>
    </div>

    <div class="study-3grid">
     
     <article class="pcard study-card rv">
      <div class="study-card-top">
       <span class="study-icon">${ic('book')}</span>
       <span class="badge-subtle">Bachelor</span>
      </div>
      <h3 class="study-title">Bachelor of Science</h3>
      <p class="study-desc">Regelstudienzeit 6 Semester. Alle Details zu Modulen, Orientierungsprüfung, BaPsy-Test, EKS und Praktikumsanforderungen.</p>
      <div class="study-links">
       <a href="#/studium/bachelor">Bachelor-Übersicht${ic('chevr')}</a>
       <a href="#/studium/bachelor/eks">EKS (Empirische Klausuren)${ic('chevr')}</a>
       <a href="#/studium/praktika">Praktika & Berufsfelder${ic('chevr')}</a>
      </div>
     </article>

     <article class="pcard study-card rv">
      <div class="study-card-top">
       <span class="study-icon">${ic('cap')}</span>
       <span class="badge-subtle">Master & Reform</span>
      </div>
      <h3 class="study-title">Master & Approbation</h3>
      <p class="study-desc">Master-Schwerpunkte am Institut (Klinische Psychologie, Kognition) und der Übergang in die neue Psychotherapie-Ausbildung.</p>
      <div class="study-links">
       <a href="#/studium/master">Master-Studiengänge${ic('chevr')}</a>
       <a href="#/studium/approbation">Psychotherapie-Approbation${ic('chevr')}</a>
       <a href="#/studium/master/bewerbung">Bewerbungsverfahren${ic('chevr')}</a>
      </div>
     </article>

     <article class="pcard study-card rv">
      <div class="study-card-top">
       <span class="study-icon">${ic('compass')}</span>
       <span class="badge-subtle">Orientierung</span>
      </div>
      <h3 class="study-title">Ausland, Ersti-Hilfe & FAQ</h3>
      <p class="study-desc">ERASMUS-Partneruniversitäten in ganz Europa, FAQs zu Studienorganisation und Unterstützung für Erstsemester.</p>
      <div class="study-links">
       <a href="#/studium/ausland">Auslandssemester & ERASMUS${ic('chevr')}</a>
       <a href="#/studium/faq">Häufige Fragen (FAQ)${ic('chevr')}</a>
       <a href="#/studium/faq?raum">Raumfinder (F104 & Co.)${ic('chevr')}</a>
      </div>
     </article>

    </div>

   </div>
  </div>

  <!-- ================= TAB 4: AKTUELLES & BLACKBOX ================= -->
  <div class="portal-view ${tab==='news'?'active':''}" id="view-news" role="tabpanel" aria-labelledby="tab-news" ${tab==='news'?'':'hidden'}>
   <div class="pv-news-wrap">
    
    <div class="news-split-grid">
     
     <!-- Featured Post -->
     <article class="pcard news-feat-card rv">
      <div class="pcard-top">
       <span class="badge-accent">Neuester Beitrag</span>
       <time datetime="${p0.d}">${d0.toLocaleDateString('de-DE',{day:'numeric',month:'long',year:'numeric'})}</time>
      </div>
      <h2 class="news-feat-title"><a class="noext" href="${P+p0.u}">${p0.t}</a></h2>
      <p class="news-feat-lead">${p0.x}</p>
      <div class="news-feat-tags">
       ${['Aktuelles',...p0.c].map(c=>`<span class="tag">${c}</span>`).join('')}
      </div>
      <div class="news-feat-actions">
       <a class="btn btn-primary btn-small noext" href="${P+p0.u}">Beitrag lesen${ic('chevr')}</a>
       <a class="btn btn-ghost btn-small" href="#/aktuelles">Alle Meldungen archiviert</a>
      </div>
     </article>

     <!-- Side: Recent List + BlackBox -->
     <div class="news-side-col">
      
      <div class="pcard news-recent-card rv">
       <div class="pcard-top"><span class="pcard-kicker">Weitere Meldungen</span><a class="tlink btn-small" href="#/aktuelles">Archiv${ic('chevr')}</a></div>
       <ul class="news-compact-list">
        ${POSTS.slice(1,4).map(p=>`
         <li>
          <time datetime="${p.d}">${new Date(p.d+'T12:00:00').toLocaleDateString('de-DE',{day:'numeric',month:'short'})}</time>
          <a class="noext" href="${P+p.u}"><b>${p.t}</b></a>
         </li>
        `).join('')}
       </ul>
      </div>

      <div class="pcard blackbox-mini-card rv">
       <div class="bbox-in">
        <div>
         <span class="pcard-kicker">Institutsmagazin</span>
         <h3 class="bbox-title">BlackBox</h3>
         <p class="bbox-desc">Artikel von Studierenden & Dozierenden, Umfragen, Memes und Archiv seit 1983.</p>
         <div class="bbox-btns">
          <a class="btn btn-primary btn-small noext" href="${U+ISSUES[0][2]}">${ic('download')}Ausgabe Nr. ${ISSUES[0][0]} lesen</a>
          <a class="tlink btn-small" href="#/leben/blackbox">Archiv${ic('chevr')}</a>
         </div>
        </div>
        <div class="orb mini-orb" data-face="a">
         <svg viewBox="0 0 240 220" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round">
          <path class="fa" d="M30 80H150V200H30Z"/><path class="fb" d="M90 20H210V140H90Z"/>
          <path d="M30 80H150V200H30ZM90 20H210V140H90ZM30 80 90 20M150 80 210 20M150 200 210 140M30 200 90 140"/>
         </svg>
         <button class="btn btn-ghost btn-small" type="button" data-necker aria-pressed="false">Perspektive</button>
        </div>
       </div>
      </div>

     </div>

    </div>

   </div>
  </div>

  <!-- ================= TAB 5: CAMPUS & RÄUME ================= -->
  <div class="portal-view ${tab==='campus'?'active':''}" id="view-campus" role="tabpanel" aria-labelledby="tab-campus" ${tab==='campus'?'':'hidden'}>
   <div class="pv-campus-wrap">
    
    <div class="campus-split-grid">
     
     <div class="pcard campus-info-card rv">
      <div class="pcard-top">
       <span class="badge-accent">📍 Anfahrt & Räume</span>
       <span class="badge-subtle">Heidelberg Altstadt</span>
      </div>
      <h2 class="campus-info-title">Psychologisches Institut</h2>
      <p class="campus-addr"><b>Hauptstraße 47–51, 69117 Heidelberg</b><br>Mitten in der Altstadt zwischen Bismarckplatz und Universitätsplatz.</p>
      
      <div class="campus-details-list">
       <div class="cd-item">
        <span class="cd-ico">${ic('door')}</span>
        <div><b>Fachschaftskeller:</b> Durch das Tor in den Innenhof, der Keller liegt direkt rechts im Souterrain.</div>
       </div>
       <div class="cd-item">
        <span class="cd-ico">${ic('clock')}</span>
        <div><b>Sitzungszeit:</b> Montags 18–20 Uhr in der Vorlesungszeit. Offen für alle Studierenden.</div>
       </div>
       <div class="cd-item">
        <span class="cd-ico">${ic('question')}</span>
        <div><b>Hörsäle & Seminarräume:</b> F104, F105, F008 und Versuchsräume schnell finden.</div>
       </div>
      </div>

      <div class="campus-actions">
       <a class="btn btn-primary btn-small" href="#/studium/faq?raum">${ic('search')}Raumfinder öffnen</a>
       <a class="btn btn-ghost btn-small" href="#/fachschaft/kontakt">Kontakt aufnehmen</a>
       <a class="tlink btn-small noext" href="${OSM_LINK}">In OpenStreetMap öffnen${ic('chevr')}</a>
      </div>
     </div>

     <div class="pcard campus-map-card rv">
      <div class="cmap-container">
       ${mapSvg('mapsvg')}
       <span class="pin" style="left:${MAP_META.ix}%;top:${MAP_META.iy}%"></span>
       <span class="pin-label" style="left:${MAP_META.ix}%;top:${MAP_META.iy}%">Psychologisches Institut</span>
      </div>
      <div class="cmap-foot">
       <span>Kartendaten © <a class="noext" href="${OSM}">OpenStreetMap-Mitwirkende</a></span>
       <a class="tlink btn-small noext" href="${OSM_LINK}">Vollbild${ic('chevr')}</a>
      </div>
     </div>

    </div>

   </div>
  </div>

 </div>

 <!-- Portal Status Strip (Zero-scroll footer replacement on homepage) -->
 <footer class="portal-status-strip">
  <div class="pss-in">
   <div class="pss-left">
    <span>© ${new Date().getFullYear()} Fachschaft Psychologie Heidelberg</span>
    <span class="pss-sep">•</span>
    <span>Hauptstr. 47–51</span>
    <span class="pss-sep">•</span>
    <a href="mailto:${MAIL}">${MAIL}</a>
   </div>
   <div class="pss-right">
    <a href="#/fachschaft/kontakt">Kontakt</a>
    <a href="#/impressum">Impressum</a>
    <a class="noext" href="${DSGVO}">Datenschutz</a>
   </div>
  </div>
 </footer>

</div>`;
}

/* ============ Unterseite ============ */
function crumbs(route){
  const parts=route?route.split('/'):[]; const out=[`<li><a href="#/">Startseite</a></li>`];
  for(let i=1;i<=parts.length;i++){const r=parts.slice(0,i).join('/'); if(!PAGES[r]) continue;
    out.push(`<li aria-hidden="true">${ic('chevr')}</li>`);
    out.push(i===parts.length?`<li aria-current="page">${navTitle(r)}</li>`:`<li><a href="#/${r}">${navTitle(r)}</a></li>`);}
  return `<nav aria-label="Brotkrümelnavigation"><ol class="crumbs">${out.join('')}</ol></nav>`;
}
function page(route){
  const p=PAGES[route]; const s=sec(route); const list=[s,...kidsOf(s)];
  const hasLocal=list.length>1, idx=list.indexOf(route);
  const prev=hasLocal&&idx>0?list[idx-1]:null, next=hasLocal&&idx<list.length-1?list[idx+1]:null;
  const lnav=hasLocal?`<nav class="lnav" aria-label="${navTitle(s)}"><div class="in"><a class="lt" href="#/${s}">${navTitle(s)}</a><ul>${list.map(r=>`<li><a href="#/${r}" ${r===route?'aria-current="page"':''}>${r===s?'Übersicht':PAGES[r].t}</a></li>`).join('')}</ul></div></nav>`:'';
  let banner='';
  if(route===s&&SECTION_IMG[s]) banner=`<figure class="banner rv"><div class="bi">${pic(SECTION_IMG[s],'',true)}</div><figcaption>${credit(SECTION_IMG[s])}</figcaption></figure>`;
  else if(route==='hopo') banner=`<figure class="banner map rv"><div class="bi">${mapSvg('')}</div><figcaption>Heidelberger Altstadt. Kartendaten © <a class="noext" href="${OSM}">OpenStreetMap-Mitwirkende</a></figcaption></figure>`;
  return `${lnav}
  <header class="phead">${banner?'':mapSvg('mapbg')}<div class="in rv">${crumbs(route)}<h1 tabindex="-1">${p.t}</h1>${p.lead?`<p class="lead">${p.lead}</p>`:''}</div></header>
  ${banner}
  <article class="doc prose rv" style="--i:1">${p.body}
   ${hasLocal?`<nav class="pager" aria-label="Blättern">${prev?`<a href="#/${prev}"><span>Zurück</span><b>${prev===s?navTitle(s):PAGES[prev].t}</b></a>`:'<span></span>'}${next?`<a class="next" href="#/${next}"><span>Weiter</span><b>${PAGES[next].t}</b></a>`:''}</nav>`:''}
  </article>`;
}
function notFound(){
  return `<header class="phead">${mapSvg('mapbg')}<div class="in">${crumbs('')}<h1 tabindex="-1">Seite nicht gefunden</h1><p class="lead">Diese Adresse gibt es auf unserer Website nicht. Versuch es mit der Suche oder starte auf der Startseite.</p></div></header>
  <div class="doc"><div class="btns"><a class="btn btn-primary" href="#/">Zur Startseite</a><button class="btn btn-ghost" type="button" data-opensearch>${ic('search')}Suchen</button></div></div>`;
}

/* ============ Navigation ============ */
function buildNav(){
  const mains=TREE.filter(([r])=>r!=='impressum');
  $('#mainnav').innerHTML=mains.map(([r])=>`<li><a href="#/${r}" data-sec="${r}">${navTitle(r)}</a></li>`).join('');
  $('#drawerBody').innerHTML=mains.filter(([,k])=>k.length).map(([r,kids])=>`<section><h2><a href="#/${r}">${navTitle(r)}</a></h2><ul><li><a href="#/${r}">Übersicht</a></li>${kids.map(k=>`<li><a href="#/${k}" class="${depth(k)===2?'lvl2':''}">${PAGES[k].t}</a></li>`).join('')}</ul></section>`).join('');
  $('#menuQuick').innerHTML=[['','Startseite'],['aktuelles','Aktuelles'],['fachschaft/kontakt','Kontakt'],['impressum','Impressum']].map(([r,t])=>`<a href="#/${r}">${t}</a>`).join('');
}
function markNav(route){
  const s=route?sec(route):'';
  $$('#mainnav a').forEach(a=>{if(a.dataset.sec===s)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
  $$('#drawer a').forEach(a=>{if(a.getAttribute('href')==='#/'+route)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
}
function themeSeg(){
  return `<div class="seg" role="group" aria-label="Darstellung">${[['system','monitor','System'],['light','sun','Hell'],['dark','moon','Dunkel']].map(([v,i,t])=>`<button type="button" data-theme-set="${v}" aria-pressed="false">${ic(i)}${t}</button>`).join('')}</div>`;
}
function footer(){
  const col=(r,extra)=>`<div><h2><a href="#/${r}">${navTitle(r)}</a></h2><ul>${kidsOf(r).map(k=>`<li><a href="#/${k}">${PAGES[k].t}</a></li>`).join('')}${extra||''}</ul></div>`;
  $('#footer').innerHTML=`<div class="f-in">
   <p class="f-note">Fotos von Heidelberg: Samuel Scherer und Fachschaft MathPhysInfo, <a class="noext" href="${CCBYSA}">CC BY-SA 4.0</a>. Kartendaten © <a class="noext" href="${OSM}">OpenStreetMap-Mitwirkende</a>. Einzelheiten unter <a href="#/impressum">Bildnachweise</a>.</p>
   <nav class="f-dir" aria-label="Alle Seiten">
    ${col('fachschaft',`<li><a href="#/aktuelles">Aktuelles</a></li>`)}${col('studium')}${col('leben')}${col('hopo')}
    <div><h2>Kontakt</h2><ul><li><a href="mailto:${MAIL}">E-Mail schreiben</a></li><li><a class="noext" href="${BBB}">Online-Sitzung</a></li><li><a class="noext" href="${PSYTREFF}">Psychotreff-Verteiler</a></li><li><a class="noext" href="${IG}">Instagram</a></li><li><a class="noext" href="${FB}">Facebook</a></li><li><a class="noext" href="https://www.psychologie.uni-heidelberg.de/">Psychologisches Institut</a></li><li><a class="noext" href="https://www.stura.uni-heidelberg.de/">StuRa</a></li></ul></div>
   </nav>
   <div class="f-addr"><span>Fachschaft Psychologie, Hauptstraße 47-51, 69117 Heidelberg</span><span>Tel. <a href="tel:+496221542456">+49 6221 54-2456</a></span><span><a href="mailto:${MAIL}">${MAIL}</a></span></div>
   <div class="f-bot"><span>© ${new Date().getFullYear()} Fachschaft Psychologie Heidelberg. Teil der Verfassten Studierendenschaft.</span>
    <ul><li><a href="#/impressum">Impressum</a></li><li><a class="noext" href="${DSGVO}">Datenschutz</a></li></ul>
    ${themeSeg()}
    <a class="uni-mark noext" href="https://www.uni-heidelberg.de/"><span>Universität</span><span>Heidelberg</span></a></div>
  </div>`;
}

/* ============ Interaktive Elemente ============ */
function decorateLinks(root){
  $$('a[href^="http"]',root).forEach(a=>{
    a.target='_blank'; a.rel='noopener';
    if(!a.classList.contains('noext')&&!a.classList.contains('btn')&&!a.closest('.linkrows,.gnav,footer,.tile,.hero,.mapwrap,.banner,.lnav,.quick,.issues-mini')) a.classList.add('ext');
    if(!$('.sr',a)) a.insertAdjacentHTML('beforeend','<span class="sr"> (öffnet in neuem Tab)</span>');
  });
}
function hydrate(root){
  decorateLinks(root);
  $$('.portal-tabs .ptab', root).forEach((btn, idx, all)=>{
    btn.addEventListener('click', () => setPortalTab(btn.dataset.tab));
    btn.addEventListener('keydown', e=>{
      let nextIdx = null;
      if(e.key === 'ArrowRight') nextIdx = (idx + 1) % all.length;
      if(e.key === 'ArrowLeft') nextIdx = (idx - 1 + all.length) % all.length;
      if(nextIdx !== null){
        e.preventDefault();
        setPortalTab(all[nextIdx].dataset.tab);
        all[nextIdx].focus();
      }
    });
  });
  $$('[data-switch-tab]', root).forEach(el=>{
    el.addEventListener('click', e=>{
      e.preventDefault();
      setPortalTab(el.dataset.switchTab);
    });
  });
  $$('[data-tabs]',root).forEach(t=>{
    const btns=$$('[role=tab]',t);
    const sel=b=>{btns.forEach(x=>{const on=x===b;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;$('#'+x.getAttribute('aria-controls')).hidden=!on;});};
    btns.forEach((b,i)=>{b.addEventListener('click',()=>sel(b));b.addEventListener('keydown',e=>{
      let j=null; if(e.key==='ArrowRight')j=(i+1)%btns.length; if(e.key==='ArrowLeft')j=(i-1+btns.length)%btns.length;
      if(j!=null){e.preventDefault();sel(btns[j]);btns[j].focus();}});});
  });
  $$('[data-copy]',root).forEach(b=>b.addEventListener('click',async()=>{
    const v=b.dataset.copy; let ok=false;
    try{await navigator.clipboard.writeText(v);ok=true;}catch(e){
      const ta=document.createElement('textarea');ta.value=v;document.body.appendChild(ta);ta.select();try{ok=document.execCommand('copy');}catch(_){}ta.remove();}
    b.classList.toggle('done',ok); b.innerHTML=ok?`${ic('check')}<span>Kopiert</span>`:`<span>${v}</span>`;
    setTimeout(()=>{b.classList.remove('done');b.innerHTML=`${ic('copy')}<span>Kopieren</span>`;},2200);
  }));
  const idx=$('#faq-index',root);
  if(idx){
    const body=$('.help-body',root), secs=$$('section.qa',body), groups=[];let cur=null;
    $$('h2.qa-group, section.qa',body).forEach(el=>{if(el.tagName==='H2'){cur={el,h:el.textContent,q:[]};groups.push(cur);}else cur.q.push(el);});
    idx.innerHTML=`<label for="faqq">Fragen filtern</label><div class="fld">${ic('funnel')}<input id="faqq" type="search" placeholder="z. B. Wohnung, NC, Ticket" autocomplete="off"></div>`+
      groups.map(g=>`<div class="grp"><h3>${g.h}</h3><ul>${g.q.map(d=>`<li><button type="button" data-open="${d.id}">${$('h3',d).textContent}</button></li>`).join('')}</ul></div>`).join('')+'<p class="none" hidden>Keine passende Frage gefunden. Versuch es mit der Suche oben.</p>';
    idx.addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(b)openQA(b.dataset.open,true);});
    $('#faqq',idx).addEventListener('input',e=>{
      const q=norm(e.target.value.trim()); let any=false;
      groups.forEach((g,gi)=>{let vis=0;g.q.forEach(d=>{const m=!q||norm(d.textContent).includes(q);d.hidden=!m;$(`[data-open="${d.id}"]`,idx).parentElement.hidden=!m;if(m)vis++;});
        g.el.hidden=!vis;$$('.grp',idx)[gi].hidden=!vis;if(vis)any=true;});
      $('.none',idx).hidden=any;
    });
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){$$('button.on',idx).forEach(b=>b.classList.remove('on'));const b=$(`[data-open="${en.target.id}"]`,idx);if(b)b.classList.add('on');}}),{rootMargin:'-35% 0px -60% 0px'});
      secs.forEach(x=>io.observe(x));
    }
  }
  const room=$('#room',root);
  if(room){
    const list=$('#bldg',root), out=$('#roomOut',root), items=$$('li',list);
    room.addEventListener('input',()=>{
      const raw=room.value.trim(), q=raw.toLowerCase().replace(/\s+/g,' ');
      const code=q.replace(/^raum\s*/,'').replace(/\s/g,'');
      if(!q){list.classList.remove('filtering');items.forEach(li=>li.classList.remove('hit'));out.textContent='';return;}
      let hits=[];
      ROOMS.forEach((r,i)=>{if(r.re&&r.re.test(code))hits.push(i);});
      if(hits.includes(2)) hits=[2];
      if(!hits.length){const words=q.split(' ');ROOMS.forEach((r,i)=>{const hay=(r.b+' '+r.w+' '+r.k).toLowerCase();if(words.every(w=>hay.includes(w)))hits.push(i);});}
      list.classList.add('filtering'); items.forEach((li,i)=>li.classList.toggle('hit',hits.includes(i)));
      out.innerHTML=hits.length?`„${raw.replace(/[<>&]/g,'')}“ findest du hier: <b>${hits.map(i=>ROOMS[i].b).join(', ')}</b>`:'Dazu haben wir nichts gefunden. Versuch es mit einer Raumnummer wie F104 oder A015.';
    });
  }
  const chips=$$('[data-filter]',root);
  chips.forEach(c=>c.addEventListener('click',()=>{
    chips.forEach(x=>x.setAttribute('aria-pressed',x===c));
    const f=c.dataset.filter;
    $$('.news li',root).forEach(li=>li.hidden=!(f==='Alle'||li.dataset.cats.split('|').includes(f)));
  }));
  const nb=$('[data-necker]',root);
  if(nb) nb.addEventListener('click',()=>{const o=$('.orb',root);const b=o.dataset.face==='a';o.dataset.face=b?'b':'a';nb.setAttribute('aria-pressed',b);});
  $$('[data-opensearch]',root).forEach(b=>b.addEventListener('click',openSearch));
  if(root.classList&&document.documentElement.classList.contains('rv-on')&&RV){$$('.rv',root).forEach((el,k)=>{if(!el.style.getPropertyValue('--i'))el.style.setProperty('--i',Math.min(k,4));RV.observe(el);});}
  $$('[data-theme-set]',root).forEach(b=>b.setAttribute('aria-pressed',b.dataset.themeSet===getPref()));
  $$('.gallery',root).forEach(t=>{
    const btns=$$(`[data-gal="${t.id}"]`,root), items=$$('li',t);
    const step=dir=>{const w=items[0].getBoundingClientRect().width+20;t.scrollBy({left:dir*w,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});};
    btns.forEach(b=>b.addEventListener('click',()=>step(b.dataset.dir==='prev'?-1:1)));
    if('IntersectionObserver' in window&&items.length){
      const io=new IntersectionObserver(es=>es.forEach(en=>{const b=btns.find(x=>x.dataset.dir===(en.target===items[0]?'prev':'next'));if(b)b.disabled=en.intersectionRatio>=.98;}),{root:t,threshold:[0,.5,.98,1]});
      io.observe(items[0]);io.observe(items[items.length-1]);
    }
  });
  const sub=$('.lnav ul',root), cur=sub&&$('a[aria-current]',sub);
  if(cur&&sub.scrollWidth>sub.clientWidth) sub.scrollLeft=cur.parentElement.offsetLeft-sub.clientWidth/2+cur.offsetWidth/2;
}
function openQA(id,focus){
  const d=document.getElementById(id); if(!d) return;
  d.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  if(focus){const h=$('h3',d);h.tabIndex=-1;h.focus({preventScroll:true});}
}

/* ============ Router ============ */
let first=true;
function router(){
  let h=decodeURIComponent(location.hash.replace(/^#\/?/,''));
  let [r,anchor]=h.split('?'); r=(r||'').replace(/\/+$/,'');
  if(location.hash&&!location.hash.startsWith('#/')){const el=document.getElementById(location.hash.slice(1)); if(el){el.scrollIntoView();return;}}
  $$('dialog[open]').forEach(d=>d.close());
  if(r==='' || r==='portal' || r==='warum-mitmachen' || r==='uebersicht'){
    const initialTab = r === 'warum-mitmachen' ? 'why' : (currentPortalTab || 'overview');
    app.innerHTML=home(initialTab);
    document.title = (r === 'warum-mitmachen' ? 'Warum mitmachen? | ' : '') + 'Fachschaft Psychologie Heidelberg';
    markNav(r); hydrate(app);
  } else {
    app.innerHTML=PAGES[r]?page(r):notFound();
    document.title=(PAGES[r]?PAGES[r].t:'Seite nicht gefunden')+' | Fachschaft Psychologie Heidelberg';
    markNav(r); hydrate(app);
  }
  if(anchor){requestAnimationFrame(()=>openQA(anchor));}
  else{window.scrollTo({top:0,behavior:'auto'}); if(!first){const h1=$('h1',app); if(h1)h1.focus({preventScroll:true});}}
  first=false;
}

/* ============ Suche ============ */
let IDX=null;
function buildIndex(){
  IDX=[]; const tmp=document.createElement('div');
  const strip=html=>{tmp.innerHTML=html;$$('svg',tmp).forEach(s=>s.remove());return tmp.textContent.replace(/\s+/g,' ').trim();};
  Object.entries(PAGES).forEach(([r,p])=>{
    const path=r.split('/').map((_,i,a)=>a.slice(0,i+1).join('/')).filter(x=>PAGES[x]&&x!==r).map(navTitle).join(' › ')||'Fachschaft Psychologie';
    IDX.push({r:'#/'+r,t:p.t,p:path,x:strip((p.lead||'')+' '+p.body)});
    if(r==='studium/faq'){tmp.innerHTML=p.body;$$('section.qa',tmp).forEach(d=>{const q=$('h3',d).textContent;const a=$('.a',d);IDX.push({r:'#/studium/faq?'+d.id,t:q,p:'Infos zum Studium › FAQ',x:a.textContent.replace(/\s+/g,' ')});});}
  });
  POSTS.forEach(p=>IDX.push({r:P+p.u,t:p.t,p:'Aktuelles › '+new Date(p.d).toLocaleDateString('de-DE'),x:p.x,ext:true}));
  ROOMS.forEach(r=>IDX.push({r:'#/studium/faq?raum',t:'Raum: '+r.b,p:'FAQ › Raumfinder',x:r.w+' '+r.k}));
}
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');
let sel=0, results=[];
function doSearch(q){
  const box=$('#sres'); const words=norm(q).split(/\s+/).filter(w=>w.length>0);
  if(!words.length){results=[];box.innerHTML=`<div class="s-quick">${['Bachelor','BaPsy','Praktikum','ERASMUS','Raum','Psychoparty','Protokolle','FachRat'].map(w=>`<button class="chip" type="button" data-q="${w}">${w}</button>`).join('')}</div>`;return;}
  if(!IDX) buildIndex();
  results=IDX.map(it=>{const T=norm(it.t),Xn=norm(it.x);let sc=0;for(const w of words){const inT=T.includes(w),inX=Xn.includes(w);const stem=w.length>5&&T.includes(w.slice(0,Math.max(4,w.length-3)));if(!inT&&!inX&&!stem)return null;sc+=(inT?12:0)+(stem&&!inT?10:0)+(T.startsWith(w)?6:0)+Math.min((Xn.split(w).length-1),6);}if(!it.ext&&!it.r.includes('?'))sc+=3;if(it.ext)sc-=2;return {...it,sc};}).filter(Boolean).sort((a,b)=>b.sc-a.sc).slice(0,14);
  sel=0;
  if(!results.length){box.innerHTML=`<p class="s-empty">Keine Treffer für „${q.replace(/[<>&]/g,'')}“. Versuch es mit einem anderen Begriff.</p>`;return;}
  const re=new RegExp('('+words.map(esc).join('|')+')','gi');
  const hl=s=>s.replace(/[<>&]/g,'').replace(re,'<mark>$1</mark>');
  box.innerHTML=results.map((it,i)=>{
    const nx=norm(it.x); let pos=nx.indexOf(words[0]); if(pos<0)pos=0;
    const st=Math.max(0,pos-60); const snip=(st>0?'… ':'')+it.x.slice(st,st+170)+(it.x.length>st+170?' …':'');
    return `<a href="${it.r}" role="option" id="sr${i}" aria-selected="${i===0}" ${it.ext?'target="_blank" rel="noopener"':''}><span class="p">${it.p}</span><span class="t">${hl(it.t)}${it.ext?' '+ic('ext'):''}</span><span class="x">${hl(snip)}</span></a>`;
  }).join('');
}
function moveSel(d){const as=$$('#sres a');if(!as.length)return;sel=(sel+d+as.length)%as.length;as.forEach((a,i)=>a.setAttribute('aria-selected',i===sel));as[sel].scrollIntoView({block:'nearest'});}
function openSearch(){const d=$('#search');if(!d.open){d.showModal();$('#q').value='';doSearch('');$('#q').focus();}}

/* ============ Darstellung: System / Hell / Dunkel ============ */
const root=document.documentElement;
function getPref(){try{const t=localStorage.getItem('fs-theme');return t==='light'||t==='dark'?t:'system';}catch(e){return 'system';}}
function applyPref(p){
  if(p==='system') delete root.dataset.theme; else root.dataset.theme=p;
  try{p==='system'?localStorage.removeItem('fs-theme'):localStorage.setItem('fs-theme',p);}catch(e){}
  $$('[data-theme-set]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.themeSet===p));
}
(()=>{const p=getPref(); if(p!=='system') root.dataset.theme=p;})();


/* ============ Start ============ */
function fitNav(){const g=$('#gnav'),inn=$('.in',g);g.classList.remove('compact');if(inn.scrollWidth>inn.clientWidth+1)g.classList.add('compact');}
const RV=('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches)?new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');RV.unobserve(en.target);}}),{rootMargin:'0px 0px -6% 0px'}):null;
if(RV) root.classList.add('rv-on');
buildNav(); footer(); $('#menuTheme').innerHTML=themeSeg(); decorateLinks($('#footer'));
applyPref(getPref());
document.addEventListener('click',e=>{const t=e.target.closest('[data-theme-set]');if(t)applyPref(t.dataset.themeSet);});
$('#openMenu').addEventListener('click',()=>$('#drawer').showModal());
$('#openSearch').addEventListener('click',openSearch);
$$('dialog [data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close();}));
$('#drawer').addEventListener('click',e=>{const a=e.target.closest('a[href^="#/"]');if(a){setTimeout(()=>$('#drawer').close(),0);if(a.getAttribute('href')===location.hash)router();}});
$('#q').addEventListener('input',e=>doSearch(e.target.value));
$('#q').addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'){e.preventDefault();moveSel(1);}
  else if(e.key==='ArrowUp'){e.preventDefault();moveSel(-1);}
  else if(e.key==='Enter'){const a=$$('#sres a')[sel];if(a){e.preventDefault();a.click();}}
  else if(e.key==='Escape'){e.preventDefault();$('#search').close();}
});
$('#sres').addEventListener('click',e=>{
  const c=e.target.closest('[data-q]'); if(c){$('#q').value=c.dataset.q;doSearch(c.dataset.q);$('#q').focus();return;}
  const a=e.target.closest('a'); if(a&&a.getAttribute('href').startsWith('#')){$('#search').close(); if(a.getAttribute('href')===location.hash){e.preventDefault();router();}}
});
document.addEventListener('keydown',e=>{
  const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
  if((e.key==='k'||e.key==='K')&&(e.ctrlKey||e.metaKey)){e.preventDefault();openSearch();}
  else if(e.key==='/'&&!typing){e.preventDefault();openSearch();}
});
let fitT; window.addEventListener('resize',()=>{clearTimeout(fitT);fitT=setTimeout(fitNav,80);});
fitNav(); if(document.fonts&&document.fonts.ready) document.fonts.ready.then(fitNav);
window.addEventListener('hashchange',router);
router();
