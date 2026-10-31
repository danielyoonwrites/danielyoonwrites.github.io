# Website: decisions

Each decision about the website with its reason, oldest first. Each app keeps its own DECISIONS.md in its folder. Only add to this file; if a decision changes, add a new entry that says which one it replaces. Copied in on October 28, 2026 from CLAUDE.md, the .claude/rules files and HANDOFF.md.

## In force (built October 31, 2026, at the end of the eighth session)

Every decision below that still holds, one line each; it's rewritten at each handoff. The log under it has each one with its reason, and is only added to.

**The website**
- October 24, 2026: plain HTML and CSS on GitHub Pages, edited by hand; no build tools (one exception since October 29: Cloudflare's Wrangler deploys Living in the Word's server); JavaScript where it helps.
- October 24, 2026: phone first; short pages, with tabs and fold-outs instead of long lists.
- October 24, 2026: the "Moon jar" design: its five colors, Libre Baskerville never bold, left-aligned, square corners, no logo, sentence case.
- October 24, 2026: never show the kids' faces, names or schools.
- October 24, 2026: the Substack's voice, for millennial Asian Christians; pastor work isn't the focus of Home or Writing.
- October 24, 2026: Dan's words, exactly, on Home and About; thingsdanwrites@gmail.com for readers.
- October 24, 2026: a celadon Subscribe button, not Substack's form; four hand-picked posts under "Start here."
- October 24, 2026: Latest posts filled in on GitHub through Jina Reader, before each publish.
- October 24, 2026: the menu is Writing, Projects, About (no Home link); Projects lists every project first, then "How I built it" as fold-outs.
- October 24, 2026: version numbers on the stylesheet and script links, raised on every change.

**The notes and handoffs**
- October 24 and 28, 2026: `HANDOFF.md` is a short index read at the start of each session; each app has a `PROGRESS.md` and a `DECISIONS.md`; history is in `CHANGELOG.md`.
- October 28, 2026: the website's rules live in `.claude/rules/`, loaded only for the files they name.
- October 31, 2026: leaner pickups: each fact keeps one home, nothing deleted; `CLAUDE.md` has "Compact instructions."
- October 31, 2026: `/pickup` runs the project skill in `.claude/skills/pickup/`, which reads the 3 newest decision entries in full.
- October 31, 2026: every pattern in the rules' `paths` starts with `/` (the top of the repository): the website's rules load only for its own files, the Moon jar design also for the three apps with that look, and neither for Living in the Word.

## Log (oldest first)

### October 24, 2026: plain HTML and CSS on GitHub Pages, edited by hand (pull request 1)
- Decision: a personal website, hosted free on GitHub Pages, in plain HTML and CSS. No build tools: no npm, no frameworks, no generators. The code stays simple and commented, and every page shares one stylesheet, `style.css`.
- Why: the owner is a beginner and edits the files by hand; the code stays simple and commented so the owner can edit it later.
- Status: one exception since October 29, 2026 (Dan chose it): Cloudflare runs its own deploy tool, Wrangler, on its computers to deploy Living in the Word's server (`living-in-the-word/DECISIONS.md`, "Cloudflare deploys the server by itself"). Nothing runs on Dan's computer.

### October 24, 2026: phone first (pull request 1)
- Decision: every page must look good on a phone first, then on a computer.
- Why: not recorded.

### October 24, 2026: the "Moon jar" colors (pull request 1)
- Decision: the "Moon jar" design, with five colors. Porcelain `#F1EFEA` is the background of every page, never pure white. Ink `#1E1C1A` is all main text. Celadon `#386F61` is for links, buttons and small labels, never a background behind body text. Stone `#6B655C` is for secondary text: dates, captions, small print. Glaze `#DCE6DF` is for thin divider lines only.
- Why: it's the same look as his Substack.

### October 24, 2026: Moon jar type: Libre Baskerville, never bold (pull request 1)
- Decision: all English in Libre Baskerville (Google Fonts), Regular and Italic only, never bold, including headings. Any Korean in Nanum Myeongjo ExtraBold (weight 800). The name in the header in Libre Baskerville Regular, never italic. Small labels in uppercase, with letter spacing of about 0.14em, in celadon. Starting point for sizes: body 18px, line height about 1.6, text column no wider than about 36em.
- Why: it's the same look as his Substack. The sizes are chosen for phones, not the 1080px Instagram images.

### October 24, 2026: Moon jar layout and words (pull request 1)
- Decision: left-aligned text and calm open space. Square corners on images and blocks. No logo image: "Daniel Yoon" in the header is the only mark. Real photos only (window light, ordinary things), no stock images. Sentence case, no exclamation marks, no emoji.
- Why: it's the same look as his Substack.

### October 24, 2026: privacy for the kids (pull request 1)
- Decision: never show the owner's kids' faces, names or schools, in text, images or file names.
- Why: not recorded.

### October 24, 2026: the voice and the readers (pull request 3)
- Decision: the voice is like the Substack: writing, family life, the shy Korean voice. The readers are millennial Asian Christians, and faith is part of what the site is about.
- Why: not recorded.

### October 24, 2026: Dan's words for the Home page (pull request 3)
- Decision: the Home page uses these words, exactly: "Korean American dad. Professional overthinker, amateur life-enjoyer, tired parent of two toddlers. A millennial Asian Christian writing the things we usually don’t say out loud."
- Why: Dan wrote them.

### October 24, 2026: a celadon Subscribe button instead of Substack's form (pull request 6)
- Decision: people sign up with a celadon Subscribe button that links to https://thingsdandoes.substack.com/subscribe.
- Why: the embed form's white box and gold button can't be restyled and clash with the design.
- Turned down: Substack's embed form.

### October 24, 2026: four hand-picked posts under "Start here" (pull requests 7 and 9)
- Decision: the Writing page has "Start here": four hand-picked posts, each with its opening lines.
- Why: not recorded.

### October 24, 2026: JavaScript where it helps (pull request 10)
- Decision: allow JavaScript where it helps. Still no build tools: no npm, no frameworks, no generators.
- Why: not recorded.

### October 24, 2026: pastor work is not the focus of Home or Writing (pull request 11)
- Decision: pastor work is not the focus of the Home or Writing pages. The About page can say more (a short paragraph). Never word it so it sounds like just a job.
- Why: not recorded.

### October 24, 2026: Dan's About page, and the email for readers (pull request 11)
- Decision: the About page is the three paragraphs in `about.html`, used exactly. The email for readers is thingsdanwrites@gmail.com, his writing email.
- Why: Dan wrote the About paragraphs. Not recorded for the email.

### October 24, 2026: Latest posts filled in on GitHub, through Jina Reader (pull request 16)
- Decision: GitHub Pages publishes through the workflow `.github/workflows/publish.yml` (Pages source: GitHub Actions) on every merge to main, once a day at 14:17 UTC, and on "Run workflow". Before publishing, `scripts/latest-posts.js` fills "Latest posts" on the Writing page with the 4 newest posts, read through Jina Reader (Substack's post list first, then the feed). It changes only the published copy, never the file in the repository. Don't edit between the `LATEST POSTS START` and `LATEST POSTS END` lines: the text there is the fallback if the posts can't be loaded. On other branches the publish step is skipped.
- Why: three approaches failed because of Substack's Cloudflare; the fourth, through Jina Reader on GitHub, works. Tested in October 2026: Substack's Cloudflare blocks GitHub's computers and Claude's sessions, and Jina Reader works from GitHub but answers 401 to visitors' browsers without a key. The publish step is skipped on other branches so the build can be tested safely.
- Turned down: the three approaches before it (pull requests 13 to 15): reading Substack straight from GitHub, then loading the posts in each visitor's browser, then Jina Reader in each visitor's browser. AllOrigins, rss2json, codetabs and corsproxy.io don't work.

### October 24, 2026: a handoff file for each new session (pull request 25)
- Decision: `HANDOFF.md` says where each project stands, and each new session reads it first. Personal details stay out of it.
- Why: so the next session can pick up without the old chat. The repository is public.

### October 24, 2026: no Home link in the menu (pull request 26)
- Decision: the menu shows Writing, Projects, About. There's no Home link: the name "Daniel Yoon" goes to Home.
- Why: four links didn't fit on one line on a small phone (360px wide, checked October 2026).

### October 24, 2026: a Projects page (pull request 26)
- Decision: a fourth page, Projects. It says once, at the top, that he builds the projects with AI. Quiet room is listed as in progress, with no link.
- Why: Quiet room has no link because the room is shared by private link. Not recorded for the rest.

### October 24, 2026: Projects: all projects first, then "How I built it" (pull request 27)
- Decision: all projects come first and stay short (label, name, one friendly line, link). The "How I built it" notes (what I wanted, the problem, what I decided, the trade-off) come after, in their own section, as fold-outs. Never put the notes inside the project list. Add each new app to both parts.
- Why: Projects is for two kinds of readers: the short list shows every project near the top, and the notes are for anyone checking how he thinks. Dan's rule (October 2026): notes inside the list push the next project out of sight.
- Turned down: the notes inside the project list.

### October 24, 2026: short pages on a phone, with tabs and fold-outs (pull request 27)
- Decision: keep pages short on a phone, with tabs or fold-outs instead of long lists. The Writing page has two tabs, "Start here" and "Latest" (`tabs.js`); without JavaScript both lists show. On the Projects page, the "How I built it" notes are fold-outs (HTML's own `<details>`), closed until tapped. Post opening lines stop after 3 lines.
- Why: Dan's rule (October 2026): people won't scroll far. It's one of his design rules, learned the hard way.

### October 24, 2026: version numbers on the stylesheet and script links (pull request 27)
- Decision: pages link the stylesheet as `style.css?v=2` and the tabs script as `tabs.js?v=1`. Raise the number on every page whenever the file changes.
- Why: so phones don't keep an old copy: GitHub Pages lets browsers keep files for 10 minutes.

### October 28, 2026: the website's rules moved into `.claude/rules/` (pull request 81)
- Decision: the website's own rules (its pages, publishing and Latest posts, the words already chosen, and its links) moved from `CLAUDE.md` into `.claude/rules/website.md`, and the Moon jar design into `.claude/rules/moon-jar.md`. The rules for every project, and the privacy rule, stay in `CLAUDE.md`.
- Why: so they load only when Claude works on the files they name: the website's own files, and for the design also Fewer spam calls, First step smaller and Quiet room. Dan chose this notes cleanup ("A") after asking how to spend fewer tokens on reading these notes.

### October 28, 2026: short handoff notes (pull request 82)
- Decision: `HANDOFF.md` becomes a short index (under about 80 lines). Each app keeps a `PROGRESS.md` (where it stands, rewritten) and a `DECISIONS.md` (choices and reasons, only added to); the website's decisions are in this file; the full history moves to `CHANGELOG.md`, read only when needed. Sessions read only the parts of long files the task needs.
- Why: Dan's plan (his Notion page "Claude Code: handoffs and decision logs," October 27, 2026): "when a long session gets summarized, Claude Code reloads CLAUDE.md from disk, but HANDOFF.md is too big to come back." And the October 28 token check: every request sends the whole conversation again, so the notes read at the start are paid for on every request. Dan chose "A," both pull requests.
- Turned down: `@path` imports (Claude Code's docs say they don't reduce what's read); deleting old notes (everything moved instead).

### October 31, 2026: leaner pickups (pull request 98)
- Decision: nothing is deleted; each fact keeps one home. `HANDOFF.md` drops its session-by-session history (moved word for word to `CHANGELOG.md`, "Session summaries," where new sessions now go) and its copy of each app's "Waiting on Dan" (it points to each `PROGRESS.md`). Living in the Word's `PROGRESS.md` keeps one line per finished item; details only it had moved to the matching `DECISIONS.md` entries as "Result" lines, and the speed research to the October 31 entry. `CLAUDE.md` gains "Compact instructions" (what a summary of a long session must keep) and a pickup tip (list a branch's changed files first). The `/pickup` skill reads the 3 newest decision entries in full instead of 10: the "In force" list has every decision in one line, and the skill still searches for entries the next step touches. Dan pastes the new wording into the skill on his claude.ai account.
- Why: Dan, October 31, 2026: "what are ways we can streamline information without losing and detail, and without losing the "why" for decisions we made, so that handoff and pickup between new chats doesn't need such a large context window every time? ... Don't just say YES because I asked, because I would rather it takes as long time rather than losing information and detail." Claude measured the notes a Living in the Word pickup reads at about 17,000 tokens (characters divided by 4, an estimate), a small part of a whole pickup session (about 127,000 to 206,000 tokens in the October 29 test on his Notion page "Claude Code: handoffs and decision logs"). The trims save about 1,000 tokens in the notes, plus about 2,500 from the skill's wording, plus about 2,000 whenever a pickup compares branches. Dan chose "a."
- Turned down: shortening the decision entries (their quotes and "Turned down" lines are the "why"); trimming Living in the Word's `CLAUDE.md` rules (a small saving, and they're the safety rails); `@path` imports and deleting history (turned down October 28).
- To test: the website's rules (`website.md` and `moon-jar.md`) loaded in a Living in the Word session after Claude read `living-in-the-word/index.html`. Their `paths` say `*.html`, and Claude Code's memory page (read October 31, 2026) says `*.md` means "Markdown files in the project root." Test in a fresh session before changing the patterns.
- Revisit if: pickups still feel heavy (then measure with `/context`, as the Notion page suggests), or a detail turns out to be missing after a pickup.
- Status: its "Dan pastes the new wording" part was replaced by October 31, 2026: the `/pickup` skill lives in the repository (pull request 99).
- Result of "To test" (the ninth session, October 31, 2026): both files loaded after Claude read `living-in-the-word/index.html` with the Read tool. Fixed in pull request 101 ("the website's rules load only for its own files," below).

### October 31, 2026: the `/pickup` skill lives in the repository (pull request 99)
- Decision: the new `/pickup` wording (the 3 newest decision entries in full instead of 10, and listing a branch's changed files first) is a project skill at `.claude/skills/pickup/SKILL.md`. In this repository, `/pickup` runs it; the copy on Dan's claude.ai account runs here only under its full name, `/anthropic-skills:pickup`, and still works everywhere else. `/handoff` stays on his account.
- Why: Dan, after Claude asked him to paste the new wording: "can't you update the pickup skill yourself?" Claude Code's skills page (read October 31, 2026): it "downloads synced skills and never uploads them. If you or Claude edit a file under `~/.claude/skills/synced/`, the change isn't saved to your claude.ai account, and a later sync can overwrite or remove it." The same page says project skills in `.claude/skills/` load in this repository's sessions, including cloud sessions (not cloud threads in a Claude project), and a project skill with the same short name runs instead of the synced one. https://code.claude.com/docs/en/skills
- Turned down: Claude editing the downloaded copy (not saved, and overwritten by the next sync); Dan pasting the wording on claude.ai (the friction he asked to avoid).
- Revisit if: Dan starts sessions as threads in a Claude project (repository skills don't load there), or changes the account's `/pickup` and expects it here.

### October 31, 2026: the website's rules load only for its own files (pull request 101)
- Decision: every pattern in the `paths` list at the top of `.claude/rules/website.md` and `.claude/rules/moon-jar.md` starts with `/`, which means "at the top of the repository": `/*.html`, `/style.css`, `/tabs.js`, `/scripts/**` and `/.github/workflows/**`, and for the Moon jar design also `/fewer-spam-calls/**`, `/first-step-smaller/**` and `/quiet-room/**`. So the website's rules load only for the website's own files (no longer for any app's pages), the Moon jar design also for the three apps with that look, and neither for Living in the Word.
- Why: the "Leaner pickups" test, in the ninth session: reading `living-in-the-word/index.html` loaded both files, about 5,700 characters (about 1,400 tokens, by characters divided by 4, an estimate) that a Living in the Word session doesn't need. Claude Code's own code (version 2.1.316, the one installed in Claude's cloud session) drops a trailing `/**`, then matches the patterns the way `.gitignore` files do (with the `ignore` library): a pattern with no `/` in it, like `*.html` or `style.css`, matches in every folder, and a `/` at the start pins it to the top. Claude Code's memory page (https://code.claude.com/docs/en/memory, read October 31, 2026) says `*.md` matches "Markdown files in the project root," which isn't what happened here. Naming each file wouldn't have been enough: Living in the Word has its own `index.html` and `style.css`. Dan chose "A": the fix, tested by Claude in a fresh session before he merges.
- Checked: with the same `ignore` library (versions 5 and 7), against every file in the repository: `website.md` matches the four pages, `style.css`, `tabs.js`, `scripts/` and `.github/`; `moon-jar.md` matches those pages, `style.css` and `tabs.js` plus the three apps' folders; neither matches any file in `living-in-the-word/`.
- Turned down: "(b)" leaving the patterns as they were and noting it (about 1,400 tokens in each Living in the Word session, and the website's rules in the other apps' sessions); naming each file (it still matches the apps' own `index.html` and `style.css`).
- Revisit if: a new app uses the Moon jar look (add `"/its-folder/**"` to `moon-jar.md`); the website gets a new folder of its own files; or a Claude Code update changes how `paths` match (then test again in a fresh session: read `living-in-the-word/index.html`, where neither should load, then `index.html`, where both should).
