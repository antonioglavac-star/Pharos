// Osjećaj igre: zvukovi, šum valova i vibracija. Zvukovi se stvaraju u pregledniku (Web Audio),
// pa nema audio datoteka. Postavke se pamte odvojeno od napretka.
const Feel = (() => {
  const KEY = 'svjetionik-postavke';
  const set = { sound: true, waves: true, vibrate: true };
  try { Object.assign(set, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(set)); } catch (e) {} };

  let ctx = null, master = null, waves = null;
  // Preglednik dopušta zvuk tek nakon prvog dodira, pa se zvuk pali tada
  function audio(){
    if (!ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = .6; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Jedan mekani ton: brzi početak i lagano utihnuće
  function tone(freq, at, dur, vol, type = 'sine', to){
    const c = audio(); if (!c) return;
    const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + .012);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(master); o.start(t); o.stop(t + dur + .05);
  }

  // Valovi: duboki šum koji polako nadolazi i odlazi
  function startWaves(){
    if (!set.waves || waves) return;
    const c = audio(); if (!c) return;
    const len = c.sampleRate * 6, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++){ last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
    const fade = c.sampleRate * .05;
    for (let i = 0; i < fade; i++){ d[i] *= i / fade; d[len - 1 - i] *= i / fade; }
    const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 450;
    const gain = c.createGain(); gain.gain.setValueAtTime(0, c.currentTime); gain.gain.linearRampToValueAtTime(.09, c.currentTime + 3);
    const lfo = c.createOscillator(), depth = c.createGain(); lfo.frequency.value = .11; depth.gain.value = .06;
    lfo.connect(depth).connect(gain.gain);
    src.connect(lp).connect(gain).connect(master); src.start(); lfo.start();
    waves = { src, lfo, gain };
  }
  function stopWaves(){
    if (!waves) return;
    const w = waves; waves = null;
    w.gain.gain.cancelScheduledValues(ctx.currentTime);
    w.gain.gain.setTargetAtTime(0, ctx.currentTime, .3);
    setTimeout(() => { w.src.stop(); w.lfo.stop(); }, 1500);
  }

  const buzz = p => { if (set.vibrate && navigator.vibrate) navigator.vibrate(p); };

  // Prvi dodir bilo gdje pali zvuk; kad je igra u pozadini, zvuk se pauzira
  document.addEventListener('pointerdown', () => { if (set.sound || set.waves){ audio(); startWaves(); } }, { once: true });
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    document.hidden ? ctx.suspend() : ctx.resume();
  });

  return {
    settings: set,
    toggle(k, v){
      set[k] = v; save();
      if (k === 'waves') v ? startWaves() : stopWaves();
      if (k === 'sound' && v) audio();
      if (k === 'vibrate' && v) buzz(15);
    },
    // Okretanje ogledala: kratak stakleni "klik"
    mirror(){ if (set.sound){ tone(1300, 0, .08, .03, 'triangle', 720); tone(2600, 0, .04, .006); } buzz(8); },
    // Brod je osvijetljen: dva meka tona
    boat(){ if (set.sound){ tone(784, 0, .55, .025); tone(1175, .07, .65, .018); } buzz(15); },
    // Razina riješena: uzlazni zvončić
    win(){ if (set.sound) [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * .11, 1.2, .025)); buzz([20, 60, 20, 60, 40]); }
  };
})();
