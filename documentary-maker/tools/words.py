"""words.py - when is every word spoken? Whisper (faster-whisper, CPU) on voice/voice.wav -> engine/data.js
(WORDS = [[word, start, end], ...] in video seconds; narration starts at 0.5 s), then checks the voice against
voice/script_voice.txt and prints missing/added words. Run from the project folder with the venv python.
Whisper writes numbers as digits ("1996", "64-bit", "$370"): captions show them like that, and scenes should anchor on
plain words next to numbers."""
import difflib, json, os, re, subprocess, wave
import numpy as np
from faster_whisper import WhisperModel

OFF = 0.5
tmp = os.path.join('voice', '_16k.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join('voice', 'voice.wav'), '-ar', '16000', '-ac', '1', tmp], check=True)
with wave.open(tmp) as w: a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
os.remove(tmp)
seg, _ = WhisperModel('small.en', compute_type='int8').transcribe(a, word_timestamps=True, language='en', beam_size=5)
W = []
for s in seg:
    for x in s.words:
        t = x.word.strip()
        if not t: continue
        if (t.startswith('-') or t in ('%',)) and W: W[-1][0] += t; W[-1][2] = round(x.end + OFF, 3); continue   # "64" "-bit" -> "64-bit"
        W.append([t, round(x.start + OFF, 3), round(x.end + OFF, 3)])
open(os.path.join('engine', 'data.js'), 'w', encoding='utf8').write('window.WORDS=' + json.dumps(W) + ';\n')

# check against the script (numbers normalised: Whisper's digits vs spelled words are not errors)
NUM = {'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10'}
nz = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())
script = [nz(w) for w in open(os.path.join('voice', 'script_voice.txt'), encoding='utf8').read().split() if nz(w)]
heard = [nz(w[0]) for w in W if nz(w[0])]
sm = difflib.SequenceMatcher(None, script, heard, autojunk=False)
issues = []
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op == 'equal': continue
    sw, hw = ' '.join(script[i1:i2]), ' '.join(heard[j1:j2])
    if any(c.isdigit() for c in hw) or all(w in NUM for w in sw.split()): continue      # number written differently
    if op == 'delete' and sw in ('dollars', 'dollar', 'percent', 'euros', 'pounds'): continue   # '$370' / '40%' hold that word
    issues.append(f'  {op:7s} script: "{sw}"  heard: "{hw}"  (near {W[min(j1, len(W) - 1)][1]:.1f}s)')
print(f'{len(W)} words timed -> engine/data.js | voice ends {W[-1][2]:.1f}s')
print('word check:', 'OK, every script word is there' if not issues else f'{len(issues)} differences (listen there, remake that paragraph if a word is wrong):')
print('\n'.join(issues))
