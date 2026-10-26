# Handoff: where everything stands

Last updated October 25, 2026, at the end of the second session, so the next session can pick up without the old chat. Read this first, then the `CLAUDE.md` and `SPEC.md` (and `PROGRESS.md`) for whichever project you're working on. Keep this file up to date when something big changes.

This repository is public. Keep personal details out of this file.


## Who you're working with

- The owner is Daniel Yoon (writes as "Dan"): a writer and pastor in Southern California, Korean American, new to coding. He's building a series of small apps with AI, each a step harder than the last, and he makes the design decisions: what to build, what to leave out, and why.
- He learns by doing: explain every change in plain words, one small change per pull request, and give him a check he can do himself before merging.
- How he likes instructions:
  - Numbered steps, with the full link inside each step (never "the link above") and the exact button or tab to click.
  - Ask one question at a time, with options and a recommendation.
  - Accuracy matters most. Check facts against official sources before stating them, say clearly when something couldn't be checked, and never guess.
  - Start feedback with what works, then up to three ranked problems, each with a fix.
  - End each reply with one concrete next action.
- He wants as little friction as possible: Claude does the follow-up work on its own (see "How the work flows"), and he doesn't want to be the messenger.
- He tests on his phone (Android, Chrome, sometimes inside the KakaoTalk in-app browser) and sends screenshots. He catches friction fast (an odd question, an extra screen), so show screenshots before every pull request.
- His design rules, learned the hard way: keep pages short on a phone (tabs, fold-outs, one level per screen); no long lists; one thing per screen in apps.
- He keeps notes in Notion: a "Master Notes" page with one page per topic. Save important decisions and checked facts there, in one write per finished piece of work.


## How the work flows

1. Claude works on the branch it's given (each session gets its own; the second session used `ccr-4cf7b8b6-sypqs8`) and restarts it from `main` after each merge: `git fetch origin main && git checkout -B <branch> FETCH_HEAD`.
2. Claude opens a pull request with a plain-words description and a "How to check it" list.
   Right after opening it, Claude subscribes to the pull request's activity (`subscribe_pr_activity`), so the merge wakes the session. Dan should never have to say "it merged." Claude also sets one backup check-in about 50 minutes later (`send_later`), and cancels it when the merge arrives.
3. Dan reviews and merges on GitHub (Conversation tab, Merge pull request, Confirm merge).
4. GitHub Actions publishes the site (workflow `.github/workflows/publish.yml`; GitHub Pages source is set to "GitHub Actions"). It takes a minute or two; check for a green mark next to **main** at https://github.com/danielyoonwrites/danielyoonwrites.github.io/actions
5. Dan checks on his phone.
6. When the merge wakes the session, Claude does the follow-up on its own: checks that the publish run on main succeeded, restarts the branch from main, updates the project's page in Dan's Master Notes (Notion), then tells Dan in one short message. Auto mode only skips permission prompts; it doesn't let Claude see GitHub between messages, and each new session has to subscribe again.

Only one pull request at a time from the branch: wait for a merge before starting the next one, or the new work lands in the open pull request.

When Dan says "do the rest," Claude works through the build plan one pull request at a time, starting the next one as soon as the last merges.


## Notion approval prompts (to fix)

- Notion updates still ask Dan for approval each time, which stalls the work. The fix is an allow list in the repository file `.claude/settings.json`. Claude can't create it (a safety check stops Claude from giving itself permissions), so Dan adds it on GitHub. He said he'll do it later. Steps, checked against GitHub's docs:
  1. Open https://github.com/danielyoonwrites/danielyoonwrites.github.io and click **Add file**, then **Create new file**.
  2. File name: `.claude/settings.json`
  3. Paste:
     ```json
     {
       "permissions": {
         "allow": [
           "mcp__Notion__notion-search",
           "mcp__Notion__notion-fetch",
           "mcp__Notion__notion-update-page",
           "mcp__Notion__notion-create-pages",
           "mcp__Notion__notion-memory-search"
         ]
       }
     }
     ```
  4. **Commit changes...**, commit directly to **main**, **Commit changes**. It takes effect in the next session.
- Until then: one Notion write per finished piece of work.


## Limits of Claude's cloud sessions, and the workarounds that worked

- **Can't reach many websites directly** (Substack, Firebase docs, gstatic, Samsung, journal sites, PubMed, webkit.org, docs.github.com, danielyoonwrites.github.io itself). npm, GitHub and web search work.
- **GitHub's help pages:** read their source at `https://raw.githubusercontent.com/github/docs/main/content/...` (and `data/reusables/...` for the shared steps). This worked in October 2026.
- **Claude Code's docs** (code.claude.com) could be fetched with curl in October 2026.
- **Workaround for checking live pages or official sources:** run a temporary test on GitHub's computers. Replace `.github/workflows/publish.yml` on the Claude branch with a test-only workflow (`on: workflow_dispatch`, no publish job), push, trigger it with the GitHub tools on the branch, then read the job log. Put the real `publish.yml` back (`git checkout origin/main -- .github/workflows/publish.yml`) before opening a pull request. Test-only runs show green, so Dan doesn't see red X's.
- **Reading official pages from GitHub:** fetch them through Jina Reader, `https://r.jina.ai/<url>` with the header `X-Return-Format: text`, then grep for the key lines. Samsung's site blocks this.
- **Substack** blocks GitHub's computers and Claude's sessions (Cloudflare "Just a moment"). Jina Reader gets through from GitHub, but answers 401 to visitors' browsers without a key.
- **Firebase emulator:** firebase-tools installs, but its CLI can't load rules here. Run the database emulator jar directly (details in `quiet-room/CLAUDE.md`).
- **Testing apps:** serve the repository with `python3 -m http.server 8765 --bind 127.0.0.1`, then drive it with Playwright at 360 pixels wide (a small Android phone) and 1280 (a computer), and take screenshots. Check what's actually visible on screen, not just the `hidden` setting: a button style once overrode `hidden`, and only a screenshot caught it. Stop the server with `fuser -k 8765/tcp` (a `pkill` that matches its own command line ends the shell).
- **Browser caching:** GitHub Pages lets browsers keep files for 10 minutes (`cache-control: max-age=600`). When a page's CSS or JavaScript changes, raise the `?v=` number on its links, or phones mix old and new files.
- **The stop hook** requires all changes to be committed and pushed before ending a turn.


## Project 1: the website (done, live)

https://danielyoonwrites.github.io. Rules and design in `CLAUDE.md`.

- Pages: Home (`index.html`), Writing (`writing.html`), Projects (`projects.html`), About (`about.html`), one stylesheet (`style.css`, linked as `style.css?v=2`). The menu has no Home link; the name goes Home.
- Projects page: all projects first, short, then a separate "How I built it" section of fold-outs (what I wanted, the problem, what I decided, the trade-off). Never mix the notes into the list, since they hide the next project. Add each new app to both parts. The page says once, at the top, that Dan builds with AI.
- Writing page: two tabs, "Start here" (four hand-picked posts) and "Latest" (the 4 newest Substack posts, filled in automatically before every publish and once a day at 14:17 UTC by `scripts/latest-posts.js`, through Jina Reader; a fallback link shows if that fails). Opening lines stop after 3 lines. Newsletter section with a celadon Subscribe button.
- Design: "Moon jar," the same look as his Substack: porcelain background, ink text, celadon links and buttons, stone small print, glaze lines; Libre Baskerville, never bold; sentence case, no exclamation marks, no emoji. Never show his kids' faces, names or schools.
- Words: Home and About were written by Dan and must be used exactly (see `CLAUDE.md`).
- GitHub turns off the daily run after 60 days without repository activity; re-enable it in the Actions tab.
- Ideas not done: skip post openings that start with "Disclaimer"; list First step smaller on the Projects page (after its trial, iPhone test and trademark search).


## Project 2: Quiet room (paused after step 1)

https://danielyoonwrites.github.io/quiet-room. A calm shared study room for Dan's young adults group, on Firebase (free Spark plan).

- Read `quiet-room/SPEC.md`, `quiet-room/CLAUDE.md` and `quiet-room/PROGRESS.md` (the decisions, the 11-step build plan and "Next").
- Step 1 is live: the page with "Quiet room," Dan's line, and "The room opens soon."
- Next is step 2: six blob avatars ("cute blobs with faces," Dan's idea) in Moon jar colors only. A rough sketch was shown (Moon, Sprout, Pebble, Reader, Scarf, Sleepy); fix the near-white fill, give Sleepy open eyes, smooth Scarf's edge. Show previews before the pull request.
- Then step 3, Firebase setup: Dan does the clicking in the console, one step at a time, after checking the current Firebase docs. The database starts in locked mode.
- Open question for step 5 (Join): anyone can see the `quiet-room` folder in the public repository, so the room's privacy can't rest on the page address alone; decide whether the room link needs a secret code.
- Effort: High for most steps. Extra high for step 4 (security rules) and step 8 (stepped away and stale seats).


## Project 3: Fewer spam calls (built, one check left)

https://danielyoonwrites.github.io/fewer-spam-calls. A guide for anyone in the US, written for seniors. Read `fewer-spam-calls/SPEC.md` and `fewer-spam-calls/CLAUDE.md`.

- How it works: three big-button questions (phone, phone company, California), then only the matching steps, one per screen, then "You're all set." Nothing is saved; it never asks for a phone number.
- Facts were checked on every official page on October 24, 2026 (FTC, FCC, T-Mobile, Verizon, AT&T, Apple, Google, California's DROP).
- Still open: confirm the Samsung steps on a real Samsung phone (Samsung's site couldn't be read).
- Delayed by Dan: Korean and Spanish versions. When resumed: a language choice on the first screen, one page per language, phone menu words taken from Apple, Google and Samsung's own Korean and Spanish help pages, and a native speaker reviews each version before it's shared.


## Project 4: First step smaller (built, owner's trial next)

https://danielyoonwrites.github.io/first-step-smaller (live, not listed in search engines yet). A little app for facing something you've been putting off. Read `first-step-smaller/SPEC.md` (every decision is there) and `CLAUDE.md`.

- How it works: name the task; "What's one small thing you could do first?" (with examples and "Need help?" tips); rate how heavy the step feels (1 to 5); do it; rate how it really was ("It felt like a 4. It was a 2."). The arc shows every step of a task with its dates and ratings.
- Any task or step can hold smaller steps, as deep as needed, one level per screen with a trail at the top. "Do the next step" hands over the first step not done yet, in order. Edit: rename, move up or down, move into another task, make it a task of its own, remove. Backup and delete: save a backup file, restore it, delete everything.
- Saved only in the browser (`localStorage`, data version 2, a tree). Not a therapy tool. No AI yet.
- Built October 25, 2026 in pull requests 28 to 35.
- Next, needs Dan or time: use it daily for a couple of weeks (build step 5); save a backup in Chrome and check it lands in Downloads; before listing it publicly, test on a real iPhone (Safari may delete saved data of sites not visited for 7 days, unconfirmed) and do a trademark search (no app with the name was found in a web search).
- Parked: making it installable. Checked October 25, 2026 (search results): Level 1 is an installable web app (a manifest file, a service worker for offline use and an icon; free; about 2 pull requests; Dan needs to approve an icon). Level 2 is the Google Play Store ($25 one time; new personal accounts need a closed test with at least 12 testers for 14 days in a row; packaged with PWABuilder). Level 3 is Apple's App Store ($99 a year, needs a Mac with Xcode, and Apple often rejects apps that are mostly a website). Recommendation: Level 1 after the trial.
- Parked: an optional "Help me make it smaller" AI button.


## Project 5: Living in the Word (AI helper live with Sonnet 5.5)

https://danielyoonwrites.github.io/living-in-the-word (live, not listed in search engines). Type a Bible passage, and the AI helper writes 5 questions for it; edit them, then share them to a group chat (Lead the study, one question at a time, is still to come). There's also a daily reading plan with 5 AI questions for each reading. Read `living-in-the-word/SPEC.md` and `CLAUDE.md`.

- Decided October 25, 2026: the owner uses it first to prepare his small group's studies, then anyone online. Stage 1 has no AI; stage 2 adds AI-suggested questions for the specific passage, which the owner reviews (a small server keeps the AI key secret; planned separately). Bible text isn't shown yet; check translation rules first.
- Reading plan (Dan's idea, added October 25, 2026, as build step 5b, right after saving): set a plan like "Matthew, one chapter a day," and each day the app shows today's reading with questions to meditate on. No streaks or guilt.
- Step 2 built October 25, 2026 (pull request 38): type a passage, choose a method, see the questions, edit, remove, add, or start them over. Each method keeps its own edits while the page is open; nothing is saved yet. The question wording is a draft in `app.js` (also listed in SPEC.md) and Dan reviews it.
- Changed course October 25, 2026: after trying step 2, Dan pointed out that questions that are the same for every passage could just be printed once. The AI helper (stage 2) moves up to come next. Plan in `living-in-the-word/AI-PLAN.md` (pull request 39): AI questions follow the chosen method and replace the general ones as drafts; a passcode, typed once per phone; Claude API with the key on a free Cloudflare Worker; the model is picked after a side-by-side test of Opus 5.5, Sonnet 5.5 and Haiku 5.5 with the cost shown (Dan wants to compare quality and cost himself); spending limit set at sign-up (recommend $5).
- Theological guidance (Dan's idea): a page sent with every AI request, at the top of `living-in-the-word/server/worker.js`. Dan wrote it himself on October 25, 2026 (pull request 41), with two additions after review: a "note for the leader" in each answer, and a line to follow the named pastors' tone, not their positions on debated topics.
- Step C1 (pull request 40): the server code, tested against a stand-in for the AI.
- Step C2 (pull request 42): the "Suggest questions" button, the passcode screen, the note for the leader, and the test link (`?test`: model choice and the cost of each answer). Tested against the real worker.js running locally with a stand-in for the AI. `SERVER_URL` in `app.js` is empty until Cloudflare is set up; the button says "The AI helper isn't connected yet."
- Dan asked about cost (October 25, 2026): he doesn't want to spend a lot. Estimates are in AI-PLAN.md ("What it should cost"): pennies to about $1.40 a month with Opus, capped by the $5 spending limit.
- Reading plan (Dan asked for it early, October 25, 2026; pull request 43): a start screen ("Prepare a study" / "Today's reading"), setup (book, 1 to 3 chapters a day, start date), "Reading 3 of 28: Matthew 3" with three Swedish-method questions, "Done for today," "Read the next one now," missed days wait, saved on the phone (`plan` in the `living-in-the-word` JSON). Chapter counts checked against two datasets. Step E (pull request 44): opening a reading asks the AI for 3 or 4 personal reflection questions (the server's `devotional` pattern) and saves them in the plan, so a reading is never paid twice. Works once `SERVER_URL` is set.
- Share and Copy (pull request 45): plain text (passage, method, numbered questions; never the note for the leader). Dan still needs to check it in KakaoTalk, from Chrome and from KakaoTalk's built-in browser.
- Method names (Dan's choice, October 25, 2026; pull request 46): Discover, Look, think, live, and Light, question, arrow, with the usual names in small print. Reading plan styles (pull request 47): chosen at setup (Quiet time, Discover, Look, think, live, Light, question, arrow), with "Change" on each day's screen; the AI writes that style's questions for one person. The general wording for each style is a draft for Dan to review (SPEC.md).
- Step B done October 26, 2026: Worker at https://living-in-the-word.danyoonsignup.workers.dev/ with secrets `ANTHROPIC_API_KEY` and `PASSCODE`; API credits come from Dan's Max plan ($100 a month, no card). **The API key expires November 24, 2026**: make a new key and replace the Cloudflare secret. Pull request 48 connects the app (`SERVER_URL`). Next: the model test with the `?test` link, then lock the model (step D).
- Pull request 49 (October 26, 2026): Dan's three guidance fixes after the first real test (short questions that ask one thing, no quotes, correct grammar).
- Pull request 50 (October 26, 2026, Dan's choice): no more study methods or reading plan styles ("they will all be written by AI anyway"). The AI writes exactly 4 questions in a set order (what the passage says, God, the heart, a response) as soon as a passage is typed. The model is Sonnet 5.5 (Dan picked it after trying John 1 with all three); the `?test` link shows only the cost. After each change to `server/worker.js`, Dan pastes it into Cloudflare again (Edit code, pick the Latest version, Deploy). Waiting on Dan: review the general questions' wording (SPEC.md, "The questions"), and check Share in KakaoTalk.
- Pull request 51 (October 26, 2026, Dan's choice): 5 questions instead of 4, the 5th about praying together; the reading plan gets 5 too. The button says "Write questions with AI," with a line saying it writes 5 new study questions. Next, Dan asked for a big visual update: make the app look like a real app, clean like Kinfolk magazine, not like the website.
- Pull request 52 (October 26, 2026): the new look, "Paper and ink" (Dan picked it from two mockups; the other kept celadon). Warm paper, black ink, EB Garamond for reading and Jost for small labels and buttons, a top bar with Back, big tap-able rows on the start screen, numbered questions with thin lines, and Share and Copy fixed at the bottom while scrolling. Details in `living-in-the-word/SPEC.md` ("The look"). The app no longer follows the website's Moon jar design. Parked: a real photo on the start screen.
- Pull request 53 (October 26, 2026, Dan asked): while the AI writes, the screen says "Writing 5 questions for ..." and shows five numbered placeholder lines that gently fade in and out, instead of looking blank (it was blank whenever the phone already had the passcode). Same on today's reading. The button now says "Go deeper with AI" (Dan's choice). Going Back and tapping the button again for the same passage doesn't pay for a second request.
- Pull request 54 (October 26, 2026): the passage itself, in the ESV (Dan's choice), in a fold-out above the questions and on today's reading, from Crossway's free ESV API through the Worker. Dan needs a free key from api.esv.org, saved in Cloudflare as the secret `ESV_API_KEY`. Without it, a "Read it on esv.org" link shows. Crossway's rules are in SPEC.md ("The Bible text"): non-commercial only, 500 verses or half a book at most, never stored, never sent to the AI. Checked the same day: the NIV through API.Bible is also free to show, but can't be sent to an AI; the BSB (public domain) can.
- ESV on hold (Dan's choice, October 26, 2026): he may let people subscribe to the app someday, and Crossway's free terms are only for non-commercial apps. No key is set, so the app shows only a "Read it on esv.org" link. Don't ask him to set up the key unless he brings it up. To turn it on later: get a free key at api.esv.org (Create an account, then create an API application), save it in Cloudflare as the secret `ESV_API_KEY`, and make sure the latest `worker.js` is pasted into Cloudflare. If a paid app is likely, look at the BSB first (SPEC.md, "The Bible text").
- Pull request 56 (October 26, 2026): Dan's words on the start screen, in sentence case (his choice when asked): "Prepare for a Bible study" and "Bible reading plan companion," each with his one-line description (in SPEC.md, "Words on the start screen"; use them exactly). Once a plan is set up, a line under the second says where it is. Also (Dan asked): the esv.org link is now a big row, "Read John 15 on esv.org," instead of small grey text.
- Dan's next big wishes (October 26, 2026), in his order: (1) saving studies, built in pull request 57: Save with the questions, "Saved studies" on the start screen, a saved passage opens without asking the AI (SPEC.md, "Saved studies"); (2) works without reception: add to home screen and open offline (build step 6c; check WebKit's page on Safari clearing saved data first); (3) a passage picker: Testament, book, chapter, then the whole chapter or verses (step 6d; needs checked verse counts).
- Pull request 58 (October 26, 2026, Dan asked): the Save button says what it saves ("Save these questions for John 1," then "Saved on this phone" or "Save your changes") across the bar's full width, with Share and Copy under it; the esv.org link is a boxed button.
- Earlier plan for step B, the sign-ups (Claude Console: credit, spending limit, recommend $5, key; then Cloudflare), one click at a time, on Dan's laptop. First read https://developers.cloudflare.com/workers/get-started/dashboard/ in full through the GitHub Actions + Jina workaround (the create-and-edit clicks aren't checked yet). Then C2 (the button and the model test), D (lock the model), then Share and Copy.
- Claude effort: High for most steps; Extra high for stage 2 (the AI server). Not Max (Claude Code's docs say it "may show diminishing returns and is prone to overthinking").


## Pull requests so far

1-3: the website's `CLAUDE.md` and content rules. 4: Home page. 5-9: Writing page (Substack, Subscribe button, featured posts, opening lines). 10: allow JavaScript. 11: About page. 12: polish and sharing previews. 13-16: automatic Latest posts (three approaches failed because of Substack's Cloudflare; the fourth, through Jina Reader on GitHub, works). 17-19: Quiet room spec, decisions, step 1. 20-24: Fewer spam calls (spec, first version, questions-first redesign, button and caching fixes, full fact check). 25: this handoff file. 26: Projects page. 27: shorter pages (Projects layout, tabs on Writing, fold-outs on Projects). 28: First step smaller spec. 29 to 35: First step smaller build (screens, tips, saving, steps inside steps, Edit, backup). 36: Living in the Word spec. 37: the reading plan added to Living in the Word, and this handoff update. 38: Living in the Word step 2 (passage, method, questions). 39: the AI helper plan. 40: the AI helper's server code. 41: Dan's theological guidance and the note for the leader. 42: the Suggest questions button. 43: the reading plan. 44: AI questions for each reading. 45: Share and Copy. 46: new names for the methods. 47: question styles for the reading plan. 48: the app connected to the AI helper. 49: guidance fixes after the first real test. 50: methods and styles removed, 4 AI questions, Sonnet 5.5. 51: 5 questions, and a clearer Write questions button. 52: the app's new look, "Paper and ink." 53: a loading state while the AI writes, and "Go deeper with AI." 54: the passage shown in the ESV. 55: the ESV put on hold (notes only). 56: Dan's words on the start screen, and a bigger esv.org link. 57: saved studies. 58: a clearer Save button ("Save these questions for John 1") and a boxed esv.org button.


## Starting a new session

Open https://claude.ai/code, start a new session with this repository, set the effort (High for most work), and paste one of these:

- Continue Living in the Word:
  > Read HANDOFF.md, then living-in-the-word/CLAUDE.md and SPEC.md, and build the next step in the build plan.
- Feedback on First step smaller, after using it:
  > Read HANDOFF.md, then first-step-smaller/CLAUDE.md and SPEC.md. Here's what I noticed while using it: [notes].
- Continue the Quiet room:
  > Read HANDOFF.md, then quiet-room/CLAUDE.md, SPEC.md and PROGRESS.md, and continue from Next.
- Finish the spam calls guide:
  > Read HANDOFF.md, then fewer-spam-calls/CLAUDE.md and SPEC.md, and continue the build plan.
- Something new:
  > Read HANDOFF.md first. Then help me plan [the new thing], plan only.
