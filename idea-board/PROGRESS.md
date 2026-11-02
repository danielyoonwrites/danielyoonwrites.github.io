# Idea board: progress (updated November 2, 2026, eleventh session)

A little app like Apple's Freeform, just for Dan: typed notes, photos and links on boards, the same on his Android phone and on a computer. Live at https://danielyoonwrites.github.io/idea-board (not listed in search engines). Read `SPEC.md` (what it does, "Tech notes," and the build plan), `DECISIONS.md` (the "In force" list first) and `CLAUDE.md`.

## Where things stand
- Done and checked:
  - The plan (pull request 103) and the plan's five questions: name "Idea board," look "Paper and ink," several boards, signing in with an email code, "index card" notes.
  - Build step 2, one board of notes saved on the device (pull request 104), and the accessibility fixes (pull request 105): checked November 2, 2026 on Dan's phone ("I tried it on the phone it works pretty well").
  - Build step 3, several boards (pull request 106): checked November 2, 2026 on Dan's phone ("it feels good and works well").
  - Notes line up on the dots (pull request 108, Dan's idea, merged November 2, 2026): checked by the saved checks; Dan hasn't said yet how it felt on his phone.
- In progress: pull request 109, build step 4, photos. Dan's four answers (November 2, 2026): "Add a note" became "Add," and a new note's screen has "Photo" ("A"); photos already on the phone only, "Take a photo" after build step 7 ("C"); a tap opens a photo on its own screen with "Done" and "Remove" ("A"); a thin ink size corner, like a picture frame's ("A"). A photo is shrunk on the phone to 1600 pixels on the long side (a JPEG, without hidden details like where it was taken), saved in its own database ("idea-board-photos"), lands in line with the notes, moves and settles like a note, and its size settles in steps that line up with notes (220 is one note wide, 476 two). 158 saved checks pass (49 new: section F and more in section C), and axe-core finds 0 problems on eight screens.
- What's saved: boards and photos live only in the browser of the device in use (IndexedDB); a computer starts with no boards until build step 7 (saving to his account).
- Branch: `claude/exciting-feynman-c90w53` (the eleventh session's), restarted from main after each merge.
- Open pull requests: pull request 109.
- Not checked yet: the KakaoTalk in-app browser (whether its photo picker opens is unknown).
- Claude's rough estimate: 5 more small pull requests (build steps 5 to 9).

## Waiting on Dan
1. Merge pull request 109: https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/109, Conversation tab, Merge pull request, Confirm merge.
2. The check on his phone, after the merge (publishing takes a minute or two; the phone may keep the old copy for up to 10 minutes):
   1. On your phone, open Chrome and go to https://danielyoonwrites.github.io/idea-board.
   2. Tap "New board," type "Test," and tap "Done."
   3. Tap "Add," then "Photo." Your phone's photo picker opens: choose a photo. It lands on the board, in line.
   4. Tap the photo: it opens big. Check it looks sharp enough. Tap "Done."
   5. Drag the photo and let go: it settles on the dots. Drag its small corner (bottom right) outward and let go: it gets bigger and keeps its shape.
   6. Close Chrome and open the page again: the photo is still there.
   7. To remove the test board: tap "Edit," then "Remove board," then "Remove."

## Next step
First ask how the check of pull request 109 went (and how lining up felt, pull request 108). Then build plan step 5, links: a web address and a title on a small card; tapping the card opens the page.
- Ask Dan open question 9 in `SPEC.md` first: how to add a link.
- Links settle onto the spots and go in line like notes and photos (`onSpot()`, `openSpot()` with the card's own size, `itemSize()`), and open on their own screen or straight away (ask). The page's safety rule (`index.html`) must allow opening links in a new tab; nothing is fetched from the linked site.
- Raise the file links to `?v=6`, add checks (a section G), and show screenshots before the pull request.

## Dead ends
- Placing each new note a little lower and to the right of the last (the first try in build step 2): in the screenshots the notes piled up and hid each other's words. Each new note now gets an open spot.
- Settling onto whichever dots show at the zoom you're at (the first try in pull request 108): zoomed out, fewer dots show, so a note placed close in could never line up exactly with one placed zoomed out. The spots are now the same at every zoom (every 64 board pixels).
- Every dot (32 board pixels) as a spot: zoomed out the way a phone shows several notes, a finger would have only about 6 to 8 screen pixels of leeway.
- New notes placed only "near the middle of the screen": the board glides to show each new note, so the middle moves and new notes ended up out of line. They now follow the rows and columns of the item nearest the middle.
- Photos in a new store of the boards' database (the plan before pull request 109): that needs the database opened as version 2, and a phone still running the old copy of the app (up to 10 minutes after a merge) would then fail to open the boards, or hold up the change while its tab stays open. Photos now have their own database.
- In the saved checks, a tap right after a quick finger move: Chrome takes it as "stop sliding" and sends no click with it, so check E4 taps an empty spot first.
- Canva's connector can't make whiteboards: its create tool says "Not for videos or whiteboards."
- Opening Apple's, Samsung's and Sammy Fans' pages from the cloud session (support.apple.com, www.samsung.com, www.sammyfans.com): blocked. W3C's WCAG rules and Cloudflare's docs were read as their source files on GitHub instead (`CLOUD-NOTES.md`).

## How to run and check it
- Run: nothing to install; the app is plain files. Open https://danielyoonwrites.github.io/idea-board, or serve the repository folder (`python3 -m http.server`) and open `/idea-board/`.
- Check: `node idea-board/tests/app-test.mjs` from the repository folder. It runs Chromium at 360 wide with touch, 1280 with a mouse, and 180 (a phone with its zoom at 200%), serving the repository on http://127.0.0.1:8766 (that port must be free). Success ends "158 passed, 0 failed" (about a minute; two checks wait out the 8-second Undo); screenshots go to the temporary folder it prints. Section E checks the lining up, section F the photos (test photos are drawn in the page; `withPhoneDetails()` adds a made-up location and a quarter turn, like a phone's camera).
- Accessibility: `node idea-board/tests/axe-check.mjs <path to axe.min.js>` runs Deque's axe-core checker on eight screens. It needs axe-core 4.10.2 installed with npm in a scratch folder, never in the repository. Success: "0 problems" on every screen.
