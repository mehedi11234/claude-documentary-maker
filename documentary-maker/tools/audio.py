"""audio.py (documentary-maker) - all sound made with code, nothing to license:
SFX synthesized from the stage's cue list (sfx_cues.json), an original music bed, ducked under the voice, -14 LUFS.
Inputs: voice/voice.wav, sfx_cues.json, DUR from cues file. Output: mix.wav"""
import json, os, subprocess, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SR, OFF = 48000, 0.5
C = json.load(open(os.path.join(HERE, 'sfx_cues.json')))
DUR = C['dur']; CUES = C['cues']
N = int(SR * DUR)
rng = np.random.default_rng(5)


def tt(d): return np.arange(int(SR * d)) / SR
def norm(x): return x / (np.abs(x).max() + 1e-9)
def onepole(x, fc):
    fc = np.broadcast_to(np.asarray(fc, float), x.shape); a = 1 - np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s += a[i] * (x[i] - s); y[i] = s
    return y
def fft_lp(x, fc, order=2):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / np.sqrt(1 + (f / fc) ** (2 * order)); return np.fft.irfft(X, len(x))
def fft_hp(x, fc, order=2):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / np.sqrt(1 + (fc / np.maximum(f, 1)) ** (2 * order)); return np.fft.irfft(X, len(x))
def bandnoise(n, lo, hi): x = rng.standard_normal(n); return onepole(x, hi) - onepole(x, lo)

# ---------------------------------------------------------------- SFX makers (same family as the approved intro)
def whoosh(d=.6, lo=250, hi=3200, peak=.6):
    n = int(SR * d); p = np.linspace(0, 1, n); sh = np.where(p < peak, p / peak, (1 - p) / (1 - peak))
    x = onepole(rng.standard_normal(n), lo + (hi - lo) * sh ** 1.6); x = x - onepole(x, 120); return norm(x) * sh ** 2.2
def riser(d=1.0):
    n = int(SR * d); p = np.linspace(0, 1, n); air = norm(onepole(rng.standard_normal(n), 180 * (6500 / 180) ** (p ** 1.4))) * p ** 2.4
    tone = np.sin(2 * np.pi * np.cumsum(70 * (260 / 70) ** p) / SR) * p ** 3 * .35; o = air + tone; o[-1440:] *= np.linspace(1, 0, 1440); return o
def key():
    t = tt(.045); n = len(t)
    return (np.sin(2 * np.pi * (2300 + 500 * rng.random()) * t) * np.exp(-t / .004) * .25 + norm(bandnoise(n, 1500, 7000)) * np.exp(-t / .006) * .6
            + np.sin(2 * np.pi * (170 + 30 * rng.random()) * t) * np.exp(-t / .012) * .45) * (.75 + .25 * rng.random())
def click():
    t = tt(.16); n = len(t)
    o = np.sin(2 * np.pi * 1750 * t) * np.exp(-t / .006) * .5 + bandnoise(n, 1200, 6000) * np.exp(-t / .004) * 4 + np.sin(2 * np.pi * (220 * np.exp(-t * 30) + 90) * t) * np.exp(-t / .03) * .8
    k = int(SR * .075); o[k:] += np.sin(2 * np.pi * 2400 * t[:n - k]) * np.exp(-t[:n - k] / .004) * .3; return o
def pop(f0=900, f1=320, d=.11):
    t = tt(d); return np.sin(2 * np.pi * np.cumsum(f1 + (f0 - f1) * np.exp(-t * 28)) / SR) * np.minimum(1, t / .002) * np.exp(-t / .035)
def tick():
    t = tt(.03); return (np.sin(2 * np.pi * 3200 * t) * .5 + norm(bandnoise(len(t), 3000, 9000)) * .5) * np.exp(-t / .005)
def thud():
    t = tt(.4); return np.sin(2 * np.pi * np.cumsum(50 + 90 * np.exp(-t * 16)) / SR) * np.exp(-t / .1) + norm(onepole(rng.standard_normal(len(t)), 900)) * np.exp(-t / .02) * .3
def impact():
    t = tt(1.6); n = len(t)
    sub = np.sin(2 * np.pi * np.cumsum(45 + 110 * np.exp(-t * 14)) / SR) * np.exp(-t / .28)
    crack = norm(onepole(rng.standard_normal(n), 2500)) * np.exp(-t / .03) * .5; sh = np.zeros(n)
    for _ in range(14):
        f = 2000 + 4500 * rng.random(); k = int(rng.random() * .12 * SR); tk = t[:n - k]; sh[k:] += np.sin(2 * np.pi * f * tk) * np.exp(-tk / (.25 + .4 * rng.random())) * .06
    return sub * .9 + crack + sh
def hum(d):
    t = tt(d); pad = sum(a * np.sin(2 * np.pi * f * t + ph) for f, a, ph in ((110, .5, 0), (164.8, .35, 1), (220, .3, 2), (329.6, .18, 3)))
    return pad * (.75 + .25 * np.sin(2 * np.pi * 1.66 * t)) * np.minimum(1, t / .3) * np.minimum(1, (d - t) / .25)
def chime():
    t = tt(2.0); o = np.zeros(len(t))
    for j, f in enumerate((659.3, 830.6, 987.8)):
        k = int(j * .05 * SR); tk = t[:len(t) - k]; o[k:] += (np.sin(2 * np.pi * f * tk) + .3 * np.sin(2 * np.pi * f * 2.76 * tk) * np.exp(-tk / .2)) * np.minimum(1, tk / .004) * np.exp(-tk / .6)
    return o
MAKE = {'whoosh': whoosh, 'swish': lambda: whoosh(.3, 500, 4200, .65), 'riser': riser, 'key': key, 'click': click, 'pop': pop, 'tick': tick,
        'thud': thud, 'impact': impact, 'chime': chime}
LEVEL = {'whoosh': .085, 'swish': .05, 'riser': .11, 'key': .045, 'click': .1, 'pop': .07, 'tick': .04, 'thud': .12, 'impact': .17, 'hum': .05, 'chime': .06}

L = np.zeros(N); R = np.zeros(N); last = {}
def put(sig, t, g, pan):
    i = int(t * SR)
    if i < 0: sig, i = sig[-i:], 0
    if i >= N: return
    sig = sig[:N - i] * g; a = (pan + 1) * np.pi / 4
    L[i:i + len(sig)] += sig * np.cos(a); R[i:i + len(sig)] += sig * np.sin(a)
cache = {}
for c in sorted(CUES, key=lambda c: c[1]):
    kind, t, g, pan = c[0], c[1], c[2], c[3]
    if kind != 'key' and t - last.get(kind, -9) < .12: continue        # no machine-gun repeats
    last[kind] = t
    if kind == 'hum': s = hum(max(.4, c[4]))
    elif kind in ('key', 'click'): s = MAKE[kind]()                   # every key a little different
    else:
        if kind not in cache: cache[kind] = MAKE[kind]()
        s = cache[kind]
    if kind in ('whoosh', 'swish'): t -= len(s) / SR * .35            # the swell lands on the cue
    put(s, t, LEVEL[kind] * g, pan)
# light room reverb on the SFX
def conv(x, ir):
    m = len(x) + len(ir); nfft = 1 << (m - 1).bit_length(); return np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[:len(x)]
irt = tt(1.0); irL = rng.standard_normal(len(irt)) * np.exp(-irt / .25); irR = rng.standard_normal(len(irt)) * np.exp(-irt / .25)
irL[:600] = 0; irR[:820] = 0
wl, wr = conv(L, irL), conv(R, irR); g = .14 * np.abs(L).max() / (np.abs(wl).max() + 1e-9)
SFX = np.stack([L + wl * g, R + wr * g], 1)

# ---------------------------------------------------------------- original music bed: 100 BPM, Am9 - Fmaj7 - C - G6
BPM = 100; beat = 60 / BPM; bar = 4 * beat
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
CH = [[45, 52, 55, 59, 60, 64], [41, 48, 52, 57, 60, 64], [48, 52, 55, 62, 64, 67], [43, 50, 55, 59, 62, 64]]
t = np.arange(N) / SR
pad = np.zeros(N); bass = np.zeros(N); hat = np.zeros(N); pl = np.zeros(N)
seg = 2 * bar
for ci in range(int(DUR / seg) + 2):
    a, b = ci * seg - .6, (ci + 1) * seg + .6; i0, i1 = max(0, int(a * SR)), min(N, int(b * SR))
    if i0 >= i1: continue
    tk = t[i0:i1]; e = np.clip((tk - a) / 1.2, 0, 1) * np.clip((b - tk) / 1.2, 0, 1); chd = CH[ci % 4]
    for m in chd[1:]:
        f = hz(m + 12 if m < 50 else m)
        for det in (-.6, .6): pad[i0:i1] += e * (np.sin(2 * np.pi * (f + det) * tk) + .12 * np.sin(4 * np.pi * (f + det) * tk)) * .18
    root = hz(chd[0] - 12 if chd[0] > 44 else chd[0])
    for k in range(16):                                               # 8th-note sub pulse
        st = ci * seg + k * beat / 2
        j0 = int(st * SR); m = int(SR * .22)
        if 0 <= j0 < N:
            tj = np.arange(min(m, N - j0)) / SR; bass[j0:j0 + len(tj)] += np.sin(2 * np.pi * root * tj) * np.exp(-tj / .09) * (1 if k % 2 == 0 else .55)
    for k in range(8):                                                # soft pluck on the off-beats
        st = ci * seg + k * beat + beat / 2; j0 = int(st * SR); m = int(SR * .5)
        if 0 <= j0 < N:
            f = hz(chd[[3, 4, 5, 4][k % 4]] + 12); tj = np.arange(min(m, N - j0)) / SR
            pl[j0:j0 + len(tj)] += (np.sin(2 * np.pi * f * tj) + .35 * np.sin(4 * np.pi * f * tj)) * np.exp(-tj / .12) * .22
for k in range(int(DUR / (beat / 2)) + 1):                            # closed hats on 8ths
    j0 = int(k * beat / 2 * SR); m = int(SR * .04)
    if j0 < N: hat[j0:j0 + m] += rng.standard_normal(min(m, N - j0)) * np.exp(-np.arange(min(m, N - j0)) / SR / .008) * (.5 if k % 2 else .25)
hat = fft_hp(hat, 7000)
pad = fft_lp(pad, 2400)
mus = pad * .9 + bass * .55 + pl * .5 + hat * .12
mus *= np.clip(t / 2.0, 0, 1) * np.clip((DUR - t) / 2.5, 0, 1)
mus = norm(mus) * .5
MUS = np.stack([mus, mus], 1)

def wav(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(path, 'w') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype('<i2').tobytes())
wav(os.path.join(HERE, 'sfx.wav'), SFX); wav(os.path.join(HERE, 'music.wav'), MUS)

voice = os.environ.get('VOICE') or os.path.join(HERE, 'voice', 'voice.wav')
o = int(OFF * 1000)
graph = (f'[0:a]aresample=48000,aformat=channel_layouts=stereo,adelay={o}|{o},apad=whole_dur={DUR:.2f},asplit=2[v][vk];'
         '[2:a]volume=0.11[m0];[m0][vk]sidechaincompress=threshold=0.02:ratio=8:attack=30:release=500[m];'
         '[v][1:a][m]amix=inputs=3:normalize=0:duration=first[out]')
ff = lambda *a, **k: subprocess.run(['ffmpeg', '-hide_banner', '-v', 'error', '-y', *a], check=True, **k)
ff('-i', voice, '-i', os.path.join(HERE, 'sfx.wav'), '-i', os.path.join(HERE, 'music.wav'), '-filter_complex', graph, '-map', '[out]', '-t', f'{DUR:.3f}', '-c:a', 'pcm_s16le', os.path.join(HERE, 'premix.wav'))
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', os.path.join(HERE, 'premix.wav'), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
js = json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1])
ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
      f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
ff('-i', os.path.join(HERE, 'premix.wav'), '-af', ln + ',aresample=48000', '-ar', '48000', '-c:a', 'pcm_s16le', os.path.join(HERE, 'mix.wav'))
print('cues', len(CUES), '| premix', js['input_i'], 'LUFS -> mix.wav -14 LUFS')
