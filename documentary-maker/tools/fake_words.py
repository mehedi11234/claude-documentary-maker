"""fake_words.py - placeholder word timings from the voice script (2.5 words/s, 0.45 s paragraph pauses),
so scenes can be laid out before the real voice exists. Real timings come from words.py."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
paras = [p.split() for p in open(os.path.join(HERE, '..', 'voice', 'script_voice.txt'), encoding='utf8').read().split('\n\n') if p.strip()]
t, out = 0.5, []
for p in paras:
    for w in p:
        d = 0.27 + 0.035 * len(w)
        out.append([w, round(t, 3), round(t + d * .9, 3)])
        t += d + (0.18 if w[-1] in ',.?!:' else 0)
    t += 0.45
open(os.path.join(HERE, 'data.js'), 'w', encoding='utf8').write('window.WORDS=' + json.dumps(out) + ';\n')
print(len(out), 'words', round(t, 1), 's')
