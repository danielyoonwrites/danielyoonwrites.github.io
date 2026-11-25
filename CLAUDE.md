# Daniel Yoon personal site

A personal website for Daniel Yoon, hosted free on GitHub Pages.
The website's own pages are plain HTML and CSS, with JavaScript where it helps. The owner is new to coding and never edits the code by hand (his answer, November 24, 2026): Claude writes and maintains it, and explains each change in plain words.

## Start here

- At the start of a new session, read `HANDOFF.md`: where each project stands and what's waiting on Dan. How Dan likes to work is below, in "Working with Dan."
- Before opening a pull request, working around a blocked site, testing a live page, or fixing Notion prompts, read `CLOUD-NOTES.md`.
- The website's own rules (its pages, publishing and Latest posts, the words already chosen, and its links) are in `.claude/rules/website.md`, and the "Moon jar" design is in `.claude/rules/moon-jar.md`. Claude Code loads them by itself when working on the files they name at the top: the website's pages, and for the design also Fewer spam calls, First step smaller and Quiet room.

## Working with Dan

### Who you're working with

- The owner is Daniel Yoon (writes as "Dan"): a writer and pastor in Southern California, Korean American, new to coding. He's building a series of small apps with AI, each a step harder than the last, and he makes the design decisions: what to build, what to leave out, and why.
- He learns by doing: explain every change in plain words, one finished piece of work per pull request, and give him a check he can do himself before merging.
- How he likes instructions:
  - Numbered steps, with the full link inside each step (never "the link above") and the exact button or tab to click.
  - Every answer stands on its own (Dan's rule, October 26, 2026, after Claude said "the steps are two messages up"): repeat every step, link, name and value in full each time, even if it was given before. Never "see above" or "as before."
  - For anything he pastes (like `server/worker.js` into Cloudflare), give the direct links to copy it: the GitHub file page (`https://github.com/danielyoonwrites/danielyoonwrites.github.io/blob/main/<path>`, with its "Copy raw file" button) and the raw page (`https://raw.githubusercontent.com/danielyoonwrites/danielyoonwrites.github.io/main/<path>`), plus exactly where to paste it.
  - Ask one question at a time, with options and a recommendation. Each lettered option is one choice: an option that joined "what goes on the board" with "use Canva" made Dan's "A" mean Canva when he meant building his own (November 2, 2026).
  - Accuracy matters most. Check facts against official sources before stating them, say clearly when something couldn't be checked, and never guess. Cite only pages Claude actually opened, and say when a source was seen only in search results (November 2, 2026).
  - Start feedback with what works, then up to three ranked problems, each with a fix.
  - End each reply with one concrete next action.
- He wants as little friction as possible: Claude does the follow-up work on its own (see "How the work flows"), and he doesn't want to be the messenger.
- He tests on his phone (Android, Chrome, sometimes inside the KakaoTalk in-app browser) and sends screenshots. His phone uses the three buttons at the bottom (|||, ○, <), not swipe gestures, so test steps say "tap <" for Back (October 28, 2026). He catches friction fast (an odd question, an extra screen), so show screenshots before every pull request.
- His design rules, learned the hard way: keep pages short on a phone (tabs, fold-outs, one level per screen); no long lists; one thing per screen in apps.
- His Bibles: he likes the NASB, ESV and NIV more than the KJV (October 26, 2026). Anything about verse numbers or Bible wording follows those three.
- He's a pastor: with Scripture, care for hurting people comes first. For passages of tragedy he asked for gentle, general words and no questions about God's silence (October 26, 2026; details in `living-in-the-word/SPEC.md`, "The questions").
- He keeps notes in Notion: a "Master Notes" page with one page per topic. Save important decisions and checked facts there, in one write per finished piece of work.


### How the work flows

The short version. Every step, and how to work beside other sessions, is in `CLOUD-NOTES.md` ("How the work flows"): read it before opening a pull request.

- Claude works on its own branch and opens one pull request per finished piece of work, with a plain-words description and a "How to check it" list.
- Dan reviews and merges on GitHub, and the site publishes by itself a minute or two later.
- Claude watches the pull request so the merge wakes the session: Dan should never have to say "it merged." Claude then does the follow-up on its own and tells him in one short message.


## Handoffs and decisions

- HANDOFF.md is a short index: where each project stands, what's waiting on Dan, and how to start the next session. Keep it under about 80 lines. It points to each app's PROGRESS.md for what's waiting there instead of copying it, and each session's summary goes to CHANGELOG.md ("Session summaries"), not HANDOFF.md.
- Each app folder has PROGRESS.md (where it stands and the next step; rewritten, under about 100 lines) and DECISIONS.md (each decision with its reason, in Dan's words when he gave them, and what was turned down; only added to). Website decisions go in the root DECISIONS.md.
- Every pull request updates its project's PROGRESS.md and adds any new decisions to DECISIONS.md, so nothing depends on the chat.
- Before changing something a past decision settled, check DECISIONS.md and ask Dan.
- When Dan switches projects or says he's stepping away, or after about five merged pull requests in one session, suggest /handoff, then /clear and /pickup [project].
- The full pull request history is in CHANGELOG.md and on GitHub. Read it only when needed.

## Rules for working here

- Explain every change in plain words a beginner can follow: what changed, why, and how to check it.
- One finished piece of work per pull request, with its notes inside it (Dan's "A", November 24, 2026). A finished piece is something he can check on his phone, or one complete change to the notes. Don't split it into small pull requests that each wait for his merge, and don't open a separate pull request just for notes.
- Tools are allowed (Dan's decision, November 24, 2026: "If it is safe and ok to use tools and frameworks and npm, use it"; root `DECISIONS.md`). Use npm, a framework or a build step when it makes an app better or quicker to build, and say in plain words what was used and why. Two things to plan for: GitHub Pages publishes files exactly as they are, so an app that needs a build step or its own server is hosted where that can run (Vercel or Cloudflare, for example) or gets a build step in the publish workflow; and the apps already built as plain files stay that way unless Dan asks to change one.
- Keep the code clear and commented so the next session can pick it up. Dan never edits code by hand (November 24, 2026), so nothing has to be kept hand-editable.
- Every page must look good on a phone first, then on a computer.

## Projects in this repository

- `quiet-room/` is a separate web app with its own `CLAUDE.md` and `SPEC.md`.
- `fewer-spam-calls/` is a one-page guide with its own `CLAUDE.md` and `SPEC.md`.
- `first-step-smaller/` is a little app (planned October 2026) with its own `CLAUDE.md` and `SPEC.md`.
- `living-in-the-word/` is a little app for Bible study questions (planned October 2026) with its own `CLAUDE.md` and `SPEC.md`.
- `idea-board/` is a little app like Apple's Freeform, for typed notes, photos and links, built to work for everyone and used just by the owner for now (planned November 2026), with its own `CLAUDE.md` and `SPEC.md`.
- `video-editor/` is a simple video editor, just for the owner, on his Android phone (planned November 2026), with its own `CLAUDE.md` and `SPEC.md`.
- `photo-filters/` is a little app that puts the owner's own looks on his photos, in the browser of his phone and MacBook (planned November 2026), with its own `CLAUDE.md` and `SPEC.md`.
- `family-activity-finder/` (a working name) is a little app that finds free and cheap things to do with young kids nearby, from official calendars first and AI search second, with a calendar to plan a day; built to work for anyone and used just by the owner for now (planned November 2026), with its own `CLAUDE.md` and `SPEC.md`. The owner's city and his kids' ages never go in this public repository.
- `church-board/` (a working name) is a little app for the owner's church group: a private board to find people to hang out with, share photos from those times and read announcements; invite only, adults only, with phone notifications (planned November 2026), with its own `CLAUDE.md` and `SPEC.md`. The app's real name and the church's name never go in this public repository.

## Privacy

- Never show the owner's kids' faces, names or schools, in text, images or file names.

## Compact instructions

When a long session is summarized, keep: each open pull request (its number, what it changes, its checks, and whether Dan merged it); what Dan chose, in his exact words, with dates; what's waiting on Dan and the next step; anything marked unverified, still marked; and any decision not yet written to a DECISIONS.md. Leave out tool output and file contents that are already saved in the repository.
