---
paths:
  - "/*.html"
  - "/style.css"
  - "/tabs.js"
  - "/fewer-spam-calls/**"
  - "/first-step-smaller/**"
  - "/quiet-room/**"
---

# The "Moon jar" design

Moved from `CLAUDE.md` on October 28, 2026, so that it loads only when Claude works on the website's pages or on the apps that use this look (Fewer spam calls, First step smaller and Quiet room). Living in the Word has its own look, "Paper and ink" (`living-in-the-word/SPEC.md`).

Each pattern in `paths` at the top starts with `/`, which means "at the top of the repository." Without it, a pattern like `*.html` matches in every folder, Living in the Word's too (October 31, 2026; root `DECISIONS.md`). A new app with this look gets its own line, like `"/its-folder/**"`.

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
