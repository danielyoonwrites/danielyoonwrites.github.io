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
- November 2, 2026: build step 2's screen: "Choose photo" in a bar at the bottom; the photo right side up, about 1,080 pixels wide, with its size in pixels and megapixels; a plain message for a file the browser can't open; a page with a made-up tall test photo for the MacBook (Claude's choices, shown to Dan in screenshots with pull request 117).
- November 2, 2026: build step 3: the Warm natural look next to the original, one above the other on a phone and side by side on a computer; worked out in a background helper (the page does it itself if the helper can't start); the softness blur's radius is its standard deviation, made with three quick box blurs (Claude's choices, shown to Dan in screenshots with pull request 118).

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

### November 2, 2026: build step 2, choosing a photo (pull request 117)
- Decision (Claude's choices, shown to Dan in screenshots with pull request 117; he can change any of them):
  - One screen: "Photo Filters" at the top, the photo in the middle, and "Choose photo" in a bar at the bottom, where a thumb reaches when holding the phone in one hand (the spec: "big tap targets and one-handed use").
  - Before a photo: "Choose a photo to start. It stays on this device: nothing is uploaded."
  - The photo shows right side up, as a copy about 1,080 pixels wide (the spec's preview size), with its size under it, for example "4,000 × 3,000 pixels (12.0 MP)," so it can be matched to the spec's "12 MP."
  - A file the browser can't open: "This browser couldn't open that file. Please choose a JPEG photo." (the spec: "If the browser can't open a file, say so in plain words").
  - The colors: the page #1c1c1c; words #ececec (14.43 to 1); smaller words #a8a8a8 (7.17 to 1); the button #ececec with #1c1c1c words; the message's edge #7a7a7a (3.97 to 1). The main button is 56 pixels high.
  - A made-up tall test photo (`tests/tall-test-photo.jpg`: 3,000 by 4,000 as you see it, saved turned with rotation tag 6, and a made-up location, 30 degrees north and 140 degrees west, open ocean) on its own page, `tests/test-photos.html`, so the Safari check doesn't depend on having a phone photo on the MacBook. It came earlier than planned: the plan had a test picture arriving with Export (step 4), which will use it too.
  - The saved checks start with this step instead of step 3.
- Why: the plan's step 2, and Dan's rules: "Phone first," "Show me side-by-side previews," and "Check, don't guess."

### November 2, 2026: build step 3, Warm natural next to the original (pull request 118)
- Decision (Claude's choices, shown to Dan in screenshots with pull request 118; he can change any of them):
  - The two pictures are labeled "Original" and "Warm natural." On a phone they're one above the other; on a screen at least 700 pixels wide (a computer), side by side. On a phone 360 pixels wide, each picture of a wide photo shows about 328 pixels wide when they're one above the other, but only about 160 side by side; a tall photo also comes out a little bigger one above the other.
  - The look is worked out on the screen's smaller copy (about 1,080 pixels wide) by a background helper (`worker.js`), so the screen doesn't freeze. If the helper can't start, the page does the same work itself. "Making the Warm natural look…" shows while it works, and the look's picture is an empty gray box until it's ready.
  - Only Warm natural's steps are built (temperature, contrast, saturation, softness), in the spec's order; the others come with the other looks in Milestone 2.
  - The softness blur's "radius" (the spec: "r × image width") is taken as the blur's standard deviation, because that's what the word means in Pillow's GaussianBlur and in CSS's blur() (both opened November 2, 2026; `SPEC.md`, "Checked so far"). The spec doesn't say which it means, and its numbers were tuned by eye, so Dan's eye decides in the end.
  - The Gaussian blur is made with three quick box blurs in a row, as Pillow's GaussianBlur does ("a sequence of extended box filters"); the saved checks show the three add up to within 8% of the Gaussian's spread.
  - The page's safety rule allows its own background helper: `worker-src 'self'` and `child-src 'self'` (Safari before 15.5 reads `child-src`; MDN's browser data, November 2, 2026).
- Measured in Chromium on Claude's cloud computer (not a phone): the look took about 0.4 seconds on a 1,000 by 2,000 copy, and a 12 MP photo's look was ready about 1.2 seconds after choosing it.
- Why: the plan's step 3, and Dan's rules: "Show me side-by-side previews" and "Phone first."
- Turned down: WebGL2 for now (harder to read and change by hand; the plan keeps it for when plain JavaScript is too slow).
