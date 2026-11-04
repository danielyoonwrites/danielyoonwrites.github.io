# SPEC: Video editor

A little app at https://danielyoonwrites.github.io/video-editor (folder `video-editor/` in the website repository; the name is the owner's choice). Planned with the owner, November 2, 2026, after Claude's research on how hard it would be (his Notion page "Simple video editor: how hard to build (Nov 2026)").

## Who it's for

Just the owner, on his Android phone in Chrome (his choice "A", November 2, 2026). Not iPhones or other people for now: two tools it needs work differently in Safari ("Tech notes"). Since November 3, 2026 it's on the website's Projects page with a link anyone can open (his "A", pull request PULL_REQUEST_NUMBER), with a line saying it's made for an Android phone in Chrome; it's still built and checked only for his phone.

## What it is

A simple video editor that does a few things well. In his words: "It's not trying to do everything, just simple things well. Like applying a filter, changing lighting, adding text, arranging video order, cropping video, speeding up or slowing down. It doesn't need an add music button or anything copyrighted, and it doesn't need AI added. I just want a simple one that can do the basic things but make them easy to use."

Everything happens on the phone: the videos are never uploaded. It's the owner's next learning app, a step harder than Idea board.

Added later, in his words (November 2, 2026): "make sure the videos that are created can be used for Instagram, TikTok, and Youtube Shorts" (see "Made for Instagram, TikTok and YouTube Shorts"); "can I have the filters a bit more Korean, like fitting Korean aesthetics and lighting, and color styles?" (see "The looks"); and "can you also create a part of the app to help with audio as well? Like maybe making the audio better" (build step 5, "Better sound").

## How it works (version 1, Claude's plan; the owner can change any of it)

As built so far, one clip's edits live as tabs on one "Edit" screen instead of separate screens (see "Built so far" below); the screens here are the first plan, kept for the steps still to build.

The video plays at the top of each screen, showing the edits as it plays. One step per screen:

1. Clips: "Add videos" picks one or more videos from the phone. They show as a list in order, each with a small picture and its length. ↑ and ↓ move a clip; tap a clip to open it.
2. A clip, on its own screen: trim (where it starts and ends), speed (0.5×, 1×, 1.5× or 2×) and which part shows in the frame (the crop).
3. Look, for the whole video: the shape (tall 9:16 for Reels, square or wide), a filter (a few ready-made ones) and lighting (brightness and contrast).
4. Text: type a line, put it at the top, middle or bottom, and choose when it shows.
5. Make the video: a progress bar, then "Save to phone" and "Share." The screen stays on while it works, and "Stop" cancels.

Trimming wasn't on the owner's list; Claude suggested it: cutting off a clip's start or end, like the moment of reaching for the phone (built in build step 4).

Built so far (build steps 3 to 5, Claude's design, shown to the owner in screenshots): Start ("Choose a video") → "Edit" (called "The look" until build step 4; the video plays at the top, without sound until you turn it on; five tabs under it, Filter, Lighting, Sound, Trim and Speed (the owner's order, November 3, 2026), opening on Filter; "Make the video" stays at the bottom) → "Making the video" (a progress bar and "Stop") → "Your video" (it plays; a line saying whether it meets Instagram's, TikTok's and YouTube Shorts' upload rules, with "What was checked" folded under it; "Save to phone," "Share" and "Start a new video"). The phone's Back button goes back one screen; Back while a video is being made stops it.
- Trim (pull request 125): "Your clip: 4.0 seconds" at the top; "Start here" and "End here" set the start or the end to the moment that's playing; Start and End sliders move in tenths of a second (shown like 0:02.5); "Reset the trim." On the Trim tab the whole video plays, so new points are easy to find; on the other tabs only the trimmed part plays, over and over. A clip is at least half a second long.
- Speed (pull request 125): 0.5× (half speed), 1× (normal), 1.5× (faster) and 2× (double speed), with the new video's length under them ("The new video: 2.0 seconds long"). The sound speeds up or slows down with the video, like a tape, so faster sounds higher (the owner's "b"); the playing video sounds the same way.
- The looks (pull request 116, the owner's "a"): Original (원본), the six Korean looks Milky (우유빛), Peach (복숭아), Soft glow (뽀샤시), Café (카페), Clear (맑음) and Film (필름), and Black and white (흑백). Each shows its English name with the Korean word under it. See "The looks."
- The lighting: Brightness and Contrast, from −50 to +50 in steps of 5, with "Reset the lighting."
- The sound (pull request 129, the owner's "B"): three switches, each a row with what it does under its name, all off at first: "Cut rumble" (wind, traffic and bumps from holding the phone), "Clearer voice" (brings voices forward and takes out boominess) and "Even out the volume" (quiet words louder, loud moments softer); a Volume slider from Off (0%) to 200% in steps of 10; "Reset the sound." The playing video sounds the same way as the new video will. A video without sound says "This video has no sound." See "Tech notes," "Better sound."
- The look is one CSS filter (a Korean look is `url(#look-...)`, an SVG filter in `index.html`): the playing video shows it, and each frame of the new video is drawn with the same filter, so what you see is what you get. The saved checks compare the two for Milky and Peach (within 12 of 255).

## Must-haves

- Phone first: buttons at least 48 by 48, one step per screen, and the phone's Back button (<) goes back one step.
- The original videos are never changed: the app only reads them and makes a new file.
- Private: the videos stay on the phone.
- Clear while waiting: a progress bar while the video is made, and a way to stop.
- Handles 1 to 3 minute videos, the length the owner plans for his short videos. Longer is a bonus.

## Not in version 1 (ideas for later)

- Music, sound effects, a voice-over (no music button, the owner's words).
- AI of any kind (the owner's words), like automatic captions.
- Fades between clips, stickers, moving text.
- iPhones and other browsers.
- Keeping an unfinished edit after Chrome closes (open question 5).
- Turning down a steady hiss, like a fan or an air conditioner (Claude's suggestion to leave for later, November 3, 2026: without AI it helps only some, it's the most work, and pushed too far it makes voices sound watery). Other people talking or music in the background can't be removed without AI.

## Privacy and safety

- The videos never leave the phone: Chrome reads them and writes the new file on the phone. Nothing goes to a server, an AI or anyone else. The app's code is public; the videos never touch the repository.
- The new video carries none of the original's hidden details, like where it was filmed: Mediabunny copies the original's tags unless told not to, so every copy is made with `tags: {}`. Checked in build step 2: a test video's location doesn't reach the copy.
- Screenshots and checks use made-up test videos, never the owner's own videos, and never his kids.

## The look

Dark (the owner's choice "A", November 2, 2026): a near-black page with light words and light buttons, so the video stands out. Claude's reason, given with the options: a bright page around a video can make the video look darker than it really is, which matters when adjusting lighting. The colors are at the top of `style.css`; their contrast is checked in `tests/app-test.mjs` (words at least 4.5 to 1, button edges and the focus ring at least 3 to 1). System fonts, so nothing loads from outside.

## The looks (Korean styles)

The owner asked for looks that fit "Korean aesthetics and lighting, and color styles," and chose "a" (November 2, 2026): six Korean looks in place of the first filters, plus Original and Black and white.

What Korean-style looks have in common, as Korean filter apps and preset sellers describe them (seen only in search results, November 2, 2026; apps.apple.com, capcut.com and gridfiti.com are blocked from Claude's session; most sources are sales pages, so this is a popular style, not a formal definition): bright and airy; soft, low contrast; gently muted pastel colors; a slightly warm or "milky" white, often with soft pink in the highlights; brightened, smooth-looking skin. Search results: https://www.capcut.com/explore/korean-filter, https://apps.apple.com/app/id6741474933 (BerryFilm), https://r1.community.samsung.com/t5/camcyclopedia/필터/ba-p/31379164 (Samsung's own camera filters such as 화사한 Sunbeam and 맑은 Crystal), https://gridfiti.com/korean-preset-lightroom/. Research notes: Dan's Notion page "Simple video editor: how hard to build (Nov 2026)."

The six looks (Claude's design, tuned on a made-up test scene; the numbers are in the SVG filters near the top of `index.html`):
- Milky (우유빛): brighter middle tones, darks lifted to about 13% (a milky softness), a touch of pink-white, colors muted to 85%.
- Peach (복숭아): a little brighter, with red and a warm lift mixed in, so skin and whites turn peach-pink.
- Soft glow (뽀샤시): brighter and softer, with a glow: a blurred copy laid over with "screen," at 45%. The blur is 1.2% of the picture's width, set by `setGlowFor()` in `app.js`, so the glow looks the same on the small preview and in the full-size video.
- Café (카페): a quarter of the way to sepia, darks lifted, cream-warm whites, colors at 88%.
- Clear (맑음): a little brighter and cooler, with a hint of mint in the shadows.
- Film (필름): faded blacks with a green tint, warm highlights that roll off below white, colors at 88%.

A separate project, Photo Filters (`photo-filters/`, planned November 2, 2026 in another session), makes looks for photos; whether the two apps share looks can be decided later.

How they're made: SVG filters (feComponentTransfer, feColorMatrix, and for the glow feGaussianBlur and feBlend) work on the playing video (a CSS filter) and on a normal canvas (Claude's test, November 2, 2026), but not on an OffscreenCanvas, so each frame is drawn on a normal canvas. The playing video on "Edit" (called "The look" until build step 4) is exactly the size of its picture, so a look that lifts the darks doesn't turn black bars gray. Brightness and Contrast still go on top of any look.

## Made for Instagram, TikTok and YouTube Shorts

The owner, November 2, 2026: "make sure the videos that are created can be used for Instagram, TikTok, and Youtube Shorts."

Their upload rules, as found on November 2, 2026. The official pages couldn't be opened from Claude's session (developers.facebook.com, developers.tiktok.com, help.instagram.com and support.google.com are blocked), so each was seen only in search results:
- Instagram (Meta's Instagram Platform reference, "Reel specifications," for videos posted through Meta's tools: https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media): MP4 or MOV, no edit lists, the moov box at the front; AAC sound at 48 kHz at most, mono or stereo, 128 kbps; H.264 or HEVC, progressive, closed GOP, 4:2:0; 23 to 60 frames a second; at most 1920 pixels wide; 9:16 recommended; at most 25 Mbps; 3 seconds to 15 minutes; at most 300 MB. Instagram's help (https://help.instagram.com/225190788256708): reels can be up to 20 minutes, but reels over 3 minutes won't be recommended to new audiences.
- TikTok (TikTok for Developers, Media Transfer Guide: https://developers.tiktok.com/docs/en/content-posting-api-media-transfer-guide): MP4 (recommended), WebM or MOV; H.264 (recommended), H.265, VP8 or VP9; 23 to 60 frames a second; each side 360 to 4096 pixels; all creators can post 3-minute videos (some 5 or 10); at most 4 GB.
- YouTube Shorts (YouTube Help, "Understand three-minute YouTube Shorts": https://support.google.com/youtube/answer/15424877): a square or vertical video up to 3 minutes is a Short. YouTube's "Recommended upload encoding settings" (https://support.google.com/youtube/answer/1722171): MP4, no edit lists, the moov box at the front; H.264 High Profile, progressive, closed GOP; AAC-LC (or Opus) sound, stereo, 48 kHz.

What every new video is made like (the `OUTPUT` settings at the top of `app.js`):
- MP4, with the file's details (the moov box) at the front; H.264 (High Profile in Claude's test browser), progressive, 4:2:0.
- At most 1920 pixels on its longest side, so a tall video is 1080 by 1920.
- A steady frame rate: the original's, rounded, between 24 and 60.
- The picture's data rate: 8 Mbps for 1080 by 1920 at 30 frames a second, 10 Mbps at 60, less for smaller videos, so a 3-minute video stays under 300 MB.
- AAC sound, 48 kHz, stereo, 128 kbps, made fresh every time.
- None of the original's tags (no location).

After each video is made, "Your video" reads it back and checks it against these rules: the file and its picture, the sound, the shape (tall 9:16 is best; wide isn't a Short), the size, the frame rate, the length (3 seconds to 3 minutes), the file size (300 MB), the data rate (25 Mbps), the details at the front, and no location. A line for Claude names the codec, the color tags and the edit lists.

Known differences, to settle with real uploads (the owner's check in build step 3): Mediabunny writes one edit list, on the sound track, to skip the AAC encoder's first 1,024 samples (21 thousandths of a second at 48 kHz), and it has no setting to leave it out; ffmpeg's own MP4 files have the same kind by default (checked November 2, 2026). In Claude's test browser the picture is tagged full-range color (bt709 primaries, sRGB transfer); what the owner's phone makes shows in the line for Claude.

## Tech notes (Claude's plan; the owner can change any of it)

Browser support below is from MDN's browser-compat-data on GitHub, read November 2, 2026 (https://github.com/mdn/browser-compat-data).

- Plain HTML, CSS and JavaScript in this folder, with no build tools (the website's rule, kept on November 2, 2026, after the owner asked about it; root `DECISIONS.md`). File links end in a `?v=` number (5 for `app.js` and `style.css` after the tabs' new order), raised whenever a file changes.
- Mediabunny reads and writes the video files: free (MPL-2.0), version 1.65.0 published October 30, 2026, first published June 16, 2025 (the npm registry, https://registry.npmjs.org/mediabunny). Its whole library is one ready-made file, `dist/bundles/mediabunny.min.cjs` in its npm package, saved as `lib/mediabunny.min.js` (renamed so the website sends it as JavaScript; `lib/README.md`), about 0.7 MB (723,317 bytes; about 186 KB compressed, measured by Claude on November 3, 2026). It's saved in `video-editor/lib/` with its license and a link to its source (https://github.com/Vanilagy/mediabunny), and loaded with a plain `<script>` tag, which gives the page a global `Mediabunny` (build step 2; modules would need an import map, which the page's safety rule blocks). Its docs say it can be included "directly with a script tag." Saved in the folder rather than loaded from a CDN: Claude's session couldn't reach jsDelivr or unpkg to test (November 2, 2026), and the page can then run only its own scripts (a Content-Security-Policy like Idea board's).
- The browser's video tools that Mediabunny uses (WebCodecs): Chrome 94 and later, on Android too.
- Preview while it plays: the video with CSS filters (brightness, contrast, saturate, grayscale, sepia; Chrome 53 and later) and `playbackRate` for the speed. Chrome normally keeps the voice's pitch at other speeds while playing; the app turns that off (`preservesPitch`, Chrome 86 and later), so the preview sounds like the new video. Text and the crop frame are page boxes over the video.
- Making the video, frame by frame (built in pull request 125; build step 3 used Mediabunny's one-step `Conversion`, which can trim but has no speed setting, per its type notes in version 1.65.0, `dist/mediabunny.d.ts`): the new video has a steady frame rate, and its frame number k shows the moment start + (k ÷ frame rate) × speed of the original. Mediabunny's `CanvasSink` reads those moments (`canvasesAtTimestamps`), turned upright and sized for the new video; the app draws each one on a normal canvas with the look (`ctx.filter`, Chrome 52 and later; a normal canvas, since an OffscreenCanvas can't use the SVG looks) and, from build step 7, the text; `CanvasSource` adds the canvas to the new MP4 as H.264. The sound: `AudioBufferSink` gathers the trimmed part, an `OfflineAudioContext` plays it at the speed, faster than real time, into 48 kHz stereo (`soundAtSpeed()` in `app.js`), and `AudioBufferSource` makes it AAC. The file is written fresh, so none of the original's tags come along. With several clips (build step 8), each clip's frames and sound follow the last. The phone test still uses `Conversion`; Mediabunny's guide to it: https://github.com/Vanilagy/mediabunny/blob/main/docs/guide/converting-media-files.md
- If Chrome on the phone can't make AAC sound, Mediabunny's free add-on `@mediabunny/aac-encoder` fills in (about 1.1 MB more, MPL-2.0, loaded only then). It contains FFmpeg's AAC encoder, unmodified (LGPL 2.1 or later; its license files are in `lib/licenses/ffmpeg/`). Its docs: "In some browsers, AAC encoding is not supported by WebCodecs." Claude's test browser needed it (November 2, 2026); the phone test shows whether the owner's phone does.
- Saving: "Save to phone" downloads the MP4, named for the time it was made (for example `video-2026-11-02-0913.mp4`); on the owner's phone it shows up in Gallery (the phone test, November 2, 2026). "Share" opens the phone's share menu with the file (`navigator.share` with files, Chrome for Android 76 and later; Chrome for Android allows `.mp4` files, per Chromium's `ShareServiceImpl.java`, read November 2, 2026).
- The screen stays on while the video is made (Screen Wake Lock, Chrome 84 and later).
- Better sound (built in pull request 129): `buildSoundSteps()` in `app.js` puts Chrome's sound tools (Web Audio) in a row: Cut rumble is two high-pass filters at 80 Hz; Clearer voice is 3 dB less around 300 Hz and 4 dB more around 3,500 Hz; Even out the volume is a compressor (above −30 dB, 4 to 1); then the volume; then a safety limit (a compressor above −3 dB, 20 to 1), so nothing clips. With nothing changed, the sound passes through untouched. The same row goes on the new video's sound (in the `OfflineAudioContext`, after the speed) and on the playing video's sound (`createMediaElementSource`, from the first change on the Sound tab). Measured in Claude's test browser, November 3, 2026, in a saved video: the 50 Hz rumble 17.7 dB quieter with 1,000 Hz unchanged (0.1 dB); 300 Hz 3.0 dB quieter and 3,500 Hz 4.0 dB louder; a 30 dB gap between quiet and loud became 18 dB; Volume 50% exactly 6.0 dB quieter; and the sound lines up with the original to the sample. Three things learned from the Web Audio spec's source (https://github.com/WebAudio/web-audio-api, `index.bs`, read November 3, 2026) and checked by measuring: a high-pass filter's Q is in decibels (−3.01 dB is the smooth "Butterworth" shape; a plain 0.707 made a 3.4 dB bump at 100 Hz); a compressor turns its output up by itself (by 0.6 times its full-range reduction), so the safety limit's 1.71 dB is turned back down; and each compressor holds the sound back 6 thousandths of a second, so the new video's sound is moved back in line (`soundDelay()`). Browser support (MDN's browser-compat-data, read November 3, 2026): `createMediaElementSource` Chrome 15; the `BiquadFilterNode`, `DynamicsCompressorNode`, `GainNode` and `AudioBuffer` constructors Chrome 55; `AudioContext` and `OfflineAudioContext` constructors Chrome 35.
- Speed and sound: the sound plays faster or slower with the video, like a tape, so faster sounds higher (the owner's "b", open question 3). Keeping the voice's pitch would take a sound-stretching method; turned down for now (`DECISIONS.md`).
- Clips of different shapes (a tall clip and a wide one) are fitted into the one shape chosen in Look, filling the frame, and each clip's crop chooses which part shows.
- Why not iPhones yet: Safari draws filters on a canvas only behind an experimental setting ("Canvas Filters," Safari 18), and its AudioEncoder arrived only in Safari 26.
- Turned down for making the video (details in `DECISIONS.md`): ffmpeg.wasm (a 32.2 MB file, and slow even on a computer), "play and record" with MediaRecorder (kept as a backup plan) and a server (the videos would leave the phone).

## Build plan (one pull request each, each with a check the owner does)

1. This plan, with the folder's `CLAUDE.md`, `PROGRESS.md` and `DECISIONS.md`. Check: read "How it works" and this build plan.
2. Done (pull request 111, checked on the owner's phone November 2, 2026): the phone test, the riskiest part first (https://danielyoonwrites.github.io/video-editor/phone-test.html): pick a video; the page says what Chrome can do (read it, make H.264 video and AAC sound), then makes a 5-second black-and-white copy, shows how long it took, and offers "Save to phone" and "Share." Check: on your phone, try a short video you filmed, play the copy, and send Claude a screenshot of what the page says.
3. Done (pull request 112): one clip with a look: open one video, choose a filter and the lighting while it plays, then make the video, check it against Instagram's, TikTok's and YouTube Shorts' rules, save it and share it. Check: make a video with a filter and the lighting, play it, and upload it privately to YouTube, TikTok and Instagram.
   - 3b. Built (pull request 116; the owner's notes still to come): the Korean looks (the owner's "a"). Check: try each look on a video of your own, make one with Soft glow, and see that it looks like the preview.
4. Built (pull request 125; the owner's phone check still to come): trim and speed; the sound follows the speed like a tape (the owner's "b"). Check: cut the start and end off a clip, speed it up, make the video and play it.
5. Built (pull request 129; the owner's phone check still to come): better sound (added November 2, 2026, after the owner asked; without AI; three switches and a Volume slider, the owner's "B"): even out the volume, cut low rumble, a clearer voice, the volume up or down. Chrome's sound tools can do these faster than the video plays (OfflineAudioContext, BiquadFilterNode, DynamicsCompressorNode). They can't really remove changing background noise like voices or music. Check: make a video with "better sound" and compare.
6. Shape and crop. Check: make a tall video from a wide clip, choosing which part shows.
7. Text. Check: add a title for the first 3 seconds.
8. Several clips: add more, put them in order, remove one; they join into one video. Check: join three short clips in a new order.
9. Polish after a week of real use (like keeping an unfinished edit, if wanted). It went on the Projects page early, in pull request PULL_REQUEST_NUMBER, at the owner's request (November 3, 2026).

## Open questions (ask one at a time)

1. The name: chosen, "Video editor" (the owner's "A", November 2, 2026).
2. The look: chosen, dark (the owner's "A", November 2, 2026).
3. Sound when a clip is sped up or slowed down: chosen, like a tape, so faster sounds higher (the owner's "b", November 2, 2026: "b, just have it match the speed, keep it simple").
4. Filter and lighting for the whole video (Claude's suggestion for version 1), or for each clip (build step 8, when there are several clips; with one clip it's the same).
5. Keeping an unfinished edit after Chrome closes (build step 9).
6. Better sound: chosen, three separate switches (Cut rumble, Clearer voice, Even out the volume) and a Volume slider (the owner's "B", November 3, 2026).
