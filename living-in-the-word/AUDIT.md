# Living in the Word: the audit (November 2, 2026)

Dan asked, November 2, 2026: "Can we audit our code to check for reliability, bugs, security issues, and speed? Can we work on perfecting it not just building it". Three reviewers read every file separately (security and privacy, reliability and bugs, speed and cost). Claude checked each finding against the code before it went on this list. Each fix is its own small pull request, in the order below. Mark each item's status here when its pull request merges. The decision and its reasons are in `DECISIONS.md` (November 2, 2026).

No high-severity problems were found. Checked and sound: nobody can spend the AI money without signing in or the passcode, a real passage and room in the daily limits; the owner's page answers only Dan's own session; sign-in codes and session keys are kept only scrambled; every database query uses placeholders; emails are plain text; the app never puts text into the page as HTML; saved studies aren't lost; questions never show under the wrong passage; the back gesture stays in step; the daily counts and the plan's days are safe across daylight saving.

## Fix first (medium)

1. **The app could open dead right after an update.** On a slow start (the page over 4 seconds), the offline helper showed the copy of the old page, which then asked for its old script; GitHub Pages ignores `?v=`, so the new app.js came back, didn't fit the old page, and no button worked for that open. 3 of the 19 updates since pull request 59 would have done it (73, 87, 89). Also, a connection that hung and then dropped could leave the page without its script. Where: `sw.js`, `newestOrCopy`. Status: fixed in pull request 119 (the phone's exact copy of a versioned file is used at once; any version when the internet fails after the wait). Proved by the new saved checks SW1 to SW3, which fail on the old `sw.js`.
2. **Someone could check who's invited, and use up the day's sign-in emails.** With an address they already know, "send a code" then "check a code" answers "wrong code" for an invited address and "code expired" for others; the 6th code of a day and Resend's error also differ. And the day's 90 emails are counted before the 5-per-address limit refuses, so anyone who knows one invited address (Dan's is the reply-to on every invite) can use up everyone's sign-in emails for the day. Where: `server/worker.js`, `sendCode`. Status: fixed in pull request 120. Every address is counted and gets a code the same way, kept under the address scrambled (so the database never keeps an address someone only typed); only an invited address is emailed; the day's 90 is checked the same way for any address but counted only for emails that go; and this answer no longer carries Resend's reason. Proved by the saved checks in section 22 of `tests/server-test.mjs`, 7 of which fail on the old code. Still possible, and accepted as low: an invited address answers a little slower (it waits for the email to go); during an outage at Resend, only an invited address answers "email-failed"; and someone who knows an address can use up its 5 codes for the day (phones already signed in keep working).
3. **A wrong passcode is counted twice.** The app still asks the server for the Bible text (the ESV is on hold), so each study opened with a wrong or old passcode counts as two wrong tries; a few phones with an old passcode on one church Wi-Fi could lock everyone there out of signing in until midnight Pacific. It's also a wasted request on every study and reading. Where: `app.js`, `showPassageText`. Fix: an on/off switch, `ESV_TEXT = false`, so the text isn't asked for while the ESV is on hold (the code stays). Status: next.

Then fast mode (Opus 5.5 in fast mode for sets someone waits for), if Dan wants it; it's built and tested, waiting its turn.

## Smaller (low), one at a time after that

4. When Anthropic is briefly busy (a 429 rate limit), the app says "This month's AI limit is reached." Fix: a separate "busy" answer and message; keep "limit" for the spending-limit and credit messages. (`worker.js`, `askClaude`)
5. A reading's questions never give up if the connection hangs (studies give up after 2 minutes). Fix: the same 2-minute timer. (`app.js`, `fetchReadingQuestions`)
6. Ending a plan while its first reading is written, then starting another, can hide the new plan's "writing" lines and pay for its first reading twice; `readingFailed` isn't cleared with the plan. Fix: a plan counter checked when an answer arrives. (`app.js`)
7. A chapter written ahead is skipped (and later replaced) if the AI is still writing another passage when it's opened. Fix: take the ready set and cancel the other request, as opening a saved study does. (`app.js`, `startStudy`)
8. One person's requests sent all at the same moment can use up everyone's 60 for the day (only 20 reach the AI). Fix: add to the person's own count first, and to everyone's only within it. (`worker.js`)
9. If the browser blocks saving, "Start the plan" silently does nothing. Fix: the same gentle message Save shows. (`app.js`, the plan setup)
10. Speed details: batch the database's table setup (4 trips become 1 on a fresh server copy), one query for the sign-in instead of two, and count first instead of read-then-count (about 0.01 to 0.25 seconds in all, an estimate); on a weak connection the fonts' instructions can still wait 4 seconds; the words "This can take up to a minute" (the measured wait was 15 seconds; Dan's words to choose after a few more measured waits).

## For Dan (no code)

- A passcode of four or more random words, and a spend limit in the Claude Console (both already in `PROGRESS.md`, item 7). The passcode's 10-wrong-tries lockout counts each internet address separately, so a computer with many addresses (IPv6) or many tries sent at the same moment gets past it; only a long passcode really protects it, until step S6 removes it.
- If his phone is ever lost: in Cloudflare, the database `living-in-the-word-limits`, run `DELETE FROM sessions WHERE email = '<his address>';` to sign out every phone signed in as him (the menu names in Cloudflare weren't checked).
- Cloudflare's logs are on (`server/wrangler.jsonc`) and may keep each visitor's internet address for up to 7 days (unverified): look at one log entry before writing the privacy page (`STORE-PLAN.md`, step 6).
- Before the group signs in together (step S6): the 10 wrong tries a day are counted per internet connection, for passcodes and codes together, so one person's mistakes on a church Wi-Fi can block everyone there. Sign in on mobile data, or count wrong codes separately then.

## Notes for later (not bugs today)

- Every page of danielyoonwrites.github.io shares the app's saved sign-in (browsers keep one storage per website). Keep outside scripts, embeds and HTML insertion off every page of the site.
- `readSaved` treats any `version` other than 1 as empty, and the next save replaces everything. If the version is ever raised, an older app.js still on a phone would wipe saved studies.
- `connectionCode` uses the passcode as its secret; step S6 already plans a separate secret.
- Prompt caching was checked again: still not worth it. In steady use each request written ahead goes alone, so the cache write costs more than it saves (`PROGRESS.md`, "Dead ends").
- Gaps in the saved checks: AI errors all the way to the screen (429, 529, a refusal, a hung request), and plan restarts. Each fix above adds its own checks.
