# Plan: the AI helper (stage 2)

Questions written for the specific passage. Planned with the owner on October 25, 2026, after he tried build step 2: questions that are the same for every passage could just be printed once, so the AI helper is what makes the app worth using. It moves up to come right after step 2.

## Decided (October 25, 2026)

- The AI follows the chosen method: for Discovery Bible Study it still asks about God, about people, obeying and sharing, but about this passage. Its questions replace the general ones as drafts. "Start these questions over" brings the general ones back.
- A passcode: the first time the owner taps "Suggest questions," the app asks for it and remembers it on that phone. Other leaders can get their own later.
- Which AI model: decided later, after a side-by-side test (see step C). The owner wants to see quality and cost together.
- Every suggestion is a draft the owner reviews. Nothing is shared on its own.

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

From search results only (Cloudflare's pages couldn't be opened from Claude's session; open them before the owner signs up):
- Cloudflare Workers free plan: 100,000 requests a day and 10 milliseconds of CPU time per request. https://developers.cloudflare.com/workers/platform/pricing/
- Secrets are added in the dashboard: Workers & Pages, the Worker, Settings, Variables and Secrets, Add, type Secret, then Deploy. https://developers.cloudflare.com/workers/configuration/secrets/
- Not checked yet: editing a Worker's code in the dashboard, and whether waiting for the AI's answer counts toward the 10 milliseconds (Claude's understanding is that waiting doesn't count; confirm it).

Rough cost per set of questions (Claude's estimate, unverified until the test): about 3 to 4 cents with Opus 5.5, about 2 cents with Sonnet 5.5, well under a cent with Haiku 5.5. The test shows the real cost of each answer.

## Keeping Scripture safe

The AI doesn't get the Bible text (stage 1 shows no Bible text, and translations have usage rules). It works from what it knows of the passage, so its instructions say:
- Point to verse numbers ("in verse 10") instead of quoting verses.
- Stay with what the passage says. Don't add an interpretation as if it were the text.
- If it doesn't recognize the passage, say so instead of guessing.
- Follow the chosen method's pattern, in plain words for a small group.

The owner reviews every question, as always.

## Build steps (one pull request each, each with a check the owner does)

A. This plan. Check: read it.
B. Sign-ups, no pull request: the Claude Console (credit, spending limit, key) and Cloudflare, one step at a time, after opening both sites' current help pages. Check: the key and passcode are saved in Cloudflare and nowhere else.
C. The server, with a side-by-side test: a test link (like `?test`) shows a model choice and the cost of each answer. Try the same passage with all three models. Check: pick the model.
D. The "Suggest questions for this passage" button and the passcode, with the chosen model. The test choice comes out. Check: try it with this week's passage.

Then the rest of `SPEC.md`'s build plan: Share and Copy, Lead the study, saving, the reading plan, printing.

## Tech notes

- The server calls the Claude API with plain `fetch` (raw HTTP). Anthropic's own SDK needs npm, which this website doesn't use, and the Cloudflare dashboard can't install it. Check the current request format and `anthropic-version` header in Anthropic's docs when building.
- The answer comes back as JSON (a list of questions), using the API's structured outputs.
- The server answers only to danielyoonwrites.github.io (and to a local test address during building), and only with the right passcode.
- The model's name is one line in the server, so changing it later is easy.
- The passcode is saved on the phone in `localStorage`, under the app's own key, `living-in-the-word`.
- If the AI declines or the spending limit is reached, the app says so kindly and keeps the general questions.
