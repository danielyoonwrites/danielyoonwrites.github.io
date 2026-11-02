# Idea board

Read `PROGRESS.md` first (where it stands and the next step), then `DECISIONS.md` (choices and their reasons) and `SPEC.md`.

A little app for typed notes, photos and links on one big board, like Apple's Freeform, for the owner's Android phone and a computer's web browser. "Idea board" is a working name (planned November 2, 2026). It lives in this folder and will be published at https://danielyoonwrites.github.io/idea-board. Keep the "Build plan" in `SPEC.md` up to date.

## Rules for working here

- Same rules as the website's `CLAUDE.md`: plain words for a beginner, one small change per pull request with a check the owner does, no build tools, phone first.
- It's just for the owner: no sharing, no live collaboration, no other accounts. Once the server exists (build step 6), only a device signed in with his own address (`OWNER_EMAIL`) can open the boards.
- Never send the boards anywhere except this app's own server. No AI, analytics or tracking.
- Never lose work: every change saves by itself, a save made from an older copy never overwrites a newer one, and the backup file stays the same versioned JSON, so old backups keep working.
- Never put a key or any secret in this folder: the repository and the website are public. Secrets live only in Cloudflare.
- The look isn't chosen yet (`SPEC.md`, "Open questions"). If it's the Moon jar design, add `"/idea-board/**"` to the `paths` list at the top of `.claude/rules/moon-jar.md`.
- Screenshots for pull requests use made-up notes and plain test photos, never the owner's own boards (the privacy rule in the root `CLAUDE.md`).
- Raise the `?v=` number on file links whenever a file changes.
