# Video editor: decisions

Each decision with its reason, oldest first. Only add to this file; if a decision changes, add a new entry that says which one it replaces.

## In force (November 2, 2026, pull request 110)

Every decision below that still holds, one line each; it's rewritten at each handoff. The log under it has each one with its reason, and is only added to.

- November 2, 2026: a simple video editor that does a few things well (a filter, lighting, text, clip order, crop, speed); no music button, nothing copyrighted, no AI (the owner's words).
- November 2, 2026: just for Dan, on his Android phone in Chrome (his "A").
- November 2, 2026: everything happens on the phone; the videos are never uploaded. Mediabunny makes the new video, frame by frame.
- November 2, 2026: Mediabunny's ready-made file saved in the folder; no npm (the website's rule, kept after Dan asked whether it helps).
- November 2, 2026: the riskiest part first: build step 2 is a phone test (Claude's plan).

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
