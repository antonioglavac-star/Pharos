// Početni izbornik. Pri pokretanju se svjetionik upali, zraka obiđe nebo i stane na natpisu.
// Dodir za vrijeme animacije je preskače. Bez animacije ako igrač ima uključeno smanjeno kretanje.
function showStart(intro){
  intro = intro && matchMedia('(prefers-reduced-motion: no-preference)').matches;
  $('map').hidden = true; $('game').hidden = true; $('start').hidden = false;
  $('start').classList.toggle('intro', !!intro);
  const started = Object.keys(progress).length > 0;
  $('play').textContent = started ? 'Nastavi' : 'Igraj';
  const lit = ISLANDS.filter(I => islandDone(I.id)).length;
  $('startProgress').textContent = started ? `Osvijetljeno otoka: ${lit} / ${ISLANDS.length}` : '';
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
  'r-cave': ICONS.cave(), 'r-star': '★'
};
for (const [c, html] of Object.entries(ruleIcons)) document.querySelector('.rules .' + c).innerHTML = html;

$('play').onclick = () => showMap();
$('howBtn').onclick = () => $('how').showModal();
$('aboutBtn').onclick = () => $('about').showModal();
$('toMenu').onclick = () => showStart(false);

showStart(true);
