// Svi otoci na karti, redom kojim se otključavaju.
// Otok bez razina u LEVELS prikazuje se kao "uskoro".
// Obris i položaj otoka na karti su u js/chart.js (prema OpenStreetMapu, alat tools/build-chart.js).
// fact – zanimljivost koja se otkrije kad igrač osvijetli cijeli otok (provjeriti prije objave!)
const COL = { w:'#ffc35a', r:'#ff6b5e', b:'#4fb6ff' };
const LEVELS = {};
const ISLANDS = [
  { id:'vis', name:'Vis',
    fact:'U 4. stoljeću prije Krista Grci su na Visu osnovali grad Issu, jedno od najstarijih naselja na Jadranu.' },
  { id:'bisevo', name:'Biševo',
    fact:'U Modroj špilji sunce ulazi kroz otvor ispod mora i boji cijelu špilju plavim svjetlom.' },
  { id:'svetac', name:'Svetac',
    fact:'Svetac se zove i Sveti Andrija. Na tom udaljenom otoku desetljećima je živjela samo jedna obitelj.' },
  { id:'susac', name:'Sušac',
    fact:'Svjetionik na Sušcu sagrađen je 1878. godine i jedan je od rijetkih na Jadranu na kojem i danas rade svjetioničari.' },
  { id:'lastovo', name:'Lastovo',
    fact:'Kuće na Lastovu poznate su po ukrašenim dimnjacima, fumarima.' },
  { id:'palagruza', name:'Palagruža',
    fact:'Svjetionik na Palagruži stoji gotovo na pola puta između hrvatske i talijanske obale.' },
  { id:'korcula', name:'Korčula', fact:'' },
  { id:'hvar', name:'Hvar', fact:'' },
  { id:'brac', name:'Brač', fact:'' },
  { id:'solta', name:'Šolta', fact:'' }
];
