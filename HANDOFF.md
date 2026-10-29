# Handoff: where everything stands

Last updated October 29, 2026 (Pacific time), at the end of the sixth session. This is a short index: where each project stands, what's waiting on Dan, and how to start the next session. Keep it under about 80 lines.

- How to work with Dan, and the rules for every project: `CLAUDE.md`.
- Each project: its folder's `PROGRESS.md` (where it stands, the next step), `DECISIONS.md` (choices and their reasons) and `SPEC.md`. The website's decisions are in the root `DECISIONS.md`.
- Blocked sites, testing tips and Notion prompts: `CLOUD-NOTES.md`.
- The full history (every pull request, and the older detailed notes for each project): `CHANGELOG.md`. Read it only when needed.

This repository is public. Keep personal details out of this file.


## The projects

- **The website** (done, live): https://danielyoonwrites.github.io. Its rules are in `.claude/rules/website.md` and `.claude/rules/moon-jar.md`, its decisions in the root `DECISIONS.md`. Ideas not done: skip post openings that start with "Disclaimer"; list First step smaller on the Projects page (after its trial, iPhone test and trademark search).
- **Quiet room** (paused after step 1): https://danielyoonwrites.github.io/quiet-room, `quiet-room/PROGRESS.md`.
- **Fewer spam calls** (built, one check left): https://danielyoonwrites.github.io/fewer-spam-calls, `fewer-spam-calls/PROGRESS.md`.
- **First step smaller** (built, the owner's trial next): https://danielyoonwrites.github.io/first-step-smaller, `first-step-smaller/PROGRESS.md`.
- **Living in the Word** (the AI helper live on Sonnet 5.5, signing in with an email code, the "check it" line, install help; the plan for phones and app stores under way): https://danielyoonwrites.github.io/living-in-the-word, `living-in-the-word/PROGRESS.md`. The store plan is `living-in-the-word/STORE-PLAN.md`.


## Where things stand (October 29, 2026)

- Fourth session (October 27 and 28): pull requests 73 to 78 for Living in the Word (signing in with an email code, Opus 5.5, the magazine look, typed names written out in full) and its own PROGRESS and DECISIONS files.
- Fifth session (October 28): pull request 79, the plan for phones and app stores, double-checked in seven research passes; 80, Android's back gesture goes back one screen; 81 and 82, the notes cleanup, after Dan asked how to spend fewer tokens on reading these notes (the findings are on his Notion page "Claude Code: handoffs and decision logs").
- Sixth session (October 28 and 29): the back button checked on Dan's phone (pull request 80; his phone uses the three buttons, not swipes). After Claude's research on cost and speed, Sonnet 5.5 at high effort replaced Opus (84; "it seems useable"); question 2 now asks why what the passage shows about God matters there (85; "better now"); the "check it" line Anthropic's terms require (86, checked); install help for Android and iPhone (87, not checked yet). Pull request 88 holds these handoff notes.
- Next: ask how install help looked on Dan's phone, then which comes next: sign-up step S4 (his invite page), a start-screen line saying a pastor wrote the AI's guidelines, or store plan step 3 (the manifest tidy-up).


## Waiting on Dan

1. Living in the Word: merge pull request 88 (these notes); try "Install the app" at the bottom of the start screen in Chrome (pull request 87); check pull request 77 (typed names) on his phone. The steps are in `living-in-the-word/PROGRESS.md`.
2. The Anthropic API key expires November 24, 2026: a new key, saved in Cloudflare as `ANTHROPIC_API_KEY`. Remind him in good time, with every step (in `living-in-the-word/PROGRESS.md`).
3. Smaller checks, if not done: a spend limit in the Claude Console ($10 suggested); a passcode of four or more random words; two-step sign-in on Cloudflare; Share inside KakaoTalk; his review of the general questions' wording.
4. The other apps: Fewer spam calls needs the Samsung steps checked on a real Samsung phone; First step smaller waits for his daily trial. Details in each `PROGRESS.md`.


## Parked (raise only when it becomes relevant)

- Google sign-in (step S5) if the app ever goes to Apple's App Store: Google blocks its sign-in inside an app's built-in browser view (Google's 2021 developer blog, through search results), and Apple's rule 4.8 then asks for an equal private option like Sign in with Apple. Email codes avoid both. Raise it at S5.
- Sign-ups after S3: S4 to S6, then Apple sign-in, moving the app to `danielyoonwrites.com` (with a way to bring saved studies along), saved studies in the account, subscriptions, and the total daily cap at S6 (raise it to about 200, or remove it).
- The reading plan says "Psalms 23" where Bibles say "Psalm 23" (the picker already says "Psalm 23").
- An Android line in the home screen tip, Korean book names, and moving saved studies from Safari into an iPhone home screen app.
- Don't mention the domain's auto-renew until September 2027.


## Starting a new session

Open https://claude.ai/code, start a new session with this repository, set the effort (High for most work), and paste one of these:

- Continue Living in the Word:
  > /pickup living in the word

  (or, without the skill: Read HANDOFF.md, then living-in-the-word/PROGRESS.md, DECISIONS.md and CLAUDE.md. Then help me with what's waiting, one step at a time.)
- Feedback on First step smaller, after using it:
  > /pickup first step smaller

  (or: Read HANDOFF.md, then first-step-smaller/PROGRESS.md, DECISIONS.md and CLAUDE.md. Here's what I noticed while using it: [notes].)
- Continue the Quiet room:
  > /pickup quiet room

  (or: Read HANDOFF.md, then quiet-room/PROGRESS.md, DECISIONS.md and CLAUDE.md, and continue from the next step.)
- Finish the spam calls guide:
  > /pickup fewer spam calls

  (or: Read HANDOFF.md, then fewer-spam-calls/PROGRESS.md, DECISIONS.md and CLAUDE.md, and continue.)
- Something new:
  > Read HANDOFF.md first. Then help me plan [the new thing], plan only.
