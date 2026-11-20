// Worked example: a ~40 s 2D documentary, "The number that blew up a rocket" (Ariane 501, 4 June 1996), theme midnight.
// Read it before writing scenes: anchors() first, one function per beat, every element lands on a word.
// Everything is an illustration, labelled as such.
// Facts: ESA/CNES Ariane 501 Inquiry Board report: veered ~37 s, self-destruct ~39 s, SRI software reused from
// Ariane 4, 64-bit float -> 16-bit signed integer conversion (max 32,767) = Operand Error in both SRIs, the OBC read
// the diagnostic pattern as flight data. $370 million = the commonly cited loss (rocket + 4 Cluster satellites).
window.KEYWORDS = ['ariane', '5', 'liftoff', 'number', 'overflowed', 'fireworks', 'sixteen', '16bit', '64bit', 'sixtyfour',
  'million', 'destroys', 'decade', 'satellites', 'panicked', 'cause'];
const B = {};
// helpers (RND, WA, WEnd, typeText, MUTEA, PAPA) come from engine/doc.js

function anchors() {
  _wc = 0;
  B.june = WA('June'); B.ninety = WEnd('ninety-six', '1996', 'six', 'ninety'); B.french = WA('French');
  B.europe = WA("Europe's", 'Europes', 'Europe'); B.ariane = WA('Ariane'); B.first = WA('first flight');
  B.decade = WA('decade'); B.sats = WA('Four satellites', '4 satellites', 'satellites');
  B.three = WA('Three', '3'); B.two = WA('Two', '2'); B.one = WA('One', '1'); B.lift = WA('Liftoff', 'Lift', 'liftoff');
  B.about = WA('About'); B.veers = WA('veers', 'veer'); B.destroys = WA('destroys');
  B.cause = WA('The cause', 'cause'); B.engines = WA('engines'); B.weather = WA('weather'); B.onenum = WA('One number', '1 number', 'number');
  B.old = WA('Old code', 'Old'); B.b64 = WA('sixty-four', '64-bit', '64', 'sixty'); B.b16 = WA('sixteen', '16-bit', '16');
  B.boxEnd = WEnd('box'); B.over = WA('overflowed'); B.comp = WA('computer panicked', 'computer'); B.around = WA('around');
  B.became = WA('became'); B.fire = WA('fireworks');
  const L = window.WORDS[window.WORDS.length - 1]; B.end = L[2] + 2.0; window.DUR = +(B.end + .4).toFixed(2);
  _wc = 0;
}

function build() {
  anchors();
  const lab = txt(sc(0, window.DUR, { fadeIn: 0, fadeOut: 0, z: 75 }), 'ILLUSTRATION · ARIANE 501 · 4 JUNE 1996', { x: 48, y: 40, size: 17, color: DIM, font: 'Geist Mono', ls: '.12em' });
  launch(); flight(); cause(); squeeze();
}

// ---------------------------------------------------------------- the rocket (flat 2D, theme colours)
function rocketSVG(id) {
  const g = `url(#rb${id})`;
  const booster = dx => `<g transform="translate(${dx},0)"><path d="M16 200 Q16 150 28 126 Q40 150 40 200 V478 H16 Z" fill="${g}"/>
    <path d="M18 478 H38 L42 500 H14 Z" fill="${DIM}"/><rect x="16" y="196" width="24" height="5" fill="${MUTE}" opacity=".7"/></g>`;
  return `<svg viewBox="0 0 140 540" width="140" height="540" style="overflow:visible">
   <defs><linearGradient id="rb${id}" x1="0" x2="1"><stop offset="0" stop-color="${MUTE}"/><stop offset=".38" stop-color="${PAPER}"/><stop offset="1" stop-color="${DIM}"/></linearGradient></defs>
   ${booster(0)}${booster(84)}
   <path d="M46 122 Q46 34 70 4 Q94 34 94 122 V470 H46 Z" fill="${g}"/>
   <path d="M46 150 H94" stroke="${DIM}" stroke-width="2"/><rect x="46" y="300" width="48" height="10" fill="${LIME}"/>
   <path d="M56 470 H84 L90 500 H50 Z" fill="${DIM}"/></svg>`;
}
function flameSVG(id) {
  const fl = (cx, w, h, c) => `<ellipse cx="${cx}" cy="${h / 2}" rx="${w}" ry="${h / 2}" fill="url(#${c}${id})"/>`;
  return `<svg viewBox="0 0 140 300" width="140" height="300" style="overflow:visible"><defs>
   <radialGradient id="fw${id}" cx=".5" cy=".18" r=".7"><stop offset="0" stop-color="${PAPER}"/><stop offset=".35" stop-color="${PINK}"/><stop offset="1" stop-color="${PINK}" stop-opacity="0"/></radialGradient>
   <radialGradient id="fb${id}" cx=".5" cy=".15" r=".7"><stop offset="0" stop-color="${PAPER}"/><stop offset=".4" stop-color="${LIME2}"/><stop offset="1" stop-color="${LIME}" stop-opacity="0"/></radialGradient></defs>
   ${fl(28, 17, 260, 'fw')}${fl(112, 17, 260, 'fw')}${fl(70, 13, 170, 'fb')}</svg>`;
}

// ---------------------------------------------------------------- 0:00 launch pad -> countdown -> liftoff
function launch() {
  const t1 = B.about - .1;
  const s = sc(0, t1, { fadeIn: .6, fadeOut: .5 });
  const cam = E('div', 'layer', s); TL.set(cam, { transformOrigin: '960px 640px' }, 0);
  // stars
  const sky = E('div', 'layer', cam);
  const ST = [...Array(80)].map((_, i) => { const d = E('div', 'abs', sky); const z = 1 + RND(i * 3) * 2.4;
    css(d, { left: RND(i) * 1920, top: RND(i + 99) * 720, width: z, height: z, borderRadius: '50%', background: PAPER }); return d; });
  UPD.push(t => ST.forEach((d, i) => d.style.opacity = .25 + .55 * (.5 + .5 * Math.sin(t * (1 + RND(i + 7) * 2) + i))));
  // ground + pad + tower
  const gr = E('div', 'abs', cam); css(gr, { left: 0, top: 800, width: 1920, height: 400 });
  gr.innerHTML = `<svg width="1920" height="400" style="overflow:visible"><path d="M0 70 C 380 20, 700 46, 960 32 C 1250 18, 1520 60, 1920 44 V400 H0 Z" fill="${BG1}" stroke="${acc(.35)}" stroke-width="2"/>
    <rect x="850" y="26" width="220" height="14" rx="3" fill="${CARD1}" stroke="${acc(.25)}"/></svg>`;
  const tw = E('div', 'abs', cam); css(tw, { left: 760, top: 250, width: 90, height: 580 });
  let lat = ''; for (let y = 0; y < 560; y += 40) lat += `<path d="M10 ${y} L80 ${y + 40} M80 ${y} L10 ${y + 40}" stroke="${DIM}" stroke-width="2"/>`;
  tw.innerHTML = `<svg width="90" height="580"><rect x="8" y="0" width="4" height="580" fill="${DIM}"/><rect x="78" y="0" width="4" height="580" fill="${DIM}"/>${lat}
    <rect x="80" y="140" width="40" height="5" fill="${DIM}"/><rect x="80" y="330" width="40" height="5" fill="${DIM}"/><circle cx="45" cy="-6" r="5" fill="${PINK}"/></svg>`;
  const bea = tw.querySelector('circle'); UPD.push(t => bea.style.opacity = Math.floor(t * 1.4) % 2 ? .2 : 1);
  // rocket + flame + smoke
  const rk = E('div', 'abs', cam); css(rk, { left: 890, top: 290, width: 140, height: 540 }); rk.innerHTML = rocketSVG('A');
  const fl = E('div', 'abs', rk); css(fl, { left: 0, top: 490, width: 140, height: 300, transformOrigin: '70px 0px' }); fl.innerHTML = flameSVG('A');
  const SM = [...Array(18)].map((_, i) => { const d = E('div', 'abs', cam); const r = 70 + RND(i + 40) * 90;
    css(d, { left: 960 - r / 2, top: 820 - r / 2, width: r, height: r, borderRadius: '50%', background: `radial-gradient(closest-side, ${MUTEA(.42)}, ${MUTEA(0)})`, opacity: 0 }); d.r = r; return d; });
  const L = B.lift, liftY = t => t < L ? 0 : Math.pow(t - L, 2.2) * 70;
  UPD.push(t => {
    const ig = prog(t, L - .35, L + .1);
    fl.style.opacity = ig; fl.style.transform = `scaleY(${(.3 + .7 * ig) * (1 + .12 * Math.sin(t * 61) + .06 * Math.sin(t * 37))}) scaleX(${1 + .05 * Math.sin(t * 53)})`;
    rk.style.transform = `translateY(${-liftY(t)}px)`;
    SM.forEach((d, i) => { const k = prog(t, L - .25 + i * .03, L + 2.6), dir = (i % 2 ? 1 : -1) * (.3 + RND(i) * 1.2);
      d.style.opacity = k > 0 ? Math.min(1, k * 4) * (1 - k * .5) : 0;
      d.style.transform = `translate(${dir * 420 * eo(k)}px, ${-40 * RND(i + 5) * eo(k)}px) scale(${.4 + 2.2 * eo(k)})`; });
    const sh = t > L - .2 && t < L + 1.8 ? (1 - prog(t, L, L + 1.8)) * 7 : 0;
    const follow = Math.min(liftY(t) * .45, 520);
    cam.style.transform = `translate(${sh * Math.sin(t * 91)}px, ${sh * Math.cos(t * 73) + follow}px) scale(${1 + .07 * prog(t, 0, L)})`;
  });
  sfx('riser', L - 1.1, .8); sfx('impact', L, 1); SFXQ.push(['hum', +L.toFixed(3), 1, 0, +(t1 - L).toFixed(3)]);
  // overlay type (does not move with the camera)
  const o = E('div', 'layer', s);
  const d1 = tag(o, '', { x: 120, y: 236, kind: 'line', size: 30 }); const d1t = E('span', 'mono', d1); popIn(d1, B.june - .15, { sound: null });
  typeText(d1t, '04 JUNE 1996', B.june, B.ninety, false);
  const d2 = tag(o, 'KOUROU · FRENCH GUIANA', { x: 120, y: 306, kind: 'dark', size: 26 }); popIn(d2, B.french - .05);
  const h = hd(o, 'ARIANE *5*', B.ariane - .05, { x: 116, y: 400, size: 170, align: 'left', width: 800 });
  const ff1 = tag(o, 'FIRST FLIGHT · FLIGHT 501', { x: 124, y: 590, kind: 'lime', size: 28 }); popIn(ff1, B.first - .05);
  const cl = E('div', 'abs', o); css(cl, { left: 1040, top: 470, width: 260, height: 2, background: acc(.7), transformOrigin: 'left center' });
  TL.fromTo(cl, { scaleX: 0 }, { scaleX: 1, duration: .5, ease: 'expo.out' }, B.ariane + .2);
  const cdot = E('div', 'abs', o); css(cdot, { left: 1033, top: 463, width: 16, height: 16, borderRadius: '50%', background: LIME, boxShadow: `0 0 20px ${LIME}` }); popIn(cdot, B.ariane + .1, { sound: null });
  const cll = txt(o, 'EUROPE’S NEW<br>HEAVY ROCKET', { x: 1320, y: 440, size: 26, color: PAPER, font: 'Geist Mono', ls: '.08em' }); rise(cll, B.ariane + .4, { y: 20, sound: null });
  TL.to([d1, d2, h, ff1, cl, cdot, cll], { opacity: 0, y: -30, filter: 'blur(8px)', duration: .4, stagger: .03 }, B.decade - .35); sfx('whoosh', B.decade - .35, .6);
  // a decade + four satellites
  const c1 = card(o, 120, 330, 560, 300, `<div class="mono abs" style="left:34px;top:30px;font-size:22px;color:${LIME};letter-spacing:.14em">DEVELOPMENT</div>
    <div class="num abs" style="left:30px;top:66px;font-size:150px">10</div><div class="sg abs" style="left:210px;top:118px;font-size:56px;color:${PAPER}">YEARS</div>
    <div class="abs" style="left:34px;top:232px;font-size:26px;color:${MUTE};font-weight:500">a decade of work</div>`);
  fly(c1, B.decade - .15, { from: 'left', pan: -.5 });
  const sat = `<svg viewBox="0 0 60 60" width="64" height="64"><rect x="20" y="20" width="20" height="20" rx="3" fill="${PAPER}"/><rect x="2" y="25" width="16" height="10" fill="${LIME}"/><rect x="42" y="25" width="16" height="10" fill="${LIME}"/><circle cx="30" cy="14" r="4" fill="none" stroke="${MUTE}" stroke-width="2"/></svg>`;
  const c2 = card(o, 1240, 330, 560, 300, `<div class="mono abs" style="left:34px;top:30px;font-size:22px;color:${LIME};letter-spacing:.14em">PAYLOAD · CLUSTER</div>
    <div class="abs sats" style="left:30px;top:80px;display:flex;gap:26px">${[0, 1, 2, 3].map(() => `<div>${sat}</div>`).join('')}</div>
    <div class="sg abs" style="left:32px;top:168px;font-size:56px;color:${PAPER}">4 SATELLITES</div>
    <div class="abs" style="left:34px;top:240px;font-size:26px;color:${MUTE};font-weight:500">on board, first flight</div>`);
  fly(c2, B.sats - .2, { from: 'right', pan: .5 });
  [...c2.querySelectorAll('.sats > div')].forEach((d, i) => popIn(d, B.sats + .1 + i * .12, { s: .3, g: .6, pan: .5 }));
  TL.to([c1, c2], { opacity: 0, scale: .9, filter: 'blur(10px)', duration: .35 }, B.three - .3);
  // countdown
  [[B.three, '3'], [B.two, '2'], [B.one, '1']].forEach(([t, n], i, A) => {
    const e = hd(o, n, null, { y: 70, size: 230 }); e.style.color = LIME; e.style.textShadow = `0 0 60px ${acc(.5)}`;
    TL.fromTo(e, { opacity: 0, scale: 1.8, filter: 'blur(14px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: .35, ease: 'power4.out' }, t - .08);
    TL.to(e, { opacity: 0, scale: .7, duration: .25 }, (i < 2 ? A[i + 1][0] : B.lift) - .12); sfx('tick', t - .02, 1.2);
  });
  const lo = hd(o, '*LIFTOFF*', B.lift - .05, { y: 40, size: 130 });
  TL.to(lo, { opacity: 0, y: -40, duration: .4 }, B.lift + 1.6);
}

// ---------------------------------------------------------------- 0:12 forty seconds later: veer + self-destruct
function flight() {
  const t0 = B.about - .2, t1 = B.cause - .05, V = B.veers, D = B.destroys + .1;
  const s = sc(t0, t1, { fadeIn: .5, fadeOut: .35 });
  const ea = E('div', 'abs', s); css(ea, { left: -500, top: 860, width: 2920, height: 1800, borderRadius: '50%', background: `radial-gradient(60% 40% at 50% 0%, ${CARD1}, ${BG1} 60%)`, boxShadow: `0 -2px 0 ${acc(.55)}, 0 -30px 90px -20px ${acc(.35)}` });
  const ST = [...Array(60)].map((_, i) => { const d = E('div', 'abs', s); const z = 1 + RND(i * 5) * 2; css(d, { left: RND(i + 3) * 1920, top: RND(i + 50) * 820, width: z, height: z, borderRadius: '50%', background: PAPER, opacity: .5 }); return d; });
  // trajectory (quadratic) + trail
  const P0 = [330, 940], P1 = [760, 330], P2 = [1560, 170], q = (u, k) => (1 - u) ** 2 * P0[k] + 2 * (1 - u) * u * P1[k] + u * u * P2[k];
  const svg = E('div', 'layer', s); svg.innerHTML = `<svg width="1920" height="1080"><path class="ghost" fill="none" stroke="${PAPA(.12)}" stroke-width="2" stroke-dasharray="4 12"/>
    <polyline class="tr" fill="none" stroke="${LIME}" stroke-width="5" stroke-linecap="round" style="filter:drop-shadow(0 0 10px ${acc(.7)})"/>
    <polyline class="tv" fill="none" stroke="${PINK}" stroke-width="5" stroke-linecap="round" style="filter:drop-shadow(0 0 10px ${warnA(.7)})"/></svg>`;
  svg.querySelector('.ghost').setAttribute('d', `M${P0} Q${P1} ${P2}`);
  const tr = svg.querySelector('.tr'), tv = svg.querySelector('.tv');
  const rk = E('div', 'abs', s); css(rk, { left: 0, top: 0, width: 140, height: 540, transformOrigin: '70px 270px' }); rk.innerHTML = rocketSVG('B');
  const fl = E('div', 'abs', rk); css(fl, { left: 0, top: 490, width: 140, height: 300, transformOrigin: '70px 0px' }); fl.innerHTML = flameSVG('B');
  const UV = .62;                                 // where the veer starts on the path
  let vp = null;
  UPD.push(t => {
    const u = UV * eio(prog(t, t0 + .1, V)), pts = [];
    for (let k = 0; k <= 50; k++) { const uu = u * k / 50; pts.push(q(uu, 0).toFixed(1) + ',' + q(uu, 1).toFixed(1)); }
    tr.setAttribute('points', pts.join(' '));
    let x = q(u, 0), y = q(u, 1), ang = Math.atan2(q(u + .001, 1) - y, q(u + .001, 0) - x);
    const vk = prog(t, V, D);
    if (vk > 0) {
      const a0 = Math.atan2(q(UV + .001, 1) - q(UV, 1), q(UV + .001, 0) - q(UV, 0)), vpts = [];
      let px = q(UV, 0), py = q(UV, 1);
      for (let k = 0; k <= 30; k++) { const kk = vk * k / 30, a = a0 + 1.5 * eo(kk); vpts.push(px.toFixed(1) + ',' + py.toFixed(1)); px += Math.cos(a) * 9 * vk; py += Math.sin(a) * 9 * vk; }
      tv.setAttribute('points', vpts.join(' ')); x = px; y = py; ang = a0 + 1.5 * eo(vk);
    } else tv.setAttribute('points', '');
    vp = [x, y];
    const shake = vk > 0 ? Math.sin(t * 80) * 6 * vk : 0;
    rk.style.transform = `translate(${x - 70}px, ${y - 270}px) rotate(${ang * 180 / Math.PI + 90 + shake}deg) scale(.24)`;
    rk.style.opacity = t < D ? 1 : 0;
    fl.style.transform = `scaleY(${1 + .15 * Math.sin(t * 59)})`;
    B.boomAt = vp;
  });
  // timer (T+ seconds; real figures: veer ~37 s, self-destruct ~39 s)
  const tm = card(s, 1400, 96, 420, 150, `<div class="mono abs" style="left:30px;top:24px;font-size:22px;color:${MUTE};letter-spacing:.14em">MISSION TIME</div>
    <div class="abs mono tt" style="left:28px;top:56px;font-size:70px;color:${PAPER};font-weight:600">T+ 00:00</div>`);
  fly(tm, t0 + .3, { from: 'right', g: .7, pan: .5 });
  const tt = tm.querySelector('.tt');
  UPD.push(t => { const sec = t < V ? 37 * eio(prog(t, t0 + .2, V)) : 37 + 2 * prog(t, V, D); tt.textContent = 'T+ 00:' + String(Math.floor(sec)).padStart(2, '0');
    tt.style.color = t >= V ? PINKT : PAPER; tm.style.borderColor = t >= V ? warnA(.6) : 'rgba(255,255,255,.08)'; });
  for (let k = 0; k < 6; k++) sfx('tick', t0 + .4 + (V - t0 - .4) * k / 6, .5, .5);
  const vt = tag(s, 'VEERS OFF COURSE', { x: 1060, y: 290, kind: 'pink', size: 28 }); popIn(vt, V + .05, { g: .9 });
  sfx('riser', V - .2, .6);
  // explosion
  const fx = E('div', 'layer', s); css(fx, { zIndex: 20 });
  const flash = E('div', 'abs', fx); css(flash, { left: 0, top: 0, width: 1920, height: 1080, opacity: 0 });
  const DB = [...Array(46)].map((_, i) => { const d = E('div', 'abs', fx); const z = 4 + RND(i + 11) * 9; css(d, { left: 0, top: 0, width: z, height: z, borderRadius: i % 3 ? '50%' : '2px', background: [PINK, PAPER, LIME2][i % 3], opacity: 0 }); return d; });
  const ringE = E('div', 'abs', fx); css(ringE, { left: 0, top: 0, width: 100, height: 100, borderRadius: '50%', border: `4px solid ${PINK}`, opacity: 0 });
  UPD.push(t => {
    const p = B.boomAt || [1100, 400], k = t - D;
    flash.style.opacity = k < 0 ? 0 : Math.max(0, .85 - k * 1.6);
    flash.style.background = `radial-gradient(circle at ${p[0]}px ${p[1]}px, ${PAPA(.95)} 0, ${warnA(.55)} 160px, ${warnA(0)} 620px)`;
    DB.forEach((d, i) => { if (k < 0) { d.style.opacity = 0; return; } const a = RND(i) * 6.283, v = 260 + RND(i + 3) * 520;
      d.style.opacity = Math.max(0, 1 - k / 1.6); d.style.transform = `translate(${p[0] + Math.cos(a) * v * k}px, ${p[1] + Math.sin(a) * v * k + 160 * k * k}px) rotate(${k * 400 * (RND(i + 9) - .5)}deg)`; });
    const rk2 = eo(cl(k / .9)); ringE.style.opacity = k < 0 ? 0 : (1 - rk2) * .9;
    ringE.style.transform = `translate(${p[0] - 50}px, ${p[1] - 50}px) scale(${.2 + rk2 * 5})`;
  });
  sfx('impact', D, 1.1); sfx('thud', D + .05, .8);
  TL.to(vt, { opacity: 0, duration: .2 }, D);
  const st = stamp(s, 'SELF-DESTRUCT', D + .35, { x: 690, y: 690, size: 80, rot: -6 });
  css(st, { background: PINK, boxShadow: `0 0 0 .07em ${INK}, 0 0 0 .12em ${PINK}, 0 20px 50px -10px ${warnA(.5)}` });
}

// ---------------------------------------------------------------- 0:17 the cause? not engines, not weather: one number
function cause() {
  const t0 = B.cause, t1 = B.old;
  const s = sc(t0 - .1, t1, { fadeIn: .3, fadeOut: .35 });
  const h = hd(s, 'THE *CAUSE?*', t0 - .05, { y: 110, size: 140 });
  const ico = {
    eng: `<svg viewBox="0 0 80 80" width="96" height="96"><path d="M28 8 H52 V30 L64 70 H16 L28 30 Z" fill="none" stroke="${MUTE}" stroke-width="4" stroke-linejoin="round"/><path d="M28 30 H52" stroke="${MUTE}" stroke-width="4"/></svg>`,
    wx: `<svg viewBox="0 0 80 80" width="96" height="96"><path d="M22 52 Q8 52 10 40 Q12 28 26 30 Q30 14 46 16 Q62 18 62 34 Q74 36 72 46 Q70 54 60 52 Z" fill="none" stroke="${MUTE}" stroke-width="4" stroke-linejoin="round"/><path d="M40 52 L32 68 H44 L36 80" fill="none" stroke="${MUTE}" stroke-width="4"/></svg>` };
  const mk = (x, k, label, t) => {
    const c = card(s, x, 400, 520, 250, `<div class="abs" style="left:34px;top:76px">${ico[k]}</div><div class="sg abs lb" style="left:160px;top:94px;font-size:64px;color:${PAPER}">${label}</div>
      <div class="mono abs" style="left:34px;top:30px;font-size:22px;color:${MUTE};letter-spacing:.14em">SUSPECT</div><div class="mono abs ok" style="left:162px;top:176px;font-size:22px;color:${LIME};letter-spacing:.12em;opacity:0">✓ WORKED FINE</div>`);
    fly(c, B.cause + .5 + (x < 900 ? 0 : .15), { from: 'below', g: .8, pan: x < 900 ? -.4 : .4 });
    const st = E('div', 'abs', c); css(st, { left: 150, top: 132, width: 330, height: 8, borderRadius: 4, background: LIME, boxShadow: `0 0 20px ${LIME}`, transformOrigin: 'left center' });
    TL.fromTo(st, { scaleX: 0 }, { scaleX: 1, duration: .3, ease: 'power3.out' }, t + .45); sfx('swish', t + .4, .9);
    TL.to(c.querySelector('.lb'), { color: DIM, duration: .3 }, t + .5); TL.to(c.querySelector('.ok'), { opacity: 1, duration: .3 }, t + .55);
    return c;
  };
  const c1 = mk(380, 'eng', 'ENGINES', B.engines), c2 = mk(1020, 'wx', 'WEATHER', B.weather);
  TL.to([c1, c2], { y: 160, opacity: 0, filter: 'blur(10px)', duration: .45, ease: 'power3.in', stagger: .05 }, B.onenum - .3);
  TL.to(h, { opacity: 0, y: -40, duration: .3 }, B.onenum - .3);
  const n = hd(s, 'ONE *NUMBER*', B.onenum, { y: 300, size: 190 }); sfx('impact', B.onenum + .05, .55);
  const dg = txt(s, '', { x: 0, y: 560, width: 1920, size: 64, color: LIME, align: 'center', font: 'Geist Mono', ls: '.18em' });
  TL.fromTo(dg, { opacity: 0 }, { opacity: 1, duration: .3 }, B.onenum + .3);
  UPD.push(t => { const f = Math.floor(t * 18); dg.textContent = [...Array(12)].map((_, i) => Math.floor(RND(f * 13 + i) * 10)).join(''); dg.style.textShadow = `0 0 30px ${acc(.5)}`; });
}

// ---------------------------------------------------------------- 0:21 64-bit into a 16-bit box -> overflow -> $370M fireworks
function squeeze() {
  const t0 = B.old - .1, t1 = window.DUR - .4;
  const s = sc(t0, t1, { fadeIn: .3, fadeOut: .4 });
  const tg = tag(s, 'OLD CODE · REUSED FROM ARIANE 4', { x: 960, y: 120, kind: 'line', size: 28, center: true }); popIn(tg, B.old);
  // 64-bit bar
  const lb64 = txt(s, '64-BIT NUMBER', { x: 128, y: 250, size: 24, color: LIME, font: 'Geist Mono', ls: '.14em' });
  const bar = E('div', 'abs', s); css(bar, { left: 128, top: 290, width: 1664, height: 70, display: 'flex', gap: '4px', transformOrigin: '832px 35px' });
  const cells = [...Array(64)].map((_, i) => { const c = E('div', '', bar); css(c, { width: 22, height: 70, borderRadius: 5, background: i % 2 ? LIME : LIME2, boxShadow: `0 0 12px ${acc(.35)}` }); return c; });
  rise(lb64, B.b64 - .1, { y: 20 });
  cells.forEach((c, i) => TL.fromTo(c, { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: .4, ease: 'back.out(2)' }, B.old + .5 + i * .012));
  sfx('swish', B.old + .45, .8);
  TL.to(cells, { boxShadow: `0 0 22px ${acc(.8)}`, duration: .2, stagger: .004 }, B.b64);
  // 16-bit box
  const box = E('div', 'abs', s); css(box, { left: 740, top: 600, width: 440, height: 100, borderRadius: 16, border: `3px solid ${LIME}`, boxShadow: `0 0 40px -6px ${acc(.5)}`, display: 'flex', gap: '4px', padding: '12px 10px' });
  for (let i = 0; i < 16; i++) { const c = E('div', '', box); css(c, { width: 22, height: 70, borderRadius: 5, border: `1.5px dashed ${acc(.45)}` }); }
  const lb16 = txt(s, '16-BIT BOX · MAX 32,767', { x: 740, y: 724, width: 440, align: 'center', size: 24, color: MUTE, font: 'Geist Mono', ls: '.1em' });
  popIn(box, B.b16 - .05, { s: .6 }); rise(lb16, B.b16 + .15, { y: 16, sound: null });
  // squeeze
  const sq = B.boxEnd - .05;
  TL.to(bar, { y: 322, scaleX: .36, duration: .7, ease: 'power3.inOut' }, sq); sfx('whoosh', sq, .9);
  TL.to(box, { scaleX: 1.06, scaleY: .94, duration: .15, yoyo: true, repeat: 3 }, sq + .6); sfx('thud', sq + .62, .7);
  TL.to(lb64, { opacity: 0, duration: .3 }, sq);
  // overflow
  const O = B.over;
  TL.to(box, { borderColor: PINK, boxShadow: `0 0 50px -4px ${warnA(.7)}`, duration: .15 }, O - .05);
  TL.to(cells, { background: PINK, boxShadow: `0 0 12px ${warnA(.5)}`, duration: .2, stagger: .004 }, O - .05);
  const ck = E('div', 'abs', s); css(ck, { left: 740, top: 600, width: 440, height: 100, zIndex: 3 });
  ck.innerHTML = `<svg width="440" height="100" style="overflow:visible"><path d="M120 -6 L140 30 L124 52 L150 106" fill="none" stroke="${PAPER}" stroke-width="3"/><path d="M330 -6 L314 40 L338 60 L318 106" fill="none" stroke="${PAPER}" stroke-width="3"/></svg>`;
  TL.fromTo(ck, { opacity: 0 }, { opacity: 1, duration: .08 }, O + .1); sfx('impact', O + .1, .7);
  const SP = [...Array(14)].map((_, i) => { const d = E('div', 'abs', s); css(d, { left: i % 2 ? 1180 : 718, top: 615, width: 22, height: 70, borderRadius: 5, background: PINK, opacity: 0 }); return d; });
  UPD.push(t => SP.forEach((d, i) => { const k = t - O - .1 - i * .03; if (k < 0) { d.style.opacity = 0; return; }
    const dir = i % 2 ? 1 : -1, vx = dir * (120 + RND(i) * 260), vy = -260 - RND(i + 4) * 260;
    d.style.opacity = Math.max(0, 1 - k / 1.4); d.style.transform = `translate(${vx * k}px, ${vy * k + 700 * k * k}px) rotate(${dir * k * 300}deg) scale(.8)`; }));
  const ov = stamp(s, 'OVERFLOW', O + .2, { x: 1250, y: 470, size: 72, rot: -7 });
  css(ov, { background: PINK, boxShadow: `0 0 0 .07em ${INK}, 0 0 0 .12em ${PINK}, 0 20px 50px -10px ${warnA(.5)}` });
  UPD.push(t => { const k = prog(t, O, O + .6); box.style.translate = k > 0 && k < 1 ? `${Math.sin(t * 90) * 8 * (1 - k)}px 0` : '0 0'; });
  // the computer panicked (the real error chain)
  TL.to(tg, { opacity: 0, y: -20, duration: .3 }, B.comp - .4);
  const term = card(s, 470, 70, 980, 190); css(term, { borderColor: warnA(.45) });
  const L1 = txt(term, '', { x: 36, y: 30, size: 30, color: PINKT, font: 'Geist Mono' }), L2 = txt(term, '', { x: 36, y: 78, size: 30, color: PINKT, font: 'Geist Mono' }), L3 = txt(term, '', { x: 36, y: 126, size: 30, color: MUTE, font: 'Geist Mono' });
  fly(term, B.comp - .3, { from: 'far', g: .7 });
  const ce = B.around - .15, step = (ce - B.comp) / 3;
  typeText(L1, 'SRI 2 › OPERAND ERROR', B.comp, B.comp + step * .9, false);
  typeText(L2, 'SRI 1 › OPERAND ERROR', B.comp + step, B.comp + step * 1.9, false);
  typeText(L3, 'OBC › error data read as flight data', B.comp + step * 2, ce, false);
  // $370,000,000 -> fireworks
  const A = B.around;
  TL.to([bar, box, lb16, ck, ov, term], { opacity: 0, y: '+=60', filter: 'blur(10px)', duration: .4, stagger: .02 }, A - .2); sfx('whoosh', A - .2, .7);
  const ct = E('div', 'abs num', s); css(ct, { left: 0, top: 330, width: 1920, textAlign: 'center', fontSize: 190, color: PINKT, textShadow: `0 0 60px ${warnA(.35)}` });
  TL.fromTo(ct, { opacity: 0, scale: 1.4, filter: 'blur(12px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: .45, ease: 'power4.out' }, A);
  UPD.push(t => { const v = Math.round(370 * eo(prog(t, A, B.became))); ct.textContent = '$' + v + ',000,000'; });
  for (let k = 0; k < 8; k++) sfx('tick', A + (B.became - A) * k / 8, .45);
  const sub = tag(s, 'ROCKET + 4 SATELLITES · ≈ COMMONLY CITED LOSS', { x: 960, y: 570, kind: 'pink', size: 26, center: true }); popIn(sub, B.became - .3, { g: .6 });
  const F = B.fire, BU = [[470, 250, 0], [1450, 230, .22], [960, 140, .45], [300, 640, .7], [1640, 620, .85]];
  const fw = E('div', 'layer', s); css(fw, { zIndex: -1 });
  const PT = [];
  BU.forEach(([bx, by, dt], b) => { for (let i = 0; i < 34; i++) { const d = E('div', 'abs', fw); css(d, { left: 0, top: 0, width: 10, height: 10, borderRadius: '50%', background: [LIME, PINK, PAPER, LIME2][(i + b) % 4], opacity: 0 }); PT.push([d, bx, by, F + dt, i / 34 * 6.283 + b, 220 + RND(i + b * 40) * 160]); }
    sfx('impact', F + dt, .35 + .1 * (b % 2), (bx - 960) / 1200); sfx('pop', F + dt + .05, .6, (bx - 960) / 1200); });
  UPD.push(t => PT.forEach(([d, bx, by, t0, a, v]) => { const k = t - t0; if (k < 0 || k > 2.4) { d.style.opacity = 0; return; }
    d.style.opacity = Math.max(0, 1 - k / 2.2); d.style.boxShadow = `0 0 12px ${d.style.background}`;
    d.style.transform = `translate(${bx + Math.cos(a) * v * eo(cl(k / 1.2))}px, ${by + Math.sin(a) * v * eo(cl(k / 1.2)) + 60 * k * k}px)`; }));
  sfx('chime', F + .9, .6);
  const end = hd(s, 'THE NUMBER THAT *BLEW UP* A ROCKET', B.end - 1.6, { y: 760, size: 64 });
}
