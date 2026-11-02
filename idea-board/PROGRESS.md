# Idea board: progress (updated November 2, 2026, eleventh session)

A little app like Apple's Freeform for typed notes, photos and links on boards, the same on a phone and a computer: built to work for everyone, used just by Dan for now. Live at https://danielyoonwrites.github.io/idea-board (not listed in search engines). Read `SPEC.md` (what it does, "Tech notes," and the build plan), `DECISIONS.md` (the "In force" list first) and `CLAUDE.md`.

## Where things stand
- Done and checked:
  - The plan (pull request 103) and its five questions: name "Idea board," look "Paper and ink," several boards, signing in with an email code, "index card" notes.
  - Build step 2, one board of notes saved on the device (pull request 104), and the accessibility fixes (pull request 105): checked on Dan's phone ("I tried it on the phone it works pretty well").
  - Build step 3, several boards (pull request 106): checked on Dan's phone ("it feels good and works well").
  - Notes line up on the dots (pull request 108, Dan's idea) and build step 4, photos (pull request 109), both merged November 2, 2026. Dan tried photos on his computer: a photo wouldn't line up with two notes made before lining up existed; after he dragged each note once: "it works."
- In progress: pull request 113: the dots drawn exactly, on a canvas (a repeating background had drifted a few pixels from the spots, on Dan's computer too), and Dan's two decisions: saving to an account comes next, and it's built to work for everyone, used just by him for now. 161 saved checks pass, and axe-core finds 0 problems on eight screens.
- What's saved: boards and photos live only in the browser of the device in use (IndexedDB); a computer starts with no boards until saving to an account (build step 7).
- Branch: `claude/exciting-feynman-c90w53` (the eleventh session's), restarted from main after each merge.
- Open pull requests: pull request 113.
- Not checked yet: photos on Dan's phone (he tried his computer), the KakaoTalk in-app browser, and photos saved in the HEIF format.
- Claude's rough estimate: about 5 more pull requests (build steps 6 and 7, then 5, 8 and 9).

## Waiting on Dan
1. Merge pull request 113: https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/113, Conversation tab, Merge pull request, Confirm merge.
2. The quick check, after the merge (publishing takes a minute or two; the browser may keep the old copy for up to 10 minutes): on your computer, open https://danielyoonwrites.github.io/idea-board and open a board. A dot sits right at each note's and photo's top-left corner. Click − and + a few times: the dots stay on the corners.

## Next step
Build step 6: the server and signing in. Best started in a fresh session (`/handoff`, then `/clear` and `/pickup idea board`).
- It's built for many accounts and used just by Dan for now (`DECISIONS.md`, "built to work for everyone"): its own Cloudflare Worker in `idea-board/server/` with its own D1 database; each board and photo row belongs to an account; only addresses on the server's list (`ALLOWED_EMAILS`, just Dan's) can sign in.
- Signing in copies Living in the Word's email code (`living-in-the-word/server/worker.js`: codes and session keys kept only scrambled, emails through Resend). Saving the boards to the account is build step 7, a separate pull request.
- Dan's one-time Cloudflare setup, with every step: a new Worker connected to this repository with Workers Builds (root folder `idea-board/server`), its D1 database, and its secrets. Check each step against Cloudflare's docs, read as their source on GitHub (`CLOUD-NOTES.md`, "Cloudflare's docs"). Dan already uses Cloudflare for Living in the Word.
- Open question 10 in `SPEC.md` (photos on D1 or R2) comes up at build step 7; ask one question at a time.

## Dead ends
- Placing each new note a little lower and to the right of the last (the first try in build step 2): in the screenshots the notes piled up and hid each other's words. Each new note now gets an open spot.
- Settling onto whichever dots show at the zoom you're at (the first try in pull request 108): a note placed close in could never line up exactly with one placed zoomed out. The spots are the same at every zoom (every 64 board pixels).
- Every dot (32 board pixels) as a spot: zoomed out the way a phone shows several notes, a finger would have only about 6 to 8 screen pixels of leeway.
- New notes placed only "near the middle of the screen": the board glides to show each new note, so the middle moves and new notes ended up out of line. They follow the rows and columns of the item nearest the middle.
- Photos in a new store of the boards' database (the plan before pull request 109): a phone still running the old copy of the app would then fail to open the boards. Photos have their own database.
- Drawing the dots as a repeating background (pull requests 108 and 109): browsers round its little squares, and the dots drifted 1 to 4 screen pixels from the spots in a test browser, more on Dan's computer. They're drawn on a canvas now.
- In the saved checks, a tap right after a quick finger move: Chrome takes it as "stop sliding" and sends no click with it, so check E4 taps an empty spot first.
- Canva's connector can't make whiteboards: its create tool says "Not for videos or whiteboards."
- Opening Apple's, Samsung's and Sammy Fans' pages from the cloud session: blocked. W3C's WCAG rules and Cloudflare's docs were read as their source files on GitHub instead (`CLOUD-NOTES.md`).

## How to run and check it
- Run: nothing to install; the app is plain files. Open https://danielyoonwrites.github.io/idea-board, or serve the repository folder (`python3 -m http.server`) and open `/idea-board/`.
- Check: `node idea-board/tests/app-test.mjs` from the repository folder. It runs Chromium at 360 wide with touch, 1280 with a mouse, 180 (a phone with its zoom at 200%) and a sharp 1000-wide screen, serving the repository on http://127.0.0.1:8766 (that port must be free). Success ends "161 passed, 0 failed" (about a minute); screenshots go to the temporary folder it prints. Section E checks the lining up (E10 the dots on a sharp screen, read straight from the dots' canvas), section F the photos.
- Accessibility: `node idea-board/tests/axe-check.mjs <path to axe.min.js>` runs Deque's axe-core checker on eight screens. It needs axe-core 4.10.2 installed with npm in a scratch folder, never in the repository. Success: "0 problems" on every screen.
