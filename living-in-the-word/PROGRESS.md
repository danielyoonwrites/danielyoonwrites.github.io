# Living in the Word: progress (updated October 28, 2026)

The app: https://danielyoonwrites.github.io/living-in-the-word (live, not listed in search engines).
Read `SPEC.md` (what it does and why), `SIGNUP-PLAN.md` (sign-ups), `STORE-PLAN.md` (phones and app stores), `AI-PLAN.md` (the AI helper) and `DECISIONS.md` (choices and their reasons). Earlier history: the root `HANDOFF.md`, "Project 5."

## Where things stand
- Done and checked:
  - Sign-up step S3, signing in with an email code (pull request 73). Dan signed in live on his phone on October 28, 2026 ("ok it works"). The secrets `RESEND_API_KEY` and `OWNER_EMAIL` are saved in Cloudflare, and the new `server/worker.js` is pasted. Only Dan's own address can sign in until step S4.
  - The AI writes with Opus 5.5 (pull request 74). Dan pasted the new `worker.js` and tried Romans 14 on the test link: 4,630 tokens in, 553 out, about 2.96 cents, and he found the questions better.
  - The magazine look and the readability fixes (pull request 76). Dan's screenshots of Phil 2 and Philippians 2 showed it live.
  - "For the leader" starts open (pull request 75): seen open in Dan's screenshot.
- Done, not checked on a phone yet:
  - Pull request 77: a typed short name is written out in full ("Phil 2" becomes "Philippians 2"), and "A note on this reading" starts open. Tested in Chromium only.
- Planned, not built: `STORE-PLAN.md` (October 28, 2026), the steps toward Android install, Google Play and maybe Apple's App Store, after Dan asked to prepare the app for phones and app stores. Double-checked the same day at his request, in seven research passes. Two things to fix now, store or not: Android's back gesture closes the installed app from any screen (`app.js` never adds to the browser's history), and the app lacks the line Anthropic's Commercial Terms (D.3) require, telling people to check the AI's facts.
- Open pull requests: only the one carrying the store plan, if it isn't merged yet.

## Waiting on Dan
1. Check pull request 77 on his phone: open https://danielyoonwrites.github.io/living-in-the-word/, tap "Prepare for a Bible study," type `phil 2`, tap "Go deeper with AI": the title should say "Philippians 2." Then open today's reading: "A note on this reading" should be open.
2. The Anthropic API key expires November 24, 2026. Before then: make a new key in the Claude Console (https://platform.claude.com), then in Cloudflare (https://dash.cloudflare.com) go to Compute, Workers & Pages, `living-in-the-word`, Settings, Variables and Secrets, and replace the secret `ANTHROPIC_API_KEY`. Remind him in good time, with every step.
3. Optional: his own words for the big title on the start screen (it's the app's name now; the mockup had made-up words).
4. Smaller checks, if not done: a spend limit in the Claude Console ($10 suggested); a passcode of four or more random words; two-step sign-in on Cloudflare; Share inside KakaoTalk; his review of the general questions' wording (`SPEC.md`, "The questions"); a trademark search for the name before any store listing.

## Next step
Ask Dan which comes first, one question: store plan step 1, the back gesture (recommended: today it closes the installed app from any screen on Android, his phone), step 4, the "check it" line (small; Anthropic's terms require it now), sign-up step S4 (his invite page), or the notes cleanup from his Notion page "Claude Code: handoffs and decision logs."

## Dead ends
- Reading Google Play's help (support.google.com, play.google.com) through the WebFetch tool: the names don't resolve at all (ENOTFOUND). developer.chrome.com and web.dev are blocked too; Chrome's install rules can be read in Chromium's source on GitHub instead (October 28, 2026).
- Reading Google's help pages (support.google.com), w3.org and Resend's docs (resend.com/docs) from the session: blocked by the network policy (the proxy answers 403). Use web search and mark facts as from search results. Resend's API request format was taken from its own code library on GitHub instead (https://github.com/resend/resend-node).
- Testing the server with one copy of `worker.js` and a new empty database each time: the Worker remembers it already made its tables (`tablesMade`), so a fresh database errors. Load a fresh copy of the module for each new database.
- `import { chromium } from 'playwright'` in a Node ES module fails here; use `createRequire(import.meta.url)('playwright')`.

## How to check it works
- On a phone: https://danielyoonwrites.github.io/living-in-the-word/?test shows the cost of each answer (about 3 cents a set with Opus).
- Sign-in: "Sign in" at the bottom of the start screen, a code by email, "Signed in as ..." with "Sign out."
- How Claude tested it (scripts aren't in the repository): `server/worker.js` loaded in Node with a stand-in for Cloudflare's D1 built on Node's own SQLite (`node:sqlite`) and stand-ins for Resend and the AI (67 checks); the app driven in Chromium with Playwright at 320, 360 and 1280 wide, with requests to the Worker answered by the real `worker.js` (54 checks). Serve the repository with `python3 -m http.server 8765 --bind 127.0.0.1`.
