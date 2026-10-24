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

function showMap(){
  $('game').hidden = true; $('isle').hidden = true; $('start').hidden = true; $('map').hidden = false;
  if (!sel){
    const i = ISLANDS.findIndex((I,i) => islandStatus(i)==='open');
    sel = ISLANDS[i<0 ? 0 : i].id;
  }
  renderMap();
}

function renderMap(){
  const W = CHART.w, H = CHART.h, lines = [];
  for (let x=55; x<W; x+=110) lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`);
  for (let y=65; y<H; y+=110) lines.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`);
  // Polje za dodir je sam obris otoka s rubom od par piksela; sitni otoci (Palagruža, Svetac, Biševo)
  // dobiju i mali krug. Veliki otoci se crtaju prvi, a mali iznad njih, da im nitko ne "ukrade" dodir.
  const order = ISLANDS.map((I,i) => i).sort((a, b) => CHART.c[ISLANDS[b].id][2] - CHART.c[ISLANDS[a].id][2]);
  const isles = order.map(i => {
    const I = ISLANDS[i], st = islandStatus(i), [cx, cy, r, hh] = CHART.c[I.id];
    return `<g class="isle ${st} ${I.id===sel?'sel':''}" data-id="${I.id}" tabindex="0" role="button" aria-label="${I.name}, ${STATUS_LABEL[st]}">
      <path class="hit" d="${CHART.isles[I.id]}"/>
      ${r < 12 ? `<circle class="hit" cx="${cx}" cy="${cy}" r="13"/>` : ''}
      <path class="contour" d="${CHART.contours[I.id]}"/>
      <path class="land" d="${CHART.isles[I.id]}"/>
      ${st==='open'||st==='done' ? `<circle class="lamp" cx="${cx}" cy="${cy}" r="2.5"/>` : ''}
      <text x="${cx}" y="${hh ? cy+hh+13 : cy+13}">${I.name}</text>
    </g>`;
  }).join('');
  $('chart').setAttribute('viewBox', `0 0 ${W} ${H}`);
  $('chart').innerHTML = `
    <defs><pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="5"/></pattern></defs>
    <g class="grat">${lines.join('')}</g>
    <path class="coast" d="${CHART.land}"/>
    <g class="rose" transform="translate(${W-45} ${H-55})">
      <path d="M0-22L4-4L22 0L4 4L0 22L-4 4L-22 0L-4-4Z"/><text y="-27">S</text></g>
    <text class="osm" x="6" y="${H-6}">© OpenStreetMap</text>
    ${isles}`;
  // Dodir na otvoren ili osvijetljen otok otvara kartu otoka; ostali otoci samo pokažu karticu
  const pick = id => {
    sel = id;
    const st = islandStatus(ISLANDS.findIndex(I => I.id===id));
    if (st==='open' || st==='done') showIsle(id); else renderMap();
  };
  $('chart').querySelectorAll('.isle').forEach(g => {
    g.onclick = () => pick(g.dataset.id);
    g.onkeydown = e => { if (e.key==='Enter'||e.key===' '){ e.preventDefault(); pick(g.dataset.id); } };
  });
  const lit = ISLANDS.filter(I => islandDone(I.id)).length;
  $('litCount').textContent = `${lit}/${ISLANDS.length}`;
  renderCard();
}

function renderCard(){
  const i = ISLANDS.findIndex(I => I.id===sel), I = ISLANDS[i], st = islandStatus(i);
  const lv = LEVELS[I.id] || [], solved = lv.filter(L => progress[L.id]).length;
  const eyebrow = st==='soon' ? 'Uskoro' : `${solved} / ${lv.length} razina`;
  const text = st==='done' ? (I.fact ? `<div class="fact"><b>Zanimljivost</b>${I.fact}</div>` : '<p>Otok je osvijetljen.</p>')
    : st==='open' ? '<p>Osvijetli sve razine i otkrij priču otoka.</p>'
    : st==='locked' ? '<p>Najprije osvijetli prethodni otok.</p>'
    : '<p>Svjetionik na ovom otoku još čeka čuvara. Novi otoci stižu uskoro.</p>';
  const btn = st==='open' ? (solved ? 'Nastavi' : 'Igraj') : st==='done' ? 'Otvori otok' : '';
  $('card').innerHTML = `<div class="eyebrow">${eyebrow}</div><h2>${I.name}</h2>${text}
    ${btn ? `<button class="btn primary" id="cardBtn">${btn}</button>` : ''}`;
  if (btn) $('cardBtn').onclick = () => showIsle(I.id);
}
