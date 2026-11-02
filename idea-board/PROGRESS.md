# Idea board: progress (updated November 2, 2026, end of the tenth session)

A little app like Apple's Freeform, just for Dan: typed notes, photos and links on boards, the same on his Android phone and on a computer. Live at https://danielyoonwrites.github.io/idea-board (not listed in search engines). Read `SPEC.md` (what it does, "Tech notes," and the build plan), `DECISIONS.md` (the "In force" list first) and `CLAUDE.md`.

## Where things stand
- Done and checked:
  - The plan (pull request 103) and the plan's five questions: name "Idea board," look "Paper and ink," several boards, signing in with an email code, "index card" notes.
  - Build step 2, one board of notes saved on the device (pull request 104), and the accessibility fixes (pull request 105): checked November 2, 2026 on Dan's phone ("I tried it on the phone it works pretty well"), and by the saved checks.
  - Build step 3, several boards (pull request 106, merged November 2, 2026): checked by the 88 saved checks in a test browser and by axe-core (0 problems on five screens), November 2, 2026. Not checked on Dan's phone yet.
- In progress: nothing.
- What's saved: boards live only in the browser of the device in use (IndexedDB); a computer starts with no boards until build step 7 (saving to his account).
- Branch: `claude/cross-platform-file-sharing-k6hbnm` (the tenth session's), restarted from main after each merge. Everything is merged into main.
- Open pull requests: pull request 107, these handoff notes (notes only; nothing on the site changes).
- Not checked yet: the KakaoTalk in-app browser.
- Claude's rough estimate: 6 more small pull requests (build steps 4 to 9).

## Waiting on Dan
1. Merge the handoff notes, pull request 107: https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/107, Conversation tab, Merge pull request, Confirm merge.
2. The phone check of build step 3 (the phone may keep the old copy for up to 10 minutes): on your phone, open Chrome and go to https://danielyoonwrites.github.io/idea-board. "Your boards" shows "My board" with its notes. Tap "New board," type a name, tap "Done," add a note, then tap "← Boards": both boards are in the list. Open one, tap "Edit," change its name, tap "Done." Then tap < at the bottom of the phone: it goes back one step at a time, to the list. Tell the next session anything that felt off.

## Next step
Build plan step 4, photos: add a photo from the phone (shrunk on the phone before saving, to about 1600 pixels on the long side, as JPEG), move it, and change its size with a corner. Read `SPEC.md` ("How it works," "Tech notes," "Easy to see and read") first. Ask Dan one question at a time about anything the spec leaves open (for example how the resize corner looks), keep the accessibility checks passing (section C of the saved checks), and show screenshots before the pull request.

## Dead ends
- Placing each new note a little lower and to the right of the last (the first try in build step 2): in the screenshots the notes piled up and hid each other's words. Each new note now gets an open spot.
- Canva's connector can't make whiteboards: its create tool says "Not for videos or whiteboards."
- Opening Apple's, Samsung's and Sammy Fans' pages from the cloud session (support.apple.com, www.samsung.com, www.sammyfans.com): blocked. W3C's WCAG rules and Cloudflare's docs were read as their source files on GitHub instead (`CLOUD-NOTES.md`).

## How to run and check it
- Run: nothing to install; the app is plain files. Open https://danielyoonwrites.github.io/idea-board, or serve the repository folder (`python3 -m http.server`) and open `/idea-board/`.
- Check: `node idea-board/tests/app-test.mjs` from the repository folder. It runs Chromium at 360 wide with touch, 1280 with a mouse, and 180 (a phone with its zoom at 200%), serving the repository on http://127.0.0.1:8766 (that port must be free). Success ends "88 passed, 0 failed"; screenshots go to the temporary folder it prints.
- Accessibility: `node idea-board/tests/axe-check.mjs <path to axe.min.js>` runs Deque's axe-core checker on five screens. It needs axe-core 4.10.2 installed with npm in a scratch folder, never in the repository. Success: "0 problems" on every screen.
