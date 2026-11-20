"""voice.py - narration with Kokoro (free, offline, runs on CPU).
    <venv python> voice.py [--voice am_michael] [--speed 1.0] [--pause 0.5]
Reads voice/script_voice.txt (paragraphs separated by a blank line = a pause), writes voice/voice.wav
(48 kHz mono, -16 LUFS) and voice/voice_parts/NN.wav. Run from the project folder.
Good narrator voices: am_michael, am_onyx, am_fenrir, bm_george, bm_daniel, af_heart, bf_emma."""
import argparse, os, re, subprocess, sys, time
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

HOME = os.path.join(os.path.expanduser('~'), '.documentary-maker', 'models')
ap = argparse.ArgumentParser()
ap.add_argument('--voice', default='am_michael'); ap.add_argument('--speed', type=float, default=1.0)
ap.add_argument('--pause', type=float, default=0.5); ap.add_argument('--lang', default='en-us')
a = ap.parse_args()

src = os.path.join('voice', 'script_voice.txt')
paras = [re.sub(r'\s+', ' ', p).strip() for p in open(src, encoding='utf8').read().split('\n\n') if p.strip()]
bad = [p for p in paras if re.search(r'[\[\]{}<>]', p)]
if bad: sys.exit('Remove [tags], {placeholders} and <notes> first - the voice would read them aloud:\n  ' + bad[0][:80])
k = Kokoro(os.path.join(HOME, 'kokoro-v1.0.onnx'), os.path.join(HOME, 'voices-v1.0.bin'))
os.makedirs(os.path.join('voice', 'voice_parts'), exist_ok=True)
out, SR, t0 = [], 24000, time.time()
for i, p in enumerate(paras):
    s, SR = k.create(p, voice=a.voice, speed=a.speed, lang=a.lang)
    s = np.asarray(s, np.float32)
    nz = np.where(np.abs(s) > 0.01)[0]                      # trim silence at the edges, keep 60 ms
    if len(nz): s = s[max(0, nz[0] - int(.06 * SR)): nz[-1] + int(.12 * SR)]
    sf.write(os.path.join('voice', 'voice_parts', f'{i + 1:02d}.wav'), s, SR)
    out += [s, np.zeros(int(a.pause * SR), np.float32)]
    print(f'[{i + 1}/{len(paras)}] {len(s) / SR:.1f}s | {p[:60]}', flush=True)
raw = os.path.join('voice', '_raw.wav'); sf.write(raw, np.concatenate(out[:-1]), SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-ac', '1',
                os.path.join('voice', 'voice.wav')], check=True)
os.remove(raw)
d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join('voice', 'voice.wav')],
                         capture_output=True, text=True).stdout)
print(f'voice/voice.wav  {d:.1f}s  ({a.voice}, speed {a.speed}) made in {time.time() - t0:.0f}s')
