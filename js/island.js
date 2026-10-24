// Ekran otoka: obris otoka preko cijele širine i staza razina uz obalu.
// Razine su jednako razmaknute oko otoka, počevši od najzapadnije točke; dodir na otvorenu razinu je pokreće.
let isleId = null;

function showIsle(id){
  isleId = id;
  const I = ISLANDS.find(x => x.id===id), lv = LEVELS[id];
  ['start','map','game','lights'].forEach(s => $(s).hidden = true);
  $('isle').hidden = false;
  $('isleName').textContent = I.name;
  const solved = lv.filter(L => progress[L.id]).length;
  const stars = lv.reduce((s, L) => s + (progress[L.id] || 0), 0);
  $('isleCount').textContent = `${solved}/${lv.length}`;
  $('isleStars').textContent = `${stars}/${lv.length*3}`;
  const next = lv.findIndex(L => !progress[L.id]);
  $('islePlay').textContent = next < 0 ? 'Igraj ponovno od 1. razine' : `Igraj ${next+1}. razinu`;
  $('islePlay').onclick = () => openIsland(id, next < 0 ? 0 : next);
  // Zanimljivost: otkrivena kad je otok osvijetljen, inače najava nagrade
  const lit = islandDone(id);
  $('isleFact').classList.toggle('locked', !lit);
  $('isleFact').hidden = lit && !I.fact;
  $('isleFact').innerHTML = lit ? `<b>Zanimljivost</b>${I.fact}`
    : `<b>Zanimljivost otoka</b>Osvijetli svih ${lv.length} razina i otkrij priču o otoku ${I.name}.`;
  renderMechs(id);
  renderNextIsle(id);
  drawIsle(id, lv);
  window.scrollTo(0, 0);
}

// Predmeti koji se pojavljuju na otoku (popis TIPS je u game.js). Predmet koji igrač još nije sreo
// ostaje zaključan (silueta i lokot) dok ne dođe do razine u kojoj se prvi put pojavljuje.
// "Novo" znači da ga nije bilo ni na jednom ranijem otoku.
const LOCK = '<svg class="lock" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
function renderMechs(id){
  const i = ISLANDS.findIndex(I => I.id===id), lv = LEVELS[id];
  const before = ISLANDS.slice(0, i).flatMap(I => LEVELS[I.id] || []);
  $('isleMechs').innerHTML = TIPS.filter(M => lv.some(M.has)).map(M => {
    const first = lv.findIndex(M.has), reached = first === 0 || !!progress[lv[first-1].id];
    return reached
      ? `<span class="mech"><i>${M.icon()}</i>${M.name}${before.some(M.has) ? '' : '<b>Novo</b>'}</span>`
      : `<span class="mech locked" aria-label="Zaključano do ${first+1}. razine"><i>${M.icon()}${LOCK}</i>${first+1}. razina</span>`;
  }).join('');
}

// Sljedeći otok: obris, ime i kada se otvara; dodir ulazi u njega ako je otvoren
function renderNextIsle(id){
  const i = ISLANDS.findIndex(I => I.id===id), N = ISLANDS[i+1], el = $('isleNext');
  el.hidden = !N;
  if (!N) return;
  const st = islandStatus(i+1), nums = CHART.detail[N.id].match(/-?\d+\.?\d*/g).map(Number);
  const xs = nums.filter((_, k) => k%2 === 0), ys = nums.filter((_, k) => k%2), x0 = Math.min(...xs), y0 = Math.min(...ys);
  const w = Math.max(...xs) - x0, h = Math.max(...ys) - y0, p = Math.max(w, h) * .12;
  const sub = st==='soon' ? 'Uskoro stiže u igru'
    : st==='locked' ? `Otvara se kad osvijetliš otok ${ISLANDS[i].name}`
    : st==='done' ? 'Osvijetljen' : 'Otvoren';
  el.disabled = !(st==='open' || st==='done');
  el.innerHTML = `<svg viewBox="${x0-p} ${y0-p} ${w+2*p} ${h+2*p}" aria-hidden="true"><path d="${CHART.detail[N.id]}" style="stroke-width:${Math.max(w, h)/40}"/></svg>
    <span><span class="eyebrow">Sljedeći otok</span><b>${N.name}</b><small>${sub}</small></span>
    ${el.disabled ? '' : '<svg class="go" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'}`;
  el.onclick = () => showIsle(N.id);
}

function drawIsle(id, lv){
  const svg = $('isleSvg'), wrap = $('isleWrap');
  svg.innerHTML = `<path class="isle-shallow" d="${CHART.detail[id]}"/><path class="isle-land" id="isleLand" d="${CHART.detail[id]}"/><g id="isleRoute"></g>`;
  const land = $('isleLand'), b = land.getBBox(), W = wrap.clientWidth || 340;

  // Razine idu po glatkoj liniji oko otoka (konveksna ovojnica obale, odmaknuta prema moru),
  // da se ne zgužvaju u uvalama. Kreće se od najzapadnije točke.
  const Lt = land.getTotalLength(), n = lv.length, raw = [];
  for (let i = 0; i < 360; i++){ const p = land.getPointAtLength(Lt*i/360); raw.push([p.x, p.y]); }
  raw.sort((a, c) => a[0] - c[0] || a[1] - c[1]);
  const cross = (o, a, c) => (a[0]-o[0])*(c[1]-o[1]) - (a[1]-o[1])*(c[0]-o[0]);
  const lo = [], hi = [];
  for (const p of raw){ while (lo.length > 1 && cross(lo[lo.length-2], lo[lo.length-1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of raw.slice().reverse()){ while (hi.length > 1 && cross(hi[hi.length-2], hi[hi.length-1], p) <= 0) hi.pop(); hi.push(p); }
  const hull = lo.slice(0, -1).concat(hi.slice(0, -1));
  const hullPer = hull.reduce((s, p, i) => { const q = hull[(i+1) % hull.length]; return s + Math.hypot(q[0]-p[0], q[1]-p[1]); }, 0);

  // Okvir i odmak staze od obale (u pikselima ekrana). Oznaka je široka 36 px, pa im treba bar 44 px razmaka:
  // ako oko otoka nema dovoljno mjesta (dugi uski otok, puno razina), staza se odmiče dalje od obale.
  let s = 1, offPx = 27;
  // Okvir je širok W, a visok najviše 1,1 W (visoki otoci poput Biševa); otok mora stati s rubom za oznake
  const frame = () => {
    const m = 2*(offPx + 26);
    s = Math.max(Math.min((W - m) / b.width, (W*1.1 - m) / b.height), .05);
    const hPx = Math.min(Math.max(b.height*s + m, W*.55), W*1.1);
    return [W / s, hPx / s];
  };
  for (let k = 0; k < 4; k++){ frame(); offPx = Math.max(27, (44*n - hullPer*s) / (2*Math.PI)); }
  const [vw, vh] = frame(), unit = 1 / s;
  const vx = b.x + b.width/2 - vw/2, vy = b.y + b.height/2 - vh/2;
  svg.setAttribute('viewBox', `${vx} ${vy} ${vw} ${vh}`);
  wrap.style.aspectRatio = `${vw} / ${vh}`;
  document.querySelector('.isle-shallow').style.strokeWidth = 18 * unit;
  land.style.strokeWidth = 1.4 * unit;

  // Ovojnicu pomakni okomito prema moru (na vrhovima zaobljeno), pa je rasporedi po duljini
  const off = offPx * unit, m = hull.length;
  const area = hull.reduce((a, p, i) => { const q = hull[(i+1) % m]; return a + p[0]*q[1] - q[0]*p[1]; }, 0), sg = area > 0 ? 1 : -1;
  const nrm = i => { const p = hull[i], q = hull[(i+1) % m], dx = q[0]-p[0], dy = q[1]-p[1], l = Math.hypot(dx, dy) || 1; return [sg*dy/l, -sg*dx/l]; };
  const ring = [];
  for (let i = 0; i < m; i++){
    const [x, y] = hull[i], a1 = Math.atan2(...nrm((i-1+m) % m).slice().reverse()), a2 = Math.atan2(...nrm(i).slice().reverse());
    let da = a2 - a1; while (da > Math.PI) da -= 2*Math.PI; while (da < -Math.PI) da += 2*Math.PI;
    const steps = Math.max(1, Math.ceil(Math.abs(da) / .2));
    for (let k = 0; k <= steps; k++){ const a = a1 + da*k/steps; ring.push([x + Math.cos(a)*off, y + Math.sin(a)*off]); }
  }
  const segs = ring.map((p, i) => { const q = ring[(i+1) % ring.length]; return Math.hypot(q[0]-p[0], q[1]-p[1]); });
  const per = segs.reduce((s, x) => s + x, 0), pts = [];
  for (let i = 0; i < n; i++){
    let t = (i + .5) * per / n, k = 0;
    while (t > segs[k]){ t -= segs[k]; k++; }
    const p = ring[k], q = ring[(k+1) % ring.length], f = t / segs[k];
    pts.push([p[0] + (q[0]-p[0])*f, p[1] + (q[1]-p[1])*f]);
  }

  // Staza između razina: riješeni dio svijetli
  const solvedUpTo = lv.findIndex(L => !progress[L.id]), lastDone = solvedUpTo < 0 ? n - 1 : solvedUpTo;
  const seg = (a, b2) => pts.slice(a, b2 + 1).map(p => p.join(',')).join(' ');
  $('isleRoute').innerHTML =
    `<polyline class="route" points="${seg(0, n-1)}" style="stroke-width:${1.5*unit};stroke-dasharray:${3*unit} ${4*unit}"/>` +
    (lastDone > 0 ? `<polyline class="route lit" points="${seg(0, lastDone)}" style="stroke-width:${2.5*unit}"/>` : '');

  // Oznake razina kao gumbi preko karte
  $('isleMarks').innerHTML = pts.map(([x, y], i) => {
    const L = lv[i], s = progress[L.id] || 0, open = i === 0 || progress[lv[i-1].id];
    const cls = s ? 'done' : open ? 'cur' : 'locked';
    const label = `Razina ${i+1}` + (s ? `, riješena, ${s} od 3 zvjezdice` : open ? ', otvorena' : ', zaključana');
    return `<button class="mk ${cls}" style="left:${(x-vx)/vw*100}%;top:${(y-vy)/vh*100}%" data-i="${i}" ${open||s ? '' : 'disabled'} aria-label="${label}">${i+1}${s ? `<small>${'★'.repeat(s)}</small>` : ''}</button>`;
  }).join('');
  $('isleMarks').querySelectorAll('.mk').forEach(m => m.onclick = () => openIsland(id, +m.dataset.i));
}

$('isleBack').onclick = () => showMap();
let isleResize;
addEventListener('resize', () => { clearTimeout(isleResize); isleResize = setTimeout(() => { if (!$('isle').hidden) drawIsle(isleId, LEVELS[isleId]); }, 150); });
