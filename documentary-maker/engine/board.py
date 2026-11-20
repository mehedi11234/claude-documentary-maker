"""board.py <dir> [cols] - tile every s_*.png in <dir> into board_NN.jpg sheets (12 per sheet) with the time printed."""
import glob, os, sys
from PIL import Image, ImageDraw
d = sys.argv[1]; cols = int(sys.argv[2]) if len(sys.argv) > 2 else 3
fs = sorted(glob.glob(os.path.join(d, 's_*.png')))
W, H, per = 640, 360, cols * 4
for b in range(0, len(fs), per):
    chunk = fs[b:b + per]; rows = (len(chunk) + cols - 1) // cols
    im = Image.new('RGB', (W * cols, H * rows), (40, 0, 0))
    for i, f in enumerate(chunk):
        t = Image.open(f).convert('RGB').resize((W, H)); dr = ImageDraw.Draw(t)
        dr.rectangle([0, 0, 92, 24], fill=(0, 0, 0)); dr.text((6, 5), os.path.basename(f)[2:-4].lstrip('0') or '0', fill=(255, 255, 0))
        im.paste(t, ((i % cols) * W, (i // cols) * H))
    im.save(os.path.join(d, f'board_{b // per:02d}.jpg'), quality=86)
print(len(fs), 'stills')
