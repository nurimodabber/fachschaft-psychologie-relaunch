"use strict";
/* ============ Konstanten ============ */
// Basis-URL für Beiträge auf dem WordPress-Server des StuRa
// Hinweis: Die WordPress-Installation des StuRa liegt unter /path/to/wordpress/
const WP_BASE='https://fs-psychologie.stura.uni-heidelberg.de/path/to/wordpress/';
const P=WP_BASE;
const OLD='https://fs-psychologie.stura.uni-heidelberg.de/path/to/wordpress/';
const U='https://fs-psychologie.stura.uni-heidelberg.de/wp-content/uploads/';
const PI='https://www.psychologie.uni-heidelberg.de/';
const UNI='https://www.uni-heidelberg.de/';
const MAIL='fachschaft@psychologie.uni-heidelberg.de';
const MAIL_FIN='finanzen.fachschaft@psychologie.uni-heidelberg.de';
const BBB='https://bbb.stura.uni-heidelberg.de/rooms/fac-ynp-v3m-fkg/join';
const CAL='https://open-web-calendar.hosted.quelltext.eu/calendar.html?language=de&skin=flat&start_of_week=work&tabs=month&tabs=week&title=Fachschaft-HD&url=https%3A%2F%2Fcalendar.google.com%2Fcalendar%2Fical%2Fb5c2563593ad7c96c55e275867ab7911432f41ff6e9ebb4529bd3bef0d2f0223%2540group.calendar.google.com%2Fpublic%2Fbasic.ics';
const ICS='https://calendar.google.com/calendar/ical/b5c2563593ad7c96c55e275867ab7911432f41ff6e9ebb4529bd3bef0d2f0223%40group.calendar.google.com/public/basic.ics';
const IG='https://www.instagram.com/psyheidelberg/';
// TODO(content): Facebook-Präsenz prüfen, ob aktiv gepflegt oder stillgelegt
const FB='https://www.facebook.com/FachschaftPsychologieHD';
const PSYTREFF='mailto:listserv@listserv.uni-heidelberg.de?subject=Psychotreff&body=SUBSCRIBE%20PSYCHOTREFF';
const DSGVO=OLD+'datenschutzerklaerung/';

/* ============ Semester- & Vorlesungszeiten ============ */
const SEMESTER_CONFIG=[
  {name:'WiSe 2024/25',start:'2024-10-14',end:'2025-02-08',breaks:[['2024-12-23','2025-01-06']]},
  {name:'SoSe 2025',start:'2025-04-14',end:'2025-07-26',breaks:[['2025-06-10','2025-06-14']]},
  {name:'WiSe 2025/26',start:'2025-10-13',end:'2026-02-07',breaks:[['2025-12-22','2026-01-06']]},
  {name:'SoSe 2026',start:'2026-04-13',end:'2026-07-25',breaks:[['2026-05-26','2026-05-30']]},
  {name:'WiSe 2026/27',start:'2026-10-12',end:'2027-02-06',breaks:[['2026-12-23','2027-01-06']]}
];

const HOLIDAYS_BW=[
  '2024-10-03','2024-11-01','2024-12-25','2024-12-26','2025-01-01','2025-01-06',
  '2025-04-18','2025-04-21','2025-05-01','2025-05-29','2025-06-09','2025-06-19','2025-10-03','2025-11-01',
  '2026-01-01','2026-01-06','2026-04-03','2026-04-06','2026-05-01','2026-05-14','2026-05-25','2026-06-04',
  '2026-10-03','2026-11-01','2026-12-25','2026-12-26','2027-01-01','2027-01-06'
];

function isLecturePeriod(date){
  const iso=typeof date==='string'?date:date.toISOString().slice(0,10);
  for(const sem of SEMESTER_CONFIG){
    if(iso>=sem.start&&iso<=sem.end){
      for(const [bStart,bEnd] of sem.breaks){
        if(iso>=bStart&&iso<=bEnd) return false;
      }
      return true;
    }
  }
  return false;
}

function isHoliday(date){
  const iso=typeof date==='string'?date:date.toISOString().slice(0,10);
  return HOLIDAYS_BW.includes(iso);
}

const formatDateLong=d=>new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(d);

function newsFreshnessHint(){
  if(!POSTS.length) return '';
  const latest=new Date(POSTS[0].d+'T12:00:00');
  const diffDays=(Date.now()-latest.getTime())/(1000*60*60*24);
  if(diffDays>180){
    return `<div class="news-freshness" role="note"><span class="nf-ico" aria-hidden="true">${ic('insta')}</span><span>Aktuelles und kurzfristige Neuigkeiten findest du auch auf <a class="noext" href="${IG}" target="_blank" rel="noopener">Instagram (@psyheidelberg)</a>.</span></div>`;
  }
  return '';
}

/* ============ Fotos ============
   Echte Fotos der Fachschaft. Schlüssel = Dateiname auf der bisherigen Website.
   Sobald Bilder vorliegen: PHOTOS['DSC00364-Kopie-2-scaled.jpg']={src:'data:image/webp;base64,...',alt:'...'} */
const PHOTOS={
  'fs-wochenende.jpg':{src:'assets/images/fachschaft/fs-wochenende.jpg',alt:'Fachschaftswochenende im April 2024'},
  'fs-team.jpg':{src:'assets/images/fachschaft/fs-team.jpg',alt:'Gruppe der Fachschaft Psychologie beim FS-Wochenende'},
  'institutsgrillen-2024.jpg':{src:'assets/images/fachschaft/institutsgrillen-2024.jpg',alt:'Institutsgrillen im Innenhof im Juni 2024'},
  'silent-disco-2024.jpg':{src:'assets/images/fachschaft/silent-disco-2024.jpg',alt:'Silent Disco Party im Juni 2024'},
  'ersti-wochenende-2023.jpg':{src:'assets/images/fachschaft/ersti-wochenende-2023.jpg',alt:'Ersti-Wochenende im Dezember 2023'},
  'sommersemester-2015.jpg':{src:'assets/images/fachschaft/sommersemester-2015.jpg',alt:'Fachschaftsgruppe Sommersemester 2015'},
  'institutsgrillen-archiv.jpg':{src:'assets/images/fachschaft/institutsgrillen-archiv.jpg',alt:'Institutsgrillen im Innenhof'},
  'DSC00364-Kopie-scaled.jpg':{src:'assets/images/fachschaft/fs-wochenende.jpg',alt:'Fachschaftswochenende im April 2024'},
  'DSC00364-Kopie-2-scaled.jpg':{src:'assets/images/fachschaft/fs-team.jpg',alt:'Gruppe der Fachschaft Psychologie beim FS-Wochenende'},
  'IMG-20240622-WA0022-1.jpg':{src:'assets/images/fachschaft/institutsgrillen-2024.jpg',alt:'Institutsgrillen im Innenhof im Juni 2024'},
  'IMG-20240607-WA0002.jpg':{src:'assets/images/fachschaft/silent-disco-2024.jpg',alt:'Silent Disco Party im Juni 2024'},
  'PXL_20231202_154432955-scaled.jpg':{src:'assets/images/fachschaft/ersti-wochenende-2023.jpg',alt:'Ersti-Wochenende im Dezember 2023'},
  'Foto-15.10.18-18-13-55.jpg':{src:'assets/images/fachschaft/sommersemester-2015.jpg',alt:'Fachschaftsgruppe Sommersemester 2015'},
  'Institutsgrillen.jpg':{src:'assets/images/fachschaft/institutsgrillen-archiv.jpg',alt:'Institutsgrillen im Innenhof'}
};
const HERO_KEY='fs-wochenende.jpg';

/* ============ Bausteine ============ */
const ic=(n,c)=>`<svg class="i${c?' '+c:''}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const L=(r,t)=>`<a href="#/${r}">${t}</a>`;
const X=(u,t)=>`<a href="${u}">${t}</a>`;
const M=(e,t)=>`<a href="mailto:${e}">${t||e}</a>`;
const copyBtn=v=>`<button class="copy" type="button" data-copy="${v}">${ic('copy')}<span>Kopieren</span></button>`;
const facts=rows=>`<dl class="facts">${rows.map(([k,v,s])=>`<div><dt>${k}</dt><dd>${v}${s?`<small>${s}</small>`:''}</dd></div>`).join('')}</dl>`;
const callout=(h,body,kind)=>`<div class="callout${kind?' '+kind:''}">${h?`<b class="h">${ic('info')}${h}</b>`:''}${body}</div>`;
const initials=n=>n.replace(/\(.*?\)/g,'').split(/[\s-]+/).filter(w=>/^[A-ZÄÖÜ]/.test(w)&&!/^[A-Z]\.$/.test(w)).map(w=>w[0]).filter((c,i,a)=>i===0||i===a.length-1).join('');
const people=arr=>`<ul class="people">${arr.map(n=>`<li><span class="mono" aria-hidden="true">${initials(n)}</span>${n}</li>`).join('')}</ul>`;
const rows=items=>`<ul class="linkrows">${items.map(([href,icon,t,s])=>`<li><a href="${href}"><span class="ico">${ic(icon)}</span><span class="txt"><b>${t}</b>${s?`<span>${s}</span>`:''}</span><span class="end">${ic(href.startsWith('#')?'chevr':(icon==='download'?'download':'ext'))}</span></a></li>`).join('')}</ul>`;
const photo=(cap,href,sub)=>{const k=href.split('/').pop(),p=PHOTOS[k];
  const src=p?p.src:href, alt=(p&&p.alt)?p.alt:cap;
  return `<figure class="ph"><img src="${src}" alt="${alt}" loading="lazy" decoding="async"><figcaption><b>${cap}</b>${sub?`<span>${sub}</span>`:''}</figcaption></figure>`;};
const fmtD=d=>new Date(d+'T12:00:00').toLocaleDateString('de-DE',{day:'numeric',month:'long',year:'numeric'});

function terms(list,opt){
  opt=opt||{};
  const now=new Date();
  let cur=opt.cur!=null?opt.cur:list.findIndex(t=>t.from&&now>=new Date(t.from+'T00:00:00')&&now<=new Date(t.to+'T23:59:59'));
  if(cur<0) cur=list.length-1;
  const id='t'+Math.random().toString(36).slice(2,8);
  const tabs=list.map((t,i)=>{
    let b='';
    if(t.badge) b=`<span class="badge old">${t.badge}</span>`;
    else if(opt.cur==null&&t.from){ if(i===cur) b='<span class="badge">aktuell</span>'; else if(new Date(t.to+'T23:59:59')<now) b='<span class="badge old">beendet</span>'; else b='<span class="badge old">kommend</span>'; }
    return `<button role="tab" type="button" id="${id}-b${i}" aria-controls="${id}-p${i}" aria-selected="${i===cur}" tabindex="${i===cur?0:-1}">${t.label}${b}</button>`;
  }).join('');
  const panels=list.map((t,i)=>`<div role="tabpanel" id="${id}-p${i}" aria-labelledby="${id}-b${i}" ${i===cur?'':'hidden'}>
    ${t.from?`<p class="term-dates">${ic('cal')} Amtszeit vom ${fmtD(t.from)} bis ${fmtD(t.to)}</p>`:''}${t.note?`<p class="term-dates">${t.note}</p>`:''}
    <h3>${t.mLabel||'Mitglieder'}</h3>${people(t.m)}
    ${t.s&&t.s.length?`<h3>${t.sLabel||'Stellvertretung'}</h3>${people(t.s)}`:''}
  </div>`).join('');
  return `<div class="tabs" data-tabs><div class="tablist" role="tablist" aria-label="Amtszeiten">${tabs}</div>${panels}</div>`;
}
function sessionBox(){
  return `<div class="panel stone"><h3 style="margin-top:0">Sitzungen: montags, 18–20 Uhr</h3>
  <p>In der Vorlesungszeit treffen wir uns im Fachschaftskeller oder nach Absprache online. Wir freuen uns über jedes neue Gesicht, komm einfach vorbei!</p>
  <div class="btns"><a class="btn btn-primary btn-small noext" href="${BBB}">${ic('video')}Online teilnehmen</a><a class="btn btn-ghost btn-small" href="#/fachschaft/kontakt">${ic('pin')}So findest du uns</a></div></div>`;
}

/* ============ Navigation (Architektur der bisherigen Seite) ============ */
const TREE=[
 ['fachschaft',['fachschaft/aktive','fachschaft/kontakt','fachschaft/downloads']],
 ['aktuelles',[]],
 ['studium',['studium/bachelor','studium/bachelor/eks','studium/master','studium/approbation','studium/ausland','studium/praktika','studium/lehrgestaltung','studium/faq','studium/links']],
 ['leben',['leben/psychoparty','leben/blackbox','leben/pumpkinparty','leben/wechslertreffen','leben/grillen','leben/ersti-we','leben/psychokino']],
 ['hopo',['hopo/fachrat','hopo/fakrat','hopo/fachschaftsrat','hopo/stura','hopo/qsm','hopo/pruefungsausschuss','hopo/psyfako']],
 ['impressum',[]]
];

/* ============ Beiträge ============ */
const POSTS=[
 {d:'2024-08-17',t:'(WebSite) Updates',u:'2024/08/website-updates/',c:['Allgemein','Leben am Institut'],x:'Mitglieder kommen und gehen. Alumni, Mentor:innen und Freund:innen sind bei uns aber immer willkommen. Warum unter der Corona-Pandemie vor allem unsere Öffentlichkeitsarbeit gelitten hat und was sich seitdem getan hat.'},
 {d:'2024-07-23',t:'BlackBox: neue Ausgabe',u:'2024/07/blackbox-neue-ausgabe/',c:['BlackBox'],x:'Den Necker-Würfel kennen viele aus der Vorlesung: Man sieht ihn von oben oder von unten, aber nie beides gleichzeitig. Mit diesem Kipp-Phänomen beginnt der Beitrag zur neuen BlackBox-Ausgabe.'},
 {d:'2023-05-01',t:'Die Rückkehr des FS-Wochenendes im April 2023',u:'2023/05/die-rueckkehr-des-fs-wochenendes-im-april-2023/',c:[],x:'Nach mehreren Jahren Pause gab es im April 2023 endlich wieder ein FS-Wochenende. Ein Rückblick, der zeigt, wie abwechslungsreich das Leben in der Fachschaft sein kann.'},
 {d:'2023-01-17',t:'Neu: Praktikumsdatenbank von Studis für Studis',u:'2023/01/neu-praktikumsdatenbank-von-studis-fuer-studis/',c:[],x:'Eine deutschlandweite Übersicht über Praktikumsplätze samt Erfahrungsberichten. Zum Suchen und zum Weiterempfehlen eigener Praktika.'},
 {d:'2022-05-07',t:'Neuer Vortrag zur Psychotherapie am PI',u:'2022/05/neuer-vortrag-zur-psychotherapie-am-pi/',c:['Leben am Institut'],x:'Gemeinsam mit dem IPP Heidelberg: ein Einblick in die tiefenpsychologische bzw. psychoanalytische Psychotherapie anhand eines Patientenfalls. Montag, 9. Mai 2022, 20:15 Uhr, Hörsaal 2 im Hintergebäude.'},
 {d:'2021-02-05',t:'WICHTIG: Psychotherapeutengesetz',u:'2021/02/psychotherapeutengesetz/',c:[],x:'Seit dem 1. September 2020 führt der Weg in die Psychotherapie über ein Approbationsstudium aus polyvalentem Psychologie-Bachelor und anschließendem Master Psychotherapie. Was das für euch bedeutet.'},
 {d:'2020-10-30',t:'Protokoll der Infoveranstaltung zur Psychologiestudiengangsreform',u:'2020/10/protokoll-der-infoveranstaltung-zur-psychologiestudiengangsreform/',c:[],x:'Am 22. Oktober 2020 fand gemeinsam mit Prof. Dr. Spinath, Prof. Dr. Barnow und Dr. Timm eine Infoveranstaltung zur Studiengangsreform statt. Das Protokoll steht für alle bereit.'},
 {d:'2020-08-05',t:'Update Psychotherapeut*innengesetz: diesen Freitag online',u:'2020/08/update-psychotherapeutinnengesetz-diesen-freitag-online/',c:[],x:'Es gibt ein neues Psychotherapeutengesetz, aber was ändert sich konkret? Eine Online-Infoveranstaltung bringt euch auf den Stand.'},
 {d:'2020-08-05',t:'Update-Post für das WiSe 2020',u:'2020/08/update-post-fuer-das-wise-2020/',c:[],x:'Antworten auf eure häufigsten Fragen zum Wintersemester 2020 und zum Verhältnis von Online- und Präsenzlehre nach dem ersten „Corona-Semester“.'},
 {d:'2020-06-02',t:'Update zum Psychotherapiegesetz',u:'2020/06/update-zum-psychotherapiegesetz/',c:[],x:'Die Folien der digitalen Infoveranstaltung der PsyFaKo e. V. zur Reform des Psychotherapiegesetzes zum Nachlesen, inklusive Stand der Umsetzung.'}
];
function newsList(list){
  return `<ul class="news">${list.map(p=>{const d=new Date(p.d+'T12:00:00');
   const fullDate=d.toLocaleDateString('de-DE',{day:'numeric',month:'long',year:'numeric'});
   return `<li data-cats="${['Aktuelles',...p.c].join('|')}"><time datetime="${p.d}" aria-label="${fullDate}"><span class="d-day" aria-hidden="true"><b>${d.getDate()}.</b></span> <span class="d-mo" aria-hidden="true">${d.toLocaleDateString('de-DE',{month:'long',year:'numeric'})}</span><span class="sr">${fullDate}</span></time>
   <div><h3><a class="noext" href="${P+p.u}" aria-describedby="ext-tab-msg">${p.t}<span class="ext-ico" aria-hidden="true">↗</span></a></h3><p>${p.x}</p><div class="tags">${['Aktuelles',...p.c].map(c=>`<span class="tag">${c}</span>`).join('')}</div></div></li>`}).join('')}</ul>`;
}

/* ============ BlackBox ============ */
const ISSUES=[
 [10,'WiSe 2024/25','2025/04/10_BLACKBOX_Wise2024.pdf'],
 [9,'SoSe 2024','2024/07/9_BLACKBOX_SoSe2024.pdf'],
 [8,'WiSe 2023/24','2024/02/8_BLACKBOX_WS2023-24.pdf'],
 [7,'SoSe 2023','2023/07/7_BLACKBOX_SoSe2023.pdf'],
 [6,'WiSe 2022/23','2023/05/6_BLACKBOX_WS2022-23.pdf'],
 [5,'SoSe 2022','2022/10/5_BLACKBOX_SoSe2022.pdf'],
 [4,'WiSe 2021/22','2022/10/4_BLACKBOX_WS2021-22.pdf'],
 [3,'SoSe 2021','2021/07/3_BLACKBOX_SoSe2021.pdf'],
 [2,'WiSe 2020/21','2021/02/2_BLACKBOX_WS2020-21.pdf'],
 [1,'SoSe 2020','2021/02/1_BLACKBOX_SoSe2020.pdf']
];
const ss=f=>U+'2024/09/'+f+'.pdf';
const OLDMAG=[
 ['Schwarze Schachtel',[['WiSe 2003/04','Schwarze-Schachtel-Ausgabe-WS-2003-04'],['WiSe 2002/03','Schwarze-Schachtel-Ausgabe-WS-2002-03'],['SoSe 2002','Schwarze-Schachtel-Ausgabe-SoSe-2002'],['WiSe 2001/02','Schwarze-Schachtel-Ausgabe-WS-2001-02'],['SoSe 2001','Schwarze-Schachtel-Ausgabe-SoSe-2001'],['SoSe 2000','Schwarze-Schachtel-Ausgabe-SoSe-2000'],['WiSe 1999/00','Schwarze-Schachtel-Ausgabe-WS-1999-00'],['SoSe 1996','Schwarze-Schachtel-Ausgabe-SoSe-1996'],['Weihnachten 1995','Schwarze-Schachtel-Ausgabe-Weihnachten-1995'],['ca. WiSe 2001, Cover: Prof. T. Vogel','Schwarze-Schachtel-Ausgabe-WS-1995-96-vmt']]],
 ['Psi',[['WiSe 1987/88','Psi-Ausgabe-WS-1987-88']]],
 ['Psychose',[['WiSe 1984/85','Psychose-Ausgabe-WS-1984-85'],['SoSe 1983','Psychose-Ausgabe-SoSe-1983']]]
];

/* ============ Raumfinder ============ */
const ROOMS=[
 {b:'Fachschaftskeller',w:'Durch das Tor in den Innenhof, direkt auf der rechten Seite. Hier finden unsere Sitzungen statt.',k:'fachschaft keller sitzung innenhof tor',plan:''},
 {b:'Vordergebäude, Erdgeschoss',w:'Prüfungssekretariat, Verwaltungssekretariat, Sekretariat Persönlichkeitsforschung und Diagnostik, CIP-Pool, Institutsbibliothek, alle Räume F0XX',k:'pruefung prüfung verwaltung persönlichkeit diagnostik cip bibliothek',re:/^f0\d{2}$/,plan:U+'2021/10/VordergebaeudeEG-rotated.jpg'},
 {b:'Vordergebäude, Zwischengeschoss',w:'Räume 019, 020 und 023',k:'',re:/^0(19|20|23)$/,plan:U+'2021/10/VordergebaeudeZG-rotated.jpg'},
 {b:'Vordergebäude, 1. OG',w:'Hörsaal 1, Sekretariat AO-Psychologie, Sekretariat Sozialpsychologie, Gender und Gesundheit, Erasmus und Erste Hilfe (Raum 114), alle Räume F1XX',k:'hörsaal 1 hs1 ao arbeits organisation sozialpsychologie gender gesundheit erasmus erste hilfe',re:/^f1\d{2}$/,plan:U+'2021/10/Vordergebaeude1OG.jpg'},
 {b:'Vordergebäude, 2. OG',w:'Sekretariat Entwicklungspsychologie und Pädagogische Psychologie, CIP-Pool 2, IT/EDV, alle Räume F2XX',k:'entwicklung pädagogisch cip 2 it edv',re:/^f2\d{2}$/,plan:U+'2021/10/Vordergebaeude2OG.jpg'},
 {b:'Hintergebäude, Erdgeschoss',w:'Hörsaal 2, Sekretariat Allgemeine Psychologie und Methodenlehre, Übungsräume B-F, alle Räume A0XX',k:'hörsaal 2 hs2 allgemeine methoden übungsraum b c d e f',re:/^a0\d{2}$/,plan:U+'2021/10/HintergebaeudeEG.jpg'},
 {b:'Hintergebäude, 1. OG',w:'Empore Hörsaal 2, Sekretariat Klinische Psychologie und Psychotherapie, Übungsraum A102, Erste Hilfe (Raum 114), alle Räume A1XX',k:'empore klinische psychotherapie übungsraum a erste hilfe',re:/^a1\d{2}$/,plan:U+'2021/10/HintergebaeudeOG.jpg'},
 {b:'Hintergebäude, Untergeschoss',w:'Zentrales Versuchslabor, studentische Aufenthaltsräume',k:'labor versuchslabor aufenthalt',plan:''},
 {b:'Pavillon',w:'Hörsaal 3, alle Räume 0XX',k:'hörsaal 3 hs3 pavillon',re:/^0\d{2}$/,plan:''}
];

/* ============ Seiten ============ */
const PAGES={
'fachschaft':{t:'Fachschaft',d:'Wer wir sind und was wir machen',lead:'Zur Fachschaft gehören alle, die Psychologie studieren, also auch du. Die aktive Fachschaft ist die Gruppe, die sich regelmäßig trifft und mitgestaltet.',body:`
<h2>Wer ist die Fachschaft Psychologie?</h2>
<p>Die Fachschaft umfasst alle Studierenden eines Fachs. Bei uns sind das sämtliche Psychologiestudierenden. Jede und jeder von euch gehört also dazu und kann mitmachen.</p>
<h2>Und wer sind dann wir?</h2>
<p>Innerhalb der Fachschaft trifft sich regelmäßig eine kleinere Gruppe von Studierenden, organisiert Veranstaltungen und vertritt die Studierenden am Institut. Diese Gruppe heißt aktive Fachschaft, und das sind wir.</p>
<div class="photos">
  ${photo('Fachschaftswochenende, April 2024','fs-wochenende.jpg','Gemeinsame Klausurtagung & Semesterplanung')}
  ${photo('Institutsgrillen im Innenhof, Juni 2024','institutsgrillen-2024.jpg','Gemütlicher Austausch von Studierenden und Dozierenden')}
  ${photo('Silent Disco am Institut, Juni 2024','silent-disco-2024.jpg','Kopfhörer-Party im Innenhof des Psychologischen Instituts')}
</div>
<h2>Was machen wir?</h2>
<div class="trio">
 <div><h3>Gute Studienbedingungen</h3><p>Wir setzen uns dafür ein, dass euer Studium möglichst viele Freiräume bietet und flexibel bleibt, etwa wenn sich Prüfungsordnung, Modulhandbuch oder Studienzulassung ändern.</p></div>
 <div><h3>Ein gutes Miteinander</h3><p>Mit großen und kleinen Veranstaltungen sorgen wir für eine lockere Atmosphäre am Institut.</p></div>
 <div><h3>Euer Geld für euch</h3><p>Wir kümmern uns darum, dass Mittel wie der Semesterbeitrag, den ihr jedes Semester zahlt, wieder euch zugutekommen.</p></div>
</div>
${sessionBox()}`},

'fachschaft/aktive':{t:'Aktive Fachschaft',d:'Gesichter, Momente und Alumni',lead:'Ein Ausschnitt aus unserer Fachschaft und alle, die uns über die Jahre begleitet haben.',body:`
<h2>Momente</h2>
<div class="photos">
${photo('Fachschafts-Team, April 2024','fs-team.jpg','Gemeinsam unterwegs auf dem Klausur-Wochenende')}
${photo('Ersti-Wochenende, Dezember 2023','ersti-wochenende-2023.jpg','Gemeinsames Kennenlernen im Odenwald')}
${photo('Institutsgrillen Tradition','institutsgrillen-archiv.jpg','Gemütlicher Austausch im Innenhof')}
</div>
<h2>Alumni, Mentor:innen und Freund:innen</h2>
<p>Sie haben die Fachschaft mitgeprägt und sind jederzeit herzlich eingeladen, wieder vorbeizuschauen.</p>
<ul class="monos">${[['Kim','2019/06/Foto-03.06.19-20-26-24'],['Aaron','2019/06/Foto-03.06.19-20-23-33'],['Aki','2019/06/Foto-03.06.19-20-32-04'],['Annalena','2019/06/Foto-03.06.19-20-22-31'],['Caro','2019/06/Foto-03.06.19-20-32-27'],['Elena','2019/06/Foto-03.06.19-20-25-27'],['Elli','2019/06/Foto-03.06.19-20-26-01'],['Florie','2019/06/Foto-03.06.19-20-29-49'],['Franzi','2019/06/Foto-03.06.19-20-31-38'],['Franzi','2019/06/Foto-03.06.19-20-28-11'],['Jill','2019/06/Foto-03.06.19-20-30-18'],['Joana','2019/06/Foto-03.06.19-20-24-25'],['Johanna','2019/07/Foto-03.06.19-20-29-17'],['Kathi','2019/06/Foto-03.06.19-20-28-50'],['Kauli','2019/06/Foto-11.06.19-19-29-35'],['Laura','2019/06/Foto-03.06.19-20-21-50'],['Luisa','2019/06/Foto-03.06.19-20-23-52'],['Marie','2019/06/Foto-03.06.19-20-27-06'],['Nuno','2019/06/Foto-11.06.19-19-33-39'],['Rieke','2019/06/Foto-03.06.19-20-23-07'],['Vincent','2019/06/Foto-03.06.19-20-30-45']].map(([n,f])=>{const k=f.split('/').pop()+'.jpg',p=PHOTOS[k];return `<li><a class="noext" href="${U+f}.jpg" aria-label="Foto von ${n} ansehen">${p?`<img class="mono" src="${p.src}" alt="" loading="lazy">`:`<span class="mono" aria-hidden="true">${n[0]}</span>`}${n}</a></li>`;}).join('')}</ul>
<h2>Gruppenbilder-Archiv</h2>
<div class="photos">${photo('Sommersemester 2015','sommersemester-2015.jpg','Fachschaftsgruppe Sommersemester 2015')}</div>`},

'fachschaft/kontakt':{t:'Kontakt',d:'Sitzungen, E-Mail und Verteiler',lead:'Du hast Fragen an uns? Dann komm vorbei oder schreib uns eine Mail.',body:`
<div class="contact-grid">
 <div class="card"><span class="ic">${ic('clock')}</span><h3>Sitzungen</h3><p>Montags 18–20 Uhr in der Vorlesungszeit im Fachschaftskeller. Du bist immer herzlich eingeladen.</p><div class="foot"><a class="btn btn-ghost btn-small noext" href="${BBB}">${ic('video')}Online dabei sein</a></div></div>
 <div class="card"><span class="ic">${ic('pin')}</span><h3>Fachschaftskeller</h3><p>Hauptstraße 47–51, 69117 Heidelberg. Durch das Tor in den Innenhof, der Keller liegt direkt auf der rechten Seite.</p><div class="foot">${L('studium/faq?raum','Zum Raumfinder')}</div></div>
 <div class="card"><span class="ic">${ic('mail')}</span><h3>E-Mail</h3><p>${M(MAIL)}<br>${copyBtn(MAIL)}</p><p><b>Finanzangelegenheiten</b><br>${M(MAIL_FIN)}<br>${copyBtn(MAIL_FIN)}</p></div>
 <div class="card"><span class="ic">${ic('phone')}</span><h3>Telefon und Fax</h3><p>Tel. <a href="tel:+496221542456">+49&nbsp;6221&nbsp;54-2456</a><br>Fax +49&nbsp;6221&nbsp;54-2457</p></div>
</div>
<h2>Nichts mehr verpassen</h2>
${rows([
 ['#/aktuelles','info','Aktuelles','Neuigkeiten aus Fachschaft und Institut'],
 ['#/fachschaft/downloads','folder','Sitzungsprotokolle','In unseren Downloads'],
 [PSYTREFF,'mail','Psychotreff-Verteiler abonnieren','Hier kommen auch die wöchentlichen Sitzungsprotokolle an. Öffnet eine vorbereitete Mail mit „SUBSCRIBE PSYCHOTREFF“ an listserv@listserv.uni-heidelberg.de'],
 [CAL,'cal','Termine im Kalender ansehen','Alle Veranstaltungen der Fachschaft'],
 [ICS,'download','Kalender abonnieren (ICS)','Zum Einbinden in Outlook, Apple- oder Google-Kalender'],
 [IG,'insta','Instagram','@psyheidelberg'],
 [FB,'fb','Facebook','Fachschaft Psychologie Heidelberg'],
 [OLD+'online-angebote/','globe','Frühere Online-Angebote','Archiv auf der bisherigen Website']
])}`},

'fachschaft/downloads':{t:'Downloads',d:'Protokolle und Satzung',lead:'Unsere Sitzungsprotokolle und die Satzung der Studienfachschaft.',body:`
${callout('Hinweis zu den Protokollen','<p>Sitzungsprotokolle müssen erst verabschiedet werden, bevor wir sie veröffentlichen. Sie erscheinen deshalb immer mit etwas Verspätung.</p>')}
${rows([
 ['https://heibox.uni-heidelberg.de/d/564c60c752f84c9297ce/','folder','Sitzungsprotokolle','Ordner in der heiBOX'],
 ['https://heibox.uni-heidelberg.de/f/05936ab93edc4a9abdec/?dl=1','download','Studienfachschaftssatzung Psychologie','Direkter Download']
])}`},

'aktuelles':{t:'Aktuelles',d:'Neuigkeiten aus der Fachschaft',lead:'Neuigkeiten aus der Fachschaft und vom Institut.',body:`
${newsFreshnessHint()}
<div class="filters" role="group" aria-label="Beiträge filtern">${['Alle','Leben am Institut','BlackBox','Allgemein'].map((c,i)=>`<button class="chip" type="button" data-filter="${c}" aria-pressed="${i===0}">${c}</button>`).join('')}</div>
${newsList(POSTS)}
<p style="margin-top:28px"><a class="btn btn-ghost noext" href="${P}category/aktuelles/page/2/">Ältere Beiträge im Archiv ${ic('ext')}</a></p>`},

'studium':{t:'Infos zum Studium',d:'Bewerbung, Aufbau, Praktika, Ausland',lead:'Ob du dich gerade bewirbst, frisch zugelassen bist oder schon mit uns studierst: Hier findest du nützliche Informationen.',body:`
<p>Für Studieninteressierte geht es vor allem um die Bewerbung und den Studienbeginn. Wenn du noch unentschlossen bist und wissen möchtest, wie sich das Studium in Heidelberg anfühlt, schau auf der ${X(PI+'studium/rainbow/','HeiMo-Seite')} vorbei. Dort gibt es Erfahrungsberichte und Beschreibungen typischer Situationen im Studium.</p>
<p>Für genauere Fragen, etwa zu Praktika, Auslandssemester oder Prüfungen, ist die ${X('http://www.psychologie.uni-heidelberg.de/studium/beratung/','Fachstudienberatung')} die richtige Anlaufstelle. Sie pflegt auch ein ausführliches ${X('http://www.psychologie.uni-heidelberg.de/studium/beratung/a-z.shtml','A-Z')}.</p>
${callout('Im Zweifel gilt die Fachstudienberatung','<p>Wenn sich unsere Angaben und die der Fachstudienberatung unterscheiden, sind die Informationen der Fachstudienberatung maßgeblich.</p>','red')}
<h2>Für Studieninteressierte</h2>
<div class="cards">
 <a class="card" href="#/studium/bachelor"><h3>Bachelor</h3><p>Aufbau, Bewerbung, BaPsy und Dokumente</p></a>
 <a class="card" href="#/studium/master"><h3>Master</h3><p>Schwerpunkte KliPP und PFA, Bewerbung</p></a>
 <a class="card" href="#/studium/bachelor/eks"><h3>EKS</h3><p>Die Einführungswoche für Erstis</p></a>
 <a class="card" href="#/studium/faq"><h3>FAQ</h3><p>Die häufigsten Fragen vor dem Studienstart</p></a>
</div>
<h2>Für Studierende</h2>
<div class="cards">
 <a class="card" href="#/studium/ausland"><h3>Auslandssemester</h3><p>ERASMUS, Partnerschaften, Overseas</p></a>
 <a class="card" href="#/studium/praktika"><h3>Praktika</h3><p>Pflichtpraktika im Bachelor und Master</p></a>
 <a class="card" href="#/leben"><h3>Leben am Institut</h3><p>Partys, Kino, Ersti-Wochenende</p></a>
 <a class="card" href="#/fachschaft"><h3>Die Fachschaft</h3><p>Wer wir sind und wie du mitmachst</p></a>
 <a class="card" href="#/hopo"><h3>Hochschulpolitik</h3><p>Gremien und studentische Vertretung</p></a>
</div>`},

'studium/bachelor':{t:'Bachelor',d:'B.Sc. Psychologie, Bewerbung, BaPsy',lead:'Das Bachelorstudium Psychologie in Heidelberg auf einen Blick.',body:`
${facts([['Abschluss','Bachelor of Science'],['Regelstudienzeit','6 Semester','verlängerbar auf bis zu 10'],['Leistungspunkte','180 LP','plus Bachelorarbeit'],['Studienbeginn','Wintersemester'],['Studienplätze','90']])}
<h2>Vollfach oder Beifach</h2>
<p>Im Vollfach (<strong>Psychologie 100 %</strong>) erwirbst du in sechs Semestern 180 Leistungspunkte und schreibst eine Bachelorarbeit. Alternativ kannst du <strong>Psychologie als Beifach</strong> mit 25 % studieren. Das dauert ebenfalls sechs Semester, ist inhaltlich aber deutlich schlanker als das Vollfach.</p>
<h2>Aufbau</h2>
<p>Das Studium vermittelt <strong>Grundlagen- und Anwendungsfächer</strong>, überwiegend in Vorlesungen und Seminaren. Je nach Semester hast du unterschiedliche Wahlmöglichkeiten. Eine detaillierte Übersicht über Aufbau und Ablauf gibt es bei der ${X('http://www.psychologie.uni-heidelberg.de/studium/beratung/bachelor/kurzinfos.shtml','Fachstudienberatung')}.</p>
${callout('Tipp von uns','<p>Manchmal kann man sich unauffällig in eine Veranstaltung der ersten beiden Semester setzen und einfach mal reinschnuppern.</p>')}
<h2>Approbationskonform studieren</h2>
<p>Du kannst das Studium ${L('studium/approbation','approbationskonform')} (also qualifizierend für einen KliPP-Master) oder nicht approbationskonform absolvieren. Der Unterschied liegt in den Vorgaben für die ${L('studium/praktika','Praktika')} und vor allem in Modulen des fünften und sechsten Semesters.</p>
<h2>Bewerbung und Auswahlverfahren</h2>
<p>Das Studium beginnt nach erfolgreicher Bewerbung jeweils zum Wintersemester. Alle Infos zur Bewerbung findest du beim ${X(PI+'studium/bachelor/bewerbung/','Psychologischen Institut')}.</p>
<p>Seit dem Wintersemester 2020 gibt es das <strong>OSA (Online-Self-Assessment)</strong> und den <strong>freiwilligen Studieneignungstest BaPsy-DGPs</strong> als zusätzliches Kriterium neben der Abiturnote. Die Erfahrung der letzten Jahre zeigt: Ohne BaPsy ist eine Zulassung äußerst unwahrscheinlich. Melde dich also rechtzeitig zum Test an.</p>
${rows([
 [PI+'studium/bachelor/faq/','info','FAQ des Psychologischen Instituts','Zum neuen Studienauswahlverfahren'],
 ['https://www.studieneignungstest-psychologie.de/','globe','Studieneignungstest Psychologie','Offizielle Seite des BaPsy-DGPs'],
 ['#/studium/faq','info','Wie hoch ist der NC?','So setzt sich die Punktzahl zusammen']
])}
<h2>Dokumente und Veranstaltungen</h2>
${rows([
 ['https://heibox.uni-heidelberg.de/d/95707d86f0674bb2a781/','folder','Modulhandbuch, Studienplan und Prüfungsordnung','Ordner in der heiBOX'],
 ['https://heico.uni-heidelberg.de/heiCO/ee/ui/ca2/app/desktop/#/slc.tm.cp/student/courses?$ctx=&$skip=0&objTermId=186&orgId=14120','cal','Veranstaltungen in heiCO','Achte darauf, dass oben links das richtige Semester eingestellt ist. Du kannst auch nach Titeln oder Stichwörtern suchen.']
])}`},

'studium/bachelor/eks':{t:'EKS',d:'Die Einführungswoche für Erstis',lead:'Das Erstsemester-Kompakt-Seminar: deine erste Woche am Psychologischen Institut.',body:`
${facts([['Wann','jedes Wintersemester','eine Woche vor Semesterbeginn'],['Format','Kleingruppen','mit je zwei EKS-Tutor:innen'],['Pflicht?','Nein','aber sehr empfohlen']])}
<h2>Was ist das EKS?</h2>
<p>Was so ernst klingt, ist schlicht die Einführungswoche für die neuen Erstis. Zwei EKS-Tutor:innen begleiten deine Kleingruppe die ganze Woche über und führen euch ins Unileben ein. Du bekommst alle nötigen Infos zum Studium, lernst das Psychologische Institut kennen und kannst all deine Fragen loswerden.</p>
<p>Der Spaß kommt natürlich nicht zu kurz: Bei der Stadtrallye und der Kneipentour lernst du deine Kommiliton:innen näher kennen. Krönender Abschluss ist die ${L('leben/psychoparty','Psychoparty')}, mit der wir alle zusammen ins Semester starten.</p>
<h2>Wer organisiert das?</h2>
<p>Das EKS organisiert die ${X('http://www.psychologie.uni-heidelberg.de/studium/beratung/','Fachstudienberatung')} des Psychologischen Instituts, wir als Fachschaft unterstützen dabei. Mit organisatorischen Fragen wendest du dich deshalb bitte an die Studienberatung.</p>
<h2>Ist das EKS Pflicht?</h2>
<p>Nein, das EKS ist ein Angebot von Studienberatung und Fachschaft. Wir legen es aber allen ans Herz: Es ist ein toller Einstieg ins Studium und macht richtig Spaß.</p>`},

'studium/master':{t:'Master',d:'M.Sc. mit den Schwerpunkten KliPP und PFA',lead:'Das Masterstudium Psychologie an der Universität Heidelberg auf einen Blick.',body:`
${facts([['Abschluss','Master of Science'],['Regelstudienzeit','4 Semester'],['Leistungspunkte','120 LP','plus Masterarbeit'],['Studienbeginn','Wintersemester']])}
<h2>Zwei Schwerpunkte</h2>
<p>Das Psychologische Institut bietet zwei Masterschwerpunkte an. Je nach Schwerpunkt belegst du unterschiedliche Module.</p>
<div class="cards">
 <div class="card"><h3>Klinische Psychologie und Psychotherapie (KliPP)</h3><p>Der Weg in die Approbation nach neuem Recht.</p><div class="foot">${X(UNI+'de/studium/alle-studienfaecher/psychologie/psychologie-in-klinischer-psychologie-und-psychotherapie-master','Studienfach-Seite')}<br>${X('http://psychologie.uni-heidelberg.de/studium/master/master-psychologie-in-klinischer-psychologie-und-psychotherapie/','Infos des Instituts')}</div></div>
 <div class="card"><h3>Forschung und Anwendung (PFA)</h3><p>Psychologie in Forschung und Anwendung.</p><div class="foot">${X(UNI+'de/studium/alle-studienfaecher/psychologie/psychologie-in-forschung-und-anwendung-master','Studienfach-Seite')}<br>${X(PI+'studium/master/master-psychologie-in-forschung-und-anwendung/','Infos des Instituts')}</div></div>
</div>
<h2>Bewerbung</h2>
<p>Nach erfolgreicher Bewerbung beginnt das Studium jeweils zum Wintersemester. Infos zur Bewerbung gibt es beim ${X(PI+'studium/master/bewerbung/','Psychologischen Institut')}.</p>
${callout('Zum Master-Test','<p>Weil wir oft danach gefragt werden: Uns als Fachschaft liegen keine Informationen zum Master-Test vor. Ohne den Test ist die Zulassungswahrscheinlichkeit allerdings sehr gering.</p>')}`},

'studium/approbation':{t:'Weg zur Approbation',d:'Psychotherapie nach neuem Recht',lead:'Was gilt für alle, die ihr Bachelorstudium ab dem Wintersemester 2020/21 begonnen haben?',body:`
<h2>Die neue Approbationsordnung</h2>
<p>Seit dem 1. September 2020 gilt die neue Approbationsordnung für Psychotherapeut:innen (${X('https://www.gesetze-im-internet.de/psychthappro/BJNR044800020.html','PsychThApprO')}). Schon im Bachelor müssen Psychologiestudierende deshalb bestimmte approbationsrelevante Veranstaltungen aus dem klinischen Bereich belegen, um sich für die neuen Masterstudiengänge Klinische Psychologie und Psychotherapie zu qualifizieren.</p>
<h2>Der neue Weg in die Psychotherapie</h2>
<ol class="steps">
 <li><b>Bachelor Psychologie, approbationskonform</b><span>Mit den klinischen Pflichtanteilen und den passenden ${L('studium/praktika','Praktika')}.</span></li>
 <li><b>Master ${X(UNI+'de/studium/alle-studienfaecher/psychologie/psychologie-in-klinischer-psychologie-und-psychotherapie-master','Klinische Psychologie und Psychotherapie')}</b><span>Nur mit diesem Abschluss ist die Approbationsprüfung möglich.</span></li>
 <li><b>Approbationsprüfung</b><span>Anschließend erfolgt die Approbation.</span></li>
 <li><b>Weiterbildung zur Fachpsychotherapeut:in</b><span>Erst hier entscheidet sich, in welcher Fachkunde und für welche Altersgruppe du praktizierst.</span></li>
</ol>
<div class="trio">
 <div><h3>Fachkunden</h3><ul><li>Verhaltenstherapie</li><li>Tiefenpsychologisch fundierte bzw. psychodynamische Psychotherapie</li><li>Psychoanalyse</li><li>Systemische Psychotherapie</li><li>Neuropsychologische Psychotherapie</li></ul></div>
 <div><h3>Altersgruppen</h3><ul><li>Behandlung von Erwachsenen</li><li>Behandlung von Kindern und Jugendlichen</li></ul></div>
</div>
<p>Quelle: ${X(PI+'studium/a-z/ausbildung-zum-psychologischen-psychotherapeuten','Psychologisches Institut Heidelberg')}</p>
<h2>Alter und neuer Berufsweg im Vergleich</h2>
<p>Die PsyFaKo hat den bisherigen und den neuen Weg in die Psychotherapie übersichtlich gegenübergestellt.</p>
${rows([
 ['https://psyfako.org/berufsweg-psychotherapie/','globe','Berufsweg Psychotherapie','Ausführliche Infos der PsyFaKo'],
 [U+'2024/08/grafik.png','image','Grafik: alter und neuer Berufsweg','Gegenüberstellung als Bild']
])}`},

'studium/ausland':{t:'Auslandssemester',d:'ERASMUS, Partnerschaften, Overseas',lead:'Du willst im Studium ins Ausland? Hier findest du die wichtigsten Wege dorthin.',body:`
${callout('Schon im Ausland gewesen?','<p>Schick deinen Erfahrungsbericht gern an '+M(MAIL,'unsere Fachschafts-Mail')+'. Andere Studierende profitieren davon.</p>')}
<h2>Alle Wege im Überblick</h2>
<div class="tablewrap"><table>
<thead><tr><th>Programm</th><th>Wohin</th><th>Organisation</th><th>Finanzierung</th></tr></thead>
<tbody>
<tr><td>ERASMUS über das Institut</td><td>Partneruniversitäten in Europa</td><td>Bewerbung am Psychologischen Institut</td><td>Stipendium, Höhe je nach Land</td></tr>
<tr><td>ERASMUS-Restplätze</td><td>Partnerunis anderer Institute</td><td>Über die Fachkoordination des fachfremden Instituts</td><td>Stipendium</td></tr>
<tr><td>Coimbra-Group</td><td>19 Universitäten in 12 Ländern</td><td>Universität Heidelberg</td><td>siehe Programmseite</td></tr>
<tr><td>Einzelpartnerschaften</td><td>Cambridge, Krakau, St. Petersburg, Prag, Budapest</td><td>Universität Heidelberg</td><td>siehe Programmseite</td></tr>
<tr><td>Overseas-Austausch</td><td>Asien, Australien und Ozeanien, Amerika</td><td>Dezernat Internationale Beziehungen</td><td>kein automatisches Stipendium, Studiengebühren meist erlassen</td></tr>
<tr><td>ERASMUS+ (unizentral)</td><td>auch außerhalb Europas</td><td>Universität Heidelberg</td><td>Stipendium</td></tr>
<tr><td>Free Mover</td><td>frei wählbar</td><td>komplett selbst</td><td>Studiengebühren selbst zahlen</td></tr>
</tbody></table></div>
<h2>Europa</h2>
<h3>ERASMUS über das Institut</h3>
<p>Ihr könnt euch um einen ERASMUS-Platz bewerben, den das Institut vermittelt. Die Partneruniversitäten findet ihr auf der Seite der ERASMUS-Koordinatorin (siehe Kontakte unten). Der große Vorteil: Je nach Land gibt es ein unterschiedlich hohes Stipendium, das den Aufenthalt erleichtert.</p>
<h3>Restplätze an anderen Instituten</h3>
<p>Findet ihr keine passende Uni, könnt ihr euch auf Restplätze anderer Institute bewerben. Dafür nehmt ihr Kontakt mit der Fachkoordination des fachfremden Bereichs auf und wickelt die Bewerbung über sie ab. In der Regel müssen mindestens 50 % der im Ausland belegten Kurse im Fachgebiet des <em>nominierenden</em> Instituts liegen. Ob fachfremde Studierende schon im ersten Verfahren mitlaufen oder nur Restplätze bekommen, entscheidet jedes Institut selbst.</p>
<h3>Coimbra-Group und Einzelpartnerschaften</h3>
<p>Über die ${X(UNI+'studium/international/ausland/europa/coimbra.html','Coimbra-Group')} bestehen Partnerschaften mit 19 Universitäten in 12 Ländern. Dazu kommen Einzelpartnerschaften mit der University of ${X(UNI+'studium/international/ausland/europa/cambridge/','Cambridge')}, der ${X(UNI+'studium/international/ausland/europa/uj.html','Jagiellonen-Universität Krakau')}, der ${X(UNI+'studium/international/ausland/europa/spbu.html','Staatlichen Universität St. Petersburg')}, der ${X(UNI+'studium/international/ausland/europa/cuni.html','Karls-Universität Prag')} sowie der ${X(UNI+'studium/international/ausland/europa/elte.html','Eötvös-Loránd-Universität (ELTE)')} und der ${X(UNI+'studium/international/ausland/europa/semmelweis.html','Semmelweis-Universität')} in Budapest.</p>
<p>${X(OLD+'ausland/ausland-europa/','Erfahrungsberichte aus Europa lesen')}</p>
<h2>Overseas</h2>
<p>Alle Austauschprogramme außerhalb Europas laufen zentral über die Universität, Anlaufstelle ist vor allem das Dezernat Internationale Beziehungen. Möglich sind ${X(UNI+'studium/international/ausland/asien/','Asien')}, ${X(UNI+'studium/international/ausland/australien/','Australien und Ozeanien')} sowie Nord- und Südamerika (${X(UNI+'studium/international/ausland/amerika/','Amerika')}). Bei Interesse geht ihr am besten zuerst in die allgemeine offene Sprechstunde und danach zu den Verantwortlichen für die Länder, die euch interessieren. Ein automatisches Stipendium wie bei ERASMUS gibt es hier nicht, die Studiengebühren werden aber in der Regel erlassen.</p>
<p>Auch unizentral gibt es ein Erasmus-Programm: Über ${X(UNI+'international/erasmus/partnerlaender/','ERASMUS+')} könnt ihr mit Stipendium auch außerhalb Europas studieren.</p>
<p>${X(OLD+'ausland-overseas/','Erfahrungsberichte von außerhalb Europas lesen')}</p>
<h2>Free Mover</h2>
<p>Ist bei all dem nicht das Richtige dabei, könnt ihr auch als Free Mover gehen. Dann organisiert ihr den Austausch selbst und zahlt auch die Studiengebühren selbst.</p>
<h2>Kontakte</h2>
${rows([
 [PI+'ae/crisp/staff/lorenz.html','users','Ute Lorenz','ERASMUS-Koordinatorin des Instituts'],
 [UNI+'studium/kontakt/auslandsamt/','globe','Dezernat Internationale Beziehungen','Kontakt und Sprechstunden'],
 [UNI+'studium/international/ausland/index.html#anker_Austauschprogramme','globe','Austauschprogramme der Universität','Übersicht aller Programme'],
 [PI+'studium/beratung/bachelor/fachstudienberatung.shtml','info','Studienberatung Bachelor','Für erste Fragen'],
 [PI+'studium/beratung/master/fachstudienberatung.shtml','info','Studienberatung Master','Für erste Fragen']
])}`},

'studium/praktika':{t:'Praktika',d:'Pflichtpraktika im Bachelor und Master',lead:'Im Bachelor wie im Master absolvierst du Praktika. Hier das Wichtigste im Überblick.',body:`
<p>Die verbindlichen Details stehen auf der ${X(PI+'studium/praktikum/','Seite der Fachstudienberatung')}.</p>
<h2>Bachelor <span class="badge old">PO 2021</span></h2>
<div class="cards">
 <div class="card"><div class="k">Orientierungspraktikum (OP)</div><h3>4 Wochen Vollzeit</h3><p>oder 150 Stunden in Teilzeit</p>
  <dl><div><dt>Betreuung, nicht approbationskonform</dt><dd>Psycholog:in in der Einrichtung</dd></div><div><dt>Betreuung, approbationskonform</dt><dd>Psychologische:r Psychotherapeut:in in der Einrichtung</dd></div></dl>
  <div class="foot"><span class="badge">schon vor Studienbeginn möglich</span></div></div>
 <div class="card"><div class="k">Berufsqualifizierendes Praktikum (BP)</div><h3>6 Wochen</h3><p>oder 240 Stunden in Teilzeit</p>
  <dl><div><dt>Voraussetzung</dt><dd>1. Studienjahr abgeschlossen, 60 ECTS</dd></div><div><dt>Betreuung, nicht approbationskonform</dt><dd>Psycholog:in in der Einrichtung</dd></div><div><dt>Betreuung, approbationskonform</dt><dd>Psychologische:r Psychotherapeut:in in der Einrichtung</dd></div></dl>
  <div class="foot"><span class="badge">teilbar in zwei 3-wöchige Praktika</span></div></div>
</div>
<h2>Master <span class="badge old">PO 2010</span></h2>
<div class="cards">
 <div class="card"><div class="k">Pflichtpraktikum</div><h3>8 Wochen Vollzeit</h3><p>oder 320 Stunden in Teilzeit</p>
  <dl><div><dt>Betreuung</dt><dd>Psycholog:in in der Einrichtung</dd></div><div><dt>Forschungspraktikum</dt><dd>4 Wochen Vollzeit bzw. 160 Stunden Teilzeit sind anrechenbar</dd></div></dl>
  <div class="foot"><span class="badge">teilbar in zwei 4-wöchige Praktika</span></div></div>
</div>
<h2>Praktikumssuche</h2>
<p>Einen Platz zu finden ist nicht immer leicht, vor allem in Unistädten wie Heidelberg oder Mannheim sind Plätze heiß begehrt. Kümmere dich deshalb möglichst früh darum. Zwei gute Anlaufstellen:</p>
${rows([
 ['https://psyfako.org/praktikumsdatenbank/','globe','PsyFaKo-Praktikumsdatenbank','Bundesweit, mit Erfahrungsberichten von Studis'],
 [UNI+'de/studium/service-beratung/karriereentwicklung/careermatch-karriereportal-der-universitaet-heidelberg','globe','careerMATCH','Das Karriereportal der Universität Heidelberg']
])}`},

'studium/lehrgestaltung':{t:'Arbeitskreis Lehrgestaltung',d:'Eure Anliegen rund um die Lehre',lead:'Wir sind eine Untergruppe der Fachschaft und wollen den Austausch über die Lehre am Psychologischen Institut fördern.',body:`
<p>Der Arbeitskreis ist eure Anlaufstelle für alle Fragen und Anliegen rund um eure Lehrveranstaltungen, zum Beispiel:</p>
<ul><li>Probleme in Seminaren oder Vorlesungen</li><li>fehlendes Feedback zu Referaten, Hausarbeiten oder der Abschlussarbeit</li><li>eigene Ideen, wie die Lehre am Institut besser werden kann</li></ul>
<h2>So erreicht ihr uns</h2>
<div class="cards">
 <div class="card"><span class="k">Mit Antwort</span><h3>Per E-Mail</h3><p>${M('arbeitskreis-lehrgestaltung@psychologie.uni-heidelberg.de','arbeitskreis-lehrgestaltung@<wbr>psychologie.uni-heidelberg.de')}</p><div class="foot">${copyBtn('arbeitskreis-lehrgestaltung@psychologie.uni-heidelberg.de')}</div></div>
 <div class="card"><span class="k">Anonym</span><h3>Über Moodle</h3><p>Über das Feedback-Formular im Moodle-Kurs der Fachschaft. Bei anonymen Nachrichten können wir euch nicht persönlich antworten.</p><div class="foot"><a class="btn btn-ghost btn-small noext" href="https://moodle.uni-heidelberg.de/mod/feedback/view.php?id=265491">Anonym schreiben ${ic('ext')}</a></div></div>
</div>`},

'studium/faq':{t:'FAQ',d:'Häufige Fragen vor dem Studienstart',lead:'Antworten auf die häufigsten Fragen, vor allem für Bewerber:innen und Erstis, die im kommenden Wintersemester in Heidelberg starten.',body:`
<p>Für alle anderen haben die Seiten der Fachstudienberatung für ${X(PI+'studium/bachelor/','Bachelor')} und ${X(PI+'studium/master/','Master')} viele Informationen, etwa zu Praktika, Auslandssemester und Prüfungen. Besonders empfehlenswert ist das ausführliche ${X('http://www.psychologie.uni-heidelberg.de/studium/beratung/a-z.shtml','A-Z')}.</p>
<div class="help"><aside class="help-nav" id="faq-index" aria-label="Fragen"></aside><div class="help-body">
<h2 class="qa-group">Allgemeine Fragen</h2>
<section class="qa" id="infos"><h3>Wo finde ich Informationen zum Studiengang Psychologie in Heidelberg?</h3><div class="a"><p>Allgemeine Infos gibt es auf den Seiten des ${X(PI,'Psychologischen Instituts')}, genauere bei der ${X(PI+'studium/bachelor/','Fachstudienberatung')}. Suchst du etwas Bestimmtes, ist das ausführliche ${X('http://www.psychologie.uni-heidelberg.de/studium/beratung/a-z.shtml','A-Z')} die beste Adresse.</p></div></section>
<section class="qa" id="hd"><h3>Wie ist es, in Heidelberg zu studieren?</h3><div class="a"><p>Das lässt sich nicht pauschal sagen, denn es gibt nicht die typischen Psychologiestudierenden und damit auch keine einheitliche Meinung. Wir wissen aber, wie schwer die Entscheidung für eine Uni fallen kann. Unser Tipp: Schau auf der ${X(PI+'studium/rainbow/','HeiMo-Seite')} vorbei. Dort gibt es Erfahrungsberichte und Beschreibungen typischer Situationen im Studium.</p></div></section>
<section class="qa" id="erstis"><h3>Wie kann ich vorab Kontakt zu anderen Erstis aufnehmen?</h3><div class="a"><p>Oft gibt es schon einige Zeit vorher Gruppen für die neuen Erstis, halte die Augen offen. Außerdem haben wir eine WhatsApp-Community, zu der du spätestens im ${L('studium/bachelor/eks','EKS')} Zugang bekommst. Vielleicht ergibt sich ja auch das eine oder andere Vortreffen.</p><p>Mach dir keine Sorgen, keinen Anschluss zu finden: Die Situation ist für alle neu und alle suchen Kontakt. Im EKS lernt ihr euch schon kennen, und auch das ${L('leben/ersti-we','Ersti-Wochenende')} ist eine super Gelegenheit. Ganz allgemein ist die Atmosphäre unter den Studierenden offen und wertschätzend.</p></div></section>
<section class="qa" id="raum"><h3>Wo finde ich Raum XYZ?</h3><div class="a"><p>Unser Institut ist nicht groß, am Anfang aber trotzdem verwirrend. Gib eine Raumnummer oder einen Begriff ein, und der Raumfinder zeigt dir das passende Gebäude.</p>
<div class="finder"><label for="room">Raumfinder</label><div class="row"><input id="room" type="text" placeholder="z. B. F104, A102, 020, Hörsaal 2, Bibliothek" autocomplete="off"></div><div class="out" id="roomOut" aria-live="polite"></div>
<ul class="bldg" id="bldg">${ROOMS.map((r,i)=>`<li data-i="${i}"><b>${r.b}</b><span>${r.w}${r.plan?`<br>${X(r.plan,'Plan ansehen')}`:''}</span></li>`).join('')}</ul></div>
${callout('Erste Hilfe','<p>Erste Hilfe bekommt ihr im Vordergebäude in Raum 114 bei Frau Lorenz und im Hintergebäude in Raum 114 bei Frau Hausner.</p>')}
<p>Und keine Sorge: Mit der Zeit findest du dich immer besser zurecht.</p></div></section>
<section class="qa" id="wohnung"><h3>Wie und wo finde ich eine Wohnung oder WG?</h3><div class="a"><p>WGs und Wohnungen in Heidelberg sind sehr gefragt. Kümmere dich möglichst früh darum. Mögliche Anlaufstellen:</p><ul><li>${X('http://www.studentenwerk.uni-heidelberg.de/wohnheime','Wohnheime des Studierendenwerks')}</li><li>private Wohnheime: ${X('http://www.studentenwerk.uni-heidelberg.de/sites/default/files/download/pdf/wo-in-hd-andere-traeger-de.pdf','Übersicht als PDF')}</li><li>WG-Anzeigen im Internet, zum Beispiel bei ${X('http://www.wg-gesucht.de','WG-Gesucht')}</li><li>Aushänge in der Triplexmensa und in der Zentralmensa im Neuenheimer Feld</li><li>Zeitungsanzeigen, vor allem für Wohnungen, etwa in der Rhein-Neckar-Zeitung</li></ul></div></section>
<section class="qa" id="ticket"><h3>Welches Ticket für Bus und Bahn soll ich mir holen?</h3><div class="a"><p>Für Studierende gibt es das <strong>D-Ticket JugendBW</strong> (365 € im Jahr), eine günstigere Variante des Deutschlandtickets. Mehr Infos hat der ${X('https://www.stura.uni-heidelberg.de/angebote/semesterticket/','StuRa')}.</p>${callout('','<p>Seit dem Wintersemester 2023/24 können Studierende der Universität Heidelberg kein Semesterticket mehr erwerben. Damit entfällt auch die frühere Abend- und Wochenendregelung für den VRN. '+X(UNI+'de/studium/studienorganisation/beitraege-gebuehren/semesterticket','Quelle')+'</p>')}</div></section>

<h2 class="qa-group">Fragen zum Bachelor</h2>
<section class="qa" id="plaetze-ba"><h3>Wie viele Plätze gibt es für den Bachelor?</h3><div class="a"><p>Für den Bachelor gibt es 90 Plätze.</p></div></section>
<section class="qa" id="nc"><h3>Wie hoch ist der NC?</h3><div class="a"><p>Die Plätze werden teils über Quoten, vor allem aber über Auswahlkriterien vergeben. Insgesamt sind maximal 60 Punkte möglich:</p><div class="pts"><div><b>30</b><span>Abiturnote</span></div><div><b>20</b><span>BaPsy-DGPs</span></div><div><b>10</b><span>sonstige Leistungen</span></div></div><p>Den NC der letzten Jahrgänge und eine genauere Erklärung findest du ${X('http://www.psychologie.uni-heidelberg.de/studium/beratung/bachelor/bewerbung.shtml#nc','beim Institut')}. Wie du siehst, schwankt er. Also: einfach probieren!</p></div></section>
<section class="qa" id="bewerbung-ba"><h3>Wie bewerbe ich mich um einen Studienplatz?</h3><div class="a"><p>Mit deutscher oder EU-Staatsangehörigkeit bewirbst du dich über das ${X(UNI+'de/studium/bewerben-einschreiben/studieneinstieg-1-fachsemester/dialogorientiertes-serviceverfahren-dosv','Dialogorientierte Serviceverfahren (DoSV)')}.</p><p><strong>Internationale Bewerber:innen</strong> mit einer Staatsangehörigkeit außerhalb der EU bewerben sich direkt bei der Universität im ${X(UNI+'de/studium/bewerben-einschreiben/studieneinstieg-1-fachsemester/dialogorientiertes-serviceverfahren-dosv/dialogorientiertes-serviceverfahren-dosv-1','universitätsinternen Zulassungsverfahren')}.</p><p>Maßgeblich sind die ${X(PI+'studium/bachelor/bewerbung/#nc','offiziellen Informationen des Instituts')}.</p></div></section>
<section class="qa" id="eks"><h3>Gibt es eine Einführungswoche für Erstis? Was ist das EKS?</h3><div class="a"><p>Eine Woche vor Semesterbeginn findet das EKS statt, das Erstsemester-Kompakt-Seminar. Klingt ernst, ist aber ein großer Spaß und ein toller Start ins Studium. ${L('studium/bachelor/eks','Mehr zum EKS')}</p></div></section>
<section class="qa" id="vorher"><h3>Was sollte ich schon vor Studienbeginn erledigen?</h3><div class="a"><p>Du solltest dich immatrikulieren, also offiziell an der Uni einschreiben. Eine Anleitung liegt deinem Zulassungsbescheid bei. Außerdem lohnt es sich, früh nach einer Wohnung zu suchen.</p><p>Was du <em>nicht</em> tun musst: dich für Veranstaltungen anmelden, Bücher besorgen oder dir Sorgen machen ;)</p></div></section>
<section class="qa" id="anmelden"><h3>Muss ich mich als Ersti vorab für Veranstaltungen anmelden?</h3><div class="a"><p><strong>Nein.</strong> Es gibt zwar Seminare mit Anmeldung, das betrifft dich aber noch nicht. Du kannst alles entspannt auf dich zukommen lassen. Im ${L('studium/bachelor/eks','EKS')} erfährst du alles Wichtige.</p></div></section>
<section class="qa" id="stundenplan"><h3>Wie sieht mein Stundenplan aus?</h3><div class="a"><p>Deinen Stundenplan bekommst du im EKS oder stellst ihn dir in ${X('https://heico.uni-heidelberg.de/','heiCO')} zusammen. Weil sich hier gerade einiges verändert, helfen wir dir im ${L('studium/bachelor/eks','EKS')} dabei. Welche Fächer dich erwarten, zeigt dir der ${X('https://heibox.uni-heidelberg.de/d/95707d86f0674bb2a781/','Studienplan')}.</p></div></section>
<section class="qa" id="buecher"><h3>Was muss ich vorab besorgen, zum Beispiel Bücher?</h3><div class="a"><p>Nichts. Du erfährst früh genug, ob und welche Bücher du brauchst. Alles Nötige findest du dann in der Institutsbibliothek oder in der großen Altstadtbibliothek.</p></div></section>

<h2 class="qa-group">Fragen zum Master</h2>
<section class="qa" id="schwerpunkte"><h3>Welche Masterschwerpunkte gibt es in Heidelberg?</h3><div class="a"><p><strong>Aktuell:</strong></p><ul><li>${X(UNI+'de/studium/alle-studienfaecher/psychologie/psychologie-in-klinischer-psychologie-und-psychotherapie-master','Klinische Psychologie und Psychotherapie (KliPP)')}</li><li>${X(UNI+'de/studium/alle-studienfaecher/psychologie/psychologie-in-forschung-und-anwendung-master','Forschung und Anwendung (PFA)')}</li></ul><p><strong>Auslaufend:</strong></p><ul><li>${X('http://www.psychologie.uni-heidelberg.de/studium/beratung/master/dcp.shtml','DCP')} (Development and Clinical Psychology)</li><li>${X(PI+'studium/beratung/master/obac.html','OBAC')} (Organisational Behavior and Adaptive Cognition)</li></ul></div></section>
<section class="qa" id="plaetze-ma"><h3>Wie viele Plätze gibt es für den Master?</h3><div class="a">${callout('Veraltete Angabe','<p>Für den Master gab es 90 Plätze: 64 im Schwerpunkt DCP und 26 im Schwerpunkt OBAC.</p>')}</div></section>
<section class="qa" id="bewerbung-ma"><h3>Wie bewerbe ich mich um einen Masterplatz?</h3><div class="a"><p>Alles Wichtige zu Bewerbung und Platzvergabe findest du ${X('http://www.psychologie.uni-heidelberg.de/studium/beratung/master/bewerbung.shtml','beim Institut')}.</p></div></section>
<section class="qa" id="extern"><h3>Habe ich einen Nachteil, wenn ich meinen Bachelor nicht in Heidelberg gemacht habe?</h3><div class="a"><p>Kurz gesagt zählen für die Zulassung die Bachelornote, Berufsausbildungen und zusätzliche Tätigkeiten. Seit einigen Semestern kommt außerdem der Mastertest hinzu. ${X(PI+'studium/beratung/master/bewerbung.shtml','Mehr Infos')}</p><p>Die vollständigen Kriterien stehen in der ${X(PI+'studium/beratung/master/files/Zulassungssatzung%20MA%20Psychologie_13.10.2017.pdf','Zulassungsordnung')}. <em>Nur sie enthält die offiziellen und ausschlaggebenden Informationen.</em></p></div></section></div></div>`},

'studium/links':{t:'Links',d:'Wichtige Adressen an Uni und Institut',lead:'Die wichtigsten Adressen rund um Universität, Institut und Stadt.',body:`
<h2>Universität Heidelberg</h2>
${rows([
 ['http://www.ub.uni-heidelberg.de','link','Universitätsbibliothek',''],
 ['https://www.urz.uni-heidelberg.de/','link','Universitätsrechenzentrum',''],
 [UNI+'studium/kontakt/zsw','link','Zentrale Studienberatung',''],
 ['http://www.hochschulsport.issw-hd.de','link','Hochschulsport',''],
 [UNI+'zsl/','link','Zentrales Sprachlabor (ZSL)',''],
 ['https://www.urz.uni-heidelberg.de/de/service-katalog/drucken','link','Drucken über Ricoh','']
])}
<h2>Psychologisches Institut</h2>
${rows([
 [PI+'studium/bachelor/dokumente/','link','Studienpläne und Prüfungsordnungen Bachelor',''],
 [PI+'studium/master/dokumente/','link','Studienpläne und Prüfungsordnungen Master',''],
 ['http://lsf.uni-heidelberg.de','link','LSF','Vorlesungsverzeichnis, Studiums- und Prüfungsverwaltung'],
 ['https://moodle.uni-heidelberg.de/','link','Moodle',''],
 [PI+'studium/bachelor/','link','Fachstudienberatung Bachelor',''],
 [PI+'studium/master/','link','Fachstudienberatung Master',''],
 ['http://www.psychologie.uni-heidelberg.de/service/bib','link','Institutsbibliothek',''],
 ['http://www.psychologie.uni-heidelberg.de/studium/rainbow/index.html','link','Heidelberger Psychologiestudierende von Morgen (HeiMo)','']
])}
<h2>Heidelberg</h2>
${rows([
 ['http://www.vrn.de','link','Verkehrsverbund Rhein-Neckar (VRN)',''],
 ['http://www.studentenwerk.uni-heidelberg.de','link','Studierendenwerk Heidelberg',''],
 ['http://www.stadtbuecherei-heidelberg.bib-bw.de','link','Stadtbücherei Heidelberg','']
])}`},

'leben':{t:'Leben am Institut',d:'Partys, Kino, Grillen und mehr',lead:'Studium ist nicht alles. Mit unseren Veranstaltungen schaffen wir Gelegenheiten, sich über alle Semester hinweg kennenzulernen.',body:`
<p>Unser Herzstück ist die ${L('leben/psychoparty','Psychoparty')}, bei der Psychos aus allen Semestern den Start ins neue Semester feiern. Auch im kleineren Rahmen, etwa bei der ${L('leben/pumpkinparty','Pumpkinparty')} oder dem ${L('leben/wechslertreffen','Wechslertreffen')}, kommen Leute aus verschiedenen Semestern zusammen und verbringen einen netten Abend.</p>
<p>Außerdem organisieren wir das ${L('leben/grillen','Institutsgrillen')}, das ${L('leben/psychokino','PsychoKino')} mit psychologischem Vortrag und das ${L('leben/ersti-we','Ersti-Wochenende')} für alle Neuen. Unser Ziel: eine lockere, positive Atmosphäre am Institut, im eigenen Semester und darüber hinaus.</p>
<h2>Durchs Jahr</h2>
<div class="year">
 <div><h3>Wintersemester</h3><ol>
  <li><span>Oktober</span><div>${L('studium/bachelor/eks','EKS')} für Erstis, danach die ${L('leben/psychoparty','Psychoparty')}</div></li>
  <li><span>um Halloween</span><div>${L('leben/pumpkinparty','Pumpkinparty')} mit Kürbis-Schnitzwettbewerb</div></li>
  <li><span>Ende November</span><div>${L('leben/ersti-we','Ersti-Wochenende')} im Nibelungenturm in Worms</div></li>
 </ol></div>
 <div><h3>Sommersemester</h3><ol>
  <li><span>im Semester</span><div>${L('leben/psychoparty','Bipolare Psychoparty')} gemeinsam mit der SRH</div></li>
  <li><span>Juni</span><div>${L('leben/grillen','Institutsgrillen')} im Innenhof</div></li>
 </ol></div>
</div>
<div class="cards">
 <a class="card" href="#/leben/psychokino"><span class="k">Einmal pro Semester</span><h3>PsychoKino</h3><p>Ein Film und ein psychologischer Vortrag.</p></a>
 <a class="card" href="#/leben/wechslertreffen"><span class="k">Nach Ankündigung</span><h3>Wechslertreffen</h3><p>Für Quereinsteiger:innen und Nachrücker:innen.</p></a>
 <a class="card" href="#/leben/blackbox"><span class="k">Jedes Semester</span><h3>BlackBox</h3><p>Die Psychologie-Zeitschrift am Institut.</p></a>
</div>
<p>Die genauen Termine kündigen wir über den Verteiler an. ${X(CAL,'Zum Kalender')}</p>`},

'leben/psychoparty':{t:'Psychoparty',d:'Das Herzstück zum Semesterstart',lead:'Zu Beginn jedes Wintersemesters steigt am Institut die Psychoparty, liebevoll auch „Psychopathie“ genannt.',body:`
${facts([['Wintersemester','Psychoparty','im Hintergebäude des Instituts'],['Sommersemester','Bipolare Psychoparty','mit der SRH Heidelberg']])}
<p>Organisiert wird die Party von Fachschaftler:innen, umgesetzt mit Hilfe vieler Studierender und Professor:innen. Sie findet im Hintergebäude unseres Instituts statt und bietet alles, was es zum Feiern braucht: eine Bar, eine coole Location, viele gut gelaunte Studierende und jede Menge gute Musik.</p>
<p>Meist gibt es ein oder zwei Stargäste, denn einige unserer Professor:innen heizen der feiernden Meute inzwischen routiniert mit ihrer Musik ein. Ob DJ Funk, DJ Carneval, DJ BiSpi oder DJ Dirk: Es lohnt sich auf jeden Fall! Und wer eine Pause von der Tanzfläche braucht, verschnauft im Innenhof.</p>
<h2>Bipolare Psychoparty</h2>
<p>Auch im Sommersemester wird gefeiert: Gemeinsam mit der SRH Heidelberg feiern wir mit allen, die in Heidelberg Psychologie studieren: die <strong>Bipolare Psychoparty</strong>.</p>
${callout('Termine','<p>Wir geben die Termine über den '+L('fachschaft/kontakt','Verteiler')+' bekannt, sobald sie feststehen. Diese Partys solltest du nicht verpassen!</p>')}`},

'leben/blackbox':{t:'BlackBox',d:'Die Psychologie-Zeitschrift am Institut',lead:'Die BlackBox ist die neu aufgelegte Psychologie-Zeitschrift unseres Instituts. Die Fachschaft hat sie 2020 wiederbelebt, nachdem über 15 Jahre lang keine „Schwarze Schachtel“ mehr erschienen war.',body:`
<p>Jedes Semester erscheint eine Ausgabe zu einem Thema oder Motto, mit Artikeln von Studierenden und Dozierenden, Umfragen, Memes und so ziemlich allen Ideen, die sich verwirklichen lassen. Stöbere in den Ausgaben, entdecke neue Perspektiven oder lach einfach über die Memes. In den PDFs kannst du per Klick zwischen den Beiträgen springen.</p>
<h2>Neue Ausgabe und Archiv</h2>
<ul class="issues">${ISSUES.map(([n,s,f],i)=>`<li class="${i===0?'newest':''}"><a class="noext" href="${U+f}"><span class="cover"><span class="bbn">BlackBox</span><span class="num">${n}</span></span><span class="meta">${s}${i===0?' (neu)':''}<span>${ic('download')} PDF herunterladen</span></span></a></li>`).join('')}</ul>
<h2>Mitmachen</h2>
<p>Du hast Lust, in der Redaktion mitzumachen oder einen Artikel beizutragen? Schreib uns, sprich uns in der Fachschaftssitzung an, melde dich auf Instagram oder komm einfach zum nächsten Treffen im Fachschaftskeller oder online.</p>
<div class="btns"><a class="btn btn-primary noext" href="mailto:blackbox@psychologie.uni-heidelberg.de">${ic('mail')}E-Mail an die Redaktion</a><a class="btn btn-ghost noext" href="https://www.instagram.com/blackbox.psy/">${ic('insta')}@blackbox.psy</a><a class="btn btn-ghost noext" href="https://bbb.stura.uni-heidelberg.de/b/ant-ov9-5tp-brx">${ic('video')}Online-Treffen</a></div>
<h2>Die Vorgänger der BlackBox</h2>
<p>Studentische Zeitschriften haben am Institut eine lange Tradition. Die ältesten noch auffindbaren Ausgaben sind über vierzig Jahre alt. Sie stammen aus einer Zeit ohne Internet, Heimcomputer oder Smartphone und behandeln trotzdem erstaunlich aktuelle Themen. Zur Archivierung haben wir die gedruckten Hefte eingescannt.</p>
${OLDMAG.map(([name,list])=>`<h3>${name}</h3>${rows(list.map(([s,f])=>[ss(f),'file',name+', Ausgabe '+s,'PDF']))}`).join('')}
${callout('Lieber im Original blättern?','<p>Komm gern zu den Sitzungszeiten vorbei und schau dir die gedruckten Hefte an.</p>')}`},

'leben/pumpkinparty':{t:'Pumpkinparty',d:'Kürbisschnitzen zu Halloween',lead:'Pünktlich zu Halloween veranstalten wir jedes Jahr die berühmte Pumpkinparty.',body:`
${facts([['Wann','um Halloween','meist ab 19 Uhr, siehe Ankündigung'],['Wo','Fachschaftskeller','des Psychologischen Instituts']])}
<p>Neben gemütlichem Beisammensein mit Glühwein, Keksen und Co. macht vor allem der <strong>Kürbis-Schnitzwettbewerb</strong> Spaß: Die Fachschaft stellt Kürbisse und Werkzeug, ihr schnitzt in Kleingruppen kreative Kürbisse.</p>
<p>Über die Platzierung entscheidet eine erfahrene Jury aus Fachschaftsmitgliedern. Dabei zählt nicht nur der Kürbis selbst, sondern auch die Geschichte, die ihr dazu erzählt. Auf die ersten drei Plätze warten Preise. Nach der Party werden alle Kürbisse im Innenhof des Instituts ausgestellt.</p>`},

'leben/wechslertreffen':{t:'Wechslertreffen',d:'Für Quereinsteiger:innen und Nachrücker:innen',lead:'Neu am Institut, aber nicht im ersten Semester? Dann ist das Wechslertreffen für dich.',body:`
${facts([['Für wen','Quereinsteiger:innen','und Nachrücker:innen'],['Wo','Fachschaftskeller','nach Ankündigung']])}
<p>Beim Wechslertreffen lernt ihr andere Studierende kennen und könnt offene Fragen klären. Für eine gemütliche Atmosphäre sorgt die Fachschaft mit Spaghetti Bolognese (auch vegetarisch) und Getränken. Nach der Begrüßung durch Fachschaftler:innen gibt es eine kurze Vorstellungsrunde, damit das Eis schnell gebrochen ist.</p>`},

'leben/grillen':{t:'Institutsgrillen',d:'Jedes Jahr im Juni im Innenhof',lead:'Einmal im Jahr wird der Innenhof zum Treffpunkt für das ganze Institut.',body:`
${facts([['Wann','jährlich im Juni','bei hoffentlich gutem Wetter'],['Wo','Innenhof','des Psychologischen Instituts'],['Für wen','alle','Studierende, Dozierende und Mitarbeitende']])}
<p>Beim Institutsgrillen grillen wir gemeinsam und sitzen gemütlich zusammen. Meist bringen alle etwas für das Salat- und Nachtischbuffet mit, Getränke gibt es bei der Fachschaft zu kaufen.</p>
<p>In der Vergangenheit gab es sogar Live-Auftritte, Pub-Quizze und die Verleihung eines studentischen Lehrpreises.</p>
<div class="photos">${photo('Institutsgrillen',U+'2015/03/Institutsgrillen.jpg')}${photo('Institutsgrillen, Juni 2024',U+'2024/07/IMG-20240622-WA0022-1.jpg')}</div>`},

'leben/ersti-we':{t:'Ersti-Wochenende',d:'Im Nibelungenturm in Worms',lead:'Nicht verpassen solltet ihr das Ersti-Wochenende, traditionell im Nibelungenturm in Worms.',body:`
${facts([['Wann','Ende November','meist an einem der letzten Wochenenden'],['Wo','Nibelungenturm','in Worms']])}
<p>Hier lernt ihr nicht nur euer Semester besser kennen, sondern auch die mitfahrenden Tutor:innen und natürlich den einmaligen Turm. Tagsüber versüßen euch Workshops die Zeit, etwa das alljährliche Plätzchenbacken, abends wird zusammen gefeiert.</p>
<p>Um den Hexer und das Cowgirl ranken sich übrigens Legenden.</p>
<div class="photos">${photo('Ersti-Wochenende, Dezember 2023',U+'2024/07/PXL_20231202_154432955-scaled.jpg')}</div>`},

'leben/psychokino':{t:'PsychoKino',d:'Filme und Psychologie',lead:'Psychokino heißt: Wir schauen Filme und beschäftigen uns dabei ganz anders mit Psychologie als im Studienalltag.',body:`
<p>Filme zeigen den riesigen Schatz menschlicher Erfahrung mit einer Unmittelbarkeit, die der normale Unibetrieb nur selten erreicht. Das Kino bietet so die Chance, sich mit der eigenen Psychologie zu verbinden: mit Gedanken, Vorstellungen und Empfindungen, manchmal auch mit Abgründen. Austausch, Begegnung und Bereicherung gehören ebenso dazu wie Auseinandersetzung, Konfrontation und Herausforderung.</p>
<p>Begleitende Vorträge, Diskussionen und andere Formate füllen die gemeinsamen Abende mit Leben. Das PsychoKino ist offen für alle. Ob als Gast oder beim Mitgestalten: Wir freuen uns auf dich!</p>
${callout('Aktuell','<p>Nach der Corona-Pause läuft das PsychoKino wieder. Hurra!</p>')}
<h2>Zuletzt gezeigt</h2>
<div class="tablewrap"><table><thead><tr><th>Film</th><th>Beitrag von</th></tr></thead><tbody>
<tr><td>Das Experiment</td><td>Prof. Dr. Joachim Funke</td></tr>
<tr><td>Willkommen Mr. Chance</td><td>M.Sc. Alexander Wendt (${X('https://zumpad.zum.de/p/r.65fab282f2e18a94c307474b419771a4','Vortrag nachlesen')})</td></tr>
<tr><td>Her</td><td>Prof. Dr. Joachim Funke</td></tr>
<tr><td>A Beautiful Mind</td><td>Prof. Dr. Sven Barnow</td></tr>
<tr><td>Elternschule</td><td>Prof. Dr. Sabina Pauen</td></tr>
<tr><td>Liebe</td><td>Prof. Dr. Cornelia Wrzus</td></tr>
</tbody></table></div>`},

'hopo':{t:'Hochschulpolitik',d:'Gremien und studentische Vertretung',lead:'Hochschulpolitik bedeutet für uns zweierlei: akademische Mitbestimmung und studentische Selbstverwaltung.',body:`
<p>Zur <strong>akademischen Mitbestimmung</strong> gehört die Mitarbeit in den Gremien der Universität. Dort vertreten wir die Studierenden als Teil des akademischen Personals. Zur <strong>studentischen Selbstverwaltung</strong> gehören die Vernetzung mit anderen Fachschaften und die Mitarbeit in der Verfassten Studierendenschaft, also im ${L('hopo/stura','Studierendenrat')}.</p>
${callout('Du willst dich engagieren?','<p>Für die Gremien können alle Psychologiestudierenden kandidieren. Aktive Fachschaftsarbeit ist keine Voraussetzung. Melde dich bei '+M(MAIL,'uns')+', wir erzählen dir gern mehr.</p>','red')}
<h2>Akademische Mitbestimmung</h2>
<div class="tablewrap"><table><thead><tr><th>Gremium</th><th>Ebene</th><th>Studentische Sitze</th><th>Wahl</th></tr></thead><tbody>
<tr><td>${L('hopo/fachrat','FachRat')}</td><td>Institut</td><td>3</td><td>jedes Wintersemester, Amtszeit ab Sommersemester</td></tr>
<tr><td>${L('hopo/fakrat','FakultätsRat')}</td><td>Fakultät</td><td>8 für die gesamte Fakultät</td><td>jährlich im Juni</td></tr>
<tr><td>${L('hopo/qsm','QSM-Kommission')}</td><td>Institut</td><td>mindestens 2</td><td>jedes Wintersemester, Amtszeit ab Sommersemester</td></tr>
<tr><td>${L('hopo/pruefungsausschuss','Prüfungsausschuss')}</td><td>Institut</td><td>1, beratend</td><td>Entsendung im Oktober</td></tr>
</tbody></table></div>
<h2>Studentische Selbstverwaltung</h2>
<div class="tablewrap"><table><thead><tr><th>Gremium</th><th>Ebene</th><th>Studentische Sitze</th><th>Wahl</th></tr></thead><tbody>
<tr><td>${L('hopo/fachschaftsrat','Fachschaftsrat')}</td><td>Fach Psychologie</td><td>7</td><td>im Januar, Amtszeit ab Sommersemester</td></tr>
<tr><td>${L('hopo/stura','StuRa')}</td><td>Universität</td><td>Vertretung der Psychologie</td><td>Entsendung im Oktober</td></tr>
<tr><td>${L('hopo/psyfako','PsyFaKo')}</td><td>bundesweit</td><td>Konferenz aller Psychologie-Fachschaften</td><td>keine Wahl</td></tr>
</tbody></table></div>`},

'hopo/fachrat':{t:'FachRat',d:'Gremium auf Institutsebene',lead:'Der FachRat gestaltet Studium und Lehre im Fach Psychologie maßgeblich mit. Seine Entscheidungen betreffen dich am direktesten.',body:`
<h2>Was ist der FachRat?</h2>
<p>Im FachRat kommen alle Gruppen des Instituts zusammen: Hochschullehrer:innen, wissenschaftliche Mitarbeiter:innen, Verwaltung und Technik sowie wir Studierende. Die Institutsebene ist die „unterste“ Ebene der Universität.</p>
<p>Zu den Aufgaben des FachRats gehören:</p>
<ul><li>Entwurf und Überarbeitung von Modulhandbüchern, Prüfungs- und Zulassungsordnungen</li><li>Planung des Lehrangebots</li><li>Evaluation der Lehre</li><li>Stellungnahmen zur Besetzung von Professuren</li></ul>
<h2>Und was geht mich das an?</h2>
<p>Im FachRat sitzen <strong>drei studentische Vertreter:innen</strong>. Sie werden jedes Wintersemester gewählt und beginnen ihre einjährige Amtszeit im Sommersemester. Die Fachschaft ruft rechtzeitig zu Wahl und Kandidatur auf. Bei Interesse melde dich gern bei uns!</p>
<h2>Studentische Vertreter:innen</h2>
${terms([
 {label:'2025/26',from:'2025-04-01',to:'2026-03-31',m:['Steffen Matthias Tietz','Nina Sophie Wimmer','Lucia Wagner'],s:['Benedikt A. Voß','Elias Staatz','Mia Sophie Dröge','Magdalena Eleonora Klevesath']},
 {label:'2026/27',from:'2026-04-01',to:'2027-03-31',m:['Tadeus Pindl','Yixuan Wang','Sarah Hestermeyer'],s:['Jasmin Denkmann']}
])}`},

'hopo/fakrat':{t:'FakRat',d:'Der FakultätsRat',lead:'Der FakultätsRat ist das entscheidungstragende Gremium auf Ebene der Fakultät.',body:`
<h2>Was ist der FakultätsRat?</h2>
<p>Das Psychologische Institut gehört zusammen mit der Ethnologie, der Gerontologie, den Sportwissenschaften und den Bildungswissenschaften zur Fakultät für Verhaltens- und Empirische Kulturwissenschaften. Im FakultätsRat werden Themen diskutiert und beschlossen, die für die Fakultät und ihre Fächer relevant sind.</p>
${facts([['Professor:innen','alle','der Fakultät'],['Mittelbau','4','Vertreter:innen'],['Studierende','8','Vertreter:innen'],['Verwaltung','1','Mitarbeiter:in']])}
<p>Den Vorsitz hat der Dekan, im Sommersemester 2024 Prof. Dr. Guido Sprenger vom Institut für Ethnologie.</p>
<p>Zu den Aufgaben gehören zum Beispiel:</p>
<ul><li>Besetzung untergeordneter Ausschüsse und Kommissionen</li><li>Beschluss von Prüfungs- und Zulassungsordnungen</li><li>Berufung von Professor:innen</li><li>Prüfung der Veranstaltungsverzeichnisse</li><li>Vergabe von Lehraufträgen</li><li>Verwendung der Qualitätssicherungsmittel für die Lehre</li></ul>
<h2>Und was geht mich das an?</h2>
<p>Im FakultätsRat sitzen auch studentische Vertreter:innen aus der Psychologie, gewählt für ein Jahr. Die Wahlen finden jeweils im Juni statt; die Fachschaft ruft rechtzeitig zu Wahl und Kandidatur auf. Bei Interesse melde dich gern bei uns!</p>
<h2>Studentische Vertreter:innen der Psychologie</h2>
${people(['Henriette Neuschwander','Lina-Marie Ruppert','Nele Josefine Haffner','Benedikt Voß','Mia Sophie Dröge'])}
<p class="term-dates">${ic('cal')} Nächste Wahl: Juni 2026</p>`},

'hopo/fachschaftsrat':{t:'Fachschaftsrat',d:'Das Exekutivorgan der Fachschaft',lead:'Der Fachschaftsrat (nicht zu verwechseln mit dem FachRat) ist die offizielle Vertretung der Psychologiestudierenden.',body:`
<h2>Was ist der Fachschaftsrat?</h2>
<p>Mit Einführung der Verfassten Studierendenschaft (${L('hopo/stura','StuRa')}) hat sich der Fachschaftsrat als offizielle Vertretung der Studierenden eines Fachs gebildet, bei uns der Psychologie. Er ist sozusagen das Exekutivorgan der Fachschaft und übernimmt vor allem organisatorische Aufgaben wie die Finanzplanung. Nicht verwechseln mit dem ${L('hopo/fachrat','FachRat')}!</p>
<h2>Und was geht mich das an?</h2>
<p>Anders als in den übrigen Unigremien sitzen im Fachschaftsrat ausschließlich Studierende: <strong>sieben Psychologiestudierende</strong>, gewählt im Januar für ein Jahr ab dem Sommersemester. Die Fachschaft ruft rechtzeitig zu Wahl und Kandidatur auf. Bei Interesse melde dich gern bei uns!</p>
<h2>Mitglieder</h2>
${terms([
 {label:'2025/26',from:'2025-04-01',to:'2026-03-31',m:['Nele Josefine Haffner','Elias Staatz','Henriette Neuschwander','Mia Sophie Dröge','Katharina Tomaszewski','Tobias Jenner','Lucia Wagner'],s:['Benedikt A. Voß','Magdalena Eleonora Klevesath']},
 {label:'2026/27',from:'2026-04-01',to:'2027-03-31',m:['Mia Sophie Dröge','Henriette Neuschwander','Lorina Lukic','Sarah Hestermeyer','Lina-Marie Ruppert','Benedikt A. Voß','Claudia Lawall'],s:[]}
])}`},

'hopo/stura':{t:'StuRa',d:'Der Studierendenrat',lead:'Der Studierendenrat ist das zentrale Organ der Verfassten Studierendenschaft der Universität Heidelberg.',body:`
<p>Alle Infos zum StuRa gibt es auf ${X('https://www.stura.uni-heidelberg.de/','seiner Website')}.</p>
<h2>Vertreter:innen der Psychologie</h2>
${terms([
 {label:'Entsendung 2025',note:'Nächste Entsendung: Oktober 2025',m:['Elias Staatz','Lucia Wagner'],s:['Tobias Remmen','Benedikt Voß'],sLabel:'Stellvertreter:innen',mLabel:'Vertreter:innen'},
 {label:'Entsendung 2026',badge:'in Vorbereitung',note:'Nächste Entsendung: Oktober 2026',m:['Mira Schneider','Helena Zündorf'],s:['Mika Bös','Lars Oppert'],sLabel:'Stellvertreter:innen',mLabel:'Vertreter:innen'}
],{cur:0})}`},

'hopo/qsm':{t:'QSM-Kommission',d:'Qualitätssicherungsmittel für die Lehre',lead:'Die QSM-Kommission entscheidet, wie die Qualitätssicherungsmittel des Instituts die Lehre verbessern.',body:`
<h2>Was ist die QSM-Kommission?</h2>
<p>Anfang 2012 wurden die Studiengebühren in Baden-Württemberg abgeschafft. Als Ausgleich stellt das Land den Hochschulen die sogenannten <strong>Qualitätssicherungs-Nachfolgemittel (QSN)</strong> zur Verfügung.</p>
<p>Wie diese Mittel eingesetzt werden, debattiert die <strong>Qualitätssicherungsmittelkommission</strong>. In drei bis vier Sitzungen pro Semester entscheidet sie über mittel- und langfristige Maßnahmen und erstellt einen Verwendungsplan für das folgende Semester.</p>
<p>Das Schöne: Der Rahmen ist sehr breit: Von der Raumausstattung bis zu Gastvorträgen ist vieles möglich. Einzige Bedingung: Die Förderung muss der Qualität der Lehre dienen und darf keine Einzelpersonen fördern.</p>
<h3>Bisher finanziert wurden zum Beispiel</h3>
<ul><li>Seminare, die der reguläre Studienplan nicht abdeckt</li><li>Tutorien, etwa für Statistik, Sozialpsychologie, EKS oder Comenius</li><li>Methodenberatung</li><li>Studienberatung</li><li>Bücher und Tests für die Bibliothek</li><li>Technik</li><li>Software</li></ul>
<h2>Und was geht mich das an?</h2>
<p>In der Kommission sitzen mindestens zwei Studierende. Sie diskutieren mit den übrigen Mitgliedern über die Verwendung der Mittel und legen die Ergebnisse dem ${L('hopo/fachschaftsrat','Fachschaftsrat')} zur Abstimmung vor. Gewählt wird jedes Wintersemester für ein Jahr ab dem Sommersemester.</p>
${callout('Du hast eine Idee?','<p>Die QSM-Kommission greift gern Vorschläge von Studierenden auf. Wende dich direkt an die studentischen Vertreter:innen oder an '+M(MAIL,'uns')+'.</p>','red')}
<h2>Studentische Vertreter:innen</h2>
${people(['Carlotta Jacobi','Henriette Neuschwander','Benedikt Voß','Felicitas Plank','Nele Haffner'])}`},

'hopo/pruefungsausschuss':{t:'Prüfungsausschuss',d:'Prüfungsordnung und Prüfungsorganisation',lead:'Der Prüfungsausschuss befasst sich mit allem, was Prüfungsordnung, Organisation und Durchführung von Prüfungen betrifft.',body:`
${facts([['Professor:innen','2','eine:r davon im Vorsitz'],['Mittelbau','1'],['Studierende','1','beratend']])}
<p>Den Vorsitz hat derzeit Prof. Dr. Andreas Voß. Wir Studierende haben in diesem Gremium leider kein echtes Stimmrecht, sondern beraten nur. Trotzdem können wir uns dort für die Interessen der Studierenden am Institut einsetzen.</p>
<h2>Studentische Vertretung</h2>
<h3>Mitglied</h3>${people(['Steffen Tietz'])}
<h3>Vertretung</h3>${people(['Rahel Kröning'])}
<p class="term-dates">${ic('cal')} Nächste Entsendung: Oktober 2025</p>`},

'hopo/psyfako':{t:'PsyFaKo',d:'Die Psychologie-Fachschaften-Konferenz',lead:'Die PsyFaKo ist die Bundesfachschaftentagung der Psychologiestudierenden.',body:`
<p>PsyFaKo steht für <strong>Psychologie-Fachschaften-Konferenz</strong>: die Interessenvertretung aller psychologischen Fachschaften in Deutschland.</p>
<h2>Ziele der PsyFaKo</h2>
<ul><li>Austausch über Hochschul- und Studienkonzepte</li><li>Vernetzung der Fachschaften</li><li>Stellungnahmen zu aktuellen studien- und berufspolitischen Themen</li></ul>
${callout('PsyFaKo in Heidelberg','<p>Im Sommersemester 2022 war die PsyFaKo nach sieben Jahren zum zweiten Mal zu Gast in Heidelberg. Die Fachschaften der Universität und der SRH Heidelberg haben die Organisation gemeinsam übernommen. Wir haben uns über die vielen Teilnehmenden sehr gefreut!</p>')}
<p><a class="btn btn-primary noext" href="http://www.psyfako.org/">${ic('globe')}Zur Website der PsyFaKo</a></p>`},

'impressum':{t:'Impressum',d:'Angaben zum Anbieter',lead:'',body:`
<div class="cards">
 <div class="card"><h3>Fachschaft Psychologie</h3><p>Hauptstraße 47–51<br>69117 Heidelberg</p><p>Tel. <a href="tel:+496221542456">+49&nbsp;6221&nbsp;54-2456</a><br>Fax +49&nbsp;6221&nbsp;54-2457<br>${M(MAIL)}</p></div>
</div>
<p>Die Fachschaft Psychologie gehört zur Verfassten Studierendenschaft der Universität Heidelberg, einer Körperschaft des öffentlichen Rechts. Gesetzlich vertreten wird sie durch den Vorsitz der Verfassten Studierendenschaft.</p>
<h2>Datenschutz</h2>
<p>Unsere Hinweise zum Datenschutz findest du in der ${X(DSGVO,'Datenschutzerklärung')}.</p>`}
};

/* ============ Hochauflösende Bilder & Karten ============ */
const HD_IMG = {
  hero: "assets/images/hero.webp",
  city: "assets/images/city.webp",
  valley: "assets/images/valley.webp",
  night: "assets/images/night.webp"
};
const MAP_META = { w: 1600, h: 955, ix: 44.59, iy: 51.88 };


/* ============ Fotos, Nachweise, Karte ============ */
const CCBYSA='https://creativecommons.org/licenses/by-sa/4.0/deed.de';
const SRC_ZAPF='https://github.com/FachschaftMathPhysInfo/zapf-tagungsheft';
const SRC_ERSTI='https://github.com/FachschaftMathPhysInfo/Ersti-Info';
const IMG={
  hero:{alt:'Blick vom Heidelberger Schloss über die Altstadt, den Neckar und die Alte Brücke bei Sonnenuntergang',by:'Samuel Scherer',src:SRC_ZAPF},
  city:{alt:'Heidelberg im Abendlicht: Blick vom Berg auf Altstadt, Bergheim und den Neckar',by:'Fachschaft MathPhysInfo (Ersti-Info 2023)',src:SRC_ERSTI},
  valley:{alt:'Der Neckar bei Sonnenuntergang, Blick über Heidelberg bis in die Rheinebene',by:'Fachschaft MathPhysInfo (Ersti-Info 2023)',src:SRC_ERSTI},
  night:{alt:'Heidelberger Schlossbeleuchtung: das rot angestrahlte Schloss mit Feuerwerk über der nächtlichen Altstadt',by:'Fachschaft MathPhysInfo (ZaPF-Tagungsheft 2018)',src:SRC_ZAPF}
};
const credit=k=>`<span class="credit-txt" aria-label="Foto: ${IMG[k].by}, Lizenz CC BY-SA 4.0"><span aria-hidden="true">Foto: </span><a class="noext" href="${IMG[k].src}" aria-label="Fotoquelle ${IMG[k].by}">${IMG[k].by}</a><span aria-hidden="true">, </span><a class="noext" href="${CCBYSA}" aria-label="Lizenz CC BY-SA 4.0">CC BY-SA 4.0</a></span>`;
const pic=(k,cls,eager)=>`<img${cls?` class="${cls}"`:''} src="${HD_IMG[k]}" alt="${IMG[k].alt}" decoding="async"${eager?' fetchpriority="high"':' loading="lazy"'}>`;
const OSM='https://www.openstreetmap.org/copyright';
const OSM_LINK='https://www.openstreetmap.org/?mlat=49.41054&mlon=8.69767#map=18/49.41054/8.69767';
const GMAPS_LINK='https://www.google.com/maps/search/?api=1&query=Psychologisches+Institut+Universit%C3%A4t+Heidelberg,+Hauptstra%C3%9Fe+47-51,+69117+Heidelberg';
const APPLE_MAPS_LINK='https://maps.apple.com/?q=Psychologisches+Institut+Universit%C3%A4t+Heidelberg&ll=49.41054,8.69767';
const MAP_DEFAULT_LINK=(typeof navigator!=='undefined'&&/Macintosh|iPhone|iPad|iPod/.test(navigator.userAgent))?APPLE_MAPS_LINK:GMAPS_LINK;
const mapSvg=cls=>`<svg class="${cls||''}" viewBox="0 0 1600 ${MAP_META.h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><use href="#hd-map"/></svg>`;
const SECTION_IMG={fachschaft:'valley',studium:'city',leben:'night'};
PAGES.impressum.body+=`
<h2>Bildnachweise</h2>
<p>Die Fotos von Heidelberg stehen unter der Lizenz <a href="${CCBYSA}">CC BY-SA 4.0</a>. Wir verwenden verkleinerte Ausschnitte; diese stehen unter derselben Lizenz.</p>
${rows([
 [SRC_ZAPF,'image','Altstadt vom Schloss bei Sonnenuntergang','Foto: Samuel Scherer, aus dem ZaPF-Tagungsheft der Fachschaft MathPhysInfo'],
 [SRC_ZAPF,'image','Heidelberger Schlossbeleuchtung','Fachschaft MathPhysInfo, ZaPF-Tagungsheft 2018'],
 [SRC_ERSTI,'image','Stadtpanorama und Neckartal im Abendlicht','Fachschaft MathPhysInfo, Titelbilder des Ersti-Info 2023'],
 [OSM,'map','Karte der Altstadt','Kartendaten © OpenStreetMap-Mitwirkende, Lizenz ODbL']
])}`;

// Globally expose variables for all script loaders & environments
if (typeof window !== "undefined") {
  Object.assign(window, {
    WP_BASE, P, OLD, U, PI, UNI, MAIL, MAIL_FIN, BBB, CAL, ICS, IG, FB, PSYTREFF, DSGVO,
    SEMESTER_CONFIG, HOLIDAYS_BW, isLecturePeriod, isHoliday, formatDateLong, newsFreshnessHint,
    PHOTOS, HERO_KEY, HD_IMG, MAP_META, IMG, SECTION_IMG, TREE, POSTS, ISSUES,
    OLDMAG, ROOMS, PAGES, ic, L, X, M, copyBtn, facts, callout, initials, people,
    rows, photo, fmtD, terms, sessionBox, pic, credit, mapSvg,
    OSM, OSM_LINK, GMAPS_LINK, APPLE_MAPS_LINK, MAP_DEFAULT_LINK
  });
}
