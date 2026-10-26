# Living in the Word

A little app that turns a Bible passage into discussion questions for a small group. It lives in this folder and is published at https://danielyoonwrites.github.io/living-in-the-word. Read `SPEC.md` first, and keep its "Build plan" up to date.

## Rules for working here

- Same rules as the website's `CLAUDE.md`: plain words for a beginner, one small change per pull request with a check the owner does, no build tools, Moon jar design, phone first.
- The owner is a pastor and reviews every question before it's shared. Never share anything automatically.
- Be careful with Scripture: never invent a quote. Stage 1 shows only the passage name, not the text. Before showing any Bible text, check that translation's usage rules.
- The AI writes exactly 4 questions per passage, in the order set in `server/worker.js` (`PATTERNS`); the general questions in `app.js` are the fallback. There's no study method to choose: the owner removed them on October 26, 2026 (see `SPEC.md`). Don't add one back unless he asks. Mark anything that couldn't be checked.
- Stage 1 sends nothing anywhere. Save recent studies only in the browser (`localStorage`, key `living-in-the-word`). No accounts, analytics or tracking.
- Never put an AI key or any secret in this folder. The website is public, so anyone can read its code. The AI helper in stage 2 needs its own server; its plan is `AI-PLAN.md`. Server code may live in `server/`, never with a key in it.
- Raise the `?v=` number on file links whenever a file changes.
