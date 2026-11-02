# SPEC: Video editor

A little app at https://danielyoonwrites.github.io/video-editor (folder `video-editor/` in the website repository; the name is the owner's choice). Planned with the owner, November 2, 2026, after Claude's research on how hard it would be (his Notion page "Simple video editor: how hard to build (Nov 2026)").

## Who it's for

Just the owner, on his Android phone in Chrome (his choice "A", November 2, 2026). Not iPhones or other people for now: two tools it needs work differently in Safari ("Tech notes").

## What it is

A simple video editor that does a few things well. In his words: "It's not trying to do everything, just simple things well. Like applying a filter, changing lighting, adding text, arranging video order, cropping video, speeding up or slowing down. It doesn't need an add music button or anything copyrighted, and it doesn't need AI added. I just want a simple one that can do the basic things but make them easy to use."

Everything happens on the phone: the videos are never uploaded. It's the owner's next learning app, a step harder than Idea board.

## How it works (version 1, Claude's plan; the owner can change any of it)

The video plays at the top of each screen, showing the edits as it plays. One step per screen:

1. Clips: "Add videos" picks one or more videos from the phone. They show as a list in order, each with a small picture and its length. ↑ and ↓ move a clip; tap a clip to open it.
2. A clip, on its own screen: trim (where it starts and ends), speed (0.5×, 1×, 1.5× or 2×) and which part shows in the frame (the crop).
3. Look, for the whole video: the shape (tall 9:16 for Reels, square or wide), a filter (a few ready-made ones) and lighting (brightness and contrast).
4. Text: type a line, put it at the top, middle or bottom, and choose when it shows.
5. Make the video: a progress bar, then "Save to phone" and "Share." The screen stays on while it works, and "Stop" cancels.

Trimming wasn't on the owner's list; Claude suggested it: cutting off a clip's start or end, like the moment of reaching for the phone. Mediabunny has it built in.

Built so far (build step 3, Claude's design, shown to the owner in screenshots): Start ("Choose a video") → "The look" (the video plays at the top, without sound until you turn it on; a "Filter" tab and a "Lighting" tab under it; "Make the video" stays at the bottom) → "Making the video" (a progress bar and "Stop") → "Your video" (it plays; a line saying whether it meets Instagram's, TikTok's and YouTube Shorts' upload rules, with "What was checked" folded under it; "Save to phone," "Share" and "Start a new video"). The phone's Back button goes back one screen; Back while a video is being made stops it.
- The filters: None, Black and white, Warm, Vivid, Soft and Old film (their CSS filters are in `FILTERS` at the top of `app.js`).
- The lighting: Brightness and Contrast, from −50 to +50 in steps of 5, with "Reset the lighting."
- The look is one CSS filter: the playing video shows it, and each frame of the new video is drawn with the same filter, so what you see is what you get.

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

## Privacy and safety

- The videos never leave the phone: Chrome reads them and writes the new file on the phone. Nothing goes to a server, an AI or anyone else. The app's code is public; the videos never touch the repository.
- The new video carries none of the original's hidden details, like where it was filmed: Mediabunny copies the original's tags unless told not to, so every copy is made with `tags: {}`. Checked in build step 2: a test video's location doesn't reach the copy.
- Screenshots and checks use made-up test videos, never the owner's own videos, and never his kids.

## The look

Dark (the owner's choice "A", November 2, 2026): a near-black page with light words and light buttons, so the video stands out. Claude's reason, given with the options: a bright page around a video can make the video look darker than it really is, which matters when adjusting lighting. The colors are at the top of `style.css`; their contrast is checked in `tests/app-test.mjs` (words at least 4.5 to 1, button edges and the focus ring at least 3 to 1). System fonts, so nothing loads from outside.

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

- Plain HTML, CSS and JavaScript in this folder, with no build tools (the website's rule, kept on November 2, 2026, after the owner asked about it; root `DECISIONS.md`). File links end in `?v=1`, raised whenever a file changes.
- Mediabunny reads and writes the video files: free (MPL-2.0), version 1.65.0 published October 30, 2026, first published June 16, 2025 (the npm registry, https://registry.npmjs.org/mediabunny). Its whole library is one ready-made file, `mediabunny.min.mjs`, about 0.7 MB (about 187 KB compressed, measured by Claude). It's saved in `video-editor/lib/` with its license and a link to its source (https://github.com/Vanilagy/mediabunny), and loaded with a plain `<script>` tag, which gives the page a global `Mediabunny` (build step 2; modules would need an import map, which the page's safety rule blocks). Its docs say it can be included "directly with a script tag." Saved in the folder rather than loaded from a CDN: Claude's session couldn't reach jsDelivr or unpkg to test (November 2, 2026), and the page can then run only its own scripts (a Content-Security-Policy like Idea board's).
- The browser's video tools that Mediabunny uses (WebCodecs): Chrome 94 and later, on Android too.
- Preview while it plays: the video with CSS filters (brightness, contrast, saturate, grayscale, sepia; Chrome 53 and later) and `playbackRate` for the speed. Chrome keeps the voice's pitch at other speeds while playing (`preservesPitch`, Chrome 86 and later). Text and the crop frame are page boxes over the video.
- Making the video, frame by frame: for each clip in order, Mediabunny's `CanvasSink` reads its frames (with the crop and fit); the app draws each one on a canvas with the filter (`ctx.filter`, Chrome 52 and later) and the text; `CanvasSource` turns the canvas into a new MP4 (H.264 video), with the times shifted for the clip's place and speed. The sound goes through `AudioBufferSink` and `AudioBufferSource` (AAC). Mediabunny's guide: https://github.com/Vanilagy/mediabunny/blob/main/docs/guide/converting-media-files.md
- If Chrome on the phone can't make AAC sound, Mediabunny's free add-on `@mediabunny/aac-encoder` fills in (about 1.1 MB more, MPL-2.0, loaded only then). It contains FFmpeg's AAC encoder, unmodified (LGPL 2.1 or later; its license files are in `lib/licenses/ffmpeg/`). Its docs: "In some browsers, AAC encoding is not supported by WebCodecs." Claude's test browser needed it (November 2, 2026); the phone test shows whether the owner's phone does.
- Saving: "Save to phone" downloads the MP4, named for the time it was made (for example `video-2026-11-02-0913.mp4`); on the owner's phone it shows up in Gallery (the phone test, November 2, 2026). "Share" opens the phone's share menu with the file (`navigator.share` with files, Chrome for Android 76 and later; Chrome for Android allows `.mp4` files, per Chromium's `ShareServiceImpl.java`, read November 2, 2026).
- The screen stays on while the video is made (Screen Wake Lock, Chrome 84 and later).
- Speed and sound: playing sound faster raises the voice's pitch, unless the app stretches it in time. Which one is open question 3.
- Clips of different shapes (a tall clip and a wide one) are fitted into the one shape chosen in Look, filling the frame, and each clip's crop chooses which part shows.
- Why not iPhones yet: Safari draws filters on a canvas only behind an experimental setting ("Canvas Filters," Safari 18), and its AudioEncoder arrived only in Safari 26.
- Turned down for making the video (details in `DECISIONS.md`): ffmpeg.wasm (a 32.2 MB file, and slow even on a computer), "play and record" with MediaRecorder (kept as a backup plan) and a server (the videos would leave the phone).

## Build plan (one pull request each, each with a check the owner does)

1. This plan, with the folder's `CLAUDE.md`, `PROGRESS.md` and `DECISIONS.md`. Check: read "How it works" and this build plan.
2. Done (pull request 111, checked on the owner's phone November 2, 2026): the phone test, the riskiest part first (https://danielyoonwrites.github.io/video-editor/phone-test.html): pick a video; the page says what Chrome can do (read it, make H.264 video and AAC sound), then makes a 5-second black-and-white copy, shows how long it took, and offers "Save to phone" and "Share." Check: on your phone, try a short video you filmed, play the copy, and send Claude a screenshot of what the page says.
3. One clip with a look (pull request 112): open one video, choose a filter and the lighting while it plays, then make the video, check it against Instagram's, TikTok's and YouTube Shorts' rules, save it and share it. Check: make a video with a filter and the lighting, play it, and upload it privately to YouTube, TikTok and Instagram.
4. Trim and speed. Check: cut the start and end off a clip, speed it up, make the video and play it.
5. Shape and crop. Check: make a tall video from a wide clip, choosing which part shows.
6. Text. Check: add a title for the first 3 seconds.
7. Several clips: add more, put them in order, remove one; they join into one video. Check: join three short clips in a new order.
8. Polish after a week of real use (like keeping an unfinished edit, if wanted), then decide whether it goes on the Projects page.

## Open questions (ask one at a time)

1. The name: chosen, "Video editor" (the owner's "A", November 2, 2026).
2. The look: chosen, dark (the owner's "A", November 2, 2026).
3. Sound when a clip is sped up or slowed down (build step 4): the voice goes higher or lower like a tape (simplest), no sound for that clip, or the voice stays natural (the most work).
4. Filter and lighting for the whole video (Claude's suggestion for version 1), or for each clip (build step 7, when there are several clips; with one clip it's the same).
5. Keeping an unfinished edit after Chrome closes (build step 8).
