# Photo Filters: decisions

Each decision with its reason, oldest first. Only add to this file; if a decision changes, add a new entry that says which one it replaces.

## In force (November 2, 2026)

Every decision below that still holds, one line each; it's rewritten at each handoff. The log under it has each one with its reason, and is only added to.

- November 2, 2026: built in the website's repository, in `photo-filters/`, with the usual pull requests (Dan's "a").
- November 2, 2026: a web app in the browser, not a native Android app (the spec's question 2, settled by the "a").
- November 2, 2026: the name "Photo Filters," at https://danielyoonwrites.github.io/photo-filters (Dan: "call it Photo Filters").
- November 2, 2026: tested in Chrome on the Galaxy S26 Ultra and in Safari on the MacBook (Dan's "b").
- November 2, 2026: all five looks stay for now; Dan decides after seeing them side by side in Milestone 2 (Dan's "a").
- November 2, 2026: the Milestone 1 plan, four pull requests: the plan; choose a photo; Warm natural next to the original; Export (Dan's "ok").
- November 2, 2026: plain HTML, CSS and JavaScript with no build tools; `PROGRESS.md` and `DECISIONS.md` instead of NOTES.md; each step pushed to Claude's work branch as a pull request; hosting on GitHub Pages (Dan's "ok" on the plan).
- November 2, 2026: a neutral dark gray look with the device's own fonts; the looks worked out in plain JavaScript in a Web Worker (WebGL2 only if that's too slow); a Content-Security-Policy and `noindex`, like Idea board (Claude's choices in the plan, OK'd with it).

## Log (oldest first)

### November 2, 2026: build it here, in the website's repository (pull request 114)
- Decision: Photo Filters lives in `photo-filters/` in the website's repository, built with the usual pull requests and tested at https://danielyoonwrites.github.io/photo-filters. Dan's "a."
- Why: the spec's opening message was written for a folder on the MacBook, and this cloud session works in the website's repository. Claude recommended "a": it's the routine Dan already uses for his other apps, and every step can be tested on his phone. A cloud session can't see the MacBook's files.
- Turned down: "b," a folder on the MacBook with Claude Code in Terminal (the plan on Dan's Notion page "Photo Looks app: Claude Code spec (Nov 2026)").
- It also answered the spec's question 2 (a web app in the browser, not a native Android app; the Notion page lists the same choice: "Build a native Android app only if it's needed later") and question 4 (Claude Code on the web; the project on GitHub).

### November 2, 2026: the name "Photo Filters" (pull request 114)
- Decision: the app is called "Photo Filters," in the folder `photo-filters/`.
- Why: Dan: "call it Photo Filters."
- Turned down: keeping the working name "Photo Looks" (Claude's recommendation, "A").
- Inside the app, the spec still calls each style a "look" (for example "Save as my look"). Whether those words change can be asked when they're built.

### November 2, 2026: Chrome on the phone, Safari on the MacBook (pull request 114)
- Decision: test in Chrome on the Galaxy S26 Ultra and in Safari on the MacBook. Dan's "b."
- Why: the spec asked which browser the phone uses; Claude added the MacBook, since Milestone 1 is tested there. Claude had recommended Chrome on both if Dan used more than one, because Claude's checks run in Chromium.
- What it means: Claude's checks run in Chromium only (WebKit isn't installed in the cloud sessions), so Safari support is checked in the docs first and settled by Dan's MacBook tests.
- Turned down: "A" (Chrome on both), "C" and "D" (Samsung Internet on the phone).

### November 2, 2026: keep all five looks for now (pull request 114)
- Decision: keep Clean natural, Warm natural, Bright café, Y2K film and Soft glow. Dan decides what to add or drop after seeing them side by side on his own photo in Milestone 2. Dan's "a."
- Why: his spec says "I judge looks by seeing them, not from descriptions," and Milestone 1 uses only Warm natural.
- Turned down: "B," changing the list before seeing the looks.

### November 2, 2026: the Milestone 1 plan, and where it differs from the spec (pull request 114)
- Decision: Milestone 1 is four pull requests: the plan; choose a photo and see it right side up; Warm natural next to the original; Export (`SPEC.md`, "Build plan for Milestone 1"). Each step is tested on the phone and the MacBook. Dan: "ok."
- The changes from the spec, OK'd with the plan:
  - Plain HTML, CSS and JavaScript instead of Vite and TypeScript (the spec only suggested them), because of the website's no-build-tools rule (kept November 2, 2026, root `DECISIONS.md`). Dan can open and edit every file by hand.
  - `PROGRESS.md` and `DECISIONS.md` instead of NOTES.md, like the other apps.
  - Dan's rule "Ask before pushing anywhere": the OK covers pushing each step to Claude's work branch and opening a pull request. Nothing goes live until he merges.
  - Hosting on GitHub Pages, where the website already is. GitHub's help says Pages is available in public repositories with GitHub Free (checked November 2, 2026; `SPEC.md`, "Technical notes"). The app is online from the first merge, so Milestone 2 doesn't need the same Wi-Fi, and Milestone 5 is only the home screen and offline parts. The repository is public, so it never holds personal photos.
- Claude's choices in the plan, OK'd with it (Dan sees them in screenshots and can change them):
  - A plain, neutral dark gray around the photos, so the background doesn't change how their colors look, and the device's own fonts, so nothing loads from other sites. (The Video editor is dark too, Dan's "A" there, for a similar reason: a bright page can make a video look darker than it is.)
  - The looks worked out in plain JavaScript in a background helper (a Web Worker), so the screen doesn't freeze, timed against the spec's goals. WebGL2 only if that's too slow.
  - Like Idea board: a Content-Security-Policy, so the page uses only its own files, and `noindex`.
- Turned down: Vite and TypeScript, with React only if it helps (the spec's "Technical notes").
