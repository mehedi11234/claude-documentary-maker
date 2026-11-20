"""new_doc.py <project folder> <theme> - start a documentary project.
theme: midnight | ember | noir | forest | crimson (see engine/themes/*.js for what each suits)
Creates: facts.md, script.md, voice/ (script_voice.txt goes here), engine/ (stage + theme + empty scenes.js),
voice.py, words.py, render.py, audio.py. Never overwrites an existing scenes.js, facts.md or script.md."""
import os, shutil, sys

SK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
proj, theme = os.path.abspath(sys.argv[1]), sys.argv[2] if len(sys.argv) > 2 else 'midnight'
src_theme = os.path.join(SK, 'engine', 'themes', theme + '.js')
if not os.path.exists(src_theme): sys.exit(f'unknown theme {theme}: ' + ', '.join(f[:-3] for f in os.listdir(os.path.join(SK, 'engine', 'themes'))))
if not os.path.exists(os.path.join(SK, 'engine', 'vendor', 'gsap.min.js')): sys.exit('Run setup first: python tools/setup.py')
E = os.path.join(proj, 'engine')
for d in ['engine', 'voice', 'stills', 'parts']: os.makedirs(os.path.join(proj, d), exist_ok=True)
for item in os.listdir(os.path.join(SK, 'engine')):
    if item == 'themes': continue
    s, t = os.path.join(SK, 'engine', item), os.path.join(E, item)
    shutil.copytree(s, t, dirs_exist_ok=True) if os.path.isdir(s) else shutil.copy2(s, t)
shutil.copy2(src_theme, os.path.join(E, 'theme.js'))
shutil.copy2(os.path.join(SK, 'tools', 'fake_words.py'), os.path.join(E, 'fake_words.py'))
for f in ['voice.py', 'words.py', 'render.py', 'audio.py']: shutil.copy2(os.path.join(SK, 'tools', f), os.path.join(proj, f))
files = {
    os.path.join(E, 'scenes.js'): "// scenes.js - anchors() first, then one function per beat. See the skill's examples/ for a full one.\n"
                                  "window.KEYWORDS = [];\nconst B = {};\nfunction anchors() { _wc = 0;\n  B.end = endAfterVoice(2.0); _wc = 0;\n}\nfunction build() { anchors();\n}\n",
    os.path.join(E, 'data.js'): 'window.WORDS=[["start",0.5,0.9]];\n',
    os.path.join(E, 'foot.js'): 'window.FOOT={};\n', os.path.join(E, 'logos.js'): 'window.LOGOS={};\n',
    os.path.join(proj, 'facts.md'): '# Facts\n\n| # | Fact (as said in the script) | Source (URL) | Checked |\n|---|---|---|---|\n',
    os.path.join(proj, 'script.md'): '# Script\n\n',
}
for p, body in files.items():
    if not os.path.exists(p): open(p, 'w', encoding='utf8').write(body)
print('project ready:', proj, '| theme', theme)
