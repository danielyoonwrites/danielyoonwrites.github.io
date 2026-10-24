# Daniel Yoon personal site

A personal website for Daniel Yoon, hosted free on GitHub Pages.
Plain HTML and CSS, with JavaScript where it helps. The owner is a beginner and edits the files by hand.

## Rules for working here

- Explain every change in plain words a beginner can follow: what changed, why, and how to check it.
- One small change per pull request.
- No build tools: no npm, no frameworks, no generators.
- Keep the code simple and commented so the owner can edit it later.
- Every page must look good on a phone first, then on a computer.

## Pages

- Version 1: Home (`index.html`), Writing (`writing.html`), About (`about.html`).
- Later: Projects (`projects.html`) for small web apps.
- One shared stylesheet: `style.css`.

## Publishing and Latest posts

- GitHub Pages publishes through the workflow `.github/workflows/publish.yml` (Pages source: GitHub Actions). It runs on every merge to main, once a day, and on "Run workflow".
- Before publishing, `scripts/latest-posts.js` fills the "Latest posts" list on `writing.html` with the 4 newest posts from the Substack feed. It changes only the published copy, never the file in the repository.
- Don't edit between the `LATEST POSTS START` and `LATEST POSTS END` lines. The text there is the fallback if the feed can't be reached.
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

## Design system: "Moon jar" (matches the Substack)

Colors
- porcelain `#F1EFEA`: background of every page. Never pure white.
- ink `#1E1C1A`: all main text.
- celadon `#386F61`: links, buttons and small labels. Never a background behind body text.
- stone `#6B655C`: secondary text: dates, captions, small print.
- glaze `#DCE6DF`: thin divider lines only.

Type
- All English in Libre Baskerville (Google Fonts), Regular and Italic only. Never bold, including headings.
- Any Korean in Nanum Myeongjo ExtraBold (weight 800, Google Fonts).
- Name in the header: Libre Baskerville Regular, never italic.
- Small labels: uppercase, letter spacing about 0.14em, celadon.
- Sizes are chosen for phones, not the 1080px Instagram images. Starting point: body 18px with line height about 1.6, text column no wider than about 36em.

Layout and words
- Left-aligned text, calm open space.
- Square corners on images and blocks (no border-radius).
- No logo image. "Daniel Yoon" in the header is the only mark.
- Real photos only: window light, ordinary things. No stock images.
- Sentence case. No exclamation marks. No emoji.

Privacy
- Never show the owner's kids' faces, names or schools, in text, images or file names.
