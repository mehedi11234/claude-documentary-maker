// doc.js - documentary helpers on top of lib.js (loaded after lib.js, before scenes.js).
// Word anchors, typing, counters, warning stamps, particle bursts, struck-through "suspect" cards, quote cards,
// timeline rows. All colours come from the theme (LIME = accent, PINK = warning).

// deterministic random (same frame -> same picture, needed for parallel rendering)
const RND = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const MUTEA = a => `rgba(${_rgb(TH.mute)},${a})`, PAPA = a => `rgba(${_rgb(TH.paper)},${a})`;

// ---- word anchors with alternatives: Whisper may write "3", "64-bit", "lift-off", "$370"
function WAi(...alts) {
  for (const a of alts) { const i = _find(a, _wc); if (i >= 0) { _wc = i + 1; return i; } }
  window.MISS.push(alts[0] + ' (none)'); return -1;
}
const WA = (...a) => { const i = WAi(...a); return i < 0 ? 0 : window.WORDS[i][1]; };      // start of the word
const WEnd = (...a) => { const i = WAi(...a); return i < 0 ? 0 : window.WORDS[i][2]; };    // end of the word
// set DUR from the last spoken word (+ tail seconds for the ending shot)
function endAfterVoice(tail = 2.0) { const L = window.WORDS[window.WORDS.length - 1]; window.DUR = +(L[2] + tail + .4).toFixed(2); return L[2] + tail; }

// ---- typing text (with key-tick SFX)
function typeText(el, s, t0, t1, caret = true) {
  const n = s.length;
  UPD.push(t => { const k = t < t0 ? 0 : Math.min(n, Math.ceil((t - t0) / (t1 - t0) * n));
    el.innerHTML = s.slice(0, k) + (caret && t > t0 - .3 && (t < t1 + .2 || Math.floor(t * 2.2) % 2) ? `<span style="display:inline-block;width:3px;height:1em;vertical-align:-.12em;margin-left:3px;background:${LIME}"></span>` : ''); });
  for (let i = 0; i < n; i++) if (s[i] !== ' ') sfx('key', t0 + (t1 - t0) * i / n, .55 + .3 * ((i * 7) % 3) / 2, .1);
}

// ---- number counter: counter(el, 0, 370, t0, t1, v => '$' + v + ',000,000')
function counter(el, from, to, t0, t1, fmt = v => v.toLocaleString('en-US'), ticks = 8) {
  UPD.push(t => { el.textContent = fmt(Math.round(from + (to - from) * eo(prog(t, t0, t1)))); });
  for (let k = 0; k < ticks; k++) sfx('tick', t0 + (t1 - t0) * k / ticks, .45);
}

// ---- warning-coloured stamp ("SELF-DESTRUCT", "FRAUD", "OVERFLOW")
function warnStamp(p, label, t, o = {}) {
  const s = stamp(p, label, t, o);
  css(s, { background: PINK, boxShadow: `0 0 0 .07em ${INK}, 0 0 0 .12em ${PINK}, 0 20px 50px -10px ${warnA(.5)}` }); return s;
}

// ---- particle burst at (x,y): explosions, fireworks, debris. colors = array of theme colours
function burst(p, x, y, t0, { n = 40, speed = [260, 780], life = 1.6, gravity = 160, size = [4, 12], colors = [PINK, PAPER, LIME2], seed = 1, flash = true, ring = true } = {}) {
  const L = E('div', 'layer', p); css(L, { zIndex: 20 });
  const fl = flash ? E('div', 'abs', L) : null;
  if (fl) css(fl, { left: 0, top: 0, width: 1920, height: 1080, opacity: 0, background: `radial-gradient(circle at ${x}px ${y}px, ${PAPA(.9)} 0, ${warnA(.5)} 160px, ${warnA(0)} 620px)` });
  const rg = ring ? E('div', 'abs', L) : null;
  if (rg) css(rg, { left: x - 50, top: y - 50, width: 100, height: 100, borderRadius: '50%', border: `4px solid ${colors[0]}`, opacity: 0 });
  const P = [...Array(n)].map((_, i) => { const d = E('div', 'abs', L); const z = size[0] + RND(i + seed * 97) * (size[1] - size[0]);
    css(d, { left: 0, top: 0, width: z, height: z, borderRadius: i % 3 ? '50%' : '2px', background: colors[i % colors.length], boxShadow: `0 0 10px ${colors[i % colors.length]}`, opacity: 0 }); return d; });
  UPD.push(t => {
    const k = t - t0;
    if (fl) fl.style.opacity = k < 0 ? 0 : Math.max(0, .85 - k * 1.6);
    if (rg) { const r = eo(cl(k / .9)); rg.style.opacity = k < 0 ? 0 : (1 - r) * .9; rg.style.transform = `scale(${.2 + r * 5})`; }
    P.forEach((d, i) => { if (k < 0 || k > life) { d.style.opacity = 0; return; }
      const a = RND(i + seed * 31) * 6.283, v = speed[0] + RND(i + seed * 53) * (speed[1] - speed[0]);
      d.style.opacity = Math.max(0, 1 - k / life);
      d.style.transform = `translate(${x + Math.cos(a) * v * eo(cl(k / life * 1.4))}px, ${y + Math.sin(a) * v * eo(cl(k / life * 1.4)) + gravity * k * k}px) rotate(${k * 400 * (RND(i + 9) - .5)}deg)`; });
  });
  sfx('impact', t0, .9, (x - 960) / 1400); return L;
}

// ---- "suspect" card that gets struck through: suspectCard(s, 380, 400, 'ENGINES', iconSvg, tIn, tStrike, 'WORKED FINE')
function suspectCard(p, x, y, label, icon, tIn, tStrike, note = 'RULED OUT', { w = 520, h = 250 } = {}) {
  const c = card(p, x, y, w, h, `<div class="abs" style="left:34px;top:76px">${icon || ''}</div><div class="sg abs lb" style="left:${icon ? 160 : 34}px;top:94px;font-size:60px;color:${PAPER}">${label}</div>
    <div class="mono abs" style="left:34px;top:30px;font-size:22px;color:${MUTE};letter-spacing:.14em">SUSPECT</div><div class="mono abs ok" style="left:${icon ? 162 : 36}px;top:176px;font-size:22px;color:${LIME};letter-spacing:.12em;opacity:0">✓ ${note}</div>`);
  fly(c, tIn, { from: 'below', g: .8, pan: x < 900 ? -.4 : .4 });
  if (tStrike != null) {
    const st = E('div', 'abs', c); css(st, { left: icon ? 150 : 26, top: 132, width: w - (icon ? 190 : 60), height: 8, borderRadius: 4, background: LIME, boxShadow: `0 0 20px ${LIME}`, transformOrigin: 'left center' });
    TL.fromTo(st, { scaleX: 0 }, { scaleX: 1, duration: .3, ease: 'power3.out' }, tStrike); sfx('swish', tStrike - .05, .9);
    TL.to(c.querySelector('.lb'), { color: DIM, duration: .3 }, tStrike + .05); TL.to(c.querySelector('.ok'), { opacity: 1, duration: .3 }, tStrike + .1);
  }
  return c;
}

// ---- quote card with the exact words + who said it + source
function quoteCard(p, x, y, w, quote, who, t, { size = 46 } = {}) {
  const c = card(p, x, y, w, 10, `<div class="sg" style="position:relative;margin:36px 40px 0;font-size:${size}px;line-height:1.12;color:${PAPER};text-transform:none;letter-spacing:-.02em">“${quote}”</div>
    <div class="mono" style="position:relative;margin:22px 40px 34px;font-size:22px;color:${LIME};letter-spacing:.1em">— ${who}</div>`);
  css(c, { height: 'auto' }); fly(c, t, { from: 'far', g: .8 }); return c;
}

// ---- date / place tag that types itself
function dateTag(p, text, x, y, t0, t1) {
  const d = tag(p, '', { x, y, kind: 'line', size: 30 }); const s = E('span', 'mono', d); popIn(d, t0 - .15, { sound: null });
  typeText(s, text, t0, t1, false); return d;
}

// ---- vertical timeline: rows lit one by one. rows = [[t, '1987', 'Programme approved'], ...]
function timeline(p, x, y, rows, { gap = 120, w = 760 } = {}) {
  const line = E('div', 'abs', p); css(line, { left: x + 9, top: y + 10, width: 3, height: gap * (rows.length - 1), background: acc(.35), transformOrigin: 'top' });
  TL.fromTo(line, { scaleY: 0 }, { scaleY: 1, duration: rows.length * .3, ease: 'power2.out' }, rows[0][0]);
  return rows.map(([t, when, what], i) => {
    const r = E('div', 'abs', p); css(r, { left: x, top: y + i * gap, width: w });
    r.innerHTML = `<div style="position:absolute;left:0;top:2px;width:22px;height:22px;border-radius:50%;background:${LIME};box-shadow:0 0 18px ${LIME}"></div>
      <div class="mono" style="position:absolute;left:46px;top:-2px;font-size:24px;color:${LIME};letter-spacing:.1em">${when}</div>
      <div class="sg" style="position:absolute;left:46px;top:32px;font-size:44px;color:${PAPER}">${what}</div>`;
    rise(r, t - .05, { y: 24, sound: 'pop', g: .7 }); return r;
  });
}
