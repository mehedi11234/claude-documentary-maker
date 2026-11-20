# documentary-maker: a free Claude Code skill for animated documentaries

Type one sentence into Claude Code, get a finished animated 2D documentary: researched facts with sources, a story
script, a voice, word-synced motion graphics, sound effects, music and a 1080p MP4. Everything runs on your own
computer. No ElevenLabs, no second website, no zip files to render by hand.

```
Make a thirty second documentary about the Ariane 5 rocket that exploded in 1996.
```

## What it does (six chapters)
1. **Research**: searches the web and writes every fact with its source into `facts.md`, so you can check it.
2. **Script**: a hook, short sentences, the biggest number saved for the end. It shows you the script first.
3. **Voice**: [Kokoro](https://huggingface.co/hexgrad/Kokoro-82M), a free voice model that runs offline on your CPU.
4. **Timing**: [faster-whisper](https://github.com/SYSTRAN/faster-whisper) writes down when every word is spoken.
5. **Scenes**: an HTML + [GSAP](https://gsap.com) stage where every animation lands on a spoken word. Five themes:
   `midnight`, `ember`, `noir`, `forest`, `crimson`.
6. **Sound + render**: sound effects and music made with code (nothing to license), Chrome draws every frame,
   FFmpeg stitches them into an MP4.

## You need
- [Claude Code](https://claude.com/claude-code)
- [Node.js](https://nodejs.org)
- [Python](https://www.python.org) 3.10 to 3.12
- [FFmpeg](https://ffmpeg.org)
- Chrome or Edge

## Install
1. Copy the `documentary-maker` folder into your project's `.claude/skills/` folder
   (or `~/.claude/skills/` to use it in every project).
2. Run the setup once. It makes a Python environment in `~/.documentary-maker/`, downloads the Kokoro voice model
   and GSAP, and checks Node, FFmpeg and Chrome:
   ```
   python .claude/skills/documentary-maker/tools/setup.py
   ```
   On Windows with several Pythons: `py -3.12 .claude/skills/documentary-maker/tools/setup.py`
3. Open Claude Code in that folder and ask for a documentary.

## Good to know
- **Check the facts** in `facts.md` before you upload. Claude can be wrong; that's why every source is written down.
- **Every run uses part of your Claude plan.** A 30-second documentary took about 19 minutes in our test.
- **Don't flood your channel.** YouTube can stop paying channels that upload mass-produced, repetitive videos.
  Use this to tell your stories faster, not to stop telling them.
- The voice is English. Rendering is CPU-heavy: roughly 1.5 minutes per 10 seconds of video with 4 workers.

## Credits and licences
- This skill's code: MIT (see `LICENSE`).
- Kokoro model: Apache-2.0, downloaded by `setup.py` from [kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx).
- GSAP: downloaded by `setup.py` from jsDelivr, under GSAP's own licence (https://gsap.com/standard-license).
- Fonts in `engine/fonts` (Space Grotesk, Inter, Geist Mono and others from Google Fonts): SIL Open Font License.

Made for the AI Tech YouTube channel.
