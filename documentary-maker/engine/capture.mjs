// capture.mjs (documentary-maker) - deterministic frame capture of stage.html in headless Chrome (CDP over WebSocket).
// node capture.mjs video <t0> <t1> <out.mp4> [port]      -> H.264 chunk, 30 fps, 1920x1080
// node capture.mjs stills <outdir> <t> [t ...]            -> PNG stills
// The page exposes window.seek(t) (returns a promise once fonts, footage frames and layout are ready).
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
import { existsSync } from 'node:fs';
const CHROME = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(p => p && existsSync(p));
if (!CHROME) { console.error('No Chrome/Edge found: set the CHROME environment variable to its path.'); process.exit(2); }
if (process.argv[2] === 'probe') { console.log('found ' + CHROME); process.exit(0); }
const FPS = +(process.env.FPS || 30), W = 1920, H = 1080; // FPS=120 -> sub-frames for motion blur
const [mode, ...args] = process.argv.slice(2);
const port = mode === 'video' ? +(args[3] || 9301) : 9300 + Math.floor(Math.random() * 90);
const prof = path.join(os.tmpdir(), 'html-engine-chrome', String(port));
rmSync(prof, { recursive: true, force: true }); mkdirSync(prof, { recursive: true });

const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`,
  `--window-size=${W},${H}`, '--hide-scrollbars', '--disable-gpu', '--force-device-scale-factor=1', '--allow-file-access-from-files',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--mute-audio', '--no-first-run',
  '--force-color-profile=srgb', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let tgt;
for (let i = 0; i < 100 && !tgt; i++) {
  await sleep(150);
  try { tgt = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page'); } catch { }
}
const ws = new WebSocket(tgt.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const cdp = (method, params = {}) => new Promise((res, rej) => {
  const i = ++id; pend.set(i, m => m.error ? rej(new Error(method + ': ' + m.error.message)) : res(m.result));
  ws.send(JSON.stringify({ id: i, method, params }));
});
await cdp('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await cdp('Runtime.enable');
await cdp('Page.enable');
await cdp('Page.navigate', { url: pathToFileURL(path.join(HERE, 'stage.html')).href });
for (let i = 0; i < 200; i++) {
  const r = await cdp('Runtime.evaluate', { expression: 'window.READY===true', returnByValue: true });
  if (r.result.value) break; await sleep(100);
  if (i === 199) throw new Error('stage never became READY');
}
const err = await cdp('Runtime.evaluate', { expression: 'window.ERR||""', returnByValue: true });
if (err.result.value) console.error('STAGE ERROR:', err.result.value);

async function frame(t, fmt) {
  const r = await cdp('Runtime.evaluate', { expression: `window.seek(${t})`, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error('seek ' + t + ': ' + JSON.stringify(r.exceptionDetails).slice(0, 400));
  for (let k = 0; ; k++) {
    try {
      const s = await cdp('Page.captureScreenshot', fmt === 'png' ? { format: 'png' } : { format: 'jpeg', quality: 94, optimizeForSpeed: true });
      return Buffer.from(s.data, 'base64');
    } catch (e) { if (k >= 4) throw e; console.error('retry screenshot', t, e.message); await sleep(500); }
  }
}

if (mode === 'eval') {
  await frame(+args[0], 'jpeg');
  const r = await cdp('Runtime.evaluate', { expression: args[1], returnByValue: true });
  console.log(JSON.stringify(r.result.value ?? r));
} else if (mode === 'stills') {
  const [outdir, ...ts] = args; mkdirSync(outdir, { recursive: true });
  for (const t of ts) {
    writeFileSync(path.join(outdir, `s_${(+t).toFixed(2).padStart(7, '0')}.png`), await frame(+t, 'png'));
    console.log('still', t);
  }
} else {
  const [t0, t1, out] = [+args[0], +args[1], args[2]];
  const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS),
    '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n0 = Math.round(t0 * FPS), n1 = Math.round(t1 * FPS), st = Date.now();
  for (let n = n0; n < n1; n++) {
    const buf = await frame(n / FPS, 'jpeg');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((n - n0) % 150 === 0) console.log(`${out} ${n - n0}/${n1 - n0} ${((n - n0) / ((Date.now() - st) / 1000 + 1e-3)).toFixed(1)} fps`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log('done', out, n1 - n0, 'frames in', ((Date.now() - st) / 1000).toFixed(0), 's');
}
ws.close(); chrome.kill();
process.exit(0);
