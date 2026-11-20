---
name: documentary-maker
description: Make a short animated 2D documentary video (30 s to 3 min) from one sentence - research with sources, a story script, a free offline voice (Kokoro), word timings (Whisper), motion-designed scenes where every animation lands on a spoken word, code-made sound effects and music, and a 1080p MP4. Use when the user asks for a documentary, an animated explainer of a true story, "make a video about <event>", or a faceless history/science/business/crime story video.
---

# documentary-maker

You are the whole film crew: researcher, writer, narrator, editor, animator, sound designer. Work through the six
chapters in order. Everything runs on the user's computer and costs nothing beyond their Claude plan.

**Tools live in this skill folder** (`<skill>` below). Python tools run with the skill's venv python:
`~/.documentary-maker/venv/Scripts/python.exe` on Windows, `~/.documentary-maker/venv/bin/python` elsewhere (`<py>`).

## 0. Setup (once)
If `~/.documentary-maker/venv` or `<skill>/engine/vendor/gsap.min.js` is missing, run `python <skill>/tools/setup.py`
(Python 3.10-3.12; on Windows `py -3.12 <skill>/tools/setup.py`). It needs Node, FFmpeg and Chrome or Edge; if one is
missing, tell the user which and stop. Then `python <skill>/tools/new_doc.py <project> <theme>` in the user's folder.

Pick the theme from the topic: `midnight` (space, science, tech), `ember` (history, business, people), `noir` (crime,
scams, mysteries), `forest` (nature, climate, health), `crimson` (war, disasters - serious tone). One accent colour
does all the highlighting; the warning colour is only for danger, money lost, deaths, failure.

## 1. Research -> facts.md
- Search the web. Every number, date, name and quote in the script must be in `facts.md` with a source URL. Prefer
  official reports, court documents, the organisation's own pages, and major newspapers over blogs.
- When sources disagree (money, death tolls), use the most-cited figure and say "about" / "around" in the script.
- Never invent a quote, a thought, a scene detail or a number. If you can't source it, leave it out.

## 2. Script -> script.md + voice/script_voice.txt
Length: about 2.4 spoken words per second (30 s ~ 75 words, 60 s ~ 145, 3 min ~ 430).
- **Open inside a moment**, not with a summary: a date, a place, an action ("June 1996. A brand new rocket sits on the
  launch pad."). The viewer must see it.
- Short sentences. One idea per sentence: each sentence becomes one animation.
- **Hold the biggest number back** for the end, and let each reveal open the next question ("The cause? Not the
  engines. Not the weather. One number.").
- End on a short line that pays off the opening.
- `script.md` = the script with a title. `voice/script_voice.txt` = the same words for the voice: numbers and symbols
  written as spoken ("nineteen ninety-six", "sixty-four bit", "three hundred seventy million dollars"), no headings,
  no [tags]; a blank line between paragraphs = a pause (paragraphs of 1-3 sentences).
- **Show the user the script and the main facts, and wait for their OK** before making the voice, unless they said
  not to ask.

## 3. Voice -> voice/voice.wav
`cd <project> && <py> voice.py --voice am_michael` (other narrators: am_onyx, am_fenrir, bm_george, bm_daniel, af_heart,
bf_emma; `--speed 0.95` for a calmer read). Kokoro runs on the CPU at about 2x real time.

## 4. Word timings -> engine/data.js
`<py> words.py`. It prints a word check; if a script word is missing or wrong, edit that paragraph (often a name:
spell it the way it sounds) and redo chapter 3. Whisper writes numbers as digits ("1996", "64-bit", "$370"), so
captions show digits; anchor animations on plain words.

## 5. Scenes -> engine/scenes.js
Read `<skill>/examples/ariane-501/scenes.js` first: it is a complete, working documentary. Write your own the same way.
- `anchors()` first: look up every beat's word times in order with `WA('word', 'alternative')` (start) and
  `WEnd(...)` (end); finish with `B.end = endAfterVoice(2.0); _wc = 0;`. Then `build()` calls one function per beat.
- **Every element lands on a spoken word.** Nothing appears before its word; the screen is never empty for more than
  about a second.
- **Draw the story, don't write it.** Inline SVG illustrations in the theme colours (rocket, building, map shape,
  coin, person silhouette, document) with camera moves (scale/translate a layer), plus kinetic headlines `hd()`,
  cards `card()` + `fly()`, `stamp()` / `warnStamp()`, `counter()`, `burst()`, `suspectCard()`, `quoteCard()`,
  `timeline()`, `dateTag()`, `typeText()`. See `engine/lib.js` and `engine/doc.js` for every helper and its options.
- Keep text short (labels, numbers, 2-4 word headlines). Captions already show every word at the bottom: keep content
  above y = 930. Set `window.KEYWORDS` to the words captions should colour.
- Label drawings that could be mistaken for real footage or documents: a small "ILLUSTRATION" tag.
- Seconds-scale motion only: no tween faster than 0.25 s, nothing that flickers.
- Use only theme colours (`LIME` = accent, `LIME2`, `PAPER`, `MUTE`, `DIM`, `CARD1`, `CARD2`, `PINK` = warning,
  `acc(a)`, `warnA(a)`, `PAPA(a)`, `MUTEA(a)`); deterministic randomness with `RND(i)`, never `Math.random()`.
- Gotchas: animate `x`/`y` with GSAP, never set a CSS transform on an element GSAP also moves; a scene `sc(t0, t1)`
  must cover every child that is still moving; don't name a variable like a helper (`rise`, `cl`, `card`...).

Check before rendering:
1. `python render.py check` -> must say `err: null` and `miss: []`.
   (Before the voice exists you can lay out scenes on fake timings: `python engine/fake_words.py`.)
2. `python render.py stills <8-24 times>` and **look at every board image**: overlaps, text cut off, empty screens,
   things appearing before their word, colours outside the theme. Fix and look again.

## 6. Sound + render -> final.mp4
```
python render.py cues        # sound-effect cue list from the scenes
<py> audio.py                # code-made SFX + original music bed under the voice, -14 LUFS -> mix.wav
python render.py video 4     # 120 fps capture -> motion blur -> 1080p30 final.mp4 (+ final_sheet.jpg)
```
Run `render.py video` in the background or with a 15-minute timeout: it takes roughly 1.5 minutes per 10 s of video with 4 workers (measured: 38 s video in 6 min on a CPU-only PC). If a chunk reports missing frames, run again with
fewer workers. Look at `final_sheet.jpg`. Then tell the user: the file, its length, what the sources are, and anything
you could not verify. Remind them to read `facts.md` before publishing, and that you can't hear the audio: their
listen is the real check.
