// Svi otoci na karti, redom kojim se otključavaju.
// Otok bez razina u LEVELS prikazuje se kao "uskoro".
// x, y, rx, ry, rot – položaj i veličina na karti (pojednostavljeni obris, viewBox 440 × 390)
// fact – zanimljivost koja se otkrije kad igrač osvijetli cijeli otok (provjeriti prije objave!)
const COL = { w:'#ffc35a', r:'#ff6b5e', b:'#4fb6ff' };
const LEVELS = {};
const ISLANDS = [
  { id:'vis', name:'Vis', x:116, y:165, rx:23, ry:11, rot:-8,
    fact:'U 4. stoljeću prije Krista Grci su na Visu osnovali grad Issu, jedno od najstarijih naselja na Jadranu.' },
  { id:'bisevo', name:'Biševo', x:85, y:188, rx:7, ry:6, rot:0,
    fact:'U Modroj špilji sunce ulazi kroz otvor ispod mora i boji cijelu špilju plavim svjetlom.' },
  { id:'svetac', name:'Svetac', x:33, y:174, rx:6, ry:3, rot:-20, fact:'' },
  { id:'susac', name:'Sušac', x:197, y:252, rx:8, ry:3, rot:-10, fact:'' },
  { id:'lastovo', name:'Lastovo', x:280, y:252, rx:15, ry:9, rot:-5,
    fact:'Kuće na Lastovu poznate su po ukrašenim dimnjacima, fumarima.' },
  { id:'palagruza', name:'Palagruža', x:142, y:363, rx:6, ry:3, rot:-30,
    fact:'Svjetionik na Palagruži stoji gotovo na pola puta između hrvatske i talijanske obale.' },
  { id:'korcula', name:'Korčula', x:285, y:201, rx:63, ry:8, rot:-5, fact:'' },
  { id:'hvar', name:'Hvar', x:252, y:135, rx:90, ry:10, rot:-8, fact:'' },
  { id:'brac', name:'Brač', x:230, y:84, rx:54, ry:17, rot:-5, fact:'' },
  { id:'solta', name:'Šolta', x:153, y:66, rx:23, ry:6, rot:-10, fact:'' }
];
