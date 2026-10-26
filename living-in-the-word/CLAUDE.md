# Living in the Word

A little app that turns a Bible passage into discussion questions for a small group. It lives in this folder and is published at https://danielyoonwrites.github.io/living-in-the-word. Read `SPEC.md` first, and keep its "Build plan" up to date.

## Rules for working here

- Same rules as the website's `CLAUDE.md`: plain words for a beginner, one small change per pull request with a check the owner does, no build tools, phone first.
- The app has its own look, "Paper and ink" (the owner's choice, October 26, 2026): clean like Kinfolk magazine, not the website's Moon jar design. Colors, fonts and layout are in `SPEC.md` ("The look") and at the top of `style.css`.
- The owner is a pastor and reviews every question before it's shared. Never share anything automatically.
- Be careful with Scripture: never invent a quote. The ESV text is on hold (no key; the owner may make the app paid someday, see `SPEC.md`). If it's turned on, the app shows the ESV text from Crossway's ESV API, under Crossway's rules (`SPEC.md`, "The Bible text"): no more than 500 verses or half a book at a time, never stored, never changed, always with "(ESV)", the copyright notice and a link to esv.org. The AI is never sent the ESV text. Before adding any other translation, check its usage rules.
- The AI writes exactly 5 questions per passage, in the order set in `server/worker.js` (`PATTERNS`); the general questions in `app.js` are the fallback. There's no study method to choose: the owner removed them on October 26, 2026 (see `SPEC.md`). Don't add one back unless he asks. Mark anything that couldn't be checked.
- Stage 1 sends nothing anywhere. Save recent studies only in the browser (`localStorage`, key `living-in-the-word`). No accounts, analytics or tracking. The one exception is the server's daily-limit counts (`AI-PLAN.md`): a scrambled code for each connection, never an internet address, kept only for today and yesterday.
- Only Bible passages reach the AI: the server checks every passage first (`looksLikePassage` in `server/worker.js`), so the AI can't be used for anything else. Keep its `BOOKS` list the same as `BOOKS` in `app.js`. Any new way of reaching the AI must go through the same check, the passcode and the daily limits.
- Never put an AI key or any secret in this folder. The website is public, so anyone can read its code. The AI helper in stage 2 needs its own server; its plan is `AI-PLAN.md`. Server code may live in `server/`, never with a key in it.
- The page has a Content-Security-Policy (the `Content-Security-Policy` line near the top of `index.html`): it may only run its own script, use its own style sheet and Google's fonts, and talk to the AI helper's server. If you add any outside service (a script, a font, an image, a server), add it there too, or the browser blocks it. Never put text into the page as HTML (use `textContent`), and no inline scripts or `style="..."` attributes.
- Raise the `?v=` number on file links whenever a file changes.
- Works without reception: `sw.js` keeps a copy of the app on the phone (`SPEC.md`, "Works without reception"). If you add a file the app needs to open, add it to `APP_FILES` in `sw.js`. If the fonts link in `index.html` changes, change `FONTS` in `sw.js` too. It must never keep anything sent to or from the AI helper.
