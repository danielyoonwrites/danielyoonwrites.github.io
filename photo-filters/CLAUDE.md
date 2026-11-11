# Photo Filters

Read `PROGRESS.md` first (where it stands and the next step), then `DECISIONS.md` (choices and their reasons) and `SPEC.md`. Re-read `SPEC.md` before starting each phase or milestone.

A little app that puts Dan's own "looks" on his photos, in the browser of his Samsung Galaxy S26 Ultra and his MacBook, so they look natural and a little soft instead of over-processed. Planned November 2, 2026. It lives in this folder and will be published at https://danielyoonwrites.github.io/photo-filters (not listed in search engines). Keep "Build plan for Milestone 1" in `SPEC.md` up to date.

Dan wrote the rules below in a claude.ai chat on November 2, 2026, for an app then called Photo Looks. They were fitted to this repository the same day, with his OK on the Milestone 1 plan; each change says so.

## About me (Dan's words)

- I'm rusty at coding. I built with React Native, Expo and Firebase years ago but don't remember much. Explain what you're doing in plain words, one step at a time.
- When I need to do something, like run a command, open a page or tap something on my phone, give me the exact steps.
- I judge visual things by seeing them. Show me side-by-side previews instead of describing them.
- I've started apps before and not finished them. Keep each step small enough to finish, and tell me when a milestone is done.

## How we work (Dan's words)

- **Plan first.** For each milestone, write a short plan and wait for my OK before writing code.
- **Small steps.** After each step, tell me how to test it on my Galaxy S26 Ultra and on my MacBook. (Chrome on the phone, Safari on the MacBook: Dan's "b," November 2, 2026.)
- **Git.** Commit after each working step with a clear message. Ask before pushing anywhere.
  - Dan's OK on the Milestone 1 plan (November 2, 2026) covers pushing each step to Claude's work branch and opening a pull request, the way this repository works. Nothing goes live until he merges. Anything else still needs asking first.
- **Free only.** Ask before adding anything that might cost money or need an account.
- **Privacy:**
  - Photos stay on my device. No uploads, analytics, trackers, or scripts that send data.
  - Never commit personal photos. Test photos go in a git-ignored folder. (`test-photos/`, listed in this folder's `.gitignore`.)
- **Stay in the current phase.** Ask before adding features.
- **Check, don't guess.** For browser support, file formats and limits, test or check the docs. Tell me what you found and how sure you are.
- **If something fails twice,** stop and explain my options in plain words.
- **Keep the notes up to date** with what's done, decisions and why, and what's next, so a new session can pick up where we left off: `PROGRESS.md` and `DECISIONS.md`, like the other apps in this repository. (Dan's version said NOTES.md; changed with his OK, November 2, 2026.)

## Rules for this repository

- Same rules as the website's `CLAUDE.md`: plain words for a beginner, one small change per pull request with a check Dan does, phone first, and screenshots before every pull request.
- No build tools: plain HTML, CSS and JavaScript that Dan can open and edit by hand. His spec suggested Vite and TypeScript; his OK on November 2, 2026 chose plain files, the website's rule.
- The repository and the website are public. Never put a personal photo, a key or any secret in this folder. The saved checks draw made-up test pictures, and screenshots use those too, never Dan's photos (and never his kids: the privacy rule in the root `CLAUDE.md`).
- Exports: a full-resolution JPEG, right side up, with no location. A photo saved again through a canvas leaves out the original's hidden details (like where it was taken); keep it that way, and keep checking it.
- From build step 2 the page has a Content-Security-Policy near the top of `index.html`, like Idea board: it may only use its own files. Put words into the page with `textContent`, never as HTML, and no inline scripts or `style="..."` attributes.
- The look: plain, neutral dark gray around the photos, so the background doesn't change how their colors look, and the device's own fonts (Claude's choice in the plan; Dan can change it after seeing it). Details in `SPEC.md`, "The look of the app."
- Claude's checks run in Chromium only (WebKit isn't installed in the cloud sessions). Safari is checked in the docs first and settled by Dan's MacBook tests; say which is which.
- The looks' math lives only in `looks.js`, in the spec's order: the background helper (`worker.js`) uses it, the page uses it if the helper can't start, and the saved checks use it. When `looks.js` changes, raise its `?v=` number in both `index.html` and `worker.js`.
- Run the saved checks after any change to `app.js`, `looks.js` or the page, and add checks for new work: `node photo-filters/tests/app-test.mjs` from the repository folder (it must end "0 failed"). The test photos are made up; never use Dan's.
- Raise the `?v=` number on file links whenever a file changes.
