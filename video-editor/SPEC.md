# SPEC: Video editor

A little app at https://danielyoonwrites.github.io/video-editor (folder `video-editor/` in the website repository; "Video editor" is a working name). Planned with the owner, November 2, 2026, after Claude's research on how hard it would be (his Notion page "Simple video editor: how hard to build (Nov 2026)").

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
- The new video is made fresh, frame by frame, so it shouldn't carry the original's hidden details, like where it was filmed (Claude's plan; checked in build step 2).
- Screenshots and checks use made-up test videos, never the owner's own videos, and never his kids.

## The look

Not chosen yet (open question 2).

## Tech notes (Claude's plan; the owner can change any of it)

Browser support below is from MDN's browser-compat-data on GitHub, read November 2, 2026 (https://github.com/mdn/browser-compat-data).

- Plain HTML, CSS and JavaScript in this folder, with no build tools (the website's rule, kept on November 2, 2026, after the owner asked about it; root `DECISIONS.md`). File links end in `?v=1`, raised whenever a file changes.
- Mediabunny reads and writes the video files: free (MPL-2.0), version 1.65.0 published October 30, 2026, first published June 16, 2025 (the npm registry, https://registry.npmjs.org/mediabunny). Its whole library is one ready-made file, `mediabunny.min.mjs`, about 0.7 MB (about 187 KB compressed, measured by Claude). It goes in `video-editor/lib/` with its license and a link to its source (https://github.com/Vanilagy/mediabunny), and the app loads it with `import`. Its docs say it can be included "directly with a script tag." Saved in the folder rather than loaded from a CDN: Claude's session couldn't reach jsDelivr or unpkg to test (November 2, 2026), and the page can then run only its own scripts (a Content-Security-Policy like Idea board's).
- The browser's video tools that Mediabunny uses (WebCodecs): Chrome 94 and later, on Android too.
- Preview while it plays: the video with CSS filters (brightness, contrast, saturate, grayscale, sepia; Chrome 53 and later) and `playbackRate` for the speed. Chrome keeps the voice's pitch at other speeds while playing (`preservesPitch`, Chrome 86 and later). Text and the crop frame are page boxes over the video.
- Making the video, frame by frame: for each clip in order, Mediabunny's `CanvasSink` reads its frames (with the crop and fit); the app draws each one on a canvas with the filter (`ctx.filter`, Chrome 52 and later) and the text; `CanvasSource` turns the canvas into a new MP4 (H.264 video), with the times shifted for the clip's place and speed. The sound goes through `AudioBufferSink` and `AudioBufferSource` (AAC). Mediabunny's guide: https://github.com/Vanilagy/mediabunny/blob/main/docs/guide/converting-media-files.md
- If Chrome on the phone can't make AAC sound, Mediabunny's free add-on `@mediabunny/aac-encoder` fills in (about 1.1 MB more, MPL-2.0). Its docs: "In some browsers, AAC encoding is not supported by WebCodecs." Build step 2 checks.
- Saving: "Save to phone" downloads the MP4 (where it shows up in the phone's gallery is checked in build step 2). "Share" opens the phone's share menu with the file (`navigator.share` with files, Chrome for Android 76 and later; Chrome for Android allows `.mp4` files, per Chromium's `ShareServiceImpl.java`, read November 2, 2026).
- The screen stays on while the video is made (Screen Wake Lock, Chrome 84 and later).
- Speed and sound: playing sound faster raises the voice's pitch, unless the app stretches it in time. Which one is open question 3.
- Clips of different shapes (a tall clip and a wide one) are fitted into the one shape chosen in Look, filling the frame, and each clip's crop chooses which part shows.
- Why not iPhones yet: Safari draws filters on a canvas only behind an experimental setting ("Canvas Filters," Safari 18), and its AudioEncoder arrived only in Safari 26.
- Turned down for making the video (details in `DECISIONS.md`): ffmpeg.wasm (a 32.2 MB file, and slow even on a computer), "play and record" with MediaRecorder (kept as a backup plan) and a server (the videos would leave the phone).

## Build plan (one pull request each, each with a check the owner does)

1. This plan, with the folder's `CLAUDE.md`, `PROGRESS.md` and `DECISIONS.md`. Check: read "How it works" and this build plan.
2. The phone test, the riskiest part first: pick a video; the page says what Chrome can do (read it, make H.264 video and AAC sound), then makes a 5-second black-and-white copy, shows how long it took, and offers "Save to phone" and "Share." Check: on your phone, try a short video you filmed, play the copy, and send Claude a screenshot of what the page says.
3. One clip with a look: open one video, choose a filter and the lighting while it plays, then make the video, save it and share it. Check: make a black-and-white copy of a 1-minute video and play it.
4. Trim and speed. Check: cut the start and end off a clip, speed it up, make the video and play it.
5. Shape and crop. Check: make a tall video from a wide clip, choosing which part shows.
6. Text. Check: add a title for the first 3 seconds.
7. Several clips: add more, put them in order, remove one; they join into one video. Check: join three short clips in a new order.
8. Polish after a week of real use (like keeping an unfinished edit, if wanted), then decide whether it goes on the Projects page.

## Open questions (ask one at a time)

1. The name (before build step 2, since it sets the web address): "Video editor" is a working name.
2. The look (build step 3): "Paper and ink" like Idea board and Living in the Word, "Moon jar" like the website, or its own.
3. Sound when a clip is sped up or slowed down (build step 4): the voice goes higher or lower like a tape (simplest), no sound for that clip, or the voice stays natural (the most work).
4. Filter and lighting for the whole video (Claude's suggestion for version 1), or for each clip (build step 3).
5. Keeping an unfinished edit after Chrome closes (build step 8).
