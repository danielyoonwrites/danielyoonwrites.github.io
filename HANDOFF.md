# Handoff: where everything stands

Last updated November 2, 2026, at the end of the eleventh session (with pull request 115), Living in the Word's lines on November 4, 2026, with pull request 136 (on the Projects page), and the video editor's lines and "Waiting on Dan" on November 3, 2026, with pull request 135 (its session's handoff). This is a short index: where each project stands, what's waiting on Dan, and how to start the next session. Keep it under about 80 lines.

- How to work with Dan, and the rules for every project: `CLAUDE.md`.
- Each project: its folder's `PROGRESS.md` (where it stands, the next step), `DECISIONS.md` (choices and their reasons) and `SPEC.md`. The website's decisions are in the root `DECISIONS.md`.
- Blocked sites, testing tips and Notion prompts: `CLOUD-NOTES.md`.
- The full history (every pull request, and the older detailed notes for each project): `CHANGELOG.md`. Read it only when needed.

This repository is public. Keep personal details out of this file.


## The projects

- **The website** (done, live): https://danielyoonwrites.github.io. Its rules are in `.claude/rules/website.md` and `.claude/rules/moon-jar.md`, its decisions in the root `DECISIONS.md`. Ideas not done: skip post openings that start with "Disclaimer"; list First step smaller on the Projects page (after its trial, iPhone test and trademark search); show the project lines on the Projects page whole (they stop after 3 lines, like post openings, so with a phone's zoom at 200% every one is cut off, checked November 2, 2026).
- **Quiet room** (paused after step 1): https://danielyoonwrites.github.io/quiet-room, `quiet-room/PROGRESS.md`.
- **Fewer spam calls** (built, one check left): https://danielyoonwrites.github.io/fewer-spam-calls, `fewer-spam-calls/PROGRESS.md`.
- **First step smaller** (built, the owner's trial next): https://danielyoonwrites.github.io/first-step-smaller, `first-step-smaller/PROGRESS.md`.
- **Living in the Word** (the AI helper live on Opus 5.5 since pull request 122, checked by Dan on November 3 and kept at its speed, with questions written ahead for the reading plan and the next chapter; signing in with an email code, the owner's invite page with an invite email, install help, the "check it" line; the server deploys by itself through Cloudflare; the audit done (pull requests 119 to 121, 126 to 128, 130 and 132 to 134; the waiting words stay until Dan has seen a few more waits, his "A"), on the website's Projects page in pull request 136, `living-in-the-word/AUDIT.md`; the plan for phones and app stores paused): https://danielyoonwrites.github.io/living-in-the-word, `living-in-the-word/PROGRESS.md`. The store plan is `living-in-the-word/STORE-PLAN.md`.
- **Idea board** (live with boards of notes and photos that line up on the dots, and on the Projects page from pull request 124; next the server and signing in, build step 6, then saving to an account, step 7): a little app like Apple's Freeform, built to work for everyone and used just by Dan for now, https://danielyoonwrites.github.io/idea-board, `idea-board/PROGRESS.md`.
- **Video editor** (live with one clip: the Korean looks, lighting, better sound, a line of text, trim and speed, the tabs in Dan's order, on the Projects page; the plan for AI captions only for Dan in pull request 140: his own Cloudflare server, one short line at a time; then shape and crop): a simple video editor just for Dan, on his Android phone, with the videos never leaving the phone and every video made to fit Instagram, TikTok and YouTube Shorts, https://danielyoonwrites.github.io/video-editor, `video-editor/PROGRESS.md`.
- **Photo Filters** (live; choosing a photo merged in pull request 117; build step 3, Warm natural next to the original, in pull request 118): Dan's own looks on his photos, in the browser of his phone and MacBook, with the photos never leaving the device, https://danielyoonwrites.github.io/photo-filters, `photo-filters/PROGRESS.md`.


## Where things stand (November 2, 2026)

- Latest: the twelfth session (November 3, 2026), Living in the Word's audit items 4 to 7 (pull requests 126 to 128 and 130), then items 8 to 10 in pull requests 132, 133 and 134. Before it, the eleventh session (November 2, 2026), Idea board pull requests 108, 109, 113 and 115: notes that line up on the dots, photos, the dots drawn exactly, and Dan's decision that Idea board is built to work for everyone, used just by him for now; then pull request 124 put it on the Projects page. At the same time other sessions built the video editor (pull requests 110 to 112, 116, 125 and 129), Photo Filters (114 and 117) and Living in the Word's audit and its fixes (119 onward). Each session's summary is in `CHANGELOG.md` ("Session summaries"). Where each project stands is in its `PROGRESS.md`.
- Next: `/pickup idea board` (build step 6, the server and signing in). Living in the Word's next step is in its `PROGRESS.md` (`/pickup living in the word`).


## Waiting on Dan

1. Idea board: the checks, now that pull request 124 (Idea board on the Projects page) merged on November 2, 2026: the Projects page on his phone, the dots on his computer, photos on his phone. Every step is in `idea-board/PROGRESS.md` (its item 1 still starts with that merge, already done).
2. Living in the Word: merge pull request 136, the app on the Projects page (https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/136, Conversation tab, Merge pull request, Confirm merge). Then the checks for pull requests 119, 120, 126, 127, 128, 130, 132, 133, 134 and 136 on his phone, with every step in `living-in-the-word/PROGRESS.md` ("Waiting on Dan"). His Max plan's API credit was already linked on October 26, 2026: nothing to do.
3. The Anthropic API key expires November 24, 2026: a new key, saved in Cloudflare as `ANTHROPIC_API_KEY`. No scheduled reminder (his "C", November 4, 2026: he'll remember it); if a session falls between November 10 and 24, mention it once, with every step (in `living-in-the-word/PROGRESS.md`).
4. The other apps: Fewer spam calls needs the Samsung steps checked on a real Samsung phone; First step smaller waits for his daily trial. Details in each `PROGRESS.md`.
5. Video editor: read and merge the plan for AI captions, pull request 140 (https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/140, Conversation tab, Merge pull request, Confirm merge); then his phone checks (text, better sound, trim and speed, the looks and test uploads). Every step is in `video-editor/PROGRESS.md`.
6. Photo Filters: merge pull request 118, build step 3 (https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/118, Conversation tab, Merge pull request, Confirm merge), then the checks on his phone and MacBook. Every step is in `photo-filters/PROGRESS.md`.


## Parked (raise only when it becomes relevant)

- Google sign-in (step S5) if the app ever goes to Apple's App Store: Google blocks its sign-in inside an app's built-in browser view (Google's 2021 developer blog, through search results), and Apple's rule 4.8 then asks for an equal private option like Sign in with Apple. Email codes avoid both. Raise it at S5.
- Sign-ups after S4 (built October 29, 2026): S5 and S6, then Apple sign-in, moving the app to `danielyoonwrites.com` (with a way to bring saved studies along), saved studies in the account, subscriptions, and the total daily cap at S6 (raise it to about 200, or remove it).
- The reading plan says "Psalms 23" where Bibles say "Psalm 23" (the picker already says "Psalm 23").
- An Android line in the home screen tip, Korean book names, and moving saved studies from Safari into an iPhone home screen app.
- Don't mention the domain's auto-renew until September 2027.


## Starting a new session

Open https://claude.ai/code, start a new session with this repository, set the effort (High for most work), and paste one of these:

- Continue Living in the Word:
  > /pickup living in the word

  (or, without the skill: Read HANDOFF.md, then living-in-the-word/PROGRESS.md, DECISIONS.md, AUDIT.md and CLAUDE.md. Then help me with what's waiting, one step at a time.)
- Feedback on First step smaller, after using it:
  > /pickup first step smaller

  (or: Read HANDOFF.md, then first-step-smaller/PROGRESS.md, DECISIONS.md and CLAUDE.md. Here's what I noticed while using it: [notes].)
- Continue the Quiet room:
  > /pickup quiet room

  (or: Read HANDOFF.md, then quiet-room/PROGRESS.md, DECISIONS.md and CLAUDE.md, and continue from the next step.)
- Finish the spam calls guide:
  > /pickup fewer spam calls

  (or: Read HANDOFF.md, then fewer-spam-calls/PROGRESS.md, DECISIONS.md and CLAUDE.md, and continue.)
- Continue Idea board:
  > /pickup idea board

  (or, without the skill: Read HANDOFF.md, then idea-board/PROGRESS.md, DECISIONS.md and CLAUDE.md, and continue from the next step.)
- Continue the video editor:
  > /pickup video editor

  (or, without the skill: Read HANDOFF.md, then video-editor/PROGRESS.md, DECISIONS.md and CLAUDE.md, and continue from the next step.)
- Continue Photo Filters:
  > /pickup photo filters
- Something new:
  > Read HANDOFF.md first. Then help me plan [the new thing], plan only.
