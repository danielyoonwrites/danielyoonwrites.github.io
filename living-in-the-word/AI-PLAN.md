# Plan: the AI helper (stage 2)

Questions written for the specific passage. Planned with the owner on October 25, 2026, after he tried build step 2: questions that are the same for every passage could just be printed once, so the AI helper is what makes the app worth using. It moves up to come right after step 2.

## Decided (October 25, 2026)

- The AI follows the chosen method: for Discovery Bible Study it still asks about God, about people, obeying and sharing, but about this passage. Its questions replace the general ones as drafts. "Start these questions over" brings the general ones back.
- A passcode: the first time the owner taps "Suggest questions," the app asks for it and remembers it on that phone. Other leaders can get their own later.
- Which AI model: decided later, after a side-by-side test (see step C). The owner wants to see quality and cost together.
- Every suggestion is a draft the owner reviews. Nothing is shared on its own.
- Theological guidance (the owner's idea, October 25, 2026): a page of written guidance is sent with every request: stay within the historic faith (Apostles' and Nicene Creeds), read in context, let Scripture interpret Scripture, never quote verses, don't take sides where churches differ, and who the group is. Claude drafted it; the owner chose "use it for now" and will rewrite it in his own words on his laptop (remind him before the model test). It lives at the top of `server/worker.js`, so it's public, like the rest of the code.
- Reading plan with AI questions (the owner likes it): it shows only the passage name, like "Today: Matthew 1," with no Bible text, so there's no copyright concern.

Still open (asked one at a time when we get there):
- The monthly spending limit (set during sign-up, step B). Recommendation: $5 to start.
- Which model, after the test.

## How it works

1. In the app, after choosing a method, tap "Suggest questions for this passage."
2. The app sends only the passage name (like "John 4:1-26"), the method and the passcode to a small server. Nothing personal.
3. The server checks the passcode, then asks the AI (Claude, by Anthropic) with the secret key, which only the server knows.
4. The questions come back and show as drafts, ready to edit, remove or add to.

Why a server: the website is public, so anyone can read its code. A key in the app could be copied and used on the owner's bill. The server keeps the key hidden.

## The parts

- AI: the Claude API from Anthropic. The owner makes an account in the Claude Console, adds credit, sets a monthly spending limit and makes a key.
- Server: Cloudflare Workers, free plan. The code is one file, kept in this folder as `server/worker.js` with no secrets in it. The owner pastes it into Cloudflare's website, and the key and passcode are stored in Cloudflare's dashboard as secrets. No npm and no build tools.

## What was checked (October 25, 2026)

Opened from Claude's session:
- Anthropic prices per million tokens (a token is about three quarters of a word), input / output: Claude Opus 5.5 $4 / $20, Claude Sonnet 5.5 $2 / $10, Claude Haiku 5.5 $0.10 / $0.50. https://platform.claude.com/docs/en/about-claude/pricing
- Spending limits: set your own monthly limit on the Console's Billing page (https://platform.claude.com/settings/billing), under "Spend limits," with "Set limit" or "Adjust limit." When it's reached, requests stop until the next month or until the limit is raised. https://platform.claude.com/docs/en/api/rate-limits

Opened through GitHub's computers (Cloudflare's site is blocked from Claude's session):
- Cloudflare Workers free plan: 100,000 requests a day and 10 milliseconds of CPU time per request. https://developers.cloudflare.com/workers/platform/pricing/
- "Waiting on network requests (such as fetch() calls ...) does not count toward CPU time," so waiting for the AI is fine. https://developers.cloudflare.com/workers/platform/limits/
- Secrets in the dashboard: Workers & Pages, the Worker, Settings, under Variables and Secrets select Add, type Secret, a name and a value, then Deploy. The value stays hidden afterward. https://developers.cloudflare.com/workers/configuration/secrets/
- Not checked yet: the exact clicks to create a Worker and edit its code in the dashboard (https://developers.cloudflare.com/workers/get-started/dashboard/ starts with Workers & Pages, then Create application). Read it in full before step B.

Also opened (Anthropic's docs): the request format for JSON answers (https://platform.claude.com/docs/en/build-with-claude/structured-outputs), the current API version, 2026-10-21 (https://platform.claude.com/docs/en/api/versioning), and that `max_tokens` is "a hard limit on total output (thinking plus response text)" (https://platform.claude.com/docs/en/build-with-claude/effort).

Rough cost per set of questions (Claude's estimate, unverified until the test): about 3 to 4 cents with Opus 5.5, about 2 cents with Sonnet 5.5, well under a cent with Haiku 5.5. The test shows the real cost of each answer.

## Keeping Scripture safe

The AI doesn't get the Bible text (stage 1 shows no Bible text, and translations have usage rules). It works from what it knows of the passage, so its instructions say:
- Point to verse numbers ("in verse 10") instead of quoting verses.
- Stay with what the passage says. Don't add an interpretation as if it were the text.
- If it doesn't recognize the passage, say so instead of guessing.
- Follow the chosen method's pattern, in plain words for a small group.

The owner reviews every question, as always.

## Keeping the bill safe

- The passcode: without it the server refuses before the AI is asked, so it costs nothing.
- The monthly spending limit in the Claude Console: the hard stop.
- Each answer is capped at 4,000 tokens, thinking included, so one answer can't cost more than about 8 cents with Opus 5.5 (and much less with the others).
- Parked: Cloudflare's rate limiting counter can slow repeated requests, but only counts per 10 or 60 seconds (search results only, unverified: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/). Add it only if the passcode ever leaks.

## Parked: Bible text

- Showing verses in the app, and giving the AI the actual chapter so it works from the real words, not memory (fewer mistakes, roughly half a cent more per request, Claude's estimate). Decide after the model test.
- Free texts (search results, not opened yet): the Berean Standard Bible, which its terms say was dedicated to the public domain on April 30, 2023 (https://berean.bible/terms.htm); the King James Version, free in the US but under Crown copyright in the United Kingdom (https://ebible.org/KJV/copr.htm); the World English Bible, described as public domain by one secondary source (https://freely-given.org/BibleTranslations/English/WEB/).

## Build steps (one pull request each, each with a check the owner does)

A. This plan. Check: read it.
B. Sign-ups, no pull request: the Claude Console (credit, spending limit, key) and Cloudflare, one step at a time, after opening both sites' current help pages. Check: the key and passcode are saved in Cloudflare and nowhere else.
C1. The server code, `server/worker.js`, with the draft guidance, tested against a stand-in for the AI (the real AI needs the key from step B). Check: read the guidance at the top.
C2. In the app, a "Suggest questions for this passage" button with the passcode, plus a test link (like `?test`) that shows a model choice and the cost of each answer. Deploy the server (after step B), then try the same passage with all three models. Check: pick the model. Before this test, remind the owner to rewrite the guidance.
D. The chosen model becomes the only one, and the test choice comes out. Check: try it with this week's passage.

Then the rest of `SPEC.md`'s build plan: Share and Copy, Lead the study, saving, the reading plan, printing.

## Tech notes

- The server calls the Claude API with plain `fetch` (raw HTTP), with the `anthropic-version: 2026-10-21` header. Anthropic's own SDK needs npm, which this website doesn't use.
- Effort is `medium` for all three models in the test, so the comparison is fair. Opus and Sonnet use Anthropic's automatic fallback (`fallbacks: "default"`): if a safety check declines a request, Anthropic retries it on another model. Haiku has no fallback.
- The answer comes back as JSON (a list of questions), using the API's structured outputs.
- The server answers only to danielyoonwrites.github.io (and to a local test address during building), and only with the right passcode.
- The model's name is one line in the server, so changing it later is easy.
- The passcode is saved on the phone in `localStorage`, under the app's own key, `living-in-the-word`.
- If the AI declines or the spending limit is reached, the app says so kindly and keeps the general questions.
