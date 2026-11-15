// Uređivač razina: slaganje dodirom, stalna provjera i spremanje u projekt.
// Pravila i provjera dolaze iz js/engine.js, pa razina radi jednako kao u igri.
const $ = id => document.getElementById(id);

const TOOLS = [
  { key:'light',  label:'Svjetionik',  icon:() => ICONS.light([1,0]), help:'Dodirni polje da postaviš svjetionik. Dodirni ga opet da mu okreneš smjer.' },
  { key:'light2', label:'Drugi svjetionik', icon:() => ICONS.light([0,-1]), help:'Neobavezan. Dodirni polje da ga postaviš, opet da mu okreneš smjer. Gumica ga briše.' },
  { key:'mirror', label:'Ogledalo', icon:() => '<div class="mirror" style="transform:rotate(-45deg)"></div>', help:'Dodirni polje da postaviš ogledalo, opet da ga okreneš. Složi ga onako kako ga igrač zatekne: krivo okrenuto ogledalo je potez koji igrač mora napraviti.' },
  { key:'B',  label:'Brod',        icon:() => ICONS.boat(null), help:'Bijeli brod prima bilo koje svjetlo.' },
  { key:'Br', label:'Crveni brod', icon:() => ICONS.boat('r'),  help:'Prima samo crveno svjetlo, pa na putu treba crveni filter.' },
  { key:'Bb', label:'Plavi brod',  icon:() => ICONS.boat('b'),  help:'Prima samo plavo svjetlo, pa na putu treba plavi filter.' },
  { key:'#',  label:'Stijena',     icon:() => '<div class="rock"></div>', help:'Zaustavlja zraku. Možeš je povlačiti preko više polja.' },
  { key:'P',  label:'Prizma',      icon:() => ICONS.prism(),    help:'Dijeli zraku na dvije, lijevo i desno od smjera dolaska.' },
  { key:'Fr', label:'Crveni filter', icon:() => ICONS.filter('r'), help:'Boji zraku u crveno.' },
  { key:'Fb', label:'Plavi filter',  icon:() => ICONS.filter('b'), help:'Boji zraku u plavo.' },
  { key:'C',  label:'Modra špilja', icon:() => ICONS.cave(),    help:'Propušta samo plavu zraku; ostale staju na ulazu.' },
  { key:'T',  label:'Hrid',        icon:() => ICONS.reef(),     help:'Plima i oseka: svaki potez mijenja more. U oseci hrid zaustavi zraku. S puno ogledala teško se računa.' },
  { key:'fog', label:'Magla',      icon:() => '<span class="glyph">▒</span>', help:'Povuci preko polja. Igrač ne vidi što je ispod dok zraka ne dođe. Svjetionik i brodovi ne mogu u maglu.' },
  { key:'land', label:'More / kopno', icon:() => '<span class="glyph">≈</span>', help:'Povuci preko polja da ih pretvoriš u more izvan otoka, ili natrag. Tako crtaš oblik otoka.' },
  { key:'erase', label:'Gumica',   icon:() => '<span class="glyph">⌫</span>', help:'Povuci preko polja da obrišeš predmete i maglu.' }
];
const DRAG = new Set(['#','fog','land','erase']);

let tool = 'mirror', mode = 'build', island = null, index = -1, showSolution = false, lastCheck = null;
let dirty = false, d = null, play = null;

// Razina u uređivaču: off i fog su skupovi polja, a toLevel() ih pretvara u oblik iz datoteke
function blankDraft(){
  return { id:nextId(), w:7, h:7, light:{x:0,y:3,d:[1,0]}, light2:null, hint:'', cells:{}, off:new Set(), fog:new Set() };
}
function fromLevel(L){
  const off = new Set(), fog = new Set();
  for (let y=0;y<L.h;y++) for (let x=0;x<L.w;x++){
    if (L.shape && L.shape[y][x]==='.') off.add(x+','+y);
    if (L.fog && L.fog[y][x]==='m') fog.add(x+','+y);
  }
  return { id:L.id, w:L.w, h:L.h, light:{...L.light}, light2:L.light2 ? {...L.light2} : null, hint:L.hint||'', cells:{...L.cells}, off, fog };
}
function toLevel(par = 0){
  const rows = (test, on) => Array.from({length:d.h}, (_,y) => Array.from({length:d.w}, (_,x) => test(x+','+y) ? on : (on==='.' ? 'x' : '.')).join(''));
  const L = { id:d.id, w:d.w, h:d.h, par, light:d.light };
  if (d.light2) L.light2 = d.light2;
  L.hint = d.hint;
  if (d.off.size) L.shape = rows(k => d.off.has(k), '.');
  if (d.fog.size) L.fog = rows(k => d.fog.has(k), 'm');
  L.cells = d.cells;
  return L;
}

function nextId(){
  const list = LEVELS[island] || [];
  const nums = list.map(L => +L.id.split('-').pop()).filter(n => !isNaN(n));
  return island + '-' + (Math.max(0, list.lastId || 0, ...nums) + 1);
}

// Provjere koje vrijede samo za crtanje otoka; ostalo radi checkLevel iz engine.js
function shapeProblems(){
  const on = (x,y) => x>=0 && y>=0 && x<d.w && y<d.h && !d.off.has(x+','+y), out = [];
  for (let y=-1;y<d.h;y++) for (let x=-1;x<d.w;x++){
    const a=on(x,y), b=on(x+1,y), c=on(x,y+1), e=on(x+1,y+1);
    if ((a&&e&&!b&&!c)||(b&&c&&!a&&!e)){ out.push('Dva polja kopna dodiruju se samo kutom. Spoji ih ili jedno makni.'); return out; }
  }
  return out;
}

function evaluate(){
  const L = toLevel();
  const errs = shapeProblems();
  const r = errs.length ? { best:Infinity, flips:null, errors:errs } : checkLevel(L);
  return r;
}

function setStatus(){
  const r = lastCheck = evaluate(), el = $('status');
  const ok = !r.errors.length && r.best !== Infinity;
  el.className = 'status ' + (ok ? 'good' : 'bad');
  if (ok){
    const ms = Object.values(d.cells).filter(v => v==='/'||v==='\\').length;
    el.innerHTML = `<b>Cilj: ${r.best} ${r.best===1?'potez':'poteza'}</b>Razina je ispravna i može se riješiti. Ogledala na ploči: ${ms}.`;
  } else {
    el.innerHTML = `<b>Još nije spremna</b><ul>${r.errors.map(e => `<li>${e}</li>`).join('')}</ul>`;
  }
  $('saveBtn').disabled = !ok;
  $('showSol').disabled = !ok || !r.flips;
  $('showSol').textContent = showSolution ? 'Sakrij rješenje' : 'Pokaži rješenje';
  if (!r.flips) showSolution = false;
}

function iconFor(k, st, playing){
  const c = st[k];
  const lamp = lightsOf(toLevel()).find(l => l.x+','+l.y === k);
  if (lamp) return ICONS.light(lamp.d);
  if (!c) return '';
  if (c.t==='m') return `<div class="mirror" style="transform:rotate(${c.v==='/'?-45:45}deg)"></div>`;
  if (c.t==='#') return '<div class="rock"></div>';
  if (c.t==='B') return ICONS.boat(c.c);
  if (c.t==='F') return ICONS.filter(c.c);
  if (c.t==='P') return ICONS.prism();
  if (c.t==='C') return ICONS.cave();
  if (c.t==='T') return ICONS.reef();
  return '';
}

function render(){
  const L = toLevel(), b = $('board'), g = $('grid');
  b.style.aspectRatio = `${d.w} / ${d.h}`;
  g.style.gridTemplateColumns = `repeat(${d.w},1fr)`;
  g.style.gridTemplateRows = `repeat(${d.h},1fr)`;
  const st = mode==='play' ? play.st : parseCells(L);
  const low = mode==='play' && lowTide(play.moves);
  const beam = castBeam(L, st, low);
  const flips = showSolution && mode==='build' && lastCheck && lastCheck.flips ? new Set(lastCheck.flips) : new Set();
  let html = '';
  for (let y=0;y<d.h;y++) for (let x=0;x<d.w;x++){
    const k = x+','+y, c = st[k], off = d.off.has(k);
    const cls = ['cell'];
    if (off) cls.push('off');
    if (c && c.t==='B'){ cls.push('boat'); if (beam.lit.has(k)) cls.push('lit'); if (beam.wrong.has(k)) cls.push('wrong'); }
    if (c && c.t==='C'){ cls.push('cave'); if (beam.caveLit.has(k)) cls.push('lit'); }
    if (c && c.t==='T'){ cls.push('reef'); if (low) cls.push('up'); }
    if (flips.has(k)) cls.push('solve');
    let inner = off ? '' : iconFor(k, st, mode==='play');
    if (mode==='build' && d.fog.has(k)) cls.push('afog');
    if (mode==='play' && play.fog.has(k) && !off){ cls.push('fog'); inner += '<div class="mist"></div>'; }
    const col = c && c.t==='B' && c.c ? `style="--bc:${COL[c.c]}"` : '';
    html += `<div class="${cls.join(' ')}" data-k="${k}" ${col}>${inner}</div>`;
  }
  g.innerHTML = html;
  $('beamLayer').setAttribute('viewBox', `0 0 ${d.w} ${d.h}`);
  $('beamLayer').innerHTML = beam.segs.map(({pts,col}) => { const s = pts.map(a => a.join(',')).join(' '); return `<polyline class="glow" stroke="${col}" points="${s}"/><polyline class="core" stroke="${col}" points="${s}"/>`; }).join('');
  $('coastLayer').setAttribute('viewBox', `0 0 ${d.w} ${d.h}`);
  $('coastLayer').innerHTML = shapeProblems().length ? '' : `<path class="shore" d="${coastPath(L, .02, 0)}"/>`;
  renderPlayInfo(beam, st);
}

function renderPlayInfo(beam, st){
  const el = $('playInfo');
  if (mode !== 'play'){ el.innerHTML = '<span>Zraka pokazuje kako igrač zatekne razinu.</span>'; return; }
  const won = boatsOf(st).length && boatsOf(st).every(k => beam.lit.has(k));
  const par = lastCheck && lastCheck.best !== Infinity ? lastCheck.best : '–';
  const tide = hasTide(toLevel()) ? ` · ${lowTide(play.moves) ? 'oseka' : 'plima'}` : '';
  el.innerHTML = `<span>Potezi: <b>${play.moves}</b> / cilj ${par}${tide}</span>` +
    (won && play.moves ? ' <b>Svi brodovi su u luci!</b>' : '') +
    ' <button class="btn" id="playReset">Ispočetka</button>';
  $('playReset').onclick = startPlay;
}

function startPlay(){
  const L = toLevel();
  play = { st:parseCells(L), moves:0, fog:new Set(d.fog) };
  revealFog();
  render();
}
function revealFog(){
  const r = castBeam(toLevel(), play.st, lowTide(play.moves));
  for (const k of r.touched) play.fog.delete(k);
}

function refresh(){ setStatus(); render(); renderLevels(); }
function changed(){ dirty = true; $('saveNote').textContent = ''; refresh(); }

// Dodir na polje u načinu slaganja
let paintOn = null, lastCell = null;
function inward(x, y){
  if (x===0) return [1,0];
  if (x===d.w-1) return [-1,0];
  if (y===0) return [0,1];
  if (y===d.h-1) return [0,-1];
  return [1,0];
}
const CW = { '1,0':[0,1], '0,1':[-1,0], '-1,0':[0,-1], '0,-1':[1,0] };
function applyTool(k, first){
  const [x, y] = k.split(',').map(Number), off = d.off.has(k);
  const isLamp = l => l && l.x===x && l.y===y;
  if (tool==='land'){
    if (first) paintOn = !off;
    if (isLamp(d.light) || isLamp(d.light2)) return false;
    if (paintOn){ d.off.add(k); delete d.cells[k]; d.fog.delete(k); } else d.off.delete(k);
    return true;
  }
  if (tool==='erase'){
    const had = d.cells[k] || d.fog.has(k) || isLamp(d.light2);
    delete d.cells[k]; d.fog.delete(k); if (isLamp(d.light2)) d.light2 = null;
    return !!had;
  }
  if (off) return false;
  if (tool==='fog'){
    if (first) paintOn = !d.fog.has(k);
    if (isLamp(d.light) || isLamp(d.light2) || (d.cells[k]||'')[0]==='B') return false;
    if (paintOn) d.fog.add(k); else d.fog.delete(k);
    return true;
  }
  if (tool==='light' || tool==='light2'){
    const own = tool==='light' ? d.light : d.light2, other = tool==='light' ? d.light2 : d.light;
    if (isLamp(other)) return false;
    if (isLamp(own)){ own.d = CW[own.d.join()]; return true; }
    delete d.cells[k]; d.fog.delete(k);
    d[tool] = { x, y, d:inward(x, y) };
    return true;
  }
  if (isLamp(d.light) || isLamp(d.light2)) return false;
  if (tool==='mirror'){
    d.cells[k] = d.cells[k]==='/' ? '\\' : '/';
    return true;
  }
  if (tool[0]==='B') d.fog.delete(k);
  if (tool==='#' && !first){ d.cells[k] = '#'; return true; }
  if (d.cells[k]===tool) delete d.cells[k]; else d.cells[k] = tool;
  return true;
}
function cellAt(e){
  const el = document.elementFromPoint(e.clientX, e.clientY);
  const c = el && el.closest('[data-k]');
  return c && $('grid').contains(c) ? c.dataset.k : null;
}
$('grid').addEventListener('pointerdown', e => {
  const k = cellAt(e);
  if (!k) return;
  e.preventDefault();
  if (mode==='play'){
    const c = play.st[k];
    if (c && c.t==='m' && !play.fog.has(k) && !d.off.has(k)){
      c.v = flipMirror(c.v); play.moves++; revealFog(); render();
    }
    return;
  }
  lastCell = k;
  if (applyTool(k, true)) changed();
});
addEventListener('pointermove', e => {
  if (!lastCell || mode!=='build' || !DRAG.has(tool)) return;
  const k = cellAt(e);
  if (k && k!==lastCell){ lastCell = k; if (applyTool(k, false)) changed(); }
});
addEventListener('pointerup', () => { lastCell = null; });

// Paleta i kontrole
function renderPalette(){
  $('palette').innerHTML = TOOLS.map(T => `<button class="tool" data-tool="${T.key}" aria-pressed="${T.key===tool}"><i>${T.icon()}</i>${T.label}</button>`).join('');
  $('palette').querySelectorAll('.tool').forEach(b => b.onclick = () => { tool = b.dataset.tool; renderPalette(); });
  $('toolHelp').textContent = TOOLS.find(T => T.key===tool).help;
}
for (const id of ['sizeW','sizeH']) $(id).innerHTML = [4,5,6,7,8,9,10].map(n => `<option value="${n}">${n}</option>`).join('');
function resize(w, h){
  d.w = w; d.h = h;
  const inside = k => { const [x,y] = k.split(',').map(Number); return x<w && y<h; };
  for (const k of Object.keys(d.cells)) if (!inside(k)) delete d.cells[k];
  for (const s of [d.off, d.fog]) for (const k of [...s]) if (!inside(k)) s.delete(k);
  const fit = l => { if (l.x>=w || l.y>=h){ l.x = Math.min(l.x, w-1); l.y = Math.min(l.y, h-1); d.off.delete(l.x+','+l.y); delete d.cells[l.x+','+l.y]; } };
  fit(d.light); if (d.light2) fit(d.light2);
  changed();
}
$('sizeW').onchange = () => resize(+$('sizeW').value, d.h);
$('sizeH').onchange = () => resize(d.w, +$('sizeH').value);
$('hintBox').oninput = () => { d.hint = $('hintBox').value; dirty = true; $('saveNote').textContent = ''; };
$('showSol').onclick = () => { showSolution = !showSolution; refresh(); };
function setMode(m){
  mode = m;
  $('modeBuild').setAttribute('aria-pressed', m==='build');
  $('modePlay').setAttribute('aria-pressed', m==='play');
  if (m==='play') startPlay(); else render();
}
$('modeBuild').onclick = () => setMode('build');
$('modePlay').onclick = () => setMode('play');

// Popis razina
function renderLevels(){
  const list = LEVELS[island] || [];
  $('levelTitle').textContent = index<0 ? `Nova razina (${d.id})` : `Razina ${index+1} (${d.id})`;
  $('delBtn').disabled = index<0;
  $('levels').innerHTML = list.length ? list.map((L,i) => `<div class="lv-row">
      <button class="lv" data-i="${i}" aria-current="${i===index}">${i+1}. razina <small>cilj ${L.par}</small></button>
      <button class="arrow" data-up="${i}" ${i===0?'disabled':''} aria-label="Pomakni gore">↑</button>
      <button class="arrow" data-down="${i}" ${i===list.length-1?'disabled':''} aria-label="Pomakni dolje">↓</button>
    </div>`).join('') : '<p class="note">Ovaj otok još nema razina. Složi prvu i spremi je.</p>';
  $('levels').querySelectorAll('.lv').forEach(b => b.onclick = () => { if (okToLeave()) openLevel(+b.dataset.i); });
  $('levels').querySelectorAll('[data-up]').forEach(b => b.onclick = () => moveLevel(+b.dataset.up, -1));
  $('levels').querySelectorAll('[data-down]').forEach(b => b.onclick = () => moveLevel(+b.dataset.down, 1));
}
const okToLeave = () => !dirty || confirm('Razina ima nespremljene promjene. Želiš ih odbaciti?');
function loadDraft(){
  dirty = false; showSolution = false;
  $('sizeW').value = d.w; $('sizeH').value = d.h; $('hintBox').value = d.hint;
  mode = 'build'; $('modeBuild').setAttribute('aria-pressed', true); $('modePlay').setAttribute('aria-pressed', false);
  refresh();
}
function openLevel(i){ index = i; d = fromLevel(LEVELS[island][i]); $('saveNote').textContent = ''; loadDraft(); }
function newLevel(){ index = -1; d = blankDraft(); $('saveNote').textContent = ''; loadDraft(); }
$('newBtn').onclick = () => { if (okToLeave()) newLevel(); };
function chooseIsland(id){
  island = id;
  if ((LEVELS[id]||[]).length) openLevel(0); else newLevel();
}
$('islandSel').onchange = () => {
  if (okToLeave()) chooseIsland($('islandSel').value); else $('islandSel').value = island;
};

// Tekst datoteke otoka, u istom obliku kao ostale datoteke u js/islands/
const q = s => "'" + s.replace(/\\/g,'\\\\').replace(/'/g,"\\'") + "'";
const lit = l => `{x:${l.x},y:${l.y},d:[${l.d}]}`;
const rowsTxt = a => `[${a.map(q).join(',\n           ')}]`;
function levelText(L){
  let t = `  { id:${q(L.id)}, w:${L.w}, h:${L.h}, par:${L.par}, light:${lit(L.light)},` + (L.light2 ? ` light2:${lit(L.light2)},` : '') + '\n';
  t += `    hint:${q(L.hint||'')},\n`;
  if (L.shape) t += `    shape:${rowsTxt(L.shape)},\n`;
  if (L.fog) t += `    fog:  ${rowsTxt(L.fog)},\n`;
  t += `    cells:{${Object.entries(L.cells).map(([k,v]) => q(k)+':'+q(v)).join(',')}} }`;
  return t;
}
function islandText(id, head){
  const list = LEVELS[id], I = ISLANDS.find(x => x.id===id);
  head = head || `// Otok ${I.name} – razine redom. ID razine se nikad ne mijenja (po njemu se pamti napredak).\n`;
  const last = list.lastId ? `LEVELS.${id}.lastId = ${list.lastId}; // najveći broj razine ikad korišten; ne koristiti ponovo\n` : '';
  return `${head}LEVELS.${id} = [\n${list.map(levelText).join(',\n')}\n];\n${last}`;
}

// Spremanje: u mapu projekta ako preglednik to dopušta (Chrome, Edge), inače preuzimanje datoteke
let projectDir = null;
const idb = fn => new Promise((res, rej) => {
  const open = indexedDB.open('pharos-urednik', 1);
  open.onupgradeneeded = () => open.result.createObjectStore('kv');
  open.onerror = () => rej(open.error);
  open.onsuccess = () => { const tx = open.result.transaction('kv','readwrite'), r = fn(tx.objectStore('kv')); tx.oncomplete = () => res(r.result); tx.onerror = () => rej(tx.error); };
});
async function getProjectDir(){
  if (!window.showDirectoryPicker) return null;
  if (!projectDir){ try { projectDir = await idb(s => s.get('dir')); } catch (e) {} }
  if (projectDir){
    const opts = { mode:'readwrite' };
    if (await projectDir.queryPermission(opts)==='granted' || await projectDir.requestPermission(opts)==='granted') return projectDir;
  }
  note('Odaberi mapu projekta „svjetionik” (onu u kojoj je index.html).');
  const dir = await window.showDirectoryPicker({ mode:'readwrite', id:'pharos' });
  try { await dir.getFileHandle('index.html'); await (await dir.getDirectoryHandle('js')).getDirectoryHandle('islands'); }
  catch (e) { throw new Error('U toj mapi nema igre. Odaberi mapu u kojoj je index.html.'); }
  projectDir = dir;
  try { await idb(s => s.put(dir, 'dir')); } catch (e) {}
  return dir;
}
const note = (t, cls='') => { $('saveNote').textContent = t; $('saveNote').className = 'note ' + cls; };
async function readText(h){ return (await h.getFile()).text(); }
async function writeText(h, t){ const w = await h.createWritable(); await w.write(t); await w.close(); }
function download(name, text){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type:'text/javascript' }));
  a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
// Zapiše datoteku otoka; novi otok dobije i svoj redak u index.html
async function writeIsland(id){
  const name = id + '.js';
  let dir = null;
  try { dir = await getProjectDir(); }
  catch (e){ if (e.name==='AbortError'){ note('Spremanje je prekinuto: mapa nije odabrana. Razina je spremljena samo u ovom prozoru.', 'err'); return false; } note(e.message, 'err'); return false; }
  if (!dir){
    download(name, islandText(id));
    note(`Preuzeta je datoteka ${name}. Ovaj preglednik ne može sam pisati u projekt: premjesti je u mapu js/islands (zamijeni staru) ili koristi Chrome ili Edge.`);
    return true;
  }
  const folder = await (await dir.getDirectoryHandle('js')).getDirectoryHandle('islands');
  let head = null, exists = true;
  try { const old = await readText(await folder.getFileHandle(name)); head = old.slice(0, old.indexOf('LEVELS.')); }
  catch (e){ exists = false; }
  await writeText(await folder.getFileHandle(name, { create:true }), islandText(id, head));
  if (!exists){
    const ih = await dir.getFileHandle('index.html'), html = await readText(ih), tag = `<script src="js/islands/${name}"></script>`;
    if (!html.includes(tag)) await writeText(ih, html.replace('<script src="js/engine.js"></script>', `${tag}\n<script src="js/engine.js"></script>`));
  }
  note('Spremljeno u projekt. Osvježi igru da vidiš promjenu.', 'ok');
  return true;
}

$('saveBtn').onclick = async () => {
  const r = evaluate();
  if (r.errors.length || r.best === Infinity) return;
  const L = JSON.parse(JSON.stringify(toLevel(r.best)));
  if (!LEVELS[island]) LEVELS[island] = [];
  if (index<0){ LEVELS[island].push(L); index = LEVELS[island].length-1; } else LEVELS[island][index] = L;
  if (await writeIsland(island)) dirty = false;
  renderLevels();
};
$('delBtn').onclick = async () => {
  const list = LEVELS[island];
  if (list.length===1){ note('Otok mora imati bar jednu razinu.', 'err'); return; }
  if (!confirm(`Izbrisati ${index+1}. razinu (${d.id})? Igračima nestaje i napredak na njoj.`)) return;
  const nums = list.map(L => +L.id.split('-').pop()).filter(n => !isNaN(n));
  list.lastId = Math.max(list.lastId||0, ...nums);   // ID izbrisane razine se više ne koristi
  list.splice(index, 1);
  await writeIsland(island);
  dirty = false; openLevel(Math.min(index, list.length-1));
};
async function moveLevel(i, by){
  if (!okToLeave()) return;
  const list = LEVELS[island], [L] = list.splice(i, 1);
  list.splice(i+by, 0, L);
  await writeIsland(island);
  dirty = false; openLevel(i+by);
}

// Učitaj postojeće razine svih otoka, pa kreni
Promise.all(ISLANDS.map(I => new Promise(res => {
  const s = document.createElement('script');
  s.src = `../js/islands/${I.id}.js`; s.onload = s.onerror = res;
  document.body.appendChild(s);
}))).then(() => {
  $('islandSel').innerHTML = ISLANDS.map(I => `<option value="${I.id}">${I.name}${LEVELS[I.id] ? '' : ' (novi)'}</option>`).join('');
  renderPalette();
  const params = new URLSearchParams(location.search);
  const start = ISLANDS.find(I => I.id===params.get('otok')) || ISLANDS.find(I => !LEVELS[I.id]) || ISLANDS[0];
  $('islandSel').value = start.id;
  chooseIsland(start.id);
});
addEventListener('beforeunload', e => { if (dirty) e.preventDefault(); });
