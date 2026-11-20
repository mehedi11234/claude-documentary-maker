"""render.py - stills, cue list and the final render. Run from the project folder.
    python render.py check              -> errors + missed word anchors + duration (fix all before rendering)
    python render.py stills 1.5 4 9 ... -> stills/s_*.png + stills/board_*.jpg (look at every board)
    python render.py cues               -> sfx_cues.json (then run audio.py)
    python render.py video [workers=4]  -> final.mp4: 120 fps capture, 4 sub-frames blended = motion blur, 30 fps,
                                           1920x1080, H.264 + AAC; then checks frame counts and black frames.
"""
import json, os, shutil, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

ENG = os.path.abspath('engine')
CAP = ['node', os.path.join(ENG, 'capture.mjs')]


def ev(expr):
    r = subprocess.run(CAP + ['eval', '0.5', expr], cwd=ENG, capture_output=True, text=True)
    if r.returncode: sys.exit(r.stderr[-2000:])
    return json.loads(json.loads(r.stdout.strip().splitlines()[-1]))


def check():
    d = ev('JSON.stringify({err: window.ERR || null, miss: window.MISS, dur: window.DUR, cues: SFXQ.length})')
    print(json.dumps(d, indent=1)); return d


def stills(ts):
    out = os.path.abspath('stills'); shutil.rmtree(out, ignore_errors=True)
    subprocess.run(CAP + ['stills', out, *ts], cwd=ENG, check=True, capture_output=True)
    subprocess.run([sys.executable, os.path.join(ENG, 'board.py'), out, '3'], check=True)
    print('look at', ', '.join(sorted(f for f in os.listdir(out) if f.startswith('board'))))


def cues():
    d = ev('JSON.stringify({dur: window.DUR, cues: SFXQ, err: window.ERR || null, miss: window.MISS})')
    json.dump({'dur': d['dur'], 'cues': d['cues']}, open('sfx_cues.json', 'w'))
    print('dur', d['dur'], '| cues', len(d['cues']), '| err', d['err'], '| missed', d['miss'])


def video(n):
    dur = json.load(open('sfx_cues.json'))['dur']; os.makedirs('parts', exist_ok=True)
    edges = [round(dur * i / n * 30) / 30 for i in range(n + 1)]
    def chunk(i):
        raw, mp4 = os.path.abspath(f'parts/raw{i}.mp4'), os.path.abspath(f'parts/p{i}.mp4')
        with open(f'parts/p{i}.log', 'w') as log:
            subprocess.run(CAP + ['video', f'{edges[i]:.4f}', f'{edges[i + 1]:.4f}', raw, str(9600 + i)], cwd=ENG, env={**os.environ, 'FPS': '120'}, stdout=log, stderr=log, check=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-vf', "tmix=frames=4:weights='1 1 1 1',fps=30", '-c:v', 'libx264', '-preset', 'medium',
                        '-crf', '16', '-pix_fmt', 'yuv420p', mp4], check=True)
        return int(subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', mp4],
                                  capture_output=True, text=True).stdout.strip().strip(','))
    with ThreadPoolExecutor(n) as ex: counts = list(ex.map(chunk, range(n)))
    want = [round((edges[i + 1] - edges[i]) * 30) for i in range(n)]
    for i, (c, w) in enumerate(zip(counts, want)): print(f'chunk {i}: {c} frames (want {w})' + ('' if abs(c - w) <= 1 else '  <-- RE-RUN WITH FEWER WORKERS'))
    open('parts/list.txt', 'w').write(''.join(f"file 'p{i}.mp4'\n" for i in range(n)))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'parts/list.txt', '-c', 'copy', 'parts/video.mp4'], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'parts/video.mp4', '-i', 'mix.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k',
                    '-ar', '48000', '-shortest', '-movflags', '+faststart', 'final.mp4'], check=True)
    bl = subprocess.run(['ffmpeg', '-i', 'final.mp4', '-vf', 'blackdetect=d=0.3:pix_th=0.05', '-an', '-f', 'null', '-'], capture_output=True, text=True).stderr
    blacks = [l.split('black_start:')[1].split()[0] for l in bl.splitlines() if 'black_start' in l]
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'final.mp4', '-vf', f'fps={16 / dur:.4f},scale=480:-1,tile=4x4', '-frames:v', '1', 'final_sheet.jpg'])
    print('final.mp4 done | black stretches at:', blacks or 'none', '| contact sheet: final_sheet.jpg')


if __name__ == '__main__':
    m = sys.argv[1] if len(sys.argv) > 1 else 'check'
    {'check': lambda: check(), 'stills': lambda: stills(sys.argv[2:]), 'cues': cues,
     'video': lambda: video(int(sys.argv[2]) if len(sys.argv) > 2 else 4)}[m]()
