// lib.js - cinematic-motion-design engine: one paused GSAP timeline + per-frame updaters, driven by window.seek(t).
// All colours come from theme.js (window.THEME); never hard-code them in scenes: use LIME (= the accent), LIME2, INK,
// PAPER, MUTE, DIM, PINK (= warning), PINKT, CARD1/CARD2 and acc(alpha) / warnA(alpha) for translucent versions.
gsap.ticker.lagSmoothing(0); gsap.ticker.sleep();
const TL = gsap.timeline({ paused: true }), UPD = [], WIN = [], SFXQ = [];
const OFF = 0.5;                                   // narration starts at output 0.5 s
const TH = window.THEME;
const LIME = TH.acc, LIME2 = TH.acc2, INK = TH.ink, PAPER = TH.paper, MUTE = TH.mute, DIM = TH.dim, PINK = TH.warn, PINKT = TH.warnText, CARD1 = TH.card1, CARD2 = TH.card2, BG1 = TH.bg1;
const _rgb = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)).join(','); };
const acc = a => `rgba(${_rgb(TH.acc)},${a})`, warnA = a => `rgba(${_rgb(TH.warn)},${a})`;
const $ = s => document.querySelector(s);
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const prog = (t, a, b) => cl((t - a) / (b - a));
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eo = x => 1 - Math.pow(1 - x, 3);
function E(tag, cls, parent, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; }
function css(e, o) { for (const k in o) e.style[k] = typeof o[k] === 'number' && !/opacity|zIndex|flex|fontWeight|lineHeight/.test(k) ? o[k] + 'px' : o[k]; return e; }
const sfx = (kind, t, g = 1, pan = 0) => SFXQ.push([kind, +t.toFixed(3), g, pan]);

// ---------------------------------------------------------------- words (narration timing)
// WORDS: [[word, start, end], ...] in OUTPUT seconds. W('phrase') = start of the next match of that word sequence,
// searching forward from the previous match (scenes are written in order). We('phrase') = end of its last word.
const nz = w => w.toLowerCase().replace(/[^a-z0-9]/g, '');
const WN = () => window.WORDS.map(w => nz(w[0]));
let _wc = 0; window.MISS = [];
function _find(seq, from) {
  const n = WN(), q = seq.split(/\s+/).map(nz).filter(Boolean);
  for (let i = from; i <= n.length - q.length; i++) if (q.every((w, k) => n[i + k] === w)) return i;
  return -1;
}
function W(seq, { keep = false } = {}) {
  let i = _find(seq, _wc);
  if (i < 0) { i = _find(seq, 0); window.MISS.push(seq + (i < 0 ? ' (none)' : ' (before cursor)')); if (i < 0) return 0; }
  if (!keep) _wc = i + 1;
  return window.WORDS[i][1];
}
function We(seq) { const i = _find(seq, Math.max(0, _wc - 1)); const q = seq.split(/\s+/).filter(Boolean).length; if (i < 0) { window.MISS.push('end:' + seq); return 0; } return window.WORDS[i + q - 1][2]; }

// ---------------------------------------------------------------- scenes
// sc(t0, t1): a full-stage layer shown only in [t0, t1] (+ fade). Returns the layer.
function sc(t0, t1, { fadeIn = .35, fadeOut = .35, z = 10, persp = 1600 } = {}) {
  const s = E('div', 'scn', $('#world')); css(s, { zIndex: z, perspective: persp + 'px' });
  WIN.push([s, t0 - .02, t1 + fadeOut + .02]);
  if (fadeIn) TL.fromTo(s, { opacity: 0 }, { opacity: 1, duration: fadeIn, ease: 'power2.out' }, t0);
  if (fadeOut) TL.to(s, { opacity: 0, duration: fadeOut, ease: 'power2.in' }, t1);
  return s;
}
// element shown only between two times (cheap visibility, for heavy children)
const win = (el, a, b) => WIN.push([el, a, b]);

// ---------------------------------------------------------------- type
// hd(parent, 'CLONE *HIGGSFIELD*', t, {x,y,size,align,width}) kinetic headline; *word* = lime, ~word~ = muted
function hd(p, txt, t, { x = 0, y = 0, size = 120, align = 'center', width = 1920, stagger = .07, dur = .8, cls = '' } = {}) {
  const h = E('div', 'hd abs ' + cls, p); css(h, { left: x, top: y, width, fontSize: size, textAlign: align });
  h.innerHTML = txt.split('|').map(line => '<div class="ln">' + line.trim().split(/\s+/).map(w => {
    const lime = /^\*.*\*$/.test(w), mute = /^~.*~$/.test(w); const ww = w.replace(/^[*~]|[*~]$/g, '');
    return `<span class="w${lime ? ' lime' : ''}${mute ? ' mute' : ''}">${ww}</span>`; }).join(' ') + '</div>').join('');
  const ws = [...h.querySelectorAll('.w')];
  if (t != null) ws.forEach((w, i) => TL.fromTo(w, { y: size * .45, opacity: 0, filter: 'blur(12px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: dur, ease: 'expo.out' }, t + i * stagger));
  h.ws = ws; return h;
}
function txt(p, html, { x, y, size = 30, color = MUTE, weight = 500, align = 'left', width, font = 'Inter', ls = 'normal', cls = '' } = {}) {
  const e = E('div', 'abs ' + cls, p, html); css(e, { left: x, top: y, fontSize: size, color, fontWeight: weight, textAlign: align, fontFamily: font, letterSpacing: ls }); if (width) css(e, { width }); return e;
}
// small pill tag. kind: 'lime' (filled), 'line' (lime outline), 'dark', 'pink'
function tag(p, html, { x, y, kind = 'line', size = 26, center = false } = {}) {
  const e = E('div', 'tag abs ' + kind, p, html); css(e, { left: x, top: y, fontSize: size }); if (center) TL.set(e, { xPercent: -50 }, 0); return e;
}
// entrance helpers (GSAP x/y only; never set a CSS transform on the same element)
function popIn(e, t, { y = 24, s = .9, dur = .55, ease = 'back.out(1.8)', sound = 'pop', g = 1, pan = 0 } = {}) {
  TL.fromTo(e, { opacity: 0, y, scale: s }, { opacity: 1, y: 0, scale: 1, duration: dur, ease }, t);
  if (sound) sfx(sound, t, g, pan); return e;
}
function rise(e, t, { y = 60, dur = .9, blur = 10, sound = 'swish', g = 1, pan = 0 } = {}) {
  TL.fromTo(e, { opacity: 0, y, filter: `blur(${blur}px)` }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: dur, ease: 'expo.out' }, t);
  if (sound) sfx(sound, t, g, pan); return e;
}
function out(e, t, { y = -20, dur = .4 } = {}) { TL.to(e, { opacity: 0, y: '+=' + y, duration: dur, ease: 'power2.in' }, t); return e; }
// fly in with a 3D tilt + motion blur (cards)
function fly(e, t, { from = 'below', dur = 1.0, sound = 'whoosh', g = 1, pan = 0 } = {}) {
  const F = { below: { y: 180, rotationX: 35 }, left: { x: -260, rotationY: 40 }, right: { x: 260, rotationY: -40 }, far: { scale: .55, rotationX: 20 } }[from];
  TL.fromTo(e, { x: 0, y: 0, ...F, z: -400, opacity: 0, filter: 'blur(16px)' }, { x: 0, y: 0, rotationX: 0, rotationY: 0, scale: 1, z: 0, opacity: 1, filter: 'blur(0px)', duration: dur, ease: 'expo.out' }, t);
  if (sound) sfx(sound, t - .05, g, pan); return e;
}
// lime stamp ("FREE")
function stamp(p, label, t, { x, y, size = 64, rot = -8 } = {}) {
  const s = E('div', 'stamp abs', p, label); css(s, { left: x, top: y, fontSize: size, transform: `rotate(${rot}deg)` });
  TL.fromTo(s, { opacity: 0, scale: 2.4 }, { opacity: 1, scale: 1, duration: .35, ease: 'power4.in' }, t);
  sfx('thud', t + .33, .9); return s;
}

// ---------------------------------------------------------------- cards
function card(p, x, y, w, h, html = '', cls = '') { const c = E('div', 'card abs ' + cls, p, html); css(c, { left: x, top: y, width: w, height: h }); return c; }
// wordmark logos are wide: height = size * aspect
// wordmark logos are wide: size = the height an icon would have; wordmarks get W x wider and AR x as tall
const LOGO_AR = { gradio: 703 / 2016, kaggle: 9.4 / 24, ngrok: 9 / 24 }, LOGO_W = { gradio: 2.6, kaggle: 2.3, ngrok: 2.3 };
function logo(name, size = 64, color) {
  const L = window.LOGOS[name]; if (!L) return '';
  const w = size * (LOGO_W[name] || 1);
  return `<span class="logo" style="width:${Math.round(w)}px;height:${Math.round(w * (LOGO_AR[name] || 1))}px;color:${color || L.c}">${L.svg}</span>`;
}
function logoTile(p, name, x, y, { size = 150, color } = {}) {
  const t = E('div', 'ltile abs', p, logo(name, size * (LOGO_W[name] ? .33 : .52), color)); css(t, { left: x, top: y, width: size, height: size, borderRadius: size * .26 }); return t;
}

// ---------------------------------------------------------------- footage frames (real recordings)
// FOOT[name] = {dir, fps, n, w, h, ext}. map: [[tOut, tSrc], ...] linear between points (equal times = hard cut).
// cam: [[t, x, y, w], ...] source-pixel view boxes (keeps the frame's aspect), eased over camDur.
function srcAt(map, t) {
  if (t <= map[0][0]) return map[0][1];
  for (let i = 0; i < map.length - 1; i++) { const [a, sa] = map[i], [b, sb] = map[i + 1]; if (t >= a && t < b) return b === a ? sb : sa + (sb - sa) * (t - a) / (b - a); }
  return map[map.length - 1][1];
}
function camAt(cam, t, dur) {
  let v = cam[0].slice(1);
  for (let i = 1; i < cam.length; i++) { const [k, ...c] = cam[i]; if (t < k) break; const e = eio(cl((t - k) / dur)); v = v.map((a, j) => a + (c[j] - a) * e); }
  return v;
}
// ff(parent, clip, map, {x,y,w,h, cam, url, radius}) -> frame element with .s (scale) .sx .sy for rings
function ff(p, clip, map, { x, y, w, h, cam, url = null, radius = 22, camDur = 1.3, glow = true } = {}) {
  const F = window.FOOT[clip], bar = url ? 46 : 0;
  const f = E('div', 'ff abs' + (glow ? ' glow' : ''), p); css(f, { left: x, top: y, width: w, height: h, borderRadius: radius });
  if (url) { const b = E('div', 'ffbar', f, `<i></i><i></i><i></i><span class="url">${url}</span>`); }
  const vp = E('div', 'ffvp', f); css(vp, { top: bar, height: h - bar });
  const img = E('img', '', vp); img.decoding = 'sync';
  cam = cam || [[0, 0, 0, F.w]];
  f.vp = vp; f.vw = w; f.vh = h - bar;
  let last = '';
  UPD.push(t => {
    if (f.closest('[data-hidden="1"]')) return;
    const st = srcAt(map, t), idx = Math.max(1, Math.min(F.n, Math.round(st * F.fps) + 1));
    const src = F.one ? F.dir : `${F.dir}/${String(idx).padStart(6, '0')}.${F.ext || 'jpg'}`;
    if (src !== last) { img.src = src; img._dirty = true; last = src; }
    const [cx, cy, cw] = camAt(cam, t, camDur), s = f.vw / cw;
    f.s = s; f.sx = cx; f.sy = cy;
    css(img, { width: F.w * s, height: F.h * s, transform: `translate(${-cx * s}px,${-cy * s}px)` });
  });
  return f;
}
// ring on a source rect [x,y,w,h] of a frame, with a soft dim outside
function ring(f, t0, t1, r, { label = null, dim = .45, pad = 8 } = {}) {
  const g = E('div', 'ring', f.vp); const lb = label ? E('div', 'rlabel', g, label) : null;
  UPD.push(t => {
    const on = t >= t0 - .05 && t < t1 + .35; g.style.display = on ? 'block' : 'none'; if (!on || f.s == null) return;
    const a = Math.min(eo(prog(t, t0, t0 + .35)), 1 - prog(t, t1, t1 + .3));
    css(g, { left: (r[0] - f.sx) * f.s - pad, top: (r[1] - f.sy) * f.s - pad, width: r[2] * f.s + pad * 2, height: r[3] * f.s + pad * 2, opacity: a,
      boxShadow: `0 0 0 3px ${LIME}, 0 0 30px ${acc(.45)}, 0 0 0 4000px rgba(5,6,7,${dim * a})`, transform: `scale(${1.08 - .08 * eo(prog(t, t0, t0 + .4))})` });
  });
  sfx('tick', t0, .9); return g;
}
// blur box on a source rect (private links)
function blurBox(f, t0, t1, r) {
  const b = E('div', 'blurbox', f.vp);
  UPD.push(t => { const on = t >= t0 && t < t1; b.style.display = on ? 'block' : 'none'; if (!on || f.s == null) return;
    css(b, { left: (r[0] - f.sx) * f.s - 4, top: (r[1] - f.sy) * f.s - 4, width: r[2] * f.s + 8, height: r[3] * f.s + 8 }); });
}

// ---------------------------------------------------------------- 3D cursor
function cursor(p, id) {
  const P = 'M2 2 L2 31 L9.6 24.4 L14.6 36 L19.8 33.7 L14.8 22.6 L24.8 22.6 Z';
  p.insertAdjacentHTML('beforeend', `<svg id="${id}" class="cursor abs" viewBox="0 0 30 40"><defs><linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#E9EAEC"/><stop offset="1" stop-color="#B9BCC2"/></linearGradient></defs>
  <path d="${P}" transform="translate(1.6 2)" fill="#2A2D31"/><path d="${P}" fill="url(#g${id})" stroke="#16181B" stroke-width=".9" stroke-linejoin="round"/>
  <path d="M3.3 5 L3.3 27.5" stroke="#fff" stroke-width=".9" stroke-linecap="round"/></svg>`);
  return document.getElementById(id);
}
const TIP = 84 / 30 * 2;
function curMove(c, t, x, y, dur = .7, ease = 'power3.inOut') { TL.to(c, { x: x - TIP, y: y - TIP, duration: dur, ease }, t); }
function curClick(c, t) { TL.to(c, { scale: .8, duration: .07 }, t).to(c, { scale: 1, duration: .28, ease: 'back.out(3)' }, t + .08); sfx('click', t, 1); }

// ---------------------------------------------------------------- captions (word by word, key words lime)
// caption key words (accent colour): set window.KEYWORDS = ['kaggle', 'gpu', ...] at the top of scenes.js for each video
let KEY = null;
function captions() {
  KEY = new Set((window.KEYWORDS || ['free', 'gpu', 'model', 'link', 'zero', 'hours', 'minutes', 'challenge']).map(nz));
  const box = $('#caps'), ws = window.WORDS; if (!ws || !ws.length) return;
  // groups of up to 5 words, broken at sentence ends and pauses
  const G = []; let cur = [];
  ws.forEach((w, i) => { cur.push(i); const nx = ws[i + 1]; const end = /[.?!,:]$/.test(w[0]) || !nx || nx[1] - w[2] > .35; if (cur.length >= 5 || (end && cur.length >= 2) || !nx) { G.push(cur); cur = []; } });
  let lastG = -1;
  UPD.push(t => {
    const gi = G.findIndex(g => t >= ws[g[0]][1] - .08 && t < ws[g[g.length - 1]][2] + .25);
    if (gi !== lastG) { lastG = gi; box.innerHTML = gi < 0 ? '' : '<div class="cl">' + G[gi].map(i => `<span data-i="${i}" class="${KEY.has(nz(ws[i][0])) ? 'k' : ''}">${ws[i][0].replace(/^"|"$/g, '')}</span>`).join(' ') + '</div>'; }
    if (gi >= 0) box.querySelectorAll('span').forEach(s => { const w = ws[+s.dataset.i]; s.classList.toggle('on', t >= w[1] - .04); });
  });
}

// ---------------------------------------------------------------- background life
function background() {
  UPD.push(t => {
    css($('#glow1'), { transform: `translate(${Math.sin(t * .13) * 220}px, ${Math.cos(t * .11) * 90}px)` });
    css($('#glow2'), { transform: `translate(${Math.cos(t * .09) * 260}px, ${Math.sin(t * .12) * 120}px)` });
    $('#grid').style.backgroundPosition = `${(t * 6) % 80}px ${(t * 3) % 80}px`;
  });
}

window.seek = async t => {
  TL.seek(t, false);
  for (const [el, a, b] of WIN) { const h = t < a || t > b; el.style.display = h ? 'none' : ''; el.dataset.hidden = h ? '1' : '0'; }
  for (const f of UPD) f(t);
  const imgs = [...document.querySelectorAll('img')].filter(i => i._dirty && !i.closest('[data-hidden="1"]'));
  await Promise.all(imgs.map(i => (i._dirty = false, i.decode().catch(() => { }))));
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  return true;
};
