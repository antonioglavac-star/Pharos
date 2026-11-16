// Početni izbornik. Pri pokretanju se svjetionik upali, zraka obiđe nebo i stane na natpisu.
// Dodir za vrijeme animacije je preskače. Bez animacije ako igrač ima uključeno smanjeno kretanje.
function showStart(intro){
  intro = intro && matchMedia('(prefers-reduced-motion: no-preference)').matches;
  ['map','game','isle','lights'].forEach(s => $(s).hidden = true); $('start').hidden = false;
  $('start').classList.toggle('intro', !!intro);
  const started = Object.keys(progress).length > 0;
  $('play').textContent = started ? 'Nastavi' : 'Igraj';
  $('mapBtn').hidden = !started;
  // Dnevna razina se nudi kad je osvijetljen prvi otok; kvačica znači da je današnja riješena
  $('dailyBtn').hidden = !dailyOpen();
  $('dailyBtn').innerHTML = dailyDone() ? 'Dnevna razina <span class="tick">✓</span>' : 'Dnevna razina <span class="dot-new"></span>';
  const lit = ISLANDS.filter(I => islandDone(I.id)).length, spot = nextSpot();
  // Otok koji je tek izašao iz magle (npr. stigao je s nadogradnjom) najavi se već u izborniku
  const fresh = spot && spot.i===0 && spot.id!==ISLANDS[0].id && !LEVELS[spot.id].some(L => progress[L.id]);
  $('startProgress').textContent = !started ? ''
    : fresh ? `Čeka te novi otok: ${ISLANDS.find(I => I.id===spot.id).name}`
    : `Osvijetljeno otoka: ${lit} / ${ISLANDS.filter(I => LEVELS[I.id]).length}`;
  if (intro) setTimeout(() => $('start').classList.remove('intro'), 2900);
}

// Prvi dodir za vrijeme animacije samo je preskače, da igrač slučajno ne pritisne gumb
$('start').addEventListener('click', e => {
  if (!$('start').classList.contains('intro')) return;
  e.stopPropagation(); e.preventDefault();
  $('start').classList.remove('intro');
}, true);

// Sličice u pravilima su iste kao u igri
const ruleIcons = {
  'r-mirror': '<div class="mirror" style="transform:rotate(-45deg)"></div>',
  'r-boat': ICONS.boat(), 'r-prism': ICONS.prism(), 'r-filter': ICONS.filter('r'),
  'r-cave': ICONS.cave(), 'r-fog': '<span class="fog-chip"></span>',
  'r-reef': ICONS.reef(), 'r-two': ICONS.light([0,-1]), 'r-more': '?',
  'r-undo': '<svg class="bulb" viewBox="0 0 24 24"><path d="M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"/></svg>', 'r-help': '<svg class="bulb" viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></svg>', 'r-star': '★'
};
for (const [c, html] of Object.entries(ruleIcons)) document.querySelector('.rules .' + c).innerHTML = html;

// "Igraj" i "Nastavi" vode ravno u razinu na kojoj je igrač stao; karta se otvara kad je sve riješeno
$('play').onclick = () => { const s = nextSpot(); s ? openIsland(s.id, s.i) : showMap(); };
$('mapBtn').onclick = () => showMap();
// Pravila pokazuju samo predmete koje je igrač već sreo; ostali ostaju iznenađenje
const RULE_TIP = { 'r-prism':'prism', 'r-filter':'filter', 'r-cave':'cave', 'r-fog':'fog', 'r-reef':'tide', 'r-two':'two' };
$('howBtn').onclick = () => {
  let hidden = 0;
  for (const [c, key] of Object.entries(RULE_TIP)){
    const li = document.querySelector('.rules .' + c).closest('li');
    li.hidden = !tipsSeen.includes(key);
    if (li.hidden) hidden++;
  }
  $('rulesMore').hidden = !hidden;
  $('how').showModal();
};
$('lightsBtn').onclick = () => showLights('menu');
$('aboutBtn').onclick = () => $('about').showModal();
$('settingsBtn').onclick = () => $('settings').showModal();
document.querySelectorAll('[data-set]').forEach(i => {
  i.checked = Feel.settings[i.dataset.set];
  i.onchange = () => Feel.toggle(i.dataset.set, i.checked);
});
$('toMenu').onclick = () => showStart(false);

showStart(true);
