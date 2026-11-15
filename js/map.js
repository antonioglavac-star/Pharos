// Karta otoka u stilu stare pomorske karte: obrisi tankom linijom, linije dubine, iscrtkano kopno.
let sel = null;

// Obrisi obale i otoka su u js/chart.js (prema OpenStreetMapu)

function islandStatus(i){
  const I = ISLANDS[i];
  if (!LEVELS[I.id]) return 'soon';
  if (islandDone(I.id)) return 'done';
  return islandOpen(i) ? 'open' : 'locked';
}
const STATUS_LABEL = { soon:'uskoro', done:'osvijetljen', open:'otvoren', locked:'zaključan' };

// lit: otok koji je igrač upravo osvijetlio. Tada karta priredi proslavu: svjetionik bljesne,
// magla se polako digne sa sljedećeg otoka i kartica ga ponudi.
function showMap(lit){
  ['game','isle','start','lights'].forEach(s => $(s).hidden = true); $('map').hidden = false;
  const spot = nextSpot();
  if (lit || !sel) sel = spot ? spot.id : lit || ISLANDS.filter(I => LEVELS[I.id]).pop().id;
  let old = null;
  if (lit && !calm()){
    // Magla kakva je bila prije: bez otoka koji se upravo otvorio
    drawFog(ISLANDS.filter((I,i) => ['open','done'].includes(islandStatus(i)) && !(spot && I.id===spot.id)).map(I => I.id));
    old = $('fogMap').cloneNode();
    old.removeAttribute('id'); old.className = 'fog-old';
    old.getContext('2d').drawImage($('fogMap'), 0, 0);
  }
  renderMap();
  if (lit){
    Feel.lit();
    const g = $('chart').querySelector(`.isle[data-id="${lit}"]`);
    if (g) g.classList.add('just-lit');
  }
  if (old){
    old.style.cssText = $('fogMap').style.cssText;   // isti pogled (zum) kao nova magla
    $('fogMap').after(old);
    old.onanimationend = () => old.remove();
  }
  window.scrollTo(0, 0);
}

// Dio karte koji se prikazuje: okvir oko otkrivenih otoka s rubom, u omjeru cijele karte, najmanje pola širine
function mapView(ids){
  const W = CHART.w, H = CHART.h, PAD = 52;
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (const id of ids){
    const [cx, cy, r, hh] = CHART.c[id], ry = hh || r;
    x0 = Math.min(x0, cx-r); x1 = Math.max(x1, cx+r); y0 = Math.min(y0, cy-ry); y1 = Math.max(y1, cy+ry+14);
  }
  const w = Math.min(W, Math.max(W*.5, x1-x0 + 2*PAD, (y1-y0 + 2*PAD) * W/H)), h = w * H/W;
  const x = Math.min(W-w, Math.max(0, (x0+x1)/2 - w/2)), y = Math.min(H-h, Math.max(0, (y0+y1)/2 - h/2));
  return { x, y, w, h };
}

function renderMap(){
  const W = CHART.w, H = CHART.h, lines = [];
  for (let x=55; x<W; x+=110) lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`);
  for (let y=65; y<H; y+=110) lines.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`);
  // Polje za dodir je sam obris otoka s rubom od par piksela; sitni otoci (Palagruža, Svetac, Biševo)
  // dobiju i mali krug. Veliki otoci se crtaju prvi, a mali iznad njih, da im nitko ne "ukrade" dodir.
  const order = ISLANDS.map((I,i) => i).sort((a, b) => CHART.c[ISLANDS[b].id][2] - CHART.c[ISLANDS[a].id][2]);
  // Magla rata: otok pod maglom nema ime ni polje za dodir
  const shown = i => ['open','done'].includes(islandStatus(i));
  const isles = order.map(i => {
    const I = ISLANDS[i], st = islandStatus(i), [cx, cy, r, hh] = CHART.c[I.id];
    if (!shown(i)) return `<path class="ghost" d="${CHART.isles[I.id]}"/>`;
    return `<g class="isle ${st} ${I.id===sel?'sel':''}" data-id="${I.id}" tabindex="0" role="button" aria-label="${I.name}, ${STATUS_LABEL[st]}">
      <path class="hit" d="${CHART.isles[I.id]}"/>
      ${r < 12 ? `<circle class="hit" cx="${cx}" cy="${cy}" r="13"/>` : ''}
      <path class="contour" d="${CHART.contours[I.id]}"/>
      <path class="land" d="${CHART.isles[I.id]}"/>
      <circle class="burst" cx="${cx}" cy="${cy}" r="6"/>
      <circle class="lamp" cx="${cx}" cy="${cy}" r="2.5"/>
      <text x="${cx}" y="${hh ? cy+hh+13 : cy+13}">${I.name}</text>
    </g>`;
  }).join('');
  // Karta se približi otkrivenim otocima (i malo magle oko njih), pa su otoci i imena veći.
  // Kako se otoci otkrivaju, pogled se širi. Oblaci prate isti pogled.
  const v = mapView(ISLANDS.filter((I,i) => shown(i)).map(I => I.id)), cv = $('fogMap');
  $('chart').setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`);
  $('chart').style.setProperty('--tz', Math.max(.62, Math.sqrt(v.w / W)));
  cv.style.width = W/v.w*100 + '%'; cv.style.height = H/v.h*100 + '%';
  cv.style.left = -v.x/v.w*100 + '%'; cv.style.top = -v.y/v.h*100 + '%';
  $('chart').innerHTML = `
    <defs><pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="5"/></pattern></defs>
    <g class="grat">${lines.join('')}</g>
    <path class="coast" d="${CHART.land}"/>
    ${isles}`;
  // Iznad oblaka ostaju ruža vjetrova i navođenje izvora karte
  $('chartTop').setAttribute('viewBox', `0 0 ${W} ${H}`);
  $('chartTop').innerHTML = `
    <g class="rose" transform="translate(${W-45} ${H-55})">
      <path d="M0-22L4-4L22 0L4 4L0 22L-4 4L-22 0L-4-4Z"/><text y="-27">S</text></g>
    <rect class="osm-bg" x="3" y="${H-17}" width="78" height="14" rx="4"/>
    <text class="osm" x="8" y="${H-7}">© OpenStreetMap</text>`;
  drawFog(ISLANDS.filter((I,i) => shown(i)).map(I => I.id));
  // Dodir na otvoren ili osvijetljen otok otvara kartu otoka
  const pick = id => { sel = id; showIsle(id); };
  $('chart').querySelectorAll('.isle').forEach(g => {
    g.onclick = () => pick(g.dataset.id);
    g.onkeydown = e => { if (e.key==='Enter'||e.key===' '){ e.preventDefault(); pick(g.dataset.id); } };
  });
  const ids = Object.keys(LIGHTHOUSES), got = ids.filter(id => islandDone(id));
  const first = got[0] || ids[0];
  $('mapLights').innerHTML = `<svg viewBox="40 0 80 120" class="${got.length ? '' : 'dim'}" aria-hidden="true">${LIGHTHOUSES[first].svg}</svg>
    <span><span class="eyebrow">Kolekcija</span><b>Svjetionici</b><small>Skupljeno ${got.length} od ${ids.length}</small></span>
    <svg class="go" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  $('mapLights').onclick = () => showLights('map');
  const lit = ISLANDS.filter(I => islandDone(I.id)).length;
  // Broje se samo otoci koji već imaju razine; oni pod maglom ostaju tajna
  $('litCount').textContent = `${lit}/${ISLANDS.filter(I => LEVELS[I.id]).length}`;
  renderCard();
  renderEnd();
}

// Kraj sadržaja: kad su svi otoci osvijetljeni, igrač dobije završnu karticu umjesto slijepe ulice
function renderEnd(){
  const el = $('endCard');
  el.hidden = !!nextSpot();
  if (el.hidden) return;
  const all = ISLANDS.flatMap(I => LEVELS[I.id] || []), stars = all.reduce((s, L) => s + (progress[L.id] || 0), 0);
  const weak = ISLANDS.find(I => (LEVELS[I.id] || []).some(L => progress[L.id] < 3));
  el.innerHTML = `<div class="eyebrow">Jadran svijetli</div><h2>Svi otoci su osvijetljeni</h2>
    <p>Novi otoci izronit će iz magle s idućom nadogradnjom igre. ${weak
      ? `Dotad skupi sve zvjezdice: imaš ih ${stars} od ${all.length*3}.`
      : `Imaš i sve zvjezdice: ${stars} od ${all.length*3}. Svaka čast!`}</p>
    <div class="ctrl-btns">${weak ? '<button class="btn primary" id="endStars">Skupi zvjezdice</button>' : ''}
      <button class="btn ${weak ? '' : 'primary'}" id="endShare">Podijeli igru</button></div>`;
  if (weak) $('endStars').onclick = () => showIsle(weak.id);
  $('endShare').onclick = async () => {
    const url = location.origin + location.pathname.replace(/index\.html$/, '');
    try {
      if (navigator.share) await navigator.share({ title:'Pharos', text:'Upali svjetla Jadrana, otok po otok.', url });
      else { await navigator.clipboard.writeText(url); $('endShare').textContent = 'Link je kopiran'; }
    } catch (e) {}
  };
}

// Magla rata: oblak dima nad svakim skrivenim otokom; more, kopno i otkriveni otoci ostaju vidljivi. Dim je šum
// izračunat za svaku točku (uvijek isti, pa ne skače), a rub je mekan i neravan. Crta se samo kad se otkrije novi otok.
let fogKey = null, fogCloud = null;
const FOG_W = 308, FOG_H = Math.round(FOG_W * CHART.h / CHART.w);

// Glatki šum: nasumična mreža, uzorkovana na više razmjera
const fogTable = (() => { let s = 7; return Float32Array.from({ length: 65536 }, () => (s = (s*16807) % 2147483647) / 2147483647); })();
function fogNoise(x, y){
  const xi = Math.floor(x), yi = Math.floor(y), xf = x-xi, yf = y-yi;
  const u = xf*xf*(3-2*xf), v = yf*yf*(3-2*yf), at = (a, b) => fogTable[((a & 255) << 8) | (b & 255)];
  const top = at(xi, yi)*(1-u) + at(xi+1, yi)*u, low = at(xi, yi+1)*(1-u) + at(xi+1, yi+1)*u;
  return top*(1-v) + low*v;
}
function fogFbm(x, y){
  let sum = 0, amp = .5;
  for (let o = 0; o < 5; o++){ sum += amp*fogNoise(x, y); x = x*2 + 13.7; y = y*2 + 7.3; amp /= 2; }
  return sum / .97;
}

function drawFog(ids){
  const key = ids.join(), cv = $('fogMap');
  if (key === fogKey) return;
  fogKey = key;
  cv.width = FOG_W; cv.height = FOG_H;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(FOG_W, FOG_H), k = CHART.w / FOG_W;

  // Dim: svijetli i tamni pramenovi; šum je iskrivljen samim sobom, pa izgleda kao kovitlac dima
  if (!fogCloud){
    // Dim je mekan, pa se računa na svakoj drugoj točki, a između se izgladi: prvo crtanje je zato brzo i na mobitelu
    const CW = (FOG_W>>1) + 2, CH = (FOG_H>>1) + 2, coarse = new Float32Array(CW*CH*2);
    for (let y = 0, p = 0; y < CH; y++) for (let x = 0; x < CW; x++, p += 2){
      const u = x*2*k/110, v = y*2*k/110;
      const n = fogFbm(u + .7*fogFbm(u + 1.7, v + 9.2), v + .7*fogFbm(u + 8.3, v + 2.8));
      const t = Math.min(1, Math.max(0, (n-.3)/.42));
      coarse[p] = 104 + 108*t*t*(3-2*t);
      coarse[p+1] = 255*fogFbm(x*2*k/24 + 50, y*2*k/24 + 50);
    }
    fogCloud = new Uint8Array(FOG_W*FOG_H*2);
    for (let y = 0, p = 0; y < FOG_H; y++) for (let x = 0; x < FOG_W; x++, p += 2){
      const cx = x>>1, cy = y>>1, fx = (x&1)/2, fy = (y&1)/2;
      for (let c = 0; c < 2; c++){
        const at = (a, b) => coarse[(b*CW + a)*2 + c];
        fogCloud[p+c] = (at(cx, cy)*(1-fx) + at(cx+1, cy)*fx)*(1-fy) + (at(cx, cy+1)*(1-fx) + at(cx+1, cy+1)*fx)*fy;
      }
    }
  }

  // Udaljenost svake točke platna od najbližeg skrivenog (near) i otkrivenog (clear) otoka, u jedinicama karte.
  // Računa se samo blizu otoka, pa je brzo i kad je otoka puno.
  const REACH = 44, box = Math.ceil(REACH/k);
  const near = new Float32Array(FOG_W*FOG_H).fill(Infinity), clear = new Float32Array(FOG_W*FOG_H).fill(Infinity);
  const stamp = (field, px, py) => {
    const cx = Math.round(px/k), cy = Math.round(py/k);
    for (let y = Math.max(0, cy-box); y <= Math.min(FOG_H-1, cy+box); y++)
      for (let x = Math.max(0, cx-box); x <= Math.min(FOG_W-1, cx+box); x++){
        const dx = x*k-px, dy = y*k-py, d = dx*dx + dy*dy, i = y*FOG_W + x;   // kvadrat udaljenosti; korijen na kraju
        if (d < field[i]) field[i] = d;
      }
  };
  const coast = (id, field, count) => {
    const n = CHART.isles[id].match(/-?\d+\.?\d*/g).map(Number), step = Math.max(1, Math.floor(n.length/2/count));
    for (let i = 0; i < n.length-1; i += 2*step) stamp(field, n[i], n[i+1]);
  };
  for (const I of ISLANDS){
    if (ids.includes(I.id)){
      coast(I.id, clear, 30);
      const [cx, cy, , hh] = CHART.c[I.id];
      stamp(clear, cx, cy); stamp(clear, cx, hh ? cy+hh+10 : cy+10);   // i mjesto za ime
    } else coast(I.id, near, 40);
  }
  // Unutrašnjost skrivenih otoka: i velikom otoku mora biti pokrivena sredina
  const mask = document.createElement('canvas'); mask.width = FOG_W; mask.height = FOG_H;
  const mc = mask.getContext('2d'); mc.scale(1/k, 1/k);
  for (const I of ISLANDS) if (!ids.includes(I.id)) mc.fill(new Path2D(CHART.isles[I.id]));
  const inside = mc.getImageData(0, 0, FOG_W, FOG_H).data;
  for (let i = 0; i < near.length; i++){
    near[i] = inside[i*4+3] > 0 ? 0 : Math.sqrt(near[i]);
    clear[i] = Math.sqrt(clear[i]);
  }

  const ease = t => { t = Math.min(1, Math.max(0, t)); return t*t*(3-2*t); };
  for (let i = 0, p = 0, c = 0; i < near.length; i++, p += 4, c += 2){
    const wisp = (fogCloud[c+1]/255 - .5)*30;
    // Oblak se širi oko skrivenog otoka i neravno izblijedi; otkriveni otok i njegovo ime ostaju čisti,
    // ali sam skriveni otok (core) uvijek ostaje pokriven, pa mu se ne vidi obris
    const cloud = ease((32 - near[i] - wisp) / 20), free = ease((clear[i] + wisp*.3 - 6) / 12), core = ease((12 - near[i]) / 5);
    const g = fogCloud[c];
    img.data[p] = g-4; img.data[p+1] = g; img.data[p+2] = g+6;
    img.data[p+3] = 255 * Math.max(core, Math.min(cloud, free));
  }
  ctx.putImageData(img, 0, 0);
}

function renderCard(){
  const i = ISLANDS.findIndex(I => I.id===sel), I = ISLANDS[i], st = islandStatus(i);
  const lv = LEVELS[I.id] || [], solved = lv.filter(L => progress[L.id]).length;
  // Otok koji je tek izašao iz magle
  const fresh = st==='open' && !solved && i > 0;
  const text = st==='done' ? (I.fact ? `<div class="fact"><b>Zanimljivost</b>${I.fact}</div>` : '<p>Otok je osvijetljen.</p>')
    : fresh ? '<p>Magla se podigla i otkrila novi otok. Osvijetli ga i otkrij njegovu priču.</p>'
    : '<p>Osvijetli sve razine i otkrij priču otoka.</p>';
  const btn = st==='open' ? (solved ? 'Nastavi' : fresh ? `Otplovi na otok ${I.name}` : 'Igraj') : 'Otvori otok';
  $('card').innerHTML = `<div class="eyebrow">${fresh ? 'Novi otok · ' : ''}${solved} / ${lv.length} razina</div><h2>${I.name}</h2>${text}
    <button class="btn primary" id="cardBtn">${btn}</button>`;
  $('cardBtn').onclick = () => showIsle(I.id);
}
