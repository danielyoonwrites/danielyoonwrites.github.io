# Plan: the AI helper (stage 2)

Questions written for the specific passage. Planned with the owner on October 25, 2026, after he tried build step 2: questions that are the same for every passage could just be printed once, so the AI helper is what makes the app worth using. It moves up to come right after step 2.

## Decided (October 25, 2026)

- The AI follows the chosen method: for Discovery Bible Study it still asks about God, about people, obeying and sharing, but about this passage. Its questions replace the general ones as drafts. "Start these questions over" brings the general ones back.
- Changed October 26, 2026 (the owner's choice, pull request 50): no methods or reading plan styles. When the AI writes for each passage, the questions won't fit a method's mold anyway. The AI writes questions in one fixed order (what the passage says, God, the heart, a response), as soon as a passage is typed. "Write new questions" asks again.
- Changed again October 26, 2026 (pull request 51): 5 questions, the 5th about praying together (the owner's choice), for the reading plan too (there, one way to live it out today, then prayer). The button now says "Write questions with AI," with a line saying it writes 5 new study questions.
- A passcode: the first time the owner taps "Suggest questions," the app asks for it and remembers it on that phone. Other leaders can get their own later.
- Which AI model: decided later, after a side-by-side test (see step C). The owner wants to see quality and cost together.
- Every suggestion is a draft the owner reviews. Nothing is shared on its own.
- Theological guidance (the owner's idea, October 25, 2026): a page of written guidance is sent with every request: stay within the historic faith (Apostles' and Nicene Creeds), read in context, let Scripture interpret Scripture, never quote verses, don't take sides where churches differ, and who the group is. Claude drafted it first; the owner then wrote his own (October 25, 2026): Reformed and evangelical, the Bible as inspired and inerrant, careful grammatical-historical reading, grace before effort, written for a group where some grew up with faith as duty or shame. Two additions he chose after Claude's review: "Follow their tone and care, not their positions on the debated topics below" (after the named pastors, since Piper and Carson are known for one side of a debated topic the guidance stays neutral on), and a "note for the leader" in each answer. It lives at the top of `server/worker.js`, so it's public, like the rest of the code. About 1,300 words, roughly 1,700 to 2,300 tokens: about 0.8 cent more per request with Opus 5.5 (Claude's estimate; the test shows the exact count).
- A note for the leader: when the guidance asks the AI to tell the leader something (one fact of background, or that many Bibles set Mark 16:9–20 or John 7:53–8:11 apart), it goes in a short note shown above the questions in the app, never shared with the group.
- Reading plan with AI questions (the owner likes it): it shows only the passage name, like "Today: Matthew 1," with no Bible text, so there's no copyright concern.

Still open (asked one at a time when we get there):
- The monthly spending limit (set during sign-up, step B). Recommendation: $5 to start.
- Which model, after the test.

## How it works

1. In the app, type a passage and tap "Go deeper with AI." While the AI writes, the screen says so and shows placeholder lines.
2. The app sends only the passage name (like "John 4:1-26"), whether it's a group study or the reading plan, and the passcode to a small server. Nothing personal.
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
- Write exactly 5 questions in the set order, in plain words for a small group.

The owner reviews every question, as always.

## What it should cost (Claude's estimate, October 25, 2026)

Hosting is free (GitHub Pages, and Cloudflare's free plan). The AI is the only cost. Assuming about 2,400 tokens in and 1,400 out per set of questions (unverified until the test, which shows the real numbers):

| | One set of questions | Small group (about 8 sets a month) | Plus a daily reading plan (about 30 more) |
|---|---|---|---|
| Opus 5.5 | about 3.7 cents | about 30 cents a month | about $1.40 a month |
| Sonnet 5.5 | about 1.9 cents | about 15 cents | about 70 cents |
| Haiku 5.5 | about 0.1 cent | about 1 cent | about 4 cents |

The monthly spending limit ($5 recommended) is the most it can ever cost in a month. Each day's reading plan questions should be saved on the phone, so opening a day again costs nothing.

## Keeping the bill safe

- The passcode: without it the server refuses before the AI is asked, so it costs nothing.
- Only Bible passages reach the AI (pull request 61, October 26, 2026, the owner's request): the server checks that the passage is a book of the Bible with chapter and verse numbers, like "John 4:1-26", "1 Cor 13" or "Jude", before anything costs money (`looksLikePassage` in `server/worker.js`). Anything else, like a sentence or instructions for the AI, gets the app's "didn't recognize that passage" message, and the AI is never asked. The AI still gets the passage exactly as typed, and still checks it too (`known_passage`).
- The monthly spending limit in the Claude Console: the hard stop. The account's tier allows up to $500 a month; set your own lower limit on the Billing page, under "Spend limits" (checked October 26, 2026: https://platform.claude.com/docs/en/api/rate-limits). When it's reached, the app says this month's AI limit is reached and shows the general questions.
- Next (the owner's request, October 26, 2026): a daily limit, kept in a small Cloudflare database (D1), for each phone's internet address and for everyone together.
- Each answer is capped at 4,000 tokens, thinking included, so one answer can't cost more than about 8 cents with Opus 5.5 (and much less with the others).
- Parked: Cloudflare's rate limiting counter can slow repeated requests, but only counts per 10 or 60 seconds (search results only, unverified: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/). Add it only if the passcode ever leaks.

## Parked: Bible text

- Showing verses in the app: done October 26, 2026, with the ESV (pull request 54; see `SPEC.md`, "The Bible text"). The ESV text is never sent to the AI.
- Giving the AI the actual chapter so it works from the real words, not memory (fewer mistakes, roughly half a cent more per request, Claude's estimate). Decide after the model test.
- Free texts (search results, not opened yet): the Berean Standard Bible, which its terms say was dedicated to the public domain on April 30, 2023 (https://berean.bible/terms.htm); the King James Version, free in the US but under Crown copyright in the United Kingdom (https://ebible.org/KJV/copr.htm); the World English Bible, described as public domain by one secondary source (https://freely-given.org/BibleTranslations/English/WEB/).

## Build steps (one pull request each, each with a check the owner does)

A. This plan. Check: read it.
B. Done October 26, 2026. The Claude Console org gets $100 a month of API credits from the owner's Max plan (https://platform.claude.com/docs/en/about-claude/api-credits-for-subscribers): no card, no purchased credits, and requests stop if the credits run out. The Cloudflare Worker is `living-in-the-word` at https://living-in-the-word.danyoonsignup.workers.dev/ (made with "Start with Hello World!", then `worker.js` pasted into Edit code). Secrets `ANTHROPIC_API_KEY` and `PASSCODE` are set (Settings, Runtime variables and secrets, Production). Since pull request 54, a third secret, `ESV_API_KEY`, can hold Crossway's free ESV API key for showing the passage. Not set: the owner put the ESV on hold on October 26, 2026 (see `SPEC.md`, "The Bible text"). The API key is scoped to the Default workspace and **expires November 24, 2026**: then make a new key and replace the `ANTHROPIC_API_KEY` secret (Anthropic emails 7 days before). `SERVER_URL` in `app.js` points to the Worker (pull request 48). Originally: sign-ups, no pull request: the Claude Console (credit, spending limit, key) and Cloudflare, one step at a time, after opening both sites' current help pages. Check: the key and passcode are saved in Cloudflare and nowhere else.
C1. The server code, `server/worker.js`, with the draft guidance, tested against a stand-in for the AI (the real AI needs the key from step B). Check: read the guidance at the top.
First real test, October 26, 2026 (John 1, Discover, Opus 5.5): the questions followed the guidance and every verse reference checked out, but they were long, quoted "come and see," and had one grammar slip. The owner added three lines to the guidance (pull request 49): short questions that ask one thing, no quotes "not even short phrases," and correct grammar. After changing `server/worker.js`, paste it into Cloudflare again (Edit code, then Deploy).

C2. Built October 25, 2026, before the sign-ups (pull request 42); the server's address (`SERVER_URL` at the top of the AI helper part of `app.js`) is filled in after Part 2 of step B. In the app, a "Suggest questions for this passage" button with the passcode, the note for the leader above the questions, plus a test link (like `?test`) that shows a model choice and the cost of each answer. Deploy the server (after step B), then try the same passage with all three models. Check: pick the model. If answers stop at the 4,000-token cap (the longer guidance may mean more thinking), raise it a little.
D. The chosen model becomes the only one, and the test choice comes out. Done October 26, 2026 (pull request 50): the owner chose Sonnet 5.5 after trying John 1 with all three models. The `?test` link now shows only the cost of each answer. Check: try it with this week's passage.

E. Built October 25, 2026 (pull request 44). AI questions for the reading plan (the owner's choice, October 25, 2026): opening a day's reading asks the AI for 3 or 4 personal reflection questions on that chapter, written for one person's quiet time instead of a group, and saves them with the plan so the same reading never costs twice. Until the AI is connected, the reading shows the three Swedish-method questions. The server has a fourth pattern for this, `devotional` in `server/worker.js` (3 or 4 questions: notice what it says about God, the heart, a response to God). On a phone without the passcode, a quiet "Questions for this reading" button asks for it once. If the AI writes a note (like the Mark 16 note), it shows as "A note on this reading." Check: open today's reading.

F. A style for the reading plan (pull request 47): the app sends the chosen style's method with `personal: true`, and the server adds a line asking for only 3 or 4 questions for one person's quiet time, in that method's order. Quiet time uses the `devotional` pattern. AI questions are saved by style and reading, so changing styles never pays twice for the same one.
Replaced October 26, 2026 (pull request 50): no styles. The app sends `method: 'personal'`, the server's `personal` pattern asks for exactly 4 questions, and they're saved by reading (`four-0`, `four-1` and so on). Readings saved under an old style are asked once more. Since pull request 51: 5 questions, saved as `five-0`, `five-1` and so on.

Then the rest of `SPEC.md`'s build plan: Share and Copy, Lead the study, saving, the reading plan, printing.

## Tech notes

- The server calls the Claude API with plain `fetch` (raw HTTP), with the `anthropic-version: 2026-10-21` header, and the key as `Authorization: Bearer` (https://platform.claude.com/docs/en/manage-claude/authentication; the older `x-api-key` header is "legacy"). The key must be scoped to one workspace (the Default Workspace) when it's created; otherwise every request also needs an `anthropic-workspace-id` header. Anthropic's own SDK needs npm, which this website doesn't use.
- Effort is `medium`. The model is Sonnet 5.5 (`MODEL` in `server/worker.js`). Anthropic's automatic fallback (`fallbacks: "default"`) was used until pull request 61 (October 26, 2026), then removed: for Sonnet 5.5 it only retries declines about cybersecurity or building other AI models (from Anthropic's reference guide for Claude models; the live page at https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback says routing is set per model and per kind of decline), so it never helped Bible questions and could only help someone misusing the app. A decline shows the general questions. During the model test (until October 26, 2026), all three models used medium effort, so the comparison was fair.
- The answer comes back as JSON (a list of questions), using the API's structured outputs.
- The server answers only to danielyoonwrites.github.io (and to a local test address during building), and only with the right passcode.
- The model's name is one line in the server, so changing it later is easy.
- The passcode is saved on the phone in `localStorage`, under the app's own key, `living-in-the-word`.
- If the AI declines or the spending limit is reached, the app says so kindly and keeps the general questions.
