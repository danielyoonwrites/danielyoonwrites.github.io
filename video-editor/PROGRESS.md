# Video editor: progress (updated November 3, 2026, at the handoff)

A simple video editor, just for the owner, on his Android phone in Chrome: a look (Korean styles), lighting, better sound, a line of text, trim and speed now; next AI captions only for Dan (planned, build step 7), then shape and crop, and clip order. The videos never leave the phone (the captions' sound will be the one exception, for Dan only), and every video is made to fit Instagram, TikTok and YouTube Shorts. Read `SPEC.md` (what it does, the AI captions plan, the platforms' rules, the build plan), `DECISIONS.md` (the "In force" list first) and `CLAUDE.md`.

## Where it stands
- Done and checked on Dan's phone:
  - The plan and the name (pull request 110); the phone test (111): checked November 2, 2026, every line ✓, AAC sound built in; one clip with a look (112): checked November 2, 2026, "it looks good."
- Built and live, not checked on Dan's phone yet (each merged; the site's publish run was green each time):
  - The Korean looks (116, Dan's "a"); trim and speed (125, the sound like a tape, Dan's "b"); better sound (129, three switches and a Volume slider, Dan's "B").
  - The tabs in Dan's order (137): Filter, Lighting, Sound, Text, Trim, Speed (Text added before Trim in 139); a new video opens on Filter.
  - On the website's Projects page (138, Dan's "A"; first in his order since pull request 142, which also added a "What I set out to learn" line and updated `tests/projects-listing.mjs` for the two gray lines): https://danielyoonwrites.github.io/projects.html, with a link, a gray line saying it's made for an Android phone in Chrome, and a "How I built it" note; Living in the Word is listed there too (another session's pull request 136).
  - Text (139, Dan's "A"): one line per video, Top, Middle or Bottom, for the new video's first 3 seconds or the whole video; white bold letters on soft dark boxes, the same on the playing video and in the saved video. How it works: `SPEC.md`, "Tech notes," "Text."
- Planned, not built: AI captions only for Dan (pull request 140, notes only): his own small Cloudflare server running Workers AI's Whisper, separate from Living in the Word's, one short line at a time, locked with a passcode. The whole plan: `SPEC.md`, "AI captions, only for the owner."
- Checked in Claude's test browser (November 3, 2026): 207 saved checks pass (`tests/app-test.mjs`), including text (section K: the words land within 3% of where they showed while editing, stay white with the lighting at −50, and go after the new video's first 3 seconds, at 2× too) and better sound measured with test tones (section J). The phone test's 71 pass. The Projects page check passes (`tests/projects-listing.mjs`, 20 checks).
- Not checked yet: the sound switches with a real voice, and whether the voice stays in step with the lips while editing; trim and speed on the phone, and how long making a video takes; real uploads to the three platforms; what the phone writes in the "For Claude" line on "Your video"; Soft glow's speed and the looks on real faces; text on the phone (its font and Korean letters, the size, and whether Top and Bottom stay clear of the apps' buttons in a real upload).
- Branch: `ccr-f31dd4eb-gq2mec` (this session's), restarted from main after each merge; everything up to pull request 140 is merged into main. Open pull requests: pull request 141, this handoff (notes only). Nothing to do after it merges but the items below.
- Claude's rough estimate: 6 more small pull requests: AI captions 7a to 7c, then shape and crop, several clips, polish.
- Dan's Master Notes (Notion), the page "Simple video editor: how hard to build (Nov 2026)," gets one entry after each merge (what merged, what was checked, what's next); the AI captions research is saved there too (November 3, 2026).

## Waiting on Dan
1. Merge the handoff notes, pull request 141 (notes only): https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/141, Conversation tab, Merge pull request, Confirm merge.
2. The text check (pull request 139), on his phone:
   1. Open Chrome and go to https://danielyoonwrites.github.io/video-editor
   2. Tap "Choose a video" and pick a video of yourself talking.
   3. Tap the Text tab and type a short line, like "Three things I wish I knew at 20." While it plays, try Top, Middle and Bottom.
   4. Leave "First 3 seconds" chosen, tap "Make the video," and play it: the words show for the first 3 seconds, where they showed while editing.
   5. Tell Claude whether the words are big enough, whether their place looks right, and whether anything covers them after a test upload.
3. The better sound check (pull request 129):
   1. On your phone, open Chrome and go to https://danielyoonwrites.github.io/video-editor
   2. Tap "Choose a video" and pick a video of yourself talking, at least 15 seconds long, ideally with some wind or traffic in it (it stays on your phone).
   3. Tap the speaker on the video to turn its sound on, then tap the Sound tab. While it plays, turn each switch on and off and listen: Cut rumble, Clearer voice, Even out the volume. Then try the Volume slider.
   4. Keep the switches you like, tap "Make the video," and play it: it should sound like what you heard while editing.
   5. Tell Claude which switches helped, whether any made it sound worse, and whether the voice stayed in step with the lips while editing.
4. The trim and speed check (pull request 125):
   1. On your phone, open Chrome and go to https://danielyoonwrites.github.io/video-editor, tap "Choose a video" and pick a video of your own at least 15 seconds long. It opens on the Filter tab; tap the Trim tab.
   2. Tap "Start here" a moment in. Let it play about 10 more seconds, then tap "End here." (Keep at least 6 seconds: shorter at 2× makes a video under 3 seconds, and "Your video" says it's too short for Instagram.)
   3. Tap the Speed tab, then 2×. Tap "Make the video," note roughly how long it takes, then play it: it starts and ends where you chose, at double speed, with the sound higher.
   4. Tell Claude how it went and how long it took.
5. The looks and the test uploads (pull requests 112 and 116):
   1. On your phone, open https://danielyoonwrites.github.io/video-editor in Chrome, tap "Choose a video" and pick one of your own. On the Filter tab, tap each look while it plays: Milky, Peach, Soft glow, Café, Clear, Film. Note any you'd change or drop.
   2. Tap Soft glow, then "Make the video," and note roughly how long it takes. On "Your video," tap "What was checked" and take a screenshot (it has the "For Claude" line).
   3. Tap "Save to phone," then upload it privately: YouTube as a Short set to Private, TikTok with "Only me," Instagram as a Reel saved to drafts. (Unverified: Claude couldn't open those apps' help pages, so it can't name their exact buttons.) Note any app that refuses it and what it says.
6. Before build step 7a, three answers, one question at a time: which Cloudflare plan his account is on (Free stops at the free allowance and costs nothing; Paid charges past it); if Paid, whether the server should stop at a daily limit; and whether the new Worker goes in the same Cloudflare account as Living in the Word's (Claude's suggestion). Then, with 7a, a one-time setup in Cloudflare (every step comes with that pull request) and a passcode of four or more random words.

## Next step
Build step 7a, the captions server and the passcode (`SPEC.md`, "AI captions, only for the owner" and "Build plan"): `video-editor/server/worker.js` and `wrangler.jsonc` (a Worker named `video-editor-captions`, with a Workers AI binding and `workers_dev`), the `?owner` passcode box in the app (saved on his phone only; the page's safety rule then needs his server's address in `connect-src`), saved checks with a stand-in for Workers AI (Claude can't use his Cloudflare account), and his one-time setup steps, each checked against Cloudflare's docs read from `cloudflare/cloudflare-docs` on GitHub (their site is blocked: `CLOUD-NOTES.md`). His other Worker's address is living-in-the-word.danyoonsignup.workers.dev, so this one will likely be video-editor-captions.danyoonsignup.workers.dev (unverified until he makes it). Ask him first, one question at a time: which Cloudflare plan his account is on; if Paid, whether the server should stop at a daily limit; and whether the Worker goes in the same Cloudflare account as Living in the Word's (that decides its address, which the page's safety rule needs). In the same pull request, add the captions server to the root `CLAUDE.md`'s one exception to "no build tools." Then 7b (making and showing captions, with the Projects page line and note updated in the same pull request: the note says "no AI" and that the videos never leave the phone) and 7c (fixing words). Ask for his phone checks along the way, and adjust whatever he asks: the text's numbers are in `TEXT_LOOK` in `app.js` (check with section K).

## Ideas, not done
- A note on the Trim and Speed tabs when the new video would be under 3 seconds or over 3 minutes (now only "Your video" says so, after it's made).
- Turning down a steady hiss, like a fan (left for later, November 3, 2026; `SPEC.md`, "Not in version 1").
- More for the text, if Dan asks after using it: a bigger or smaller size, another color, a time other than 3 seconds.

## Dead ends
- Blocked from Claude's session: jsDelivr, unpkg and chromestatus.com (November 2, 2026; Mediabunny came from registry.npmjs.org); the platforms' rule pages (developers.facebook.com, developers.tiktok.com, help.instagram.com, support.google.com) and the Korean-look sources (apps.apple.com, capcut.com, gridfiti.com), read through search results only; developers.cloudflare.com, huggingface.co, openai.com and developers.openai.com (November 4, 2026): read their docs from GitHub instead (`CLOUD-NOTES.md`).
- danielyoonwrites.github.io itself can't be opened from Claude's session (the proxy answers 403); a green publish run is the check, and Dan's phone is the first live look.
- Claude's API can't take sound ("All current models support text and image input, text output," Anthropic's models page, read November 3, 2026), so the captions use Cloudflare's Whisper. Chrome's built-in speech recognition only listens to the microphone, not to a file.
- Line breaks made "as narrow as possible" (like CSS's balanced text) still left "I" at the end of a line ("Three things I / wish I knew at 20"); `textLines()` now picks the most even breaks and keeps a one-letter word off a line's end when it can.
- scikit-image's test photos moved inside that project (their old paths answer 404), so the looks are judged on a made-up scene (`tests/make-scene.py`).
- An OffscreenCanvas ignores SVG filters (`url(#...)`); a normal canvas works, even one that isn't on the page.
- Loading Mediabunny as a module (`import`): its AAC add-on imports "mediabunny" by name, which needs an import map, an inline script the page's safety rule blocks. The plain script builds (a global `Mediabunny`) work instead.
- Mediabunny's one-step `Conversion` can trim but has no speed setting (its type notes, version 1.65.0), so the app makes each video frame by frame.
- A Web Audio high-pass filter with Q 0.707 made a 3.4 dB bump at 100 Hz: for that filter type Q is in decibels; −3.01 is the smooth shape.
- Timing the new video's sound by a sudden tone read 14 thousandths of a second late: AAC smears a sudden start. Lining up a hiss (`soundLag()` in `tests/test-videos.mjs`) shows it's in line to the sample.
- In the checks, `innerText` of words inside a closed fold-out or a hidden tab is empty; open the tab first, or read them with `textContent`.

## How to run and check it
- Run: nothing to install; the pages are plain files. Open https://danielyoonwrites.github.io/video-editor (the app) or https://danielyoonwrites.github.io/video-editor/phone-test.html (the phone test), or serve the repository folder (`python3 -m http.server`) and open `/video-editor/`.
- Check the app (needs Playwright with Chromium, and ffmpeg; both are installed in Claude's cloud sessions): `node video-editor/tests/app-test.mjs` from the repository folder. It makes made-up test videos, a color chart, a "clock" video and test sounds with ffmpeg (`tests/test-videos.mjs`), serves the repository on http://127.0.0.1:8768 (that port must be free) and runs Chromium at 360 wide with touch, 180 wide (a phone at 200% zoom) and 1280 with a mouse. Success ends "207 passed, 0 failed" (about 1 to 2 minutes); screenshots go to the temporary folder it prints.
- Check the Projects page listing (after changing its line or note): `node video-editor/tests/projects-listing.mjs` (port 8794): the line shows whole at 320 and 360 pixels wide, nothing scrolls sideways, the note opens, and the link opens the app. Success ends "20 passed, 0 failed."
- See the looks side by side: `node video-editor/tests/looks-sheet.mjs` (port 8769; needs Python with Pillow and numpy). Check the phone test: `node video-editor/tests/phone-test.mjs` (port 8767); success ends "71 passed, 0 failed."
