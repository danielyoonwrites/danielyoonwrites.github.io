# Living in the Word: decisions

Each decision with its reason, oldest first. Only add to this file; if a decision changes, add a new entry that says which one it replaces. Decisions before October 27, 2026 are still in `SPEC.md`, `AI-PLAN.md`, `SIGNUP-PLAN.md` and the root `HANDOFF.md` ("Project 5"); a later notes cleanup may copy them here.

### October 27, 2026: no app store for now (no pull request)
- Decision: stay with the free home-screen web app; start on sign-ups instead.
- Why: Dan asked what extra work the Google Play and Apple stores need. Both need sign-ups instead of the shared passcode, account deletion, a privacy policy and a report button; Apple also needs a Mac, 99 USD a year, and may reject a wrapped website (guideline 4.2). Dan: "I have a MacBook. Let's start working on the signups then and built in limits per account for now, since I am not charging yet."
- Turned down: listing in the stores now, because sign-ups come first either way.
- Revisit if: sign-ups are done and Dan wants the app public. The research is in his Notion page "Living in the Word app (Oct 2026)."

### October 28, 2026: each signed-in person has their own daily limit, starting with S3 (pull request 73)
- Decision: 20 sets of questions a day per signed-in person, wherever they are; 60 for everyone together; phones with the passcode still count by connection.
- Why: Dan: "built in limits per account for now, since I am not charging yet."
- Turned down: waiting for step S6, as the plan first said.
- Revisit if: the app goes public or paid (the 60 total was planned to rise to about 200 at S6).

### October 28, 2026: sign-in details (pull request 73)
- Decision: an email code (6 digits, 10 minutes, 5 tries), a phone stays signed in 90 days, "Sign in" shows on the start screen for everyone not signed in, the app never says whether an address is invited, and signing in replaces the passcode on that phone.
- Why: the code rules and 90 days come from the plan Dan approved (`SIGNUP-PLAN.md`). The other three were Claude's choices, listed in pull request 73 for Dan to change; he merged without changes. Not saying who's invited keeps anyone from finding out who's in his group.
- Turned down: a "not invited" message, because it would reveal who's invited.
- Revisit if: people get confused by the "If ... is invited" wording.

### October 28, 2026: Opus 5.5 writes the questions (pull request 74)
- Decision: `MODEL` in `server/worker.js` is `claude-opus-5-5` (it was Sonnet 5.5 since October 26).
- Why: Dan: "I am not happy with the depth of these questions right now." After trying Romans 14: "ok I think this is better."
- Turned down: Sonnet 5.5, for the depth. It costs about half as much (about 1.5 cents a set instead of 3).
- Revisit if: costs matter when the app goes public. Dan said he "can't afford that much," so once it goes live for everyone he'll think about pricing to cover the costs. Other levers before switching back: the effort setting (now "medium") or a line in the guidance on what "deeper" means.

### October 28, 2026: the commentary for the leader starts open (pull request 75)
- Decision: the "For the leader" fold-out is open each time; a tap closes it. Replaces the October 26 choice of "closed until tapped."
- Why: Dan: "the 'for the leader' sections are better written now so maybe we can keep that text box open instead of closed."

### October 28, 2026: the magazine look, with readability fixes (pull request 76)
- Decision: the "Magazine" mockup: a dateline and centered title on the start screen, the choices like a table of contents, centered headings with a short rule, questions numbered i., ii., iii., notes in a shaded box. Also a darker grey (#57524A) and no text under 13 pixels except verse numbers (12).
- Why: Dan wanted it to "feel and look more like kinfolk," "this clean and pretty look," and asked whether the contrast was good enough. The colors passed; the small text (about 11 pixels) was the weak spot (Apple's guidelines: 11 points minimum, larger for thin fonts).
- Turned down: "Quiet column" (today's layout with more space), Claude's recommendation for the questions screen; and copying Kinfolk's tiny grey print, because it hurts readability.
- Revisit if: Dan gives his own words for the start-screen title.

### October 28, 2026: typed names written out in full; the reading's note open (pull request 77)
- Decision: "Phil 2" becomes "Philippians 2" (and similar) before anything is sent; "A note on this reading" starts open.
- Why: Dan: "I typed in Phil 2 instead of Philippians 2... it writes it as Phil 2 instead of autocorrect to Philippians," and "the 'for the leader' tab is open for the Bible study but the 'note on this reading' is closed for daily Bible reading."
- Turned down: nothing recorded.

### October 28, 2026: Android's back gesture goes back one screen (pull request 80)
- Decision: the app adds one history entry for each screen in its Back list (`visited` in `app.js`, renamed from `history`) after a tap, and takes entries away when the list gets shorter. The back gesture then goes back one screen, like the Back button, and closes the app only from the start screen.
- Why: Dan chose it first ("A") after the store plan's double-check found that the back gesture closed the installed app from any screen.
- Turned down: adding one entry again right after each back gesture (simpler, but Chrome then marks it skippable, so the next gesture closes the app: seen in Chromium's code and in a test); the CloseWatcher API (Chrome only, not Safari or Firefox).
- Revisit if: the gesture skips a screen or closes the app early on Dan's phone.
