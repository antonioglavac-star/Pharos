const $ = id => document.getElementById(id);
let isl, LV, li = 0, state, moves = 0, won = false, toIsle = false, litNow = null;
let fog = new Set();   // polja pod maglom koja zraka još nije dotaknula
let litBefore = new Set(), quiet = true;   // koji su brodovi bili osvijetljeni prije poteza; tiho pri učitavanju razine
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Napredak: zvjezdice po ID-u razine (npr. 'vis-3'), pa nove razine ne kvare spremljenu igru
const SAVE_KEY = 'svjetionik-napredak';
let progress = {};
try { progress = JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch (e) {}
function saveStars(id, s){
  progress[id] = Math.max(progress[id]||0, s);
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(progress)); } catch (e) {}
}
const islandDone = id => !!LEVELS[id] && LEVELS[id].every(L => progress[L.id]);
// Otok je otvoren ako ima razine i svi prethodni otoci s razinama su osvijetljeni
const islandOpen = i => !!LEVELS[ISLANDS[i].id] && ISLANDS.slice(0,i).every(I => !LEVELS[I.id] || islandDone(I.id));

// Gdje igrač nastavlja: prva neriješena razina prvog otvorenog otoka (null kad je sve riješeno)
function nextSpot(){
  const n = ISLANDS.findIndex((I, i) => islandOpen(i) && !islandDone(I.id));
  if (n < 0) return null;
  const id = ISLANDS[n].id;
  return { id, i: LEVELS[id].findIndex(L => !progress[L.id]) };
}

function drawCoast(L){
  // Rub oko mreže (u poljima) je mali, da ploča bude što veća; linija dubine smije izaći preko ruba ploče
  const M = .15, sh = !!L.shape, W = L.w+(sh?2*M:0), H = L.h+(sh?2*M:0), b = $('board'), g = $('grid');
  b.classList.toggle('shaped', sh);
  b.style.aspectRatio = W + ' / ' + H;
  b.style.setProperty('--px', sh ? M*100/W+'%' : '0%');
  b.style.setProperty('--py', sh ? M*100/H+'%' : '0%');
  g.style.clipPath = sh ? 'url(#isleClip)' : '';
  const c = $('coast');
  if (!sh){ c.innerHTML = ''; return; }
  const d = coastPath(L, .08, .06);
  c.setAttribute('viewBox', `${-M} ${-M} ${W} ${H}`);
  c.innerHTML = `<defs>
      <clipPath id="isleClip" clipPathUnits="objectBoundingBox"><path transform="scale(${1/L.w} ${1/L.h})" d="${d}"/></clipPath>
    </defs>
    <path class="contour" d="${coastPath(L, .36, .05)}"/>
    <path class="shore" d="${d}"/>`;
}

// Pokreće razinu i otoka (bez i: prvu neriješenu)
function openIsland(id, i){
  isl = ISLANDS.find(I => I.id===id); LV = LEVELS[id];
  ['map','isle','lights','start'].forEach(s => $(s).hidden = true); $('game').hidden = false;
  $('island').textContent = 'Otok ' + isl.name;
  const next = LV.findIndex(L => !progress[L.id]);
  load(i ?? (next<0 ? 0 : next));
  window.scrollTo(0, 0);
}

function load(i){
  li = i; moves = 0; won = false;
  const L = LV[i];
  state = parseCells(L);
  $('title').textContent = 'Razina ' + (i+1);
  $('par').textContent = L.par;
  $('hint').textContent = L.hint;
  $('win').hidden = true;
  $('board').classList.remove('won');
  drawCoast(L);
  const g = $('grid');
  g.style.gridTemplateColumns = `repeat(${L.w},1fr)`;
  g.style.gridTemplateRows = `repeat(${L.h},1fr)`;
  $('beams').setAttribute('viewBox', `0 0 ${L.w} ${L.h}`);
  g.innerHTML = '';
  fog = new Set();
  if (L.fog) for (let y=0;y<L.h;y++) for (let x=0;x<L.w;x++) if (L.fog[y][x]==='m') fog.add(x+','+y);
  for (let y=0;y<L.h;y++) for (let x=0;x<L.w;x++){
    const k = x+','+y, c = state[k];
    let el;
    if (!onBoard(L,x,y)){
      el = document.createElement('div');
      el.classList.add('off'); el.setAttribute('aria-hidden','true');
    } else if (c && c.t==='m'){
      el = document.createElement('button');
      el.setAttribute('aria-label','Ogledalo, dodirni za okretanje');
      el.innerHTML = `<div class="mirror" style="transform:rotate(${c.rot}deg)"></div>`;
      el.onclick = () => rotate(k, el);
    } else {
      el = document.createElement('div');
      const lamp = lightsOf(L).find(l => l.x===x && l.y===y);
      if (lamp) el.innerHTML = ICONS.light(lamp.d);
      else if (c && c.t==='#') el.innerHTML = '<div class="rock"></div>';
      else if (c && c.t==='B'){ el.classList.add('boat'); el.innerHTML = ICONS.boat(c.c); if (c.c) el.style.setProperty('--bc', COL[c.c]); }
      else if (c && c.t==='F') el.innerHTML = ICONS.filter(c.c);
      else if (c && c.t==='P') el.innerHTML = ICONS.prism();
      else if (c && c.t==='C'){ el.classList.add('cave'); el.innerHTML = ICONS.cave(); }
      else if (c && c.t==='T'){ el.classList.add('reef'); el.innerHTML = ICONS.reef(); }
    }
    el.classList.add('cell'); el.dataset.k = k;
    // Magla skriva polje dok zraka ne prođe kroz njega; skriveno ogledalo se ne može okretati
    if (fog.has(k)){
      el.classList.add('fog'); el.insertAdjacentHTML('beforeend', '<div class="mist"></div>');
      if (el.tagName==='BUTTON'){ el.disabled = true; el.setAttribute('aria-label','Skriveno u magli'); }
    }
    g.appendChild(el);
  }
  $('moves').textContent = 0;
  L.tide = Object.values(L.cells).includes('T');
  $('tide').hidden = !L.tide;
  litBefore = new Set(); quiet = true;
  trace();
  quiet = false;
  showTips(L);
}

// Upute u pravom trenutku: kad se predmet prvi put pojavi u igri, kratki prozor ga objasni (samo jednom)
const TIPS = [
  { key:'mirror', name:'Ogledalo', icon:() => '<div class="mirror" style="transform:rotate(-45deg)"></div>', has:L => Object.values(L.cells).some(v => v==='/' || v==='\\'),
    text:'Dodirni ogledalo da ga okreneš. Zraka se od njega odbija pod pravim kutom. Dovedi svjetlo do svih brodova.' },
  { key:'prism', name:'Prizma', icon:() => ICONS.prism(), has:L => Object.values(L.cells).includes('P'),
    text:'Prizma dijeli zraku na dvije: jedna ide lijevo, a druga desno od smjera iz kojeg je zraka došla.' },
  { key:'filter', name:'Filter boja', icon:() => ICONS.filter('r'), has:L => Object.values(L.cells).some(v => v[0]==='F'),
    text:'Filter boji zraku. Obojeni brod uplovljava samo uz svjetlo svoje boje, a bijeli brod prima svako svjetlo.' },
  { key:'cave', name:'Modra špilja', icon:() => ICONS.cave(), has:L => Object.values(L.cells).includes('C'),
    text:'Modra špilja propušta samo plavu zraku, koja prolazi ravno kroz nju. Svaka druga zraka staje na ulazu.' },
  { key:'fog', name:'Magla', icon:() => '<span class="fog-chip"></span>', has:L => !!L.fog,
    text:'Magla skriva dio otoka. Kad zraka uđe u maglu, otkrije što je ispod. Ogledalo u magli ne možeš okretati dok ga zraka ne otkrije.' },
  { key:'tide', name:'Plima i oseka', icon:() => ICONS.reef(), has:L => Object.values(L.cells).includes('T'),
    text:'Svaki potez mijenja more. U plimi je hrid pod morem i zraka prelazi preko nje, a u oseci hrid izroni i zaustavi zraku. Pazi koliko poteza napraviš.' },
  { key:'two', name:'Dva svjetionika', icon:() => ICONS.light([0,-1]), has:L => !!L.light2,
    text:'Na ovom otoku svijetle dva svjetionika. Zrake se mogu križati i ne smetaju jedna drugoj, a brodu je dovoljna bilo koja od njih.' }
];
const TIPS_KEY = 'svjetionik-upute';
let tipsSeen = [];
try { tipsSeen = JSON.parse(localStorage.getItem(TIPS_KEY)) || []; } catch (e) {}
let tipQueue = [];
function tipSeen(key){
  tipsSeen.push(key);
  try { localStorage.setItem(TIPS_KEY, JSON.stringify(tipsSeen)); } catch (e) {}
}
function showTips(L){
  tipQueue = TIPS.filter(T => T.has(L) && !tipsSeen.includes(T.key));
  // Ogledalo ne treba prozor: u prvoj razini samo pulsira dok ga igrač ne dodirne
  const m = tipQueue.findIndex(T => T.key==='mirror');
  if (m >= 0){
    tipQueue.splice(m, 1); tipSeen('mirror');
    document.querySelectorAll('#grid button.cell').forEach(b => b.classList.add('hinted'));
  }
  nextTip();
}
function nextTip(){
  const T = tipQueue.shift();
  if (!T) return;
  tipSeen(T.key);
  $('tipIcon').innerHTML = T.icon();
  $('tipTitle').textContent = T.name;
  $('tipText').textContent = T.text;
  setTimeout(() => { if (!$('tip').open) $('tip').showModal(); }, 250);
}
$('tip').addEventListener('close', () => nextTip());

function rotate(k, el){
  if (won) return;
  const c = state[k];
  c.v = c.v==='/' ? '\\' : '/';
  c.rot += 90;
  el.firstChild.style.transform = `rotate(${c.rot}deg)`;
  moves++; $('moves').textContent = moves;
  Feel.mirror();
  $('hint').textContent = LV[li].hint;
  trace();
}

function trace(){
  const L = LV[li], low = lowTide(moves);
  const { segs, lit, wrong, caveLit, touched } = castBeam(L, state, low);
  document.querySelectorAll('.reef').forEach(r => r.classList.toggle('up', low));
  if (L.tide) $('tide').innerHTML = low
    ? '<b>Oseka</b> · hridi su izronile i zaustavljaju zraku. Sljedeći potez donosi plimu.'
    : '<b>Plima</b> · hridi su pod morem i zraka prelazi preko njih. Sljedeći potez donosi oseku.';
  $('tide').classList.toggle('low', low);
  $('beams').innerHTML = segs.map(({pts,col})=>{const s=pts.map(a=>a.join(',')).join(' ');return `<polyline class="glow" stroke="${col}" points="${s}"/><polyline class="core" stroke="${col}" points="${s}"/>`}).join('');
  document.querySelectorAll('.cave').forEach(c => c.classList.toggle('lit', caveLit.has(c.dataset.k)));
  // Zraka raspršuje maglu: polje ostaje otkriveno do kraja pokušaja
  for (const k of touched) if (fog.has(k)){
    fog.delete(k);
    const el = document.querySelector(`#grid [data-k="${k}"]`);
    el.classList.add('clear');
    if (el.tagName==='BUTTON'){ el.disabled = false; el.setAttribute('aria-label','Ogledalo, dodirni za okretanje'); }
  }
  const boats = Object.keys(state).filter(k=>state[k].t==='B');
  document.querySelectorAll('.hinted').forEach(h => h.classList.remove('hinted'));
  const fresh = [...lit].filter(k => !litBefore.has(k));
  litBefore = lit;
  document.querySelectorAll('.boat').forEach(b=>{
    b.classList.toggle('lit', lit.has(b.dataset.k));
    b.classList.toggle('wrong', wrong.has(b.dataset.k) && !lit.has(b.dataset.k));
    // Brod koji je upravo dobio svjetlo se zaljulja
    if (!quiet && fresh.includes(b.dataset.k)){ b.classList.remove('arrive'); void b.offsetWidth; b.classList.add('arrive'); }
  });
  if (boats.every(k=>lit.has(k)) && !won){
    won = true;
    // Pobjeda: brodovi uplove, zraka zasja jače, pa se pokaže poruka
    $('board').classList.add('won');
    Feel.win();
    setTimeout(showWin, calm() ? 500 : 1300);
  } else if (!quiet && fresh.length) Feel.boat();
}

// Pomoć "Pokaži potez": iz trenutnog stanja traži najkraće rješenje i vrati ogledalo koje se smije dodirnuti
// prvo. Ogledalo u magli ne može biti prvi potez.
function findHint(){
  const L = LV[li], st = {};
  for (const k in state) st[k] = { ...state[k] };
  if (L.tide) return solveTide(L, st, moves, fog).first;
  for (const flips of solveMin(L, st).sols){
    const k = flips.find(k => !fog.has(k));
    if (k) return k;
  }
  return null;
}

$('helpBtn').onclick = () => {
  if (won) return;
  document.querySelectorAll('.hinted').forEach(h => h.classList.remove('hinted'));
  const k = findHint();
  if (k){
    document.querySelector(`#grid [data-k="${k}"]`).classList.add('hinted');
    $('hint').textContent = 'Okreni označeno ogledalo.';
  } else {
    $('hint').textContent = 'Potrebno ogledalo skriva se u magli. Usmjeri zraku u maglu da ga otkriješ.';
  }
};

function showWin(){
  const L = LV[li], wasDone = islandDone(isl.id);
  const s = moves<=L.par ? 3 : moves<=L.par+2 ? 2 : 1;
  saveStars(L.id, s);
  const justLit = !wasDone && islandDone(isl.id);
  toIsle = li===LV.length-1;
  litNow = justLit ? isl.id : null;   // upravo osvijetljen otok: sljedeći korak je proslava na karti
  $('winTitle').textContent = justLit ? `Otok ${isl.name} je osvijetljen` : 'Svi brodovi su u luci';
  $('stars').innerHTML = [1,2,3].map(i=>`<span class="${i<=s?'':'off'}">★</span>`).join('');
  $('winText').textContent = `Riješeno u ${moves} ${moves===1?'potezu':'poteza'} (cilj: ${L.par}).`;
  $('winFact').hidden = !(justLit && isl.fact);
  $('winFact').innerHTML = `<b>Zanimljivost</b>${isl.fact}`;
  // Novi svjetionik u kolekciji
  const H = justLit && typeof LIGHTHOUSES !== 'undefined' && LIGHTHOUSES[isl.id];
  $('winLight').hidden = !H;
  if (H){
    $('winLight').innerHTML = `<svg viewBox="40 0 80 120" aria-hidden="true">${H.svg}</svg><span><small>Novi svjetionik u kolekciji</small><b>${H.name}</b></span>`;
    $('winLight').onclick = () => openLight(isl.id);
  }
  $('next').textContent = litNow ? 'Na kartu' : toIsle ? 'Na otok' : 'Sljedeća razina';
  $('winIsle').hidden = toIsle || !!litNow;
  $('win').hidden = false;
  $('next').focus();
}

$('reset').onclick = () => load(li);
// Pauza: nastavak, ponovni početak, karta otoka, postavke, početni izbornik
$('pauseBtn').onclick = () => $('pause').showModal();
$('pResume').onclick = () => $('pause').close();
$('pRestart').onclick = () => { $('pause').close(); load(li); };
$('pIsle').onclick = () => { $('pause').close(); showIsle(isl.id); };
$('pSettings').onclick = () => { $('pause').close(); $('settings').showModal(); };
$('pMenu').onclick = () => { $('pause').close(); showStart(false); };
$('next').onclick = () => litNow ? showMap(litNow) : toIsle ? showIsle(isl.id) : load(li+1);
$('winIsle').onclick = () => showIsle(isl.id);
$('back').onclick = () => showIsle(isl.id);
