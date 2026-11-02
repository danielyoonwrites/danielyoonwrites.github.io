# Idea board: progress (updated November 2, 2026, end of the eleventh session)

A little app like Apple's Freeform for typed notes, photos and links on boards, the same on a phone and a computer: built to work for everyone, used just by Dan for now. Live at https://danielyoonwrites.github.io/idea-board (not listed in search engines). Read `SPEC.md` (what it does, "Tech notes," the build plan), `DECISIONS.md` (the "In force" list first) and `CLAUDE.md`.

## Where things stand
- Done and checked:
  - The plan (pull request 103) and its five questions: name "Idea board," look "Paper and ink," several boards, signing in with an email code, "index card" notes.
  - Build step 2, one board of notes on the device (pull request 104), and the accessibility fixes (105): checked November 2, 2026 on Dan's phone ("I tried it on the phone it works pretty well").
  - Build step 3, several boards (106): checked November 2, 2026 on Dan's phone ("it feels good and works well").
  - Notes line up on the dots (108) and build step 4, photos (109), merged November 2, 2026: tried on Dan's computer the same day. A photo wouldn't line up with two notes made before lining up existed (they sat between the spots); after he dragged each note once: "it works." Photos are not checked on his phone yet.
  - The dots drawn exactly, on a canvas (113), merged November 2, 2026: checked by the saved checks and by measuring rows of dots in a test browser (under 0.1 screen pixels from the spots, against 1 to 4 before). Not checked on Dan's computer yet.
- In progress: nothing. These notes are in pull request @@PR@@.
- What's saved: boards and photos live only in the browser of the device in use (IndexedDB); a computer starts with no boards until build step 7 saves them to an account.
- Branch: `claude/exciting-feynman-c90w53` (the eleventh session's); everything up to pull request 113 is merged into main.
- At the same time, other sessions worked in this repository: the video editor (`video-editor/`, pull requests 110 to 112) and Photo Filters (`photo-filters/`, 114). Their notes are their own.
- Not checked yet: photos on Dan's phone, the dots on his computer, the KakaoTalk in-app browser, photos saved in the HEIF format.
- Claude's rough estimate: about 5 more pull requests (build steps 6 and 7, then 5, 8 and 9).

## Waiting on Dan
1. Merge the handoff notes, pull request @@PR@@: https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/@@PR@@, Conversation tab, Merge pull request, Confirm merge.
2. The checks, any time (a phone or browser may keep the old copy for up to 10 minutes after a merge):
   - On his computer: open https://danielyoonwrites.github.io/idea-board and a board. A dot sits right at each note's and photo's top-left corner. Click − and + a few times: the dots stay on the corners.
   - On his phone, photos: open Chrome and go to https://danielyoonwrites.github.io/idea-board. Tap "New board," type "Test," tap "Done." Tap "Add," then "Photo," and choose a photo: it lands in line. Tap it: it opens big; check it looks sharp enough; tap "Done." Drag it and let go: it settles on the dots. Drag its small corner (bottom right) outward: it gets bigger and keeps its shape. Close Chrome and open the page again: it's still there. To remove the test board: "Edit," then "Remove board," then "Remove."
   - Notes on his boards made before lining up (before November 2, 2026) sit between the spots: drag each one once and it joins the rows.

## Next step
Build step 6: the server and signing in. First ask how the checks went ("Waiting on Dan," item 2).
- What it is: Idea board's own Cloudflare Worker in `idea-board/server/`, with its own D1 database. Signing in with an email code, like Living in the Word. Built for many accounts (every board and photo row belongs to an account, and the server answers each person only about their own), but only addresses on the server's list can sign in (`ALLOWED_EMAILS`, just Dan's for now; how it's written, for example addresses separated by commas, is to be decided). The app gets its sign-in screens (through `goDeeper()`); saving the boards to the account is build step 7, its own pull request.
- Read first: `living-in-the-word/server/worker.js` (the email code: codes and session keys kept only scrambled, emails through Resend, a device signed in for 90 days) and `living-in-the-word/SIGNUP-PLAN.md` (how that app lets invited people in, useful when sign-ups open; and its "Known limits"); `living-in-the-word/server/wrangler.jsonc` and `living-in-the-word/PROGRESS.md` (how Cloudflare's Workers Builds deploys a Worker after every merge); `CLOUD-NOTES.md` (Cloudflare's docs read as their source on GitHub; testing a Worker in Node with a stand-in for D1).
- Things to carry over, adjusted: Living in the Word's `connectionCode()` mixes in its `PASSCODE`, and Idea board has no passcode, so it needs a secret of its own for that (its `SIGNUP-PLAN.md`, step S6, says the same). Its `ALLOWED_ORIGINS` lets in `http://127.0.0.1:8765` (its tests); Idea board's tests use `http://127.0.0.1:8766`. Both apps share the website's browser storage (danielyoonwrites.github.io), so Idea board's session key needs a name of its own.
- Dan's one-time Cloudflare setup, with every step and full links, each checked against Cloudflare's docs, in this order: make the D1 database (he sends its ID for `wrangler.jsonc`); choose the Worker's name, which sets its address (probably `https://idea-board.danyoonsignup.workers.dev`, like Living in the Word's `https://living-in-the-word.danyoonsignup.workers.dev`; unchecked) and so the page's `connect-src`; connect the Worker to this repository with Workers Builds (root folder `idea-board/server`) before merging ("Connect first, then merge," `living-in-the-word/PROGRESS.md`); then the secrets, by name only: `RESEND_API_KEY`, `ALLOWED_EMAILS` and the new secret (secrets never go in the repository).
- Emails: Living in the Word already allows itself 90 sign-in emails a day (`EMAILS_ALL` in its `worker.js`) of Resend's free 100 a day, so on the same Resend account Idea board would have about 10 a day left.
- Ask Dan, one question at a time, each with a recommendation: (1) how the checks went; (2) whether Idea board's codes come from Living in the Word's Resend account and sending address, with a key of its own (and what that does to the daily limit); (3) whether the app still works before signing in, with the boards kept on the device as now.
- The page's safety rule (`index.html`, Content-Security-Policy) has to allow the server's address (`connect-src`). Raise the file links to `?v=7`, add server and app checks and the new screens to `tests/axe-check.mjs`, and show screenshots before the pull request.
- Open question 10 in `SPEC.md` (photos on D1 or R2) comes up at build step 7.

## Dead ends
- Placing each new note a little lower and to the right of the last (the first try in build step 2): the notes piled up and hid each other's words. Each new note gets an open spot.
- Settling onto whichever dots show at the zoom you're at (the first try in pull request 108): a note placed close in could never line up exactly with one placed zoomed out. The spots are the same at every zoom (every 64 board pixels).
- Every dot (32 board pixels) as a spot: zoomed out the way a phone shows several notes, a finger would have only about 6 to 8 screen pixels of leeway.
- New notes placed only "near the middle of the screen": the board glides to show each new note, so the middle moves and new notes ended up out of line. They follow the rows and columns of the item nearest the middle.
- Photos in a new store of the boards' database (the plan before pull request 109): a phone still running the old copy of the app would then fail to open the boards. Photos have their own database.
- Drawing the dots as a repeating background (pull requests 108 and 109): browsers round its little squares, so the dots drifted 1 to 4 screen pixels from the spots in a test browser, more on Dan's computer. They're drawn on a canvas.
- Considered, not done: making old notes settle by themselves (notes saved before stay put, a choice put to Dan with pull request 108). Settling them all at once could push two close notes into each other; Dan drags each once instead.
- In the saved checks, a tap right after a quick finger move: Chrome takes it as "stop sliding" and sends no click with it, so check E4 taps an empty spot first.
- Canva's connector can't make whiteboards ("Not for videos or whiteboards"). Apple's, Samsung's and Sammy Fans' pages are blocked from the cloud session; WCAG and Cloudflare's docs were read as their source files on GitHub (`CLOUD-NOTES.md`).

## How to run and check it
- Run: nothing to install; the app is plain files. Open https://danielyoonwrites.github.io/idea-board, or serve the repository folder (`python3 -m http.server`) and open `/idea-board/`.
- Check: `node idea-board/tests/app-test.mjs` from the repository folder. It runs Chromium at 360 wide with touch, 1280 with a mouse, 180 (a phone with its zoom at 200%) and a sharp 1000-wide screen, serving the repository on http://127.0.0.1:8766 (that port must be free). Success ends "161 passed, 0 failed" (about a minute); screenshots go to the temporary folder it prints. Section E checks lining up (E10 the dots, read straight from their canvas), section F photos.
- Accessibility: `node idea-board/tests/axe-check.mjs <path to axe.min.js>` runs Deque's axe-core checker on eight screens. It needs axe-core 4.10.2 installed with npm in a scratch folder, never in the repository. Success: "0 problems" on every screen.
