# Church board (working name)

Read `PROGRESS.md` first (where it stands and the next step), then `DECISIONS.md` (choices and their reasons) and `SPEC.md`. Re-read the parts of `SPEC.md` a build step needs before starting it.

A little app for the owner's church group, planned November 5, 2026: a private board where members post to find people to hang out with (grab food, watch a movie), share photos from those times, and read announcements. It lives in this folder and will be published at https://danielyoonwrites.github.io/church-board (not listed in search engines). The name and address may change (open question 11 in `SPEC.md`). Keep the "Build plan" in `SPEC.md` up to date.

## Rules for working here

- Same rules as the website's `CLAUDE.md`: plain words for a beginner, one small change per pull request with a check the owner does, no build tools, phone first, screenshots before every pull request.
- Only the owner's church group, invite only, and he approves each person (his "A," November 5, 2026). Adults only, 18 and up (his "A," the same day).
- "Social purposes ... but not social media" (the owner's words): no likes or counts, newest first, no ads, tracking or AI, nothing public (Claude's reading, in `SPEC.md`, "Not social media").
- Privacy: the repository and the website are public. Never put the app's real name, the church's name, any member's name, face or email address, or a key in this folder, in a commit message, in a pull request, in a screenshot or in test data. The real name is saved in Cloudflare as the secret `BOARD_NAME` and in the owner's private Notion notes ("Church board app (Nov 2026)," under Master Notes). Saved checks and screenshots use made-up people and drawn pictures, never real photos.
- Members' names, photos and posts go only to this app's own server: never to an AI, analytics or anyone else.
- Ask before anything that costs money (Cloudflare's paid plan, R2 if it needs a payment method).
