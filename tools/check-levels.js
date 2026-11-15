// Provjera razina: za svaku razinu traži najmanji broj poteza koji osvjetljava sve brodove
// i uspoređuje ga s "par" vrijednošću. Pravila su u js/engine.js, isto kao u igri.
// Pokretanje: node tools/check-levels.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Učitaj popis otoka, pravila, pa sve datoteke s razinama iz js/islands/
const js = path.join(__dirname, '..', 'js');
for (const f of ['islands.js', 'engine.js']) vm.runInThisContext(fs.readFileSync(path.join(js, f), 'utf8'));
for (const f of fs.readdirSync(path.join(js, 'islands')).filter(f => f.endsWith('.js')))
  vm.runInThisContext(fs.readFileSync(path.join(js, 'islands', f), 'utf8'));
const { LEVELS, ISLANDS, checkLevel } = vm.runInThisContext('({ LEVELS, ISLANDS, checkLevel })');

let ok = true;
const ids = new Set();
for (const [island, list] of Object.entries(LEVELS)) {
  if (!ISLANDS.some(I => I.id === island)) { console.log(`Otok "${island}" nije u popisu ISLANDS`); ok = false; }
  for (const L of list) {
    if (ids.has(L.id)) { console.log(`${L.id}: ID se ponavlja`); ok = false; }
    ids.add(L.id);
    const r = checkLevel(L);
    let status = 'OK';
    if (r.errors.length) { status = r.errors.join(' '); ok = false; }
    else if (r.best !== L.par) { status = `par bi trebao biti ${r.best}`; ok = false; }
    console.log(`${L.id}: min ${r.best === Infinity ? '-' : r.best}, par ${L.par} -> ${status}`);
  }
}
process.exit(ok ? 0 : 1);
