# Idea board: progress (updated November 2, 2026, eleventh session)

A little app like Apple's Freeform, just for Dan: typed notes, photos and links on boards, the same on his Android phone and on a computer. Live at https://danielyoonwrites.github.io/idea-board (not listed in search engines). Read `SPEC.md` (what it does, "Tech notes," and the build plan), `DECISIONS.md` (the "In force" list first) and `CLAUDE.md`.

## Where things stand
- Done and checked:
  - The plan (pull request 103) and the plan's five questions: name "Idea board," look "Paper and ink," several boards, signing in with an email code, "index card" notes.
  - Build step 2, one board of notes saved on the device (pull request 104), and the accessibility fixes (pull request 105): checked November 2, 2026 on Dan's phone ("I tried it on the phone it works pretty well"), and by the saved checks.
  - Build step 3, several boards (pull request 106): checked November 2, 2026 on Dan's phone ("it feels good and works well"), by the saved checks and by axe-core (0 problems on five screens).
  - The tenth session's handoff notes (pull request 107), merged November 2, 2026.
- In progress: pull request 108, notes that line up (Dan's idea after trying build step 3, his choice "a"). When you let go of a note, it glides onto the nearest spot on the dots (every 64 board pixels, the same at every zoom); a new note goes in the same rows and columns as the note nearest the middle of the screen; notes saved before stay where they are until they're moved. Also a fix the checks found: a tap on a note near the top of the screen put the cursor where the finger was, so typing went into the middle of the words; it now goes at the end. 109 saved checks pass (21 new), and axe-core still finds 0 problems on five screens.
- What's saved: boards live only in the browser of the device in use (IndexedDB); a computer starts with no boards until build step 7 (saving to his account).
- Branch: `claude/exciting-feynman-c90w53` (the eleventh session's), restarted from main after each merge.
- Open pull requests: pull request 108.
- Not checked yet: the KakaoTalk in-app browser.
- Claude's rough estimate: 6 more small pull requests (build steps 4 to 9).

## Waiting on Dan
1. Merge pull request 108: https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/108, Conversation tab, Merge pull request, Confirm merge.
2. The check on his phone, after the merge (publishing takes a minute or two; the phone may keep the old copy for up to 10 minutes):
   1. On your phone, open Chrome and go to https://danielyoonwrites.github.io/idea-board.
   2. Tap "New board," type "Test," and tap "Done."
   3. Add three notes: tap "Add a note," type a word, and tap "Done," three times. Each new note lands in line with the others.
   4. Pinch with two fingers to zoom out until there's room beside the notes. Drag one note beside another, a little higher or lower than it, and let go: it slides level with its neighbor.
   5. Tap a note near the top of the screen and type a word: it goes at the end of the note's words. Tap "Done."
   6. To remove the test board: tap "Edit," then "Remove board," then "Remove."

## Next step
First ask how the check of pull request 108 went ("Waiting on Dan," item 2). Then build plan step 4, photos: add a photo from the phone (shrunk on the phone before saving, to about 1600 pixels on the long side, as JPEG), move it, and change its size with a corner. A photo settles onto the spots like a note (`onSpot()`), and a new one goes in line with the others (`openSpot()`).
- Read `SPEC.md` first: "How it works," "Easy to see and read," and in "Tech notes" the photo plan (photos in their own IndexedDB store, which means opening the database as version 2, with `onversionchange` and a wait-and-explain on `onblocked` added first) and "Lining up" (`openSpot()` and `noteOutlines()` assume a note's width, 220, so photos need their own width there).
- Ask Dan open questions 6 to 8 in `SPEC.md`, one at a time: how to add a photo, what tapping a photo does, and how the resize corner looks (and whether a photo's size settles to the spots too).
- Add photo checks to section C of `tests/app-test.mjs` and to `tests/axe-check.mjs`, check that the shrunk photo carries no location data, raise the file links to `?v=5`, and show screenshots made with plain test photos before the pull request.

## Dead ends
- Placing each new note a little lower and to the right of the last (the first try in build step 2): in the screenshots the notes piled up and hid each other's words. Each new note now gets an open spot.
- Settling onto whichever dots show at the zoom you're at (the first try in pull request 108): zoomed out, fewer dots show, so a note placed close in could never line up exactly with one placed zoomed out. The spots are now the same at every zoom (every 64 board pixels).
- Every dot (32 board pixels) as a spot: zoomed out the way a phone shows several notes, a finger would have only about 6 to 8 screen pixels of leeway, so near misses would land a dot off.
- New notes placed only "near the middle of the screen": the board glides to show each new note, so the middle moves and new notes ended up out of line with each other. They now follow the rows and columns of the note nearest the middle.
- In the saved checks, a tap right after a quick finger move: Chrome takes it as "stop sliding" and sends no click with it, so check E4 taps an empty spot first.
- Canva's connector can't make whiteboards: its create tool says "Not for videos or whiteboards."
- Opening Apple's, Samsung's and Sammy Fans' pages from the cloud session (support.apple.com, www.samsung.com, www.sammyfans.com): blocked. W3C's WCAG rules and Cloudflare's docs were read as their source files on GitHub instead (`CLOUD-NOTES.md`).

## How to run and check it
- Run: nothing to install; the app is plain files. Open https://danielyoonwrites.github.io/idea-board, or serve the repository folder (`python3 -m http.server`) and open `/idea-board/`.
- Check: `node idea-board/tests/app-test.mjs` from the repository folder. It runs Chromium at 360 wide with touch, 1280 with a mouse, and 180 (a phone with its zoom at 200%), serving the repository on http://127.0.0.1:8766 (that port must be free). Success ends "109 passed, 0 failed"; screenshots go to the temporary folder it prints. Section E checks the lining up.
- Accessibility: `node idea-board/tests/axe-check.mjs <path to axe.min.js>` runs Deque's axe-core checker on five screens. It needs axe-core 4.10.2 installed with npm in a scratch folder, never in the repository. Success: "0 problems" on every screen.
