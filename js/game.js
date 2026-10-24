const $ = id => document.getElementById(id);
let isl, LV, li = 0, state, moves = 0, won = false, toIsle = false;
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

const ICONS = {
  light: d => `<svg class="icon" viewBox="0 0 40 40" style="transform:rotate(${Math.atan2(d[1],d[0])*180/Math.PI}deg)">
     <circle cx="20" cy="20" r="17" fill="#ffc35a22"/>
     <g transform="rotate(90 20 20)"><path d="M14 34h12l-2.5-20h-7z" fill="#e9eff7"/><path d="M15 27h10l-.6-5h-8.8z" fill="#d9534f"/>
     <rect x="15.5" y="9" width="9" height="5" rx="1" fill="#ffc35a"/><path d="M14.5 9h11l-5.5-4z" fill="#d9534f"/></g></svg>`,
  filter: c => `<svg class="icon" viewBox="0 0 40 40"><rect x="9" y="9" width="22" height="22" rx="7" fill="${COL[c]}" fill-opacity=".38" stroke="${COL[c]}" stroke-width="2.5"/><path d="M14 15l6-3" stroke="#fff9" stroke-width="2" stroke-linecap="round"/></svg>`,
  boat: c => `<svg class="icon" viewBox="0 0 40 40"><path d="M7 25h26l-4 7H11z" fill="#c9d4e3"/><path class="sail" d="M20 6v17H10z" fill="${c?COL[c]:'#e9eff7'}"/><path d="M21 9v14h8z" fill="#8ea3bf"/><path d="M5 34c4 0 4-2 8-2s4 2 8 2 4-2 8-2 4 2 6 2" stroke="#8ea3bf55" stroke-width="1.5" fill="none"/></svg>`,
  cave: () => `<svg class="icon" viewBox="0 0 40 40"><path d="M4 34C4 17 10 7 20 7s16 10 16 27z" fill="#34404f"/><path d="M9 30C10 19 14 12 20 11" stroke="#4a5768" stroke-width="2" fill="none" stroke-linecap="round"/><path class="mouth" d="M12 34c0-9 3.5-15 8-15s8 6 8 15z" fill="#07101d"/></svg>`,
  // svaka prizma ima svoj prijelaz boja, jer skrivena kopija (npr. u zatvorenom prozoru) ne smije pokvariti ostale
  prism: () => { const g = 'pg' + (++ICONS.n); return `<svg class="icon" viewBox="0 0 40 40"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bfe9ff"/><stop offset="1" stop-color="#5aa7ff"/></linearGradient></defs><path d="M20 7l13 23H7z" fill="url(#${g})" opacity=".9"/><path d="M20 7l-4 23" stroke="#fff8" stroke-width="1"/></svg>`; },
  n: 0
};

// Ćelija je na ploči ako je unutar mreže i, kad razina ima obris (shape), nije označena s '.'
const onBoard = (L,x,y) => x>=0 && y>=0 && x<L.w && y<L.h && (!L.shape || L.shape[y][x]!=='.');

// Obala: rubovi ćelija ploče spojeni u petlje, pa zaglađeni (stube postaju kose linije)
// i blago valoviti, uvijek jednako za istu razinu. off pomiče liniju prema moru, amp je jačina valovitosti.
function coastPath(L, off, amp){
  const next = {};
  for (let y=0;y<L.h;y++) for (let x=0;x<L.w;x++) if (onBoard(L,x,y)){
    if (!onBoard(L,x,y-1)) next[x+','+y] = [x+1,y];
    if (!onBoard(L,x+1,y)) next[(x+1)+','+y] = [x+1,y+1];
    if (!onBoard(L,x,y+1)) next[(x+1)+','+(y+1)] = [x,y+1];
    if (!onBoard(L,x-1,y)) next[x+','+(y+1)] = [x,y];
  }
  // Valovitost ovisi o ID-u razine, pa obala ne skače pri ponovnom učitavanju
  let seed = 0;
  for (const ch of L.id) seed = (seed*31 + ch.charCodeAt(0)) % 997;
  const ph = [seed*.37, seed*.91, seed*1.53];
  let d = '';
  for (const s of Object.keys(next)){
    if (!next[s]) continue;
    const corners = [];
    for (let k=s; next[k]; ){ const p = next[k]; delete next[k]; corners.push(p); k = p.join(','); }
    // Gusto točke: četiri po rubu ćelije
    let pts = [];
    corners.forEach((a,i) => { const b = corners[(i+1)%corners.length];
      for (let t=0;t<1;t+=.25) pts.push([a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]); });
    const n = pts.length, at = i => pts[(i+n)%n];
    // Zaglađivanje: svaka točka postaje prosjek susjeda do pola ćelije na svaku stranu (triput)
    for (let pass=0; pass<3; pass++){
      pts = pts.map((_,i) => { let x=0, y=0;
        for (let j=-2;j<=2;j++){ x += at(i+j)[0]; y += at(i+j)[1]; }
        return [x/5, y/5]; });
    }
    // Pomak prema moru (more je lijevo od smjera hoda) plus blagi valovi duž obale
    pts = pts.map((p,i) => {
      const a = at(i-1), b = at(i+1), dx = b[0]-a[0], dy = b[1]-a[1], len = Math.hypot(dx,dy) || 1;
      const u = i*.25, wave = Math.sin(u*2.6+ph[0])*.6 + Math.sin(u*5.3+ph[1])*.3 + Math.sin(u*11+ph[2])*.1;
      const o = off + amp*wave;
      return [p[0] + dy/len*o, p[1] - dx/len*o];
    });
    const mid = i => { const a=at(i), b=at(i+1); return [(a[0]+b[0])/2, (a[1]+b[1])/2]; };
    const r = v => v.map(c => +c.toFixed(3));
    d += 'M'+r(mid(0)) + pts.map((_,i)=>'Q'+r(at(i+1))+' '+r(mid(i+1))).join('') + 'Z';
  }
  return d;
}

function drawCoast(L){
  const sh = !!L.shape, W = L.w+(sh?1:0), H = L.h+(sh?1:0), b = $('board'), g = $('grid');
  b.classList.toggle('shaped', sh);
  b.style.aspectRatio = W + ' / ' + H;
  b.style.setProperty('--px', sh ? 50/W+'%' : '0%');
  b.style.setProperty('--py', sh ? 50/H+'%' : '0%');
  g.style.clipPath = sh ? 'url(#isleClip)' : '';
  const c = $('coast');
  if (!sh){ c.innerHTML = ''; return; }
  const d = coastPath(L, .08, .06);
  c.setAttribute('viewBox', `-.5 -.5 ${W} ${H}`);
  c.innerHTML = `<defs>
      <clipPath id="isleClip" clipPathUnits="objectBoundingBox"><path transform="scale(${1/L.w} ${1/L.h})" d="${d}"/></clipPath>
    </defs>
    <path class="contour" d="${coastPath(L, .36, .05)}"/>
    <path class="shore" d="${d}"/>`;
}

// Pokreće razinu i otoka (bez i: prvu neriješenu)
function openIsland(id, i){
  isl = ISLANDS.find(I => I.id===id); LV = LEVELS[id];
  $('map').hidden = true; $('isle').hidden = true; $('game').hidden = false;
  $('island').textContent = 'Otok ' + isl.name;
  const next = LV.findIndex(L => !progress[L.id]);
  load(i ?? (next<0 ? 0 : next));
  window.scrollTo(0, 0);
}

function load(i){
  li = i; moves = 0; won = false;
  const L = LV[i];
  state = {};
  for (const [k,v] of Object.entries(L.cells)) state[k] =
    (v==='/'||v==='\\') ? {t:'m', v, rot: v==='/'?-45:45}
    : v[0]==='F' ? {t:'F', c:v[1]}
    : v[0]==='B' ? {t:'B', c:v[1]||null}
    : {t:v};
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
      if (L.light.x===x && L.light.y===y) el.innerHTML = ICONS.light(L.light.d);
      else if (c && c.t==='#') el.innerHTML = '<div class="rock"></div>';
      else if (c && c.t==='B'){ el.classList.add('boat'); el.innerHTML = ICONS.boat(c.c); if (c.c) el.style.setProperty('--bc', COL[c.c]); }
      else if (c && c.t==='F') el.innerHTML = ICONS.filter(c.c);
      else if (c && c.t==='P') el.innerHTML = ICONS.prism();
      else if (c && c.t==='C'){ el.classList.add('cave'); el.innerHTML = ICONS.cave(); }
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
  $('legCave').hidden = !Object.values(L.cells).includes('C');
  $('legFog').hidden = !L.fog;
  litBefore = new Set(); quiet = true;
  renderDots(); trace();
  quiet = false;
}

function rotate(k, el){
  if (won) return;
  const c = state[k];
  c.v = c.v==='/' ? '\\' : '/';
  c.rot += 90;
  el.firstChild.style.transform = `rotate(${c.rot}deg)`;
  moves++; $('moves').textContent = moves;
  Feel.mirror();
  trace();
}

function trace(){
  const L = LV[li], segs = [], lit = new Set(), wrong = new Set(), seen = new Set(), caveLit = new Set(), touched = new Set();
  const q = [{x:L.light.x, y:L.light.y, dx:L.light.d[0], dy:L.light.d[1], col:'w'}];
  while (q.length){
    const r = q.shift();
    let cx=r.x, cy=r.y; const pts=[[cx+.5,cy+.5]];
    const go = (x,y,dx,dy,col) => { const s=`${x},${y},${dx},${dy},${col}`; if (!seen.has(s)){ seen.add(s); q.push({x,y,dx,dy,col}); } };
    while (true){
      const nx=cx+r.dx, ny=cy+r.dy;
      const edge = [cx+.5+r.dx*.5, cy+.5+r.dy*.5];
      if (!onBoard(L,nx,ny)){ pts.push(edge); break; }
      const k=nx+','+ny, c=state[k];
      touched.add(k);
      if ((nx===L.light.x&&ny===L.light.y) || (c&&c.t==='#')){ pts.push(edge); break; }
      if (c&&c.t==='B'){ pts.push([nx+.5,ny+.5]); (!c.c || c.c===r.col ? lit : wrong).add(k); break; }
      if (c&&c.t==='F'){ pts.push([nx+.5,ny+.5]); go(nx,ny,r.dx,r.dy,c.c); break; }
      // Modra špilja: plava zraka prolazi kroz nju, svaka druga staje na ulazu
      if (c&&c.t==='C'){ if (r.col==='b'){ caveLit.add(k); cx=nx; cy=ny; continue; } pts.push(edge); break; }
      if (c&&(c.t==='m'||c.t==='P')){
        pts.push([nx+.5,ny+.5]);
        const dirs = c.t==='P' ? [[r.dy,r.dx],[-r.dy,-r.dx]]
                   : c.v==='/' ? [[-r.dy,-r.dx]] : [[r.dy,r.dx]];
        for (const [dx,dy] of dirs) go(nx,ny,dx,dy,r.col);
        break;
      }
      cx=nx; cy=ny;
    }
    segs.push({pts, col:COL[r.col]});
  }
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

function showWin(){
  const L = LV[li], wasDone = islandDone(isl.id);
  const s = moves<=L.par ? 3 : moves<=L.par+2 ? 2 : 1;
  saveStars(L.id, s);
  const justLit = !wasDone && islandDone(isl.id);
  toIsle = justLit || li===LV.length-1;
  $('winTitle').textContent = justLit ? `Otok ${isl.name} je osvijetljen` : 'Svi brodovi su u luci';
  $('stars').innerHTML = [1,2,3].map(i=>`<span class="${i<=s?'':'off'}">★</span>`).join('');
  $('winText').textContent = `Riješeno u ${moves} ${moves===1?'potezu':'poteza'} (cilj: ${L.par}).`;
  $('winFact').hidden = !(justLit && isl.fact);
  $('winFact').innerHTML = `<b>Zanimljivost</b>${isl.fact}`;
  $('next').textContent = toIsle ? 'Na otok' : 'Sljedeća razina';
  $('winIsle').hidden = toIsle;
  $('win').hidden = false;
  renderDots();
  $('next').focus();
}

function renderDots(){
  $('dots').innerHTML = LV.map((L,i)=>`<button class="dot ${i===li?'cur':''} ${progress[L.id]?'done':''}" ${i>0&&!progress[LV[i-1].id]&&i!==li?'disabled':''} data-i="${i}" aria-label="Razina ${i+1}">${i+1}</button>`).join('');
  $('dots').querySelectorAll('.dot').forEach(d=>d.onclick=()=>load(+d.dataset.i));
}

$('reset').onclick = () => load(li);
$('next').onclick = () => toIsle ? showIsle(isl.id) : load(li+1);
$('winIsle').onclick = () => showIsle(isl.id);
$('back').onclick = () => showIsle(isl.id);
