"use strict";




/* ============ Hilfsfunktionen ============ */
const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>[...(r||document).querySelectorAll(s)];
const app=$('#app');
const sec=r=>r.split('/')[0];
const secId=r=>'sec-'+r.replace(/\//g,'-');
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
  const wd=add===0?'Heute':add===1?'Morgen':'Nächster Termin';
  const iso=d.toISOString();
  const dateStr=formatDateLong(d)+' · 18–20 Uhr';
  const inLecture=isLecturePeriod(d);
  const holiday=isHoliday(d);
  let note='In der Vorlesungszeit, jede Woche. Neue Gesichter sind immer willkommen.';
  if(holiday){
    note='Gesetzlicher Feiertag in BW · Sitzung entfällt oder findet nach Absprache statt.';
  } else if(!inLecture){
    note='Vorlesungsfreie Zeit · Sitzungen finden unregelmäßig oder nach Absprache statt.';
  }
  return {live,wd,day:d.getDate(),iso,dateStr,note,inLecture,holiday};
}

/* ============ Startseite ============ */
function home(){
  const s=nextSession(), p0=POSTS[0], d0=new Date(p0.d+'T12:00:00');
  const quick=[['studium/bachelor','book','Bachelor'],['studium/master','cap','Master'],['studium/bachelor/eks','users','EKS'],['studium/approbation','heart','Approbation'],['studium/ausland','compass','Ausland'],['studium/praktika','briefcase','Praktika'],['studium/faq','question','FAQ'],['fachschaft/downloads','download','Protokolle']];
  const why=[
    ['spark','Mitgestalten','Von der Psychoparty bis zum PsychoKino: Du bringst deine Ideen ein und setzt sie mit uns um.',[['leben/psychoparty','Psychoparty'],['leben/psychokino','PsychoKino'],['leben/ersti-we','Ersti-WE']]],
    ['bank','Hochschulpolitik','Du erlebst, wie Entscheidungen über Studium und Lehre entstehen, und bestimmst mit.',[['hopo/fachrat','FachRat'],['hopo/fakrat','Fakultät'],['hopo/stura','StuRa']]],
    // TODO(content): Chips unter 'Semesterübergreifend' prüfen (Bachelor/Master/Aktive passen inhaltlich kaum)
    ['users','Semesterübergreifend','Du lernst engagierte Studierende kennen, die du sonst im Studienalltag nie getroffen hättest.',[['studium/bachelor','Bachelor'],['studium/master','Master'],['fachschaft/aktive','Aktive']]],
    ['handshake','Verantwortung','Erfahrungen sammeln mit eigenen Projekten, Institutsfinanzen und den Themen der Studierenden.',[['fachschaft/kontakt','Sitzung'],['hopo/qsm','QSM-Mittel'],['studium/lehrgestaltung','Lehre']]]
  ];
  return `
<section class="hero" aria-labelledby="hero-h">
 ${pic('hero','',true)}
 <div class="in">
  <p class="eb">Universität Heidelberg</p>
  <h1 id="hero-h" tabindex="-1">Fachschaft Psychologie</h1>
  <p class="lead">Herzlich willkommen! Wir sind die Studierendenvertretung am Psychologischen Institut.</p>
  <div class="btns"><a class="btn btn-primary" href="#/fachschaft">Über uns</a><a class="tlink" href="#/studium">Infos zum Studium${ic('chevr')}</a></div>
 </div>
 <p class="credit">${credit('hero')}</p>
</section>

<nav class="quick" aria-label="Schnellzugriff"><ul>${quick.map(([h,i,t])=>`<li><a href="#/${h}"><span class="qi">${ic(i)}</span>${t}</a></li>`).join('')}</ul></nav>

<section class="sec sec-intro">
 <div class="sec-bg-map" aria-hidden="true">${mapSvg('mapbg-ambient')}</div>
 <div class="wrap intro">
  <div class="rv">
   <p class="statement">Wir vertreten die Psychologiestudierenden in Heidelberg, organisieren Veranstaltungen und helfen dir bei allen Fragen rund ums Studium.</p>
   <p class="more"><a class="tlink" href="#/fachschaft">Mehr über die Fachschaft${ic('chevr')}</a></p>
  </div>
  <aside class="session rv" aria-labelledby="sess-h">
   <h2 id="sess-h">Nächste Sitzung${s.live?'<span class="live">läuft gerade</span>':''}</h2>
   <div class="date"><time class="day" datetime="${s.iso}">${s.day}</time><span class="wd">${s.wd}</span><time class="mo" datetime="${s.iso}">${s.dateStr}</time></div>
   <dl>
    <div><dt>${ic('pin')}<span class="sr">Ort</span></dt><dd>Fachschaftskeller, Hauptstraße 47–51. Durch das Tor in den Innenhof, direkt rechts.</dd></div>
    <div><dt>${ic('video')}<span class="sr">Online</span></dt><dd>Oder nach Absprache online.</dd></div>
    <div><dt>${ic('cal')}<span class="sr">Hinweis</span></dt><dd>${s.note}</dd></div>
   </dl>
   <div class="btns"><a class="btn btn-primary btn-small noext" href="${BBB}">Online teilnehmen</a><a class="tlink noext" href="${CAL}">Alle Termine${ic('chevr')}</a></div>
  </aside>
 </div>
</section>

<section class="sec tight" aria-labelledby="ex-h">
 <div class="wrap">
  <div class="shead rv"><div><h2 class="sh2" id="ex-h">Was interessiert dich gerade?</h2></div></div>
  <div class="bento3">
   <article class="tile t-study rv">
    <figure>${pic('city')}</figure><span class="cap">${credit('city')}</span>
    <div class="tb"><h3><a href="#/studium">Infos zum Studium</a></h3>
     <p>Bewerbung, Studienaufbau, Praktika und Auslandssemester. Dazu Antworten auf die Fragen, die Erstis am häufigsten stellen.</p>
     <div class="subl"><a href="#/studium/bachelor">Bachelor${ic('chevr')}</a><a href="#/studium/master">Master${ic('chevr')}</a><a href="#/studium/approbation">Approbation${ic('chevr')}</a><a href="#/studium/faq">FAQ${ic('chevr')}</a></div></div>
   </article>
   <article class="tile t-events rv" style="--i:1">
    <figure>${pic('night')}</figure><span class="cap">${credit('night')}</span>
    <div class="tb"><h3><a href="#/leben">Veranstaltungen</a></h3>
     <p>Psychoparty, Ersti-Wochenende, PsychoKino und Institutsgrillen.</p>
     <div class="subl"><a href="#/leben/psychoparty">Psychoparty${ic('chevr')}</a><a href="#/leben/ersti-we">Ersti-Wochenende${ic('chevr')}</a></div></div>
   </article>
   <article class="tile t-fs rv" style="--i:2">
    <figure>${pic('valley')}</figure><span class="cap">${credit('valley')}</span>
    <div class="tb"><h3><a href="#/fachschaft">Die Fachschaft</a></h3>
     <p>Wer wir sind, wie du mitmachst und wo wir dich vertreten.</p>
     <div class="subl"><a href="#/fachschaft/aktive">Aktive Fachschaft${ic('chevr')}</a><a href="#/hopo">Hochschulpolitik${ic('chevr')}</a></div></div>
   </article>
  </div>
 </div>
</section>

<section class="sec alt" aria-labelledby="why-h">
 <div class="wrap">
  <div class="shead why-head rv">
   <div>
    <h2 class="sh2" id="why-h">Warum mitmachen?</h2>
    <p class="sub">Worum es bei uns geht – von Hochschulpolitik und Studienberatung bis zum Institutsleben.</p>
   </div>
  </div>
  <div class="why-grid">
   ${why.map(([icon,t,desc,chips],idx)=>`
    <article class="why-card rv" style="--i:${idx}">
     <div class="why-card-top">
      <span class="why-ico" aria-hidden="true">${ic(icon)}</span>
      <span class="why-idx">0${idx+1}</span>
     </div>
     <h3>${t}</h3>
     <p>${desc}</p>
     <div class="why-chips">
      ${chips.map(([href,label])=>`<a class="why-chip" href="#/${href}"><span>${label}</span>${ic('chevr')}</a>`).join('')}
     </div>
    </article>
   `).join('')}
   <article class="why-card why-card-hero rv" style="--i:4">
    <div>
     <div class="why-hero-badge">${ic('smiley')} <span>05 · Der wichtigste Punkt</span></div>
     <h3>Gemeinschaft</h3>
     <p>Fachschaft bedeutet für uns Gemeinschaft: zusammen grillen, Feste planen und Leute aus allen Semestern kennenlernen.</p>
    </div>
    <div>
     <div class="why-hero-session">
      <span class="pulse-dot"></span>
      <div>
       <b>Jede Woche montags</b>
       <span>18–20 Uhr im Fachschaftskeller</span>
      </div>
     </div>
     <a class="btn btn-primary why-hero-cta" href="#/fachschaft/kontakt">
      <span>So erreichst du uns</span>${ic('chevr')}
     </a>
    </div>
   </article>
  </div>
 </div>
</section>

<section class="sec sec-news" aria-labelledby="news-h">
 <div class="wrap">
  <div class="shead rv"><h2 class="sh2" id="news-h">Was gibt’s Neues?</h2><a class="tlink" href="#/aktuelles">Alle Beiträge${ic('chevr')}</a></div>
  ${newsFreshnessHint()}
  <div class="news-grid">
   <article class="feat rv">
    <time datetime="${p0.d}">${d0.toLocaleDateString('de-DE',{day:'numeric',month:'long',year:'numeric'})}</time>
    <h3><a class="noext" href="${P+p0.u}" aria-describedby="ext-tab-msg">${p0.t}<span class="ext-ico" aria-hidden="true">↗</span></a></h3><p>${p0.x}</p>
    <div class="tags">${['Aktuelles',...p0.c].map(c=>`<span class="tag">${c}</span>`).join('')}</div>
   </article>
   <div class="side-news rv" style="--i:1">${newsList(POSTS.slice(1,4))}</div>
  </div>
 </div>
</section>

<section class="sec tight sec-blackbox" aria-labelledby="bb-h">
 <div class="wrap">
  <div class="bbox rv">
   <div>
    <p class="kick">Die Zeitschrift am Institut</p>
    <h2 class="sh2" id="bb-h">BlackBox</h2>
    <p>Jedes Semester eine neue Ausgabe mit Artikeln von Studierenden und Dozierenden, Umfragen und Memes. Das Archiv reicht bis 1983 zurück.</p>
    <ul class="issues-mini">${ISSUES.slice(0,4).map(([n,s,f])=>`<li><a class="noext" href="${U+f}"><b>Nr.&nbsp;${n}</b>${s}</a></li>`).join('')}</ul>
    <div class="btns"><a class="btn btn-primary noext" href="${U+ISSUES[0][2]}">${ic('download')}Neue Ausgabe lesen</a><a class="tlink" href="#/leben/blackbox">Zum Archiv${ic('chevr')}</a></div>
   </div>
   <div class="orb" data-face="a">
    <svg viewBox="0 0 240 220" role="img" aria-label="Optische Täuschung: Necker-Würfel mit bistabiler Wahrnehmung" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round">
     <title id="necker-title">Optische Täuschung: Necker-Würfel mit bistabiler Wahrnehmung</title>
     <path class="fa" d="M30 80H150V200H30Z"/><path class="fb" d="M90 20H210V140H90Z"/>
     <path d="M30 80H150V200H30ZM90 20H210V140H90ZM30 80 90 20M150 80 210 20M150 200 210 140M30 200 90 140"/>
    </svg>
    <button class="btn btn-ghost btn-small" type="button" data-necker aria-pressed="false">Perspektive wechseln</button>
    <small>Der Necker-Würfel: Du siehst ihn von oben oder von unten, aber nie beides zugleich.</small>
   </div>
  </div>
 </div>
</section>

<section class="sec" aria-labelledby="map-h">
 <div class="wrap">
  <div class="shead rv"><div><h2 class="sh2" id="map-h">So findest du uns</h2><p class="sub">Mitten in der Altstadt, an der Hauptstraße zwischen Bismarckplatz und Universitätsplatz.</p></div></div>
  <div class="mapwrap rv" data-zoomable>
   <div class="map-viewport">
    <div class="map-layer">
     ${mapSvg('mapsvg')}
     <span class="pin" style="left:${MAP_META.ix}%;top:${MAP_META.iy}%"></span>
     <span class="pin-label" style="left:${MAP_META.ix}%;top:${MAP_META.iy}%">Psychologisches Institut</span>
    </div>
   </div>
   <div class="map-ctrls" role="toolbar" aria-label="Karte zoomen">
    <button type="button" class="mctrl-btn" data-mzoom="in" title="Vergrößern (Reinzoomen)" aria-label="Vergrößern"><svg viewBox="0 0 24 24" class="i" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
    <button type="button" class="mctrl-btn" data-mzoom="out" title="Verkleinern (Rauszoomen)" aria-label="Verkleinern"><svg viewBox="0 0 24 24" class="i" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
    <button type="button" class="mctrl-btn" data-mzoom="reset" title="Zentrieren / Zurücksetzen" aria-label="Zentrieren"><svg viewBox="0 0 24 24" class="i" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></button>
   </div>
   <div class="mapcard">
    <div class="mapcard-head">
     <div class="mapcard-title-row">
      <h3>Fachschaftskeller</h3>
      <span class="spot-pill">${ic('pin')}Innenhof</span>
     </div>
     <p class="mapcard-addr"><b>Hauptstraße 47–51, 69117 Heidelberg</b><span>Durch das Tor in den Innenhof, der Keller liegt direkt rechts.</span></p>
    </div>
    <div class="mapcard-time">
     ${ic('clock')}<span>Sitzungen montags 18–20 Uhr (Vorlesungszeit)</span>
    </div>
    <div class="mapcard-actions">
     <a class="btn btn-primary btn-small mapcard-cta" href="#/fachschaft/kontakt">${ic('mail')}Kontakt</a>
     <div class="mapcard-maps">
      <a class="btn-route noext" href="${GMAPS_LINK}" target="_blank" rel="noopener" title="In Google Maps öffnen">${ic('map')}<span>Google Maps</span></a>
      <a class="btn-route noext" href="${APPLE_MAPS_LINK}" target="_blank" rel="noopener" title="In Apple Maps öffnen">${ic('compass')}<span>Apple Maps</span></a>
     </div>
    </div>
   </div>
   <p class="mapcredit">Kartendaten © <a class="noext" href="${OSM}">OpenStreetMap-Mitwirkende</a></p>
  </div>
 </div>
</section>`;
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
  const hasLocal=list.length>1;
  const isMulti=kidsOf(s).length>0;

  const lnav=hasLocal?`<nav class="lnav" aria-label="${navTitle(s)}" data-topic-nav><div class="in"><a class="lt" href="#/${s}" data-sec-target="${secId(s)}">${navTitle(s)}</a><ul>${list.map(r=>`<li><a href="#/${r}" data-sec-target="${secId(r)}" ${r===route?'aria-current="page"':''}>${r===s?'Übersicht':PAGES[r].t}</a></li>`).join('')}</ul></div></nav>`:'';

  let banner='';
  if(s==='hopo') banner=`<figure class="banner map rv" data-zoomable><div class="bi"><div class="map-viewport"><div class="map-layer">${mapSvg('')}</div></div><div class="map-ctrls" role="toolbar" aria-label="Karte zoomen"><button type="button" class="mctrl-btn" data-mzoom="in" title="Vergrößern"><svg viewBox="0 0 24 24" class="i" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button><button type="button" class="mctrl-btn" data-mzoom="out" title="Verkleinern"><svg viewBox="0 0 24 24" class="i" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg></button><button type="button" class="mctrl-btn" data-mzoom="reset" title="Zurücksetzen"><svg viewBox="0 0 24 24" class="i" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></button></div></div><figcaption>Heidelberger Altstadt. Kartendaten © <a class="noext" href="${OSM}">OpenStreetMap-Mitwirkende</a> • <a class="noext" href="${GMAPS_LINK}" target="_blank" rel="noopener">Google Maps</a> • <a class="noext" href="${APPLE_MAPS_LINK}" target="_blank" rel="noopener">Apple Maps</a></figcaption></figure>`;
  else if(SECTION_IMG[s]) banner=`<figure class="banner rv"><div class="bi">${pic(SECTION_IMG[s],'',true)}</div><figcaption>${credit(SECTION_IMG[s])}</figcaption></figure>`;

  if(!isMulti){
    return `${lnav}
    <header class="phead">${banner?'':mapSvg('mapbg')}<div class="in rv">${crumbs(route)}<h1 tabindex="-1">${p.t}</h1>${p.lead?`<p class="lead">${p.lead}</p>`:''}</div></header>
    ${banner}
    <article class="doc prose rv" style="--i:1">
     ${p.body}
    </article>`;
  }

  const mainP=PAGES[s];
  const overviewHtml=`
    <section class="topic-section topic-overview rv" id="${secId(s)}" data-route="${s}">
      ${mainP.body}
    </section>`;

  const childrenHtml=kidsOf(s).map((childRoute,idx)=>{
    const cp=PAGES[childRoute];
    return `
    <section class="topic-section rv" id="${secId(childRoute)}" data-route="${childRoute}" style="--i:${(idx%3)+1}">
      <header class="topic-section-head">
        <div class="topic-section-meta">
          <span class="topic-badge">${navTitle(s)}</span>
          <span class="topic-dot">·</span>
          <span class="topic-sub">${cp.t}</span>
        </div>
        <h2 class="topic-section-title">${cp.t}</h2>
        ${cp.lead?`<p class="topic-section-lead">${cp.lead}</p>`:''}
      </header>
      <div class="topic-section-body">
        ${cp.body}
      </div>
    </section>`;
  }).join('');

  return `${lnav}
  <header class="phead">${banner?'':mapSvg('mapbg')}<div class="in rv">${crumbs(s)}<h1 tabindex="-1">${mainP.t}</h1>${mainP.lead?`<p class="lead">${mainP.lead}</p>`:''}</div></header>
  ${banner}
  <article class="doc prose" style="--i:1">
    ${overviewHtml}
    ${childrenHtml}
    <div class="topic-bottom-nav">
      <a class="btn btn-ghost btn-small" href="#/${s}" data-sec-target="${secId(s)}">${ic('chevr')} Zur Übersicht von ${navTitle(s)}</a>
    </div>
  </article>`;
}
function notFound(){
  return `<header class="phead">${mapSvg('mapbg')}<div class="in rv">${crumbs('')}<h1 tabindex="-1">Seite nicht gefunden</h1><p class="lead">Diese Adresse gibt es auf unserer Website nicht oder sie wurde im Zuge des Relaunchs verschoben.</p></div></header>
  <article class="doc prose rv" style="--i:1">
    <div class="panel stone">
      <h2 style="font-size:18px;margin-top:0">Was suchst du?</h2>
      <p>Hier sind einige der am häufigsten besuchten Seiten:</p>
      <div class="bento3" style="margin-top:16px">
        <a class="card" href="#/studium"><h3>${ic('book')} Infos zum Studium</h3><p>Bachelor, Master, BaPsy und FAQs.</p></a>
        <a class="card" href="#/fachschaft/kontakt"><h3>${ic('pin')} Fachschaft & Kontakt</h3><p>Sitzungstermine und Ansprechpersonen.</p></a>
        <a class="card" href="#/aktuelles"><h3>${ic('newspaper')} Aktuelles</h3><p>Neuigkeiten rund ums Institut.</p></a>
      </div>
      <div class="btns" style="margin-top:20px">
        <a class="btn btn-primary" href="#/">Zur Startseite</a>
        <button class="btn btn-ghost" type="button" data-opensearch>${ic('search')}Website durchsuchen</button>
      </div>
    </div>
  </article>`;
}

/* ============ Navigation ============ */
const SEC_ICONS = {
  fachschaft: 'users',
  studium: 'cap',
  leben: 'spark',
  hopo: 'bank'
};

const NAV_TAGS = {
  'studium/bachelor/eks': 'Ersti-Woche',
  'leben/blackbox': 'Zeitschrift',
  'leben/ersti-we': 'Ende Nov.',
  'hopo/psyfako': 'Bundesweit'
};

const DRAWER_GROUPS = {
  fachschaft: [
    { label: 'Über uns', items: ['fachschaft', 'fachschaft/aktive'] },
    // TODO(content): Direkter Satzungs-Link falls gewünscht: https://heibox.uni-heidelberg.de/f/05936ab93edc4a9abdec/?dl=1
    { label: 'Kontakt & Downloads', items: ['fachschaft/kontakt', 'fachschaft/downloads'] }
  ],
  studium: [
    { label: 'Studiengänge & Start', items: ['studium', 'studium/bachelor', 'studium/bachelor/eks', 'studium/master', 'studium/approbation'] },
    { label: 'Praxis & Ausland', items: ['studium/praktika', 'studium/ausland'] },
    { label: 'Orientierung & Hilfe', items: ['studium/faq', 'studium/lehrgestaltung', 'studium/links'] }
  ],
  leben: [
    { label: 'Kultur & Medien', items: ['leben', 'leben/psychoparty', 'leben/blackbox', 'leben/psychokino'] },
    { label: 'Events & Treffen', items: ['leben/ersti-we', 'leben/grillen', 'leben/pumpkinparty', 'leben/wechslertreffen'] }
  ],
  hopo: [
    { label: 'Am Institut', items: ['hopo', 'hopo/fachrat', 'hopo/fachschaftsrat', 'hopo/pruefungsausschuss'] },
    { label: 'Fakultät & Universität', items: ['hopo/fakrat', 'hopo/stura', 'hopo/qsm'] },
    { label: 'Überregional', items: ['hopo/psyfako'] }
  ]
};

function buildNav(){
  const mains=TREE.filter(([r])=>r!=='impressum');
  $('#mainnav').innerHTML=mains.map(([r])=>`<li><a href="#/${r}" data-sec="${r}">${navTitle(r)}</a></li>`).join('');
  $('#drawerBody').innerHTML=mains.filter(([,k])=>k.length).map(([r])=>{
    const groups=DRAWER_GROUPS[r]||[{label:'',items:[r,...kidsOf(r)]}];
    const icon=SEC_ICONS[r]||'folder';
    return `<section class="sheet-col" aria-labelledby="col-title-${r}">
      <div class="sheet-col-head">
        <h2 class="sheet-col-title-wrap" id="col-title-${r}">
          <a class="sheet-col-title" href="#/${r}">
            <span class="sheet-col-ico" aria-hidden="true">${ic(icon)}</span>
            <span class="sheet-col-name">${navTitle(r)}</span>
          </a>
        </h2>
      </div>
      <div class="sheet-col-body">
        ${groups.map((g,gi)=>{
          const gid=`group-${r}-${gi}`;
          return `<div class="sheet-group">
            ${g.label?`<h3 id="${gid}" class="sheet-group-label">${g.label}</h3>`:''}
            <ul class="sheet-group-list"${g.label?` aria-labelledby="${gid}"`:''}>
              ${g.items.map(k=>{
                const isOverview=k===r;
                const title=isOverview?'Übersicht':PAGES[k].t;
                const tag=NAV_TAGS[k]?`<span class="m-tag">${NAV_TAGS[k]}</span>`:'';
                return `<li><a href="#/${k}" class="sheet-link${isOverview?' is-overview':''}"><span>${title}</span>${tag}</a></li>`;
              }).join('')}
            </ul>
          </div>`;
        }).join('')}
      </div>
    </section>`;
  }).join('');
  $('#menuQuick').innerHTML=[['','Startseite'],['aktuelles','Aktuelles'],['fachschaft/kontakt','Kontakt'],['impressum','Impressum']].map(([r,t])=>`<a href="#/${r}">${t}</a>`).join('');
}
function markNav(route){
  const s=route?sec(route):'';
  $$('#mainnav a').forEach(a=>{if(a.dataset.sec===s)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
  $$('#drawer a').forEach(a=>{if(a.getAttribute('href')==='#/'+route)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
}
function markLnav(route){
  $$('.lnav ul a').forEach(a=>{
    if(a.getAttribute('href')==='#/'+route) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
  const sub=$('.lnav ul'), cur=sub&&$('a[aria-current]',sub);
  if(cur&&sub.scrollWidth>sub.clientWidth){
    cur.scrollIntoView({inline:'nearest',behavior:'smooth'});
  }
}
function themeSeg(){
  return `<div class="seg" role="group" aria-label="Darstellung">${[['system','monitor','System'],['light','sun','Hell'],['dark','moon','Dunkel']].map(([v,i,t])=>`<button type="button" data-theme-set="${v}" aria-pressed="false">${ic(i)}${t}</button>`).join('')}</div>`;
}
function footer(){
  const col=(r,extra)=>`<div><h2><a href="#/${r}">${navTitle(r)}</a></h2><ul>${kidsOf(r).map(k=>`<li><a href="#/${k}">${PAGES[k].t}</a></li>`).join('')}${extra||''}</ul></div>`;
  $('#footer').innerHTML=`<div class="f-in">
   <p class="f-note" aria-label="Fotos von Heidelberg: Samuel Scherer und Fachschaft MathPhysInfo, Lizenz CC BY-SA 4.0. Kartendaten © OpenStreetMap-Mitwirkende. Einzelheiten unter Bildnachweise.">Fotos von Heidelberg: Samuel Scherer und Fachschaft MathPhysInfo, <a class="noext" href="${CCBYSA}" aria-label="Lizenz CC BY-SA 4.0">CC BY-SA 4.0</a>. Kartendaten © <a class="noext" href="${OSM}">OpenStreetMap-Mitwirkende</a>. Einzelheiten unter <a href="#/impressum">Bildnachweise</a>.</p>
   <nav class="f-dir" aria-label="Alle Seiten">
    ${col('fachschaft',`<li><a href="#/aktuelles">Aktuelles</a></li>`)}${col('studium')}${col('leben')}${col('hopo')}
    <div><h2>Kontakt</h2><ul><li><a href="mailto:${MAIL}">E-Mail schreiben</a></li><li><a class="noext" href="${BBB}">Online-Sitzung</a></li><li><a class="noext" href="${PSYTREFF}">Psychotreff-Verteiler</a></li><li><a class="noext" href="${IG}">Instagram</a></li><li><a class="noext" href="${FB}">Facebook</a></li><li><a class="noext" href="https://www.psychologie.uni-heidelberg.de/">Psychologisches Institut</a></li><li><a class="noext" href="https://www.stura.uni-heidelberg.de/">StuRa</a></li></ul></div>
   </nav>
   <div class="f-addr"><span>Fachschaft Psychologie, Hauptstraße 47–51, 69117 Heidelberg</span><span>Tel. <a href="tel:+496221542456">+49&nbsp;6221&nbsp;54-2456</a></span><span><a href="mailto:${MAIL}">${MAIL}</a></span></div>
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
    if(!a.closest('h1,h2,h3,h4,h5,h6')&&!$('.sr',a)&&!a.hasAttribute('aria-describedby')) a.insertAdjacentHTML('beforeend','<span class="sr"> (öffnet in neuem Tab)</span>');
  });
}
/* ============ Interaktive Karten (Zoom & Pan) ============ */
function initZoomableMaps(root){
  const isMac = typeof navigator !== 'undefined' && /Macintosh|Mac OS X|iPhone|iPad|iPod/.test(navigator.userAgent);
  const zoomHint = isMac ? '⌘ + Scrollen zum Zoomen' : 'Strg + Scrollen zum Zoomen';

  const setupMap = container => {
    const vp = $('.map-viewport', container);
    const layer = $('.map-layer', container);
    if(!vp || !layer || container._zoomInited) return;
    container._zoomInited = true;

    // A11y & Fokus
    if(!vp.hasAttribute('tabindex')) vp.setAttribute('tabindex', '0');
    if(!vp.hasAttribute('role')) vp.setAttribute('role', 'region');
    if(!vp.hasAttribute('aria-label')) vp.setAttribute('aria-label', 'Interaktive Umgebungskarte. Pfeiltasten zum Bewegen, Plus und Minus zum Zoomen.');

    let toast = $('.map-toast', container);
    if(!toast){
      toast = document.createElement('div');
      toast.className = 'map-toast';
      toast.setAttribute('aria-live', 'polite');
      toast.textContent = zoomHint;
      container.appendChild(toast);
    }

    let toastTimer = null;
    function showToast(msg = zoomHint){
      toast.textContent = msg;
      toast.classList.add('visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('visible'), 1400);
    }

    let scale = 1;
    let x = 0, y = 0;
    let isDragging = false;
    let startX = 0, startY = 0;
    let initialDist = 0, initialScale = 1;
    let startMidX = 0, startMidY = 0;
    let isMapActive = false;

    vp.addEventListener('focus', () => { isMapActive = true; });
    vp.addEventListener('blur', () => { isMapActive = false; });
    vp.addEventListener('click', () => { isMapActive = true; });

    document.addEventListener('pointerdown', e => {
      if(!container.contains(e.target)){
        isMapActive = false;
      }
    });

    function applyTransform(animated = false){
      const rect = vp.getBoundingClientRect();
      const maxPanX = Math.max(0, (rect.width * (scale - 1)) / 2);
      const maxPanY = Math.max(0, (rect.height * (scale - 1)) / 2);

      if(scale <= 1){
        x = 0; y = 0; scale = 1;
      } else {
        x = Math.max(-maxPanX, Math.min(maxPanX, x));
        y = Math.max(-maxPanY, Math.min(maxPanY, y));
      }

      container.style.setProperty('--map-scale', scale.toFixed(2));
      layer.style.transition = animated ? 'transform .26s cubic-bezier(.16,1,.3,1)' : 'none';
      layer.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      
      const resetBtn = $('[data-mzoom="reset"]', container);
      if(resetBtn) resetBtn.classList.toggle('active', scale > 1.05 || Math.abs(x) > 4 || Math.abs(y) > 4);
      vp.style.cursor = scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default';
    }

    $$('[data-mzoom]', container).forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        isMapActive = true;
        const action = btn.dataset.mzoom;
        if(action === 'in'){
          scale = Math.min(5, scale * 1.4);
          applyTransform(true);
        } else if(action === 'out'){
          scale = Math.max(1, scale / 1.4);
          applyTransform(true);
        } else if(action === 'reset'){
          scale = 1; x = 0; y = 0;
          applyTransform(true);
        }
      });
    });

    // Mausrad: Scrollt die Seite immer normal weiter, außer Strg/Cmd wird gehalten
    vp.addEventListener('wheel', e => {
      const modifier = e.ctrlKey || e.metaKey;
      if(!modifier){
        showToast(zoomHint);
        return; // Kein e.preventDefault(): Seite scrollt ungestört!
      }

      e.preventDefault();
      const rect = vp.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      const delta = e.deltaY < 0 ? 1.2 : 0.83;
      const prevScale = scale;
      const nextScale = Math.min(5, Math.max(1, scale * delta));
      if(nextScale === prevScale) return;

      const factor = nextScale / prevScale;
      x = mouseX - factor * (mouseX - x);
      y = mouseY - factor * (mouseY - y);
      scale = nextScale;
      applyTransform(false);
    }, { passive: false });

    // Dragging mit Maus
    vp.addEventListener('mousedown', e => {
      if(e.button !== 0) return;
      isMapActive = true;
      isDragging = true;
      startX = e.clientX - x;
      startY = e.clientY - y;
      vp.style.cursor = 'grabbing';
      e.preventDefault();
    });

    const onMove = e => {
      if(!isDragging) return;
      x = e.clientX - startX;
      y = e.clientY - startY;
      applyTransform(false);
    };

    const onUp = () => {
      if(!isDragging) return;
      isDragging = false;
      applyTransform(true);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    // Tastaturbedienung
    vp.addEventListener('keydown', e => {
      const step = 40;
      let handled = true;
      if(e.key === 'ArrowUp'){
        y += step;
      } else if(e.key === 'ArrowDown'){
        y -= step;
      } else if(e.key === 'ArrowLeft'){
        x += step;
      } else if(e.key === 'ArrowRight'){
        x -= step;
      } else if(e.key === '+' || e.key === '='){
        scale = Math.min(5, scale * 1.3);
      } else if(e.key === '-' || e.key === '_'){
        scale = Math.max(1, scale / 1.3);
      } else if(e.key === '0' || e.key === 'Escape'){
        scale = 1; x = 0; y = 0;
      } else {
        handled = false;
      }

      if(handled){
        e.preventDefault();
        applyTransform(true);
      }
    });

    // Touch-Gesten:
    // 1 Finger: Seite scrollt ungestört (native)
    // 2 Finger: Karte verschieben & Zoomen
    let isTwoFingerTouch = false;
    vp.addEventListener('touchstart', e => {
      if(e.touches.length === 2){
        isTwoFingerTouch = true;
        initialDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialScale = scale;
        startMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - x;
        startMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - y;
      } else {
        isTwoFingerTouch = false;
      }
    }, { passive: true });

    vp.addEventListener('touchmove', e => {
      if(e.touches.length === 2 && isTwoFingerTouch){
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const curMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const curMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        
        x = curMidX - startMidX;
        y = curMidY - startMidY;
        scale = Math.min(5, Math.max(1, initialScale * (dist / initialDist)));
        applyTransform(false);
      }
    }, { passive: false });

    vp.addEventListener('touchend', e => {
      if(e.touches.length < 2){
        isTwoFingerTouch = false;
        applyTransform(true);
      }
    }, { passive: true });

    vp.addEventListener('dblclick', e => {
      e.preventDefault();
      isMapActive = true;
      const rect = vp.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      if(scale < 2){
        const nextScale = 2.4;
        const factor = nextScale / scale;
        x = mouseX - factor * (mouseX - x);
        y = mouseY - factor * (mouseY - y);
        scale = nextScale;
      } else {
        scale = 1; x = 0; y = 0;
      }
      applyTransform(true);
    });

    applyTransform(false);
  };

  $$('[data-zoomable]', root).forEach(container => {
    if('IntersectionObserver' in window && !container._zoomInited){
      const obs = new IntersectionObserver((entries, observer)=>{
        entries.forEach(entry => {
          if(entry.isIntersecting){
            observer.unobserve(container);
            setupMap(container);
          }
        });
      }, {rootMargin:'250px 0px'});
      obs.observe(container);
    } else {
      setupMap(container);
    }
  });
}

function hydrate(root){
  decorateLinks(root);
  initZoomableMaps(root);
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
    $$('h2.qa-group, section.qa',body).forEach(el=>{if(el.tagName==='H2'){cur={el,h:el.textContent,q:[]};groups.push(cur);}else if(cur){cur.q.push(el);}});
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
  $$('.why-card',root).forEach(c=>{
    c.addEventListener('mousemove',e=>{
      const r=c.getBoundingClientRect();
      c.style.setProperty('--x',`${e.clientX-r.left}px`);
      c.style.setProperty('--y',`${e.clientY-r.top}px`);
    });
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
let currentSec=null;
let topicObserver=null;
let isScrollSpyNavigating=false;

function initTopicScrollSpy(s){
  if(topicObserver){topicObserver.disconnect(); topicObserver=null;}
  const sections=$$('.topic-section',app);
  if(!sections.length) return;

  if(!('IntersectionObserver' in window)) return;

  topicObserver=new IntersectionObserver((entries)=>{
    if(isScrollSpyNavigating) return;
    const visible=entries.filter(e=>e.isIntersecting);
    if(!visible.length) return;
    visible.sort((a,b)=>Math.abs(a.boundingClientRect.top-120)-Math.abs(b.boundingClientRect.top-120));
    const best=visible[0];
    const route=best.target.dataset.route;
    if(route){
      markLnav(route);
      markNav(route);
      if(history.replaceState){
        history.replaceState(null,'','#'+route);
      }
      if(PAGES[route]){
        document.title=PAGES[route].t+' | Fachschaft Psychologie Heidelberg';
      }
    }
  },{
    rootMargin:'-100px 0px -55% 0px',
    threshold:[0, 0.2, 0.5]
  });

  sections.forEach(secEl=>topicObserver.observe(secEl));
}

function updateMeta(title, desc){
  document.title = title;
  const d = desc || 'Die Fachschaft Psychologie an der Universität Heidelberg: Infos zum Studium, Veranstaltungen am Institut und Hochschulpolitik.';
  const metaDesc = $('meta[name="description"]');
  if(metaDesc) metaDesc.setAttribute('content', d);
  const ogTitle = $('meta[property="og:title"]');
  if(ogTitle) ogTitle.setAttribute('content', title);
  const ogDesc = $('meta[property="og:description"]');
  if(ogDesc) ogDesc.setAttribute('content', d);
  const twTitle = $('meta[name="twitter:title"]');
  if(twTitle) twTitle.setAttribute('content', title);
  const twDesc = $('meta[name="twitter:description"]');
  if(twDesc) twDesc.setAttribute('content', d);
  const el = $('#routeAnnouncer');
  if(el) el.textContent = title;
}

function router(){
  let h=decodeURIComponent(location.hash.replace(/^#\/?/,''));
  let [r,anchor]=h.split('?'); r=(r||'').replace(/\/+$/,'');
  if(location.hash&&!location.hash.startsWith('#/')){
    const el=document.getElementById(location.hash.slice(1));
    if(el){el.scrollIntoView({behavior:'smooth'});return;}
  }
  $$('dialog[open]').forEach(d=>d.close());

  if(r===''){
    currentSec=null;
    if(topicObserver){topicObserver.disconnect(); topicObserver=null;}
    app.innerHTML=home();
    updateMeta('Fachschaft Psychologie Heidelberg');
    markNav(r); hydrate(app);
    window.scrollTo({top:0,behavior:'auto'});
    if(!first){const h1=$('h1',app); if(h1)h1.focus({preventScroll:true});}
    first=false;
    return;
  }

  if(!PAGES[r]){
    currentSec=null;
    if(topicObserver){topicObserver.disconnect(); topicObserver=null;}
    app.innerHTML=notFound();
    updateMeta('Seite nicht gefunden | Fachschaft Psychologie Heidelberg', 'Diese Seite existiert leider nicht. Bitte starte auf der Startseite oder nutze die Suche.');
    markNav(r); hydrate(app);
    window.scrollTo({top:0,behavior:'auto'});
    if(!first){const h1=$('h1',app); if(h1)h1.focus({preventScroll:true});}
    first=false;
    return;
  }

  const s=sec(r);
  const isMulti=kidsOf(s).length>0;

  if(isMulti){
    if(currentSec===s){
      markNav(r); markLnav(r);
      updateMeta(PAGES[r].t+' | Fachschaft Psychologie Heidelberg', PAGES[r].d || PAGES[r].lead);
      const target=document.getElementById(secId(r));
      if(target){
        isScrollSpyNavigating=true;
        target.scrollIntoView({behavior:first?'auto':'smooth'});
        setTimeout(()=>{isScrollSpyNavigating=false;},700);
      }
      if(anchor){requestAnimationFrame(()=>openQA(anchor));}
      if(!first){const h1=$('h1',app); if(h1)h1.focus({preventScroll:true});}
      first=false;
      return;
    }

    currentSec=s;
    app.innerHTML=page(r);
    updateMeta(PAGES[r].t+' | Fachschaft Psychologie Heidelberg', PAGES[r].d || PAGES[r].lead);
    markNav(r); markLnav(r); hydrate(app);
    initTopicScrollSpy(s);

    if(r!==s){
      const target=document.getElementById(secId(r));
      if(target){
        requestAnimationFrame(()=>{
          target.scrollIntoView({behavior:'auto'});
        });
      }
    } else {
      window.scrollTo({top:0,behavior:'auto'});
    }
    if(anchor){requestAnimationFrame(()=>openQA(anchor));}
    if(!first){const h1=$('h1',app); if(h1)h1.focus({preventScroll:true});}
    first=false;
    return;
  }

  currentSec=s;
  if(topicObserver){topicObserver.disconnect(); topicObserver=null;}
  app.innerHTML=page(r);
  updateMeta(PAGES[r].t+' | Fachschaft Psychologie Heidelberg', PAGES[r].d || PAGES[r].lead);
  markNav(r); hydrate(app);
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
  if(!words.length){
    results=[];
    box.innerHTML=`<div class="s-quick">
      <div class="s-quick-title">Häufig gesucht</div>
      <div class="s-quick-chips">
        ${['Bachelor','Master','BaPsy','Praktikum','Ausland','FAQ','Raumfinder','Psychoparty','Protokolle','FachRat'].map(w=>`<button class="chip" type="button" data-q="${w}">${w}</button>`).join('')}
      </div>
      <div class="s-quick-links">
        <a href="#/studium/faq">${ic('question')} Häufige Fragen (FAQ)</a>
        <a href="#/studium/faq?raum">${ic('search')} Raumfinder Institut</a>
        <a href="#/fachschaft/kontakt">${ic('pin')} Fachschaft & Kontakt</a>
      </div>
    </div>`;
    return;
  }
  if(!IDX) buildIndex();
  results=IDX.map(it=>{const T=norm(it.t),Xn=norm(it.x);let sc=0;for(const w of words){const inT=T.includes(w),inX=Xn.includes(w);const stem=w.length>5&&T.includes(w.slice(0,Math.max(4,w.length-3)));if(!inT&&!inX&&!stem)return null;sc+=(inT?12:0)+(stem&&!inT?10:0)+(T.startsWith(w)?6:0)+Math.min((Xn.split(w).length-1),6);}if(!it.ext&&!it.r.includes('?'))sc+=3;if(it.ext)sc-=2;return {...it,sc};}).filter(Boolean).sort((a,b)=>b.sc-a.sc).slice(0,14);
  sel=0;
  if(!results.length){
    const safeQ=q.replace(/[<>&]/g,'');
    box.innerHTML=`<div class="s-empty">
      <p>Keine Treffer für „${safeQ}“. Versuch es mit einem anderen Begriff.</p>
      <div class="s-empty-suggestions">
        <div class="s-quick-title">Suchvorschläge</div>
        <div class="s-quick-chips">
          ${['Bachelor','Master','Praktikum','FAQ','Raum','Kontakt'].map(w=>`<button class="chip" type="button" data-q="${w}">${w}</button>`).join('')}
        </div>
      </div>
    </div>`;
    return;
  }
  const re=new RegExp('('+words.map(esc).join('|')+')','gi');
  const hl=s=>s.replace(/[<>&]/g,'').replace(re,'<mark>$1</mark>');
  box.innerHTML=results.map((it,i)=>{
    const nx=norm(it.x); let pos=nx.indexOf(words[0]); if(pos<0)pos=0;
    const st=Math.max(0,pos-60); const snip=(st>0?'… ':'')+it.x.slice(st,st+170)+(it.x.length>st+170?' …':'');
    return `<a href="${it.r}" role="option" id="sr${i}" aria-selected="${i===0}" ${it.ext?'target="_blank" rel="noopener"':''}><span class="p">${it.p}</span><span class="t">${hl(it.t)}${it.ext?' '+ic('ext'):''}</span><span class="x">${hl(snip)}</span></a>`;
  }).join('');
}
function moveSel(d){const as=$$('#sres a');if(!as.length)return;sel=(sel+d+as.length)%as.length;as.forEach((a,i)=>a.setAttribute('aria-selected',i===sel));as[sel].scrollIntoView({block:'nearest'});}
function openSearch(){
  const d=$('#search');
  if(!d.open){
    d.showModal();
    const b=$('#openSearch'); if(b) b.setAttribute('aria-expanded','true');
    $('#q').value='';
    doSearch('');
    $('#q').focus();
  }
}

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
const RV=('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches)?new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');RV.unobserve(en.target);}}),{rootMargin:'0px 0px 18% 0px'}):null;
if(RV) root.classList.add('rv-on');
buildNav(); footer(); $('#menuTheme').innerHTML=themeSeg(); decorateLinks($('#footer'));
applyPref(getPref());
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-theme-set]');
  if(t)applyPref(t.dataset.themeSet);
  const onPageLink=e.target.closest('a[href^="#/"]');
  if(onPageLink&&currentSec){
    const rawHref=onPageLink.getAttribute('href');
    const targetRoute=rawHref.replace(/^#\/?/,'').split('?')[0];
    if(sec(targetRoute)===currentSec){
      const targetEl=document.getElementById(secId(targetRoute));
      if(targetEl){
        e.preventDefault();
        isScrollSpyNavigating=true;
        targetEl.scrollIntoView({behavior:'smooth'});
        history.pushState(null,'',rawHref);
        markNav(targetRoute);
        markLnav(targetRoute);
        if(PAGES[targetRoute]){
          updateMeta(PAGES[targetRoute].t+' | Fachschaft Psychologie Heidelberg', PAGES[targetRoute].d || PAGES[targetRoute].lead);
        }
        setTimeout(()=>{isScrollSpyNavigating=false;},800);
      }
    }
  }
});
$('#openMenu').addEventListener('click',()=>{
  $('#drawer').showModal();
  $('#openMenu').setAttribute('aria-expanded','true');
});
$('#openSearch').addEventListener('click',openSearch);
$('#drawer').addEventListener('close',()=>{
  $('#openMenu').setAttribute('aria-expanded','false');
  if(document.activeElement===document.body || $('#drawer').contains(document.activeElement)){
    $('#openMenu').focus();
  }
});
$('#search').addEventListener('close',()=>{
  const b=$('#openSearch');
  if(b) b.setAttribute('aria-expanded','false');
  if(document.activeElement===document.body || $('#search').contains(document.activeElement)){
    if(b) b.focus();
  }
});
$$('[data-opensearch]').forEach(b=>b.addEventListener('click',()=>{const d=b.closest('dialog');if(d)d.close();openSearch();}));
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
