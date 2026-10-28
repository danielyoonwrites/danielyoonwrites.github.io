---
paths:
  - "*.html"
  - "style.css"
  - "tabs.js"
  - "scripts/**"
  - ".github/workflows/**"
---

# The website's own rules

Moved from `CLAUDE.md` on October 28, 2026, so that they load only when Claude works on the website's own files (the pages at the top of the repository, `style.css`, `tabs.js`, `scripts/` and `.github/workflows/`). The rules for every project, and the privacy rule, stay in `CLAUDE.md`. The "Moon jar" design is in `moon-jar.md`, next to this file.

## Pages

- Home (`index.html`), Writing (`writing.html`), Projects (`projects.html`), About (`about.html`).
- The menu shows Writing, Projects, About. There's no Home link: the name "Daniel Yoon" goes to Home. Four links didn't fit on one line on a small phone (360px wide, checked October 2026).
- Projects is for two kinds of readers. All projects come first and stay short (label, name, one friendly line, link), so every project shows near the top. The "How I built it" notes (what I wanted, the problem, what I decided, the trade-off) come after, in their own section as fold-outs, for anyone checking how he thinks. Never put the notes inside the project list: they push the next project out of sight (the owner's rule, October 2026). The page says once, at the top, that he builds them with AI. Quiet room is listed as in progress with no link, because the room is shared by private link.
- Keep pages short on a phone (the owner's rule, October 2026): people won't scroll far. Use tabs or fold-outs instead of long lists.
  - Writing: two tabs, "Start here" and "Latest" (`tabs.js`). Without JavaScript both lists show.
  - Projects: the "How I built it" notes are fold-outs (HTML's own `<details>`), closed until tapped.
  - Post opening lines stop after 3 lines (`.post-excerpt` in `style.css`).
- One shared stylesheet: `style.css`. Pages link it as `style.css?v=2`: raise the number on every page whenever `style.css` changes, so phones don't keep an old copy (GitHub Pages lets browsers keep files for 10 minutes). The same for `tabs.js?v=1`.

## Publishing and Latest posts

- GitHub Pages publishes through the workflow `.github/workflows/publish.yml` (Pages source: GitHub Actions). It runs on every merge to main, once a day, and on "Run workflow". On other branches the publish step is skipped, so the build can be tested safely.
- Before publishing, `scripts/latest-posts.js` fills "Latest posts" on `writing.html` with the 4 newest posts. It reads Substack's post list through Jina Reader (r.jina.ai, header `X-Return-Format: text`), then the feed through Jina. It changes only the published copy, never the file in the repository.
- Don't edit between the `LATEST POSTS START` and `LATEST POSTS END` lines. The text there is the fallback if the posts can't be loaded.
- What was tested (October 2026): Substack's Cloudflare blocks GitHub's computers and Claude's sessions. Jina Reader works from GitHub but answers 401 to visitors' browsers without a key. AllOrigins, rss2json, codetabs and corsproxy.io don't work.
- GitHub turns off scheduled workflows after 60 days without repository activity; turn it back on in the Actions tab.

## Content

- The voice is like the Substack: writing, family life, the shy Korean voice.
- Readers: millennial Asian Christians. Faith is part of what the site is about.
- Pastor work is not the focus of the Home or Writing pages. The About page can say more (a short paragraph). Never word it so it sounds like just a job.

Words already chosen (use them exactly)
- Home: "Korean American dad. Professional overthinker, amateur life-enjoyer, tired parent of two toddlers. A millennial Asian Christian writing the things we usually don’t say out loud."
- About: the three paragraphs in `about.html`, written by the owner.
- Email for readers: thingsdanwrites@gmail.com (his writing email).

## Links

- Substack, The Shy Korean: https://thingsdandoes.substack.com
  Sign up with a celadon Subscribe button linking to https://thingsdandoes.substack.com/subscribe. Don't use Substack's embed form: its white box and gold button can't be restyled and clash with the design.
- Instagram: https://www.instagram.com/theshykoreandad/
