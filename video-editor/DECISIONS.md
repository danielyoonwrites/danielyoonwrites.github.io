# Video editor: decisions

Each decision with its reason, oldest first. Only add to this file; if a decision changes, add a new entry that says which one it replaces.

## In force (November 2, 2026, pull requests 110 to 112)

Every decision below that still holds, one line each; it's rewritten at each handoff. The log under it has each one with its reason, and is only added to.

- November 2, 2026: a simple video editor that does a few things well (a filter, lighting, text, clip order, crop, speed); no music button, nothing copyrighted, no AI (the owner's words).
- November 2, 2026: just for Dan, on his Android phone in Chrome (his "A").
- November 2, 2026: the name "Video editor," at https://danielyoonwrites.github.io/video-editor (his "A").
- November 2, 2026: everything happens on the phone; the videos are never uploaded. Mediabunny makes the new video, frame by frame.
- November 2, 2026: Mediabunny's ready-made file saved in the folder; no npm (the website's rule, kept after Dan asked whether it helps).
- November 2, 2026: the riskiest part first: build step 2 is a phone test (Claude's plan).
- November 2, 2026: the phone test is its own page, `phone-test.html`, kept for checking other phones or Chrome updates later.
- November 2, 2026: Mediabunny loads as plain scripts (a global `Mediabunny`); its AAC add-on loads only when Chrome can't make AAC sound.
- November 2, 2026: copies carry none of the original's tags (`tags: {}`), so hidden details like a location stay behind; the picture is turned upright in the frames; the longest side is at most 1920 pixels.
- November 2, 2026: the phone test passed on the owner's phone: AAC sound is built in, so the app loads the add-on only on a phone or browser without it.
- November 2, 2026: the dark look (Dan's "A").
- November 2, 2026: every video is made to fit Instagram's, TikTok's and YouTube Shorts' upload rules (Dan's request), and "Your video" checks it against them.
- November 2, 2026: build step 3's screens: Start, "The look" (Filter and Lighting tabs), "Making the video," "Your video"; six filters; Brightness and Contrast from −50 to +50.
- November 2, 2026: the filter and lighting question (whole video or each clip) waits for build step 7.

## Log (oldest first)

### November 2, 2026: a simple video editor that does a few things well (pull request 110)
- Decision: plan a simple video editor: a filter, lighting, text, the order of clips, cropping, and speeding up or slowing down. No music button, nothing copyrighted, no AI.
- Why: the owner: "This is for research and asking questions, how hard would it be to make a simple video editor? It's not trying to do everything, just simple things well. Like applying a filter, changing lighting, adding text, arranging video order, cropping video, speeding up or slowing down. It doesn't need an add music button or anything copyrighted, and it doesn't need AI added. I just want a simple one that can do the basic things but make them easy to use." Claude's research (his Notion page "Simple video editor: how hard to build (Nov 2026)"): doable in Chrome on the phone, harder than Idea board, with nearly all the difficulty in saving the finished video.
- Also: trimming (cutting off a clip's start and end) was Claude's suggestion, not on the owner's list; Mediabunny has it built in.

### November 2, 2026: just for the owner, on his Android phone in Chrome (pull request 110)
- Decision: version 1 is only for the owner's Android phone, in Chrome.
- Why: his answer, "Yea let's try A," to "Who's it for?", where "A" was "Just you, on your Android phone in Chrome" (Claude's recommendation: everything checked works there).
- Turned down: "B", other people too, including on iPhones. Safari draws filters on a canvas only behind an experimental setting ("Canvas Filters," Safari 18), and its AudioEncoder arrived only in Safari 26 (MDN's browser-compat-data, read November 2, 2026).

### November 2, 2026: everything on the phone; Mediabunny makes the video (pull request 110)
- Decision: the app makes the new video frame by frame in Chrome, with the browser's video tools (WebCodecs, Chrome 94 and later, Android included) and the free Mediabunny library (MPL-2.0; version 1.65.0, October 30, 2026). The videos never leave the phone.
- Why: Claude's research, November 2, 2026: Mediabunny's conversion tools have trimming, cropping, resizing and frame-by-frame drawing (for filters and text) built in, with progress and a way to stop, and it comes as one ready-made file (its README and guide on GitHub, and the npm registry).
- Turned down: ffmpeg.wasm (FFmpeg in the browser): its main file is 32.2 MB, and its own speed test took 60 to 129 seconds to convert a 10-second 720p clip on a computer (Intel Core i5, Chrome 116), so a phone would likely be slower (its FAQ and Performance pages on GitHub). "Play and record" with the browser's MediaRecorder: no library, but saving takes as long as the video plays, with the screen on, and whether Chrome on Android records MP4 couldn't be confirmed (a third-party table, addpipe's, says Chrome 126 and later can, without saying whether Android is included); kept as a backup plan. A server: the videos would leave the phone.

### November 2, 2026: Mediabunny's file saved in the folder, no npm (pull request 110)
- Decision: Mediabunny's ready-made file goes in `video-editor/lib/`, with its license and a link to its source, and the app loads it with `import`. One version stays until an update is chosen on purpose.
- Why: the owner asked: "why is there a no npm rule? Does that help in any way? If not then use npm." Claude's answer: the rule helps (root `DECISIONS.md`, November 2, 2026), and npm wouldn't help this app much, because Mediabunny's docs say it can be included "directly with a script tag" from its ready-made builds. jsDelivr and unpkg (CDNs) couldn't be reached from Claude's session to test, and a saved file lets the page run only its own scripts.
- Turned down: npm with a build step (a smaller download, by keeping only the parts of Mediabunny the app uses, but a build on every publish); loading Mediabunny from a CDN.

### November 2, 2026: the riskiest part first (pull request 110)
- Decision: build step 2 is a phone test: make a 5-second black-and-white copy of a video, save it and share it, showing what Chrome can do and how long it took.
- Why: Claude's plan, from the research. Saving the finished video is the hard part, and two answers can only come from the owner's phone: how fast it is, and whether Chrome there can make AAC sound (Mediabunny's docs: "In some browsers, AAC encoding is not supported by WebCodecs").

### November 2, 2026: the name, "Video editor" (pull request 110)
- Decision: the app is called "Video editor," at https://danielyoonwrites.github.io/video-editor (folder `video-editor/`).
- Why: the owner's answer "A" of three: "Video editor" (Claude's recommendation: plain and clear, like "Idea board," and it says what it is), "Cutting room" (warmer, and it goes with "Quiet room") or "Little edits" (says it's small and simple).
- Turned down: "Cutting room" and "Little edits."

### November 2, 2026: the phone test page, and how Mediabunny loads (pull request 111)
- Decision: build step 2 is its own page, `video-editor/phone-test.html`, with `phone-test.js` and `phone-test.css`, kept after the app is built, for checking another phone or a Chrome update. Mediabunny loads with plain `<script>` tags: `lib/mediabunny.min.js` (its `mediabunny.min.cjs` build, renamed so the website sends it as JavaScript) sets a global `Mediabunny`. Mediabunny's AAC add-on (`lib/mediabunny-aac-encoder.min.js`) loads only when Chrome can't make AAC sound itself. The page has a safety rule (Content-Security-Policy) like Idea board's, plus `'wasm-unsafe-eval'` and `worker-src blob:` for the add-on.
- Why (Claude's choices, November 2, 2026): the add-on's module build imports "mediabunny" by name, which needs an import map, an inline script the safety rule would block; its plain build reads the global `Mediabunny` instead (seen in both files). Claude's test browser (Chromium 153) can make H.264 video but not AAC sound, so the add-on is a real need on some browsers; Mediabunny's docs: "In some browsers, AAC encoding is not supported by WebCodecs." Both downloads matched the npm registry's integrity hashes; their SHA-256 hashes are in `lib/README.md`, and the saved checks test them.
- Licenses: Mediabunny and the add-on are MPL-2.0 (`lib/LICENSE`, with links to their source). The add-on contains FFmpeg's AAC encoder, unmodified, under the LGPL 2.1 or later; its license files are in `lib/licenses/ffmpeg/`, with a link to FFmpeg's source and the build steps in `lib/README.md`.
- Turned down: modules with an import map (blocked by the safety rule without extra work); loading from a CDN (not reachable from Claude's session to test); making Opus sound instead of AAC when Chrome lacks AAC (whether other apps play Opus inside MP4 wasn't checked).

### November 2, 2026: what a copy keeps and doesn't (pull request 111)
- Decision: each copy is made with `tags: {}` (none of the original's tags), with the picture turned upright in the frames (`allowTransformationMetadata: false`), and at most 1920 pixels on its longest side (Reels are 1080 by 1920). The file's name isn't shown on the page.
- Why: Mediabunny's type notes for `Conversion` say: "If no function is set, the input's metadata tags will be copied to the output (excluding `creationTime`)." So the privacy plan in `SPEC.md` ("it shouldn't carry the original's hidden details") needed `tags: {}`. The saved checks confirm it: a test video with a location ("loci") makes a copy without one. Turning the picture upright in the frames means every player shows it the right way up; the check compares the copy's first frame with ffmpeg's upright view of the original. File names can be personal, and the owner sends screenshots.
- Also checked: the page looks for a location in the file's "moov" box only ("©xyz", "loci" or Apple's "quicktime.location"), so picture data can't cause a false alarm. Which of these Android phones write wasn't checked; the test shows what the owner's phone does.

### November 2, 2026: the phone test passed on the owner's phone (pull request 111)
- Result: on Dan's phone (Chrome 156 on Android 17, phone model SM-S948U1, from the page's "This phone" line), every line under "What Chrome can do" was ✓: the video tools, H.264 video, AAC sound "yes, built in," drawing filters, sharing to other apps, and keeping the screen on (his screenshot). The copy worked; Dan: "yes it works, the copy is in my gallery, black and white and with sound."
- So: the app loads the AAC add-on only when Chrome can't make AAC itself (never on Dan's phone; always in Claude's test browser).
- Not reported: how long the 5-second copy took.

### November 2, 2026: the dark look (pull request 112)
- Decision: a dark look: a near-black page (`#121212`), light words, light buttons, system fonts.
- Why: Dan's answer "A" of three. Claude recommended it: "a bright page around a video can make the video look darker than it really is, which matters when you're adjusting lighting."
- Turned down: "Paper and ink" (like Idea board and Living in the Word) and "Moon jar" (like the website).

### November 2, 2026: made for Instagram, TikTok and YouTube Shorts (pull request 112)
- Decision: every new video is made to fit the three platforms' upload rules: MP4 with its details at the front; H.264; at most 1920 pixels on the longest side; a steady 24 to 60 frames a second (the original's, rounded); 8 Mbps for 1080 by 1920 at 30 frames a second (10 at 60, less for smaller videos); AAC sound at 48 kHz, stereo, 128 kbps; no tags. "Your video" reads the new file back and checks it against the rules, with one line for each, and a line for Claude with the codec, color tags and edit lists.
- Why: Dan: "Also make sure the videos that are created can be used for Instagram, TikTok, and Youtube Shorts." The rules and their sources are in `SPEC.md` ("Made for Instagram, TikTok and YouTube Shorts"); every official page was seen only in search results, since developers.facebook.com, developers.tiktok.com, help.instagram.com and support.google.com are blocked from Claude's session. The strictest numbers come from Meta's rules for videos posted through its tools (300 MB, 25 Mbps, AAC at 48 kHz, 128 kbps): meeting those meets the looser ones. The data rates keep a 3-minute video under 300 MB (Claude's arithmetic: 8.1 Mbps for 180 seconds is about 183 MB).
- Known differences, left on purpose until real uploads say otherwise: one edit list on the sound track (it skips the AAC encoder's first 1,024 samples; Mediabunny has no setting to leave it out, and ffmpeg's MP4 files have the same kind by default), and full-range color tags in Claude's test browser (the phone's own may differ; the line for Claude shows them). Meta's and YouTube's strictest settings ask for no edit lists.
- Turned down: hacking the edit list out of the finished file (renaming its box), since it shifts the sound by 21 thousandths of a second and real uploads may show it's not needed; converting every frame to limited-range color by hand, which would slow every video down, before knowing what the phone makes.

### November 2, 2026: build step 3's screens (pull request 112)
- Decision (Claude's design, for Dan to judge in the screenshots): Start → "The look" → "Making the video" → "Your video." On "The look," the video plays at the top without sound (it can be turned on), with a "Filter" tab (None, Black and white, Warm, Vivid, Soft, Old film) and a "Lighting" tab (Brightness and Contrast, −50 to +50 in steps of 5, "Reset the lighting"); "Make the video" stays at the bottom. The phone's Back button goes back one screen, and stops a video being made. A saved video is named for its time, like `video-2026-11-02-0913.mp4`.
- Why: Dan's rules: one thing per screen and short pages on a phone (tabs instead of one long page). The filters are CSS filters, so the playing video and the new file use the same words and look the same.
- The filter and lighting question (`SPEC.md`, open question 4) waits for build step 7: with one clip, the whole video and each clip are the same.
