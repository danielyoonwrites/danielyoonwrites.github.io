# Handoff: where everything stands

Written October 24, 2026, at the end of a long first session, so the next session can pick up without the old chat. Read this first, then the `CLAUDE.md` and `SPEC.md` (and `PROGRESS.md`) for whichever project you're working on. Keep this file up to date when something big changes.

This repository is public. Keep personal details out of this file.


## Who you're working with

- The owner is Daniel Yoon (writes as "Dan"): a writer and pastor in Southern California, Korean American, new to coding. This was his first time using Claude Code.
- He learns by doing: explain every change in plain words, one small change per pull request, and give him a check he can do himself before merging.
- How he likes instructions:
  - Numbered steps, with the full link inside each step (never "the link above") and the exact button or tab to click.
  - Ask one question at a time, with options and a recommendation.
  - Accuracy matters most. Check facts against official sources before stating them, say clearly when something couldn't be checked, and never guess.
  - Start feedback with what works, then up to three ranked problems, each with a fix.
  - End each reply with one concrete next action.
- He tests on his phone (Android, often inside the KakaoTalk in-app browser) and sends screenshots.
- He keeps notes in Notion: a "Master Notes" page with one page per topic. Save important decisions and checked facts there.


## How the work flows

1. Claude works on the branch it's given (this session used `claude/clever-brown-sqiwin`) and restarts it from `main` after each merge: `git fetch origin main && git checkout -B <branch> origin/main`.
2. Claude opens a pull request with a plain-words description and a "How to check it" list.
   Right after opening it, Claude subscribes to the pull request's activity (`subscribe_pr_activity`), so the merge wakes the session. Dan should never have to say "it merged."
3. Dan reviews and merges on GitHub (Conversation tab, Merge pull request, Confirm merge).
4. GitHub Actions publishes the site (workflow `.github/workflows/publish.yml`; GitHub Pages source is set to "GitHub Actions"). It takes a minute or two; check for a green mark next to **main** at https://github.com/danielyoonwrites/danielyoonwrites.github.io/actions
5. Dan checks on his phone.
6. When the merge wakes the session, Claude does the follow-up on its own: checks that the publish run on main succeeded, restarts the branch from main, updates the project's page in Dan's Master Notes (Notion), then tells Dan in one short message. Auto mode only skips permission prompts; it doesn't let Claude see GitHub between messages, and each new session has to subscribe again.

Only one pull request at a time from the branch: wait for a merge before starting the next one, or the new work lands in the open pull request.


## Limits of Claude's cloud sessions, and the workarounds that worked

- **Can't reach many websites directly** (Substack, Firebase docs, gstatic, Samsung, danielyoonwrites.github.io itself). npm and GitHub work.
- **Workaround for checking live pages or official sources:** run a temporary test on GitHub's computers. Replace `.github/workflows/publish.yml` on the Claude branch with a test-only workflow (`on: workflow_dispatch`, no publish job), push, trigger it with the GitHub tools on the branch, then read the job log. Put the real `publish.yml` back (`git checkout origin/main -- .github/workflows/publish.yml`) before opening a pull request. Test-only runs show green, so Dan doesn't see red X's.
- **Reading official pages from GitHub:** fetch them through Jina Reader, `https://r.jina.ai/<url>` with the header `X-Return-Format: text`, then grep for the key lines. Samsung's site blocks this.
- **Substack** blocks GitHub's computers and Claude's sessions (Cloudflare "Just a moment"). Jina Reader gets through from GitHub, but answers 401 to visitors' browsers without a key.
- **Firebase emulator:** firebase-tools installs, but its CLI can't load rules here. Run the database emulator jar directly (details in `quiet-room/CLAUDE.md`).
- **Browser caching:** GitHub Pages lets browsers keep files for 10 minutes (`cache-control: max-age=600`). When a page's CSS or JavaScript changes, raise the `?v=` number on its links, or phones mix old and new files. This broke the spam calls guide once.
- **The stop hook** requires all changes to be committed and pushed before ending a turn.


## Project 1: the website (done, live)

https://danielyoonwrites.github.io. Rules and design in `CLAUDE.md`.

- Pages: Home (`index.html`), Writing (`writing.html`), Projects (`projects.html`), About (`about.html`), one stylesheet (`style.css`). The menu has no Home link; the name goes Home.
- Projects page: all projects first, short, then a separate "How I built it" section of fold-outs (what I wanted, the problem, what I decided, the trade-off). Never mix the notes into the list, since they hide the next project. Add each new app to both parts.
- Dan's rule: keep pages short on a phone, with tabs or fold-outs instead of long lists. The Writing page has two tabs, "Start here" and "Latest".
- Design: "Moon jar," the same look as his Substack: porcelain background, ink text, celadon links and buttons, stone small print, glaze lines; Libre Baskerville, never bold; sentence case, no exclamation marks, no emoji. Never show his kids' faces, names or schools.
- Words: Home and About were written by Dan and must be used exactly (see `CLAUDE.md`).
- Writing page:
  - "Start here": four hand-picked posts with opening lines (text only; the Substack covers are stock photos, which the design rules don't allow).
  - "Latest posts": the 4 newest Substack posts, filled in automatically before every publish and once a day at 14:17 UTC by `scripts/latest-posts.js`, through Jina Reader. If that fails, a fallback link shows.
  - Newsletter section with a celadon Subscribe button (Substack's embed form clashed with the design).
- GitHub turns off the daily run after 60 days without repository activity; re-enable it in the Actions tab.
- Ideas not done: skip post openings that start with "Disclaimer"; a bigger app that shows Dan's architecture skills (parked October 24, 2026, until the Projects page is merged).


## Project 2: Quiet room (paused after step 1)

https://danielyoonwrites.github.io/quiet-room. A calm shared study room for Dan's young adults group, on Firebase (free Spark plan).

- Read `quiet-room/SPEC.md`, `quiet-room/CLAUDE.md` and `quiet-room/PROGRESS.md` (the decisions, the 11-step build plan and "Next").
- Step 1 is live: the page with "Quiet room," Dan's line, and "The room opens soon."
- Next is step 2: six blob avatars ("cute blobs with faces," Dan's idea) in Moon jar colors only. A rough sketch was shown (Moon, Sprout, Pebble, Reader, Scarf, Sleepy); fix the near-white fill, give Sleepy open eyes, smooth Scarf's edge. Show previews before the pull request.
- Then step 3, Firebase setup: Dan does the clicking in the console, one step at a time, after checking the current Firebase docs. The database starts in locked mode.
- Effort: High for most steps. Extra is worth it for step 4 (security rules) and step 8 (stepped away and stale seats).


## Project 3: Fewer spam calls (built, one check left)

https://danielyoonwrites.github.io/fewer-spam-calls. A guide for anyone in the US, written for seniors. Read `fewer-spam-calls/SPEC.md` and `fewer-spam-calls/CLAUDE.md`.

- How it works: three big-button questions (phone, phone company, California), then only the matching steps, one per screen, then "You're all set." Nothing is saved; it never asks for a phone number.
- Facts were checked on every official page on October 24, 2026 (FTC, FCC, T-Mobile, Verizon, AT&T, Apple, Google, California's DROP).
- Still open: confirm the Samsung steps on a real Samsung phone (Samsung's site couldn't be read).
- Delayed by Dan: Korean and Spanish versions. When resumed: a language choice on the first screen, one page per language, phone menu words taken from Apple, Google and Samsung's own Korean and Spanish help pages, and a native speaker reviews each version before it's shared.


## Project 4: First step smaller (built through step 4, owner's trial next)

https://danielyoonwrites.github.io/first-step-smaller (live, not listed in search engines yet). A little app for facing something you've been putting off: name it, rate how heavy it feels, shrink it to a 2-minute first step, do it, then rate how it really was. Read `first-step-smaller/SPEC.md` and `CLAUDE.md`.

- Decided October 2026: the owner uses it first, then anyone online. Not a therapy tool. No AI for now (maybe an optional button later). Saved only on the phone, with a backup file. First version is one step at a time.
- Built October 25, 2026 (pull requests 29 to 35): the screens, "Need help?" tips, saving on the phone, smaller steps inside steps (a tree, data version 2), Edit, and backup/restore/delete everything. See `SPEC.md` for every decision.
- Next: the owner uses it daily for a couple of weeks (build step 5). Before listing it on the Projects page: test on a real iPhone, and do a trademark search (no app with the name was found in a web search, October 2026).


## Pull requests so far

1-3: the website's `CLAUDE.md` and content rules. 4: Home page. 5-9: Writing page (Substack, Subscribe button, featured posts, opening lines). 10: allow JavaScript. 11: About page. 12: polish and sharing previews. 13-16: automatic Latest posts (three approaches failed because of Substack's Cloudflare; the fourth, through Jina Reader on GitHub, works). 17-19: Quiet room spec, decisions, step 1. 20-24: Fewer spam calls (spec, first version, questions-first redesign, button and caching fixes, full fact check). 25: this handoff file. 26: Projects page. 27: shorter pages (Projects layout, tabs on Writing, fold-outs on Projects). 28: First step smaller spec. 29 to 35: First step smaller build (screens, tips, saving, steps inside steps, Edit, backup).


## Starting a new session

Open https://claude.ai/code, start a new session with this repository, and paste one of these:

- Continue the Quiet room:
  > Read HANDOFF.md, then quiet-room/CLAUDE.md, SPEC.md and PROGRESS.md, and continue from Next.
- Finish the spam calls guide:
  > Read HANDOFF.md, then fewer-spam-calls/CLAUDE.md and SPEC.md, and continue the build plan.
- Something new:
  > Read HANDOFF.md first. Then help me plan [the new thing], plan only.
