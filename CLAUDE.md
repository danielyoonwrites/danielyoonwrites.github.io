# Daniel Yoon personal site

A personal website for Daniel Yoon, hosted free on GitHub Pages.
Plain HTML and CSS, with JavaScript where it helps. The owner is a beginner and edits the files by hand.

## Start here

- At the start of a new session, read `HANDOFF.md`: where each project stands and what's waiting on Dan. How Dan likes to work is below, in "Working with Dan."
- Before working around a blocked site, testing a live page, or fixing Notion prompts, read `CLOUD-NOTES.md`.
- The website's own rules (its pages, publishing and Latest posts, the words already chosen, and its links) are in `.claude/rules/website.md`, and the "Moon jar" design is in `.claude/rules/moon-jar.md`. Claude Code loads them by itself when working on the files they name at the top: the website's pages, and for the design also Fewer spam calls, First step smaller and Quiet room.

## Working with Dan

### Who you're working with

- The owner is Daniel Yoon (writes as "Dan"): a writer and pastor in Southern California, Korean American, new to coding. He's building a series of small apps with AI, each a step harder than the last, and he makes the design decisions: what to build, what to leave out, and why.
- He learns by doing: explain every change in plain words, one small change per pull request, and give him a check he can do himself before merging.
- How he likes instructions:
  - Numbered steps, with the full link inside each step (never "the link above") and the exact button or tab to click.
  - Every answer stands on its own (Dan's rule, October 26, 2026, after Claude said "the steps are two messages up"): repeat every step, link, name and value in full each time, even if it was given before. Never "see above" or "as before."
  - For anything he pastes (like `server/worker.js` into Cloudflare), give the direct links to copy it: the GitHub file page (`https://github.com/danielyoonwrites/danielyoonwrites.github.io/blob/main/<path>`, with its "Copy raw file" button) and the raw page (`https://raw.githubusercontent.com/danielyoonwrites/danielyoonwrites.github.io/main/<path>`), plus exactly where to paste it.
  - Ask one question at a time, with options and a recommendation.
  - Accuracy matters most. Check facts against official sources before stating them, say clearly when something couldn't be checked, and never guess.
  - Start feedback with what works, then up to three ranked problems, each with a fix.
  - End each reply with one concrete next action.
- He wants as little friction as possible: Claude does the follow-up work on its own (see "How the work flows"), and he doesn't want to be the messenger.
- He tests on his phone (Android, Chrome, sometimes inside the KakaoTalk in-app browser) and sends screenshots. His phone uses the three buttons at the bottom (|||, ○, <), not swipe gestures, so test steps say "tap <" for Back (October 28, 2026). He catches friction fast (an odd question, an extra screen), so show screenshots before every pull request.
- His design rules, learned the hard way: keep pages short on a phone (tabs, fold-outs, one level per screen); no long lists; one thing per screen in apps.
- His Bibles: he likes the NASB, ESV and NIV more than the KJV (October 26, 2026). Anything about verse numbers or Bible wording follows those three.
- He's a pastor: with Scripture, care for hurting people comes first. For passages of tragedy he asked for gentle, general words and no questions about God's silence (October 26, 2026; details in `living-in-the-word/SPEC.md`, "The questions").
- He keeps notes in Notion: a "Master Notes" page with one page per topic. Save important decisions and checked facts there, in one write per finished piece of work.


### How the work flows

1. Claude works on the branch it's given (each session gets its own; the second session used `ccr-4cf7b8b6-sypqs8`, the third `ccr-c34f8c4c-6bmdd8`) and restarts it from `main` after each merge: `git fetch origin main && git checkout -B <branch> FETCH_HEAD`.
2. Claude opens a pull request with a plain-words description and a "How to check it" list.
   Right after opening it, Claude subscribes to the pull request's activity (`subscribe_pr_activity`), so the merge wakes the session. Dan should never have to say "it merged." Claude also sets one backup check-in about 50 minutes later (`send_later`), and cancels it when the merge arrives.
3. Dan reviews and merges on GitHub (Conversation tab, Merge pull request, Confirm merge).
4. GitHub Actions publishes the site (workflow `.github/workflows/publish.yml`; GitHub Pages source is set to "GitHub Actions"). It takes a minute or two; check for a green mark next to **main** at https://github.com/danielyoonwrites/danielyoonwrites.github.io/actions
   A merge that changes `living-in-the-word/server/` also deploys the server: Cloudflare builds it (Workers Builds) and shows its own check next to the merge, so Dan no longer pastes `worker.js` into Cloudflare.
5. Dan checks on his phone.
6. When the merge wakes the session, Claude does the follow-up on its own: checks that the publish run on main succeeded, restarts the branch from main, updates the project's page in Dan's Master Notes (Notion), then tells Dan in one short message. Auto mode only skips permission prompts; it doesn't let Claude see GitHub between messages, and each new session has to subscribe again.

Only one pull request at a time from the branch: wait for a merge before starting the next one, or the new work lands in the open pull request.

When Dan says "do the rest," Claude works through the build plan one pull request at a time, starting the next one as soon as the last merges.


## Handoffs and decisions

- HANDOFF.md is a short index: where each project stands, what's waiting on Dan, and how to start the next session. Keep it under about 80 lines.
- Each app folder has PROGRESS.md (where it stands and the next step; rewritten, under about 100 lines) and DECISIONS.md (each decision with its reason, in Dan's words when he gave them, and what was turned down; only added to). Website decisions go in the root DECISIONS.md.
- Every pull request updates its project's PROGRESS.md and adds any new decisions to DECISIONS.md, so nothing depends on the chat.
- Before changing something a past decision settled, check DECISIONS.md and ask Dan.
- When Dan switches projects or says he's stepping away, or after about five merged pull requests in one session, suggest /handoff, then /clear and /pickup [project].
- The full pull request history is in CHANGELOG.md and on GitHub. Read it only when needed.
- Every request sends the whole conversation again, and so do check-ins and pull request wake-ups (Claude Code's docs, checked October 28, 2026). So a fresh session costs less than a long one, and long files like an app's SPEC.md are read only in the parts the task needs.

## Rules for working here

- Explain every change in plain words a beginner can follow: what changed, why, and how to check it.
- One small change per pull request.
- No build tools: no npm, no frameworks, no generators. One exception (Dan chose it, October 29, 2026): Cloudflare runs its own deploy tool, Wrangler, on its computers to deploy Living in the Word's server (`living-in-the-word/server/wrangler.jsonc`). Nothing runs on Dan's computer, and the code stays plain files.
- Keep the code simple and commented so the owner can edit it later.
- Every page must look good on a phone first, then on a computer.

## Projects in this repository

- `quiet-room/` is a separate web app with its own `CLAUDE.md` and `SPEC.md`.
- `fewer-spam-calls/` is a one-page guide with its own `CLAUDE.md` and `SPEC.md`.
- `first-step-smaller/` is a little app (planned October 2026) with its own `CLAUDE.md` and `SPEC.md`.
- `living-in-the-word/` is a little app for Bible study questions (planned October 2026) with its own `CLAUDE.md` and `SPEC.md`.

## Privacy

- Never show the owner's kids' faces, names or schools, in text, images or file names.
