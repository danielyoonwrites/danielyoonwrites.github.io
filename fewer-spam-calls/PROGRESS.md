# Fewer spam calls: progress (updated October 28, 2026)

The guide: https://danielyoonwrites.github.io/fewer-spam-calls. Read `SPEC.md` (what it does and why), `DECISIONS.md` (choices and their reasons) and `CLAUDE.md`.

## Where it stands
- Built, with one check left. Pull requests 20 to 24: the spec, the first version, the questions-first redesign, button and caching fixes, and a full fact check. Build plan steps 1 to 3 are done. Step 4, the final pass: facts rechecked October 24, 2026; the Samsung steps are still to confirm.
- A guide for anyone in the US, written for seniors. Three big-button questions (phone, phone company, California), then only the matching steps, one per screen, then "You're all set." Nothing is saved; it never asks for a phone number.
- Facts were checked on every official page on October 24, 2026 (FTC, FCC, T-Mobile, Verizon, AT&T, Apple, Google, California's DROP), by opening each page from GitHub through Jina Reader and reading the exact lines. Recheck them before each update.
- Not confirmed directly:
  - The Samsung steps. Samsung's site couldn't be read, so they rest on search results of Samsung's Smart Call page.
  - "Free" for Verizon and AT&T, which comes from their pages as quoted in search results.
- Not recorded either way: build plan step 4 also says to check the iPhone steps on a real iPhone. The notes list only the Samsung check as left.
- Delayed by Dan (no reason recorded): Korean and Spanish versions. When resumed: a language choice on the first screen, one page per language, phone menu words taken from Apple, Google and Samsung's own Korean and Spanish help pages, and a native speaker reviews each version before it's shared.

## Waiting on Dan
1. The Samsung check, on a real Samsung Galaxy phone: on that phone, open https://danielyoonwrites.github.io/fewer-spam-calls, tap "Samsung Galaxy," answer the other two questions, then tap "Done, next step" until the Samsung step shows.
2. Do what the Samsung step on https://danielyoonwrites.github.io/fewer-spam-calls says, in that phone's own Phone app: the three dots, Settings, Caller ID and spam protection, Block spam and scam calls. Tell Claude whether each name matches what the phone shows (a screenshot of each screen helps).

## Open pull requests
None (checked on GitHub, October 28, 2026). These notes come from the notes cleanup, planned as pull request 82.

## Next step
Finish build plan step 4 with Dan's Samsung check. If the phone shows different names, fix the Samsung step, then update the "Last checked" date and the sources list (rules in `CLAUDE.md`). Step 4 also names a check of the iPhone steps on a real iPhone that no note records as done: ask Dan about it. The Korean and Spanish versions wait until Dan resumes them.

## Dead ends
- Reading Samsung's help page (https://www.samsung.com/us/support/answer/ANS10003438/) through the page reader, Jina Reader on GitHub, on October 24, 2026: Samsung blocked it.

## How to check it works
- On a phone, open https://danielyoonwrites.github.io/fewer-spam-calls and go through it with your own answers, then again with "I'm not sure."
- Nothing shows below the buttons until the last screen, "You're all set." That screen has "Start over," the sources (a fold-out, "Where this comes from," with the "last checked" date) and "Made by Daniel Yoon."
- Tap every link once, and follow the steps for your own phone and phone company.
- Without JavaScript, every step shows on one page.
- After a change to `style.css` or `guide.js`, raise the `?v=` number on their file links, or phones may keep the old copy for up to 10 minutes.
