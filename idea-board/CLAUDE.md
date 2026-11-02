# Idea board

Read `PROGRESS.md` first (where it stands and the next step), then `DECISIONS.md` (choices and their reasons) and `SPEC.md`.

A little app for typed notes, photos and links on one big board, like Apple's Freeform, for the owner's Android phone and a computer's web browser, planned November 2, 2026. It lives in this folder and will be published at https://danielyoonwrites.github.io/idea-board. Keep the "Build plan" in `SPEC.md` up to date.

## Rules for working here

- Same rules as the website's `CLAUDE.md`: plain words for a beginner, one small change per pull request with a check the owner does, no build tools, phone first.
- It's just for the owner: no sharing, no live collaboration, no other accounts. Once the server exists (build step 6), only a device signed in with his own address (`OWNER_EMAIL`) can open the boards.
- Never send the boards anywhere except this app's own server. No AI, analytics or tracking.
- Never lose work: every change saves by itself, a save made from an older copy never overwrites a newer one, and the backup file stays the same versioned JSON, so old backups keep working.
- Never put a key or any secret in this folder: the repository and the website are public. Secrets live only in Cloudflare.
- The look is "Paper and ink," like Living in the Word (the owner's choice, November 2, 2026), not the website's Moon jar design. Colors and fonts are at the top of `style.css`; the rest is in `SPEC.md`, "The look."
- The page has a Content-Security-Policy (near the top of `index.html`): it may only run its own script and use its own style sheet and Google's fonts. If you add an outside service (a font, an image, a server), add it there too, or the browser blocks it. Put words into the page with `textContent`, never as HTML, and no inline scripts or `style="..."` attributes in the HTML.
- Run the saved checks after any change to `app.js`, and add checks for new work: `node idea-board/tests/app-test.mjs` from the repository folder (it must end "0 failed").
- Screenshots for pull requests use made-up notes and plain test photos, never the owner's own boards (the privacy rule in the root `CLAUDE.md`).
- Raise the `?v=` number on file links whenever a file changes.
