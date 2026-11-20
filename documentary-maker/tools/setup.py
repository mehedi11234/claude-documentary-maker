"""setup.py - one-time setup for documentary-maker. Run it with Python 3.10-3.12:
    python tools/setup.py
Creates ~/.documentary-maker/venv (kokoro-onnx, faster-whisper, numpy, soundfile), downloads the Kokoro v1.0 voice
model (Apache-2.0, ~350 MB, from the kokoro-onnx GitHub release) and GSAP (from the jsDelivr npm CDN) into the skill's
engine/vendor folder. Checks that Node, FFmpeg and Chrome/Edge are installed. Safe to run again: skips what exists."""
import os, shutil, subprocess, sys, urllib.request, venv

HOME = os.path.join(os.path.expanduser('~'), '.documentary-maker')
SK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VENV = os.path.join(HOME, 'venv')
PY = os.path.join(VENV, 'Scripts', 'python.exe') if os.name == 'nt' else os.path.join(VENV, 'bin', 'python')
MODELS = os.path.join(HOME, 'models')
KOKORO = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
GSAP = 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js'


def fetch(url, dst):
    if os.path.exists(dst) and os.path.getsize(dst) > 0: print('  have', os.path.basename(dst)); return
    print('  downloading', os.path.basename(dst), '...', flush=True)
    urllib.request.urlretrieve(url, dst + '.part'); os.replace(dst + '.part', dst)


def main():
    if sys.version_info[:2] < (3, 10) or sys.version_info[:2] > (3, 12):
        print(f'Python {sys.version.split()[0]} found. Please run this with Python 3.10, 3.11 or 3.12 '
              '(Windows: "py -3.12 tools/setup.py").'); sys.exit(1)
    os.makedirs(MODELS, exist_ok=True)
    missing = [n for n in ('node', 'ffmpeg', 'ffprobe') if not shutil.which(n)]
    if missing: print('Missing on PATH:', ', '.join(missing), '- install them and run setup again.'); sys.exit(1)
    if not os.path.exists(PY):
        print('creating venv', VENV); venv.create(VENV, with_pip=True)
    print('installing Python packages (first time takes a few minutes)')
    subprocess.run([PY, '-m', 'pip', 'install', '-q', '--disable-pip-version-check', 'kokoro-onnx', 'faster-whisper', 'numpy', 'soundfile'], check=True)
    fetch(KOKORO + 'kokoro-v1.0.onnx', os.path.join(MODELS, 'kokoro-v1.0.onnx'))
    fetch(KOKORO + 'voices-v1.0.bin', os.path.join(MODELS, 'voices-v1.0.bin'))
    os.makedirs(os.path.join(SK, 'engine', 'vendor'), exist_ok=True)
    fetch(GSAP, os.path.join(SK, 'engine', 'vendor', 'gsap.min.js'))
    r = subprocess.run(['node', os.path.join(SK, 'engine', 'capture.mjs'), 'probe'], capture_output=True, text=True)
    print('browser:', (r.stdout or r.stderr).strip().splitlines()[-1] if (r.stdout or r.stderr) else 'unknown')
    print('\nReady. Python for the tools:', PY)


if __name__ == '__main__':
    main()
