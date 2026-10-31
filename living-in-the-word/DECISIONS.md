# Living in the Word: decisions

The "In force" list right below is every decision that still holds, one line each; it's rewritten at each handoff. The log under it has each decision with its reason, oldest first, and is only added to: if a decision changes, add a new entry that says which one it replaces, and one "Status" line on the old entry. The decisions from before October 27, 2026 were copied in on October 28, 2026 from the root `HANDOFF.md` ("Project 5"), `SPEC.md`, `AI-PLAN.md` and `SIGNUP-PLAN.md`; those files keep their own text too. When the notes give no reason, an entry says "not recorded."

## In force (rewritten October 29, 2026, at the end of the seventh session)

**Who it's for, and how the work goes**
- October 25, 2026: stages: Dan's small group first, then anyone online later (stage 3). Dan reviews every question, and nothing is shared on its own.
- October 25, 2026: the name "Living in the Word"; a trademark search before any public launch or store listing.
- October 25, 2026: Claude's effort: High for most steps; Extra high was for building the AI helper.
- October 29, 2026: the checks live in `living-in-the-word/tests/`; run them after any change to `app.js` or `server/worker.js`.

**The questions and the AI**
- October 25, 2026: the AI gets only the passage name and whether it's for a group study or the reading plan: no Bible text, nothing personal.
- October 25, 2026: Dan's own theological guidance goes with every request (in `server/worker.js`, `GUIDANCE`).
- October 26, 2026: no study methods; the AI writes right away, in a set order: what it says, God, the heart, a response, prayer.
- October 26, 2026: 3 to 5 questions, always the first and the last; short, one thing each, no quotes, correct grammar.
- October 26, 2026: passages of suffering get pastoral care; general words like "sexual violence," never graphic terms; only what the passage itself shows about God.
- October 31, 2026: don't draw attention to something the text itself doesn't (a genealogy's names don't bring in the sins in those people's stories); the leader's heads-up is only for hard things the passage itself tells of.
- October 26, 2026: no questions about God's silence, where God was, or why he didn't stop it (Dan: such questions "can hurt people's faith").
- October 28, 2026: the commentary for the leader (about 100 words, written with the questions) and the reading's note start open.
- October 29, 2026: Sonnet 5.5 at `high` effort, with "Think the problem through before you answer."; uneven sets get guidance fixes, not a model switch.
- October 29, 2026: question 2 asks why what the passage shows about God matters there.
- October 29, 2026: the "check it" line wherever the AI's words show; a "pastor wrote the guidelines" line may go on the start screen, never inside that warning.
- October 26, 2026: the ESV text is on hold: only a "Read it on esv.org" button. Don't ask Dan to set up the key.

**The look and the screens**
- October 26, 2026: the "Paper and ink" look; October 28, 2026: the magazine layout, and no text under 13 pixels except verse numbers.
- October 26, 2026: Dan's own words on the start screen, exactly (`SPEC.md`, "Words on the start screen").
- October 26, 2026: "Go deeper with AI," a loading screen with placeholder lines, and a clean screen when a passage isn't recognized.
- October 26, 2026: saved studies stay on the phone; the Save button says what it saves; "Remove" sits under the Save bar.
- October 31, 2026: the reading plan writes the next reading's questions ahead, quietly, one reading ahead only.
- October 26, 2026: the home screen icon is the full name in EB Garamond, and the name under it is "In the Word."
- October 26, 2026: verse numbers follow the NASB, ESV and NIV; "Choose from the Bible" sits above the typing box.
- October 28, 2026: typed short names are written out in full ("Phil 2" becomes "Philippians 2").
- October 25, 2026: a daily reading plan with no streaks or guilt, with AI questions for each reading, saved with the plan.
- October 25, 2026: Share and Copy first; "Lead the study" (one question at a time) and a printable page are still to build.

**Safety, limits and sign-ups**
- October 26, 2026: only real Bible passages reach the AI (the server checks first); no automatic retry on another model.
- October 28, 2026: daily limits: 20 sets a day for each signed-in person (or each connection using the passcode), 60 for everyone, and 10 wrong passcodes or codes a day for each connection. The counts start over at midnight Pacific time.
- October 26, 2026: invite only; sign in with an email code (built) or Google (step S5, later); Apple only if wanted. The passcode goes away at step S6.
- October 28, 2026: sign-in codes have 6 digits and last 10 minutes or 5 tries; a phone stays signed in 90 days; the app never says whether an address is invited.
- October 26, 2026: emails go through Resend, from `sign-in@mail.danielyoonwrites.com`. Dan's web address `danielyoonwrites.com` has auto-renew off and expires October 26, 2027: remind him once, in September 2027 (sign-in and invite emails depend on it).
- October 29, 2026: the owner's page ("Invite people"), only for Dan: two screens; "Turn off" signs someone out everywhere; rows stay in place.
- October 29, 2026: "Daily AI limits" explained on the owner's page; no "testing only" note (only Dan sees it).
- October 29, 2026: each tap of "Invite" emails the person in Dan's words, with replies going to his address; at most 3 a day to one address.

**Phones, stores and the server**
- October 27 and 28, 2026: no app store for now; the free steps of `STORE-PLAN.md` first, in its order.
- October 28, 2026: Android's back gesture goes back one screen, like Back.
- October 29, 2026: install help: "Install the app" in Chrome, or the steps for iPhone and Android; no KakaoTalk step.
- October 29, 2026: Cloudflare deploys the server on every merge (Workers Builds, settings in `server/wrangler.jsonc`, build watch paths `*`): the one exception to "no npm." Preview builds stay off.

## Log (oldest first)

### October 25, 2026: first for Dan's small group, then anyone online (pull request 36)
- Decision: stage 1, Dan uses the app to prepare his small group's studies, with no AI; stage 2 adds AI questions written for the passage; stage 3 opens it to anyone online, like other small group leaders. Dan reviews every question before anyone sees it, and nothing is shared on its own. Stage 1 sends nothing anywhere and keeps studies only on the phone (no accounts, analytics or tracking), and shows no Bible text until translation rules are checked.
- Why: not recorded for the stages. Dan reviews everything because AI can misquote Scripture or add interpretations.
- Turned down: accounts and collecting group members' answers, for stage 1.

### October 25, 2026: share first, then lead the study (pull request 36)
- Decision: "Share" (Dan's first pick) sends the passage and questions as plain text through the phone's share menu, for example to a KakaoTalk group chat, with "Copy" in case sharing doesn't work. "Lead the study" (his other pick) shows one question at a time in big text. A page that prints cleanly comes later (Dan's "maybe also").
- Why: not recorded.

### October 25, 2026: the name "Living in the Word" (pull request 36)
- Decision: the app is called "Living in the Word" (Dan's choice).
- Why: not recorded.
- Revisit if: the app opens to anyone (stage 3): search again and do a trademark search first. A web search found no app with this name, but there's a sermon podcast called "Living in the Word" and a ministry called "Life in the Word."

### October 25, 2026: Extra high effort for the AI helper (pull request 36)
- Decision: Claude's effort is Extra high for stage 2, the AI helper (Dan asked), and High for most other steps.
- Why: not recorded.
- Turned down: Max, because Claude Code's docs say it "may show diminishing returns and is prone to overthinking."

### October 25, 2026: a daily reading plan, with no streaks or guilt (pull request 37)
- Decision: a reading plan (Dan's idea): set it once, like "Matthew, one chapter a day," and each day the app shows today's reading with questions to meditate on and "Done for today." A missed day just waits. In the build plan it comes right after saving (Dan's choice).
- Why: not recorded for the plan itself. No streaks and no guilt follow the same kindness rule as First step smaller.
- Turned down: reminders or notifications for the reading plan, for stage 1.

### October 25, 2026: the AI helper comes next (pull request 39)
- Decision: the AI helper (stage 2) moves up to come right after build step 2. Its questions follow the chosen study method and replace the general ones as drafts.
- Why: after trying step 2, Dan pointed out that questions that are the same for every passage could just be printed once. Questions written for the passage are what make the app worth using.

### October 25, 2026: Claude's API on a small free server, with a passcode (pull request 39)
- Decision: the questions come from the Claude API, with the key kept on a free Cloudflare Worker (one file, `server/worker.js`, with no secrets in it). A passcode, typed once on each phone, lets the app use it; other leaders can get their own later.
- Why: the website is public, so anyone can read its code, and a key in the app could be copied and used on Dan's bill. Without the passcode, the server refuses before the AI is asked, so it costs nothing.

### October 25, 2026: the model is chosen after a side-by-side test (pull request 39)
- Decision: Opus 5.5, Sonnet 5.5 and Haiku 5.5 are tried on the same passage, with the cost of each answer shown, before one is chosen.
- Why: Dan wanted to see quality and cost together and compare them himself.

### October 25, 2026: the AI gets only the passage name (pull request 39)
- Decision: the app sends only the passage name and whether it's for a group study or the reading plan: no Bible text and nothing personal. The AI points to verse numbers instead of quoting verses.
- Why: stage 1 shows no Bible text, and translations have usage rules.
- Revisit if: Dan wants the AI to work from the real words instead of memory (fewer mistakes, about half a cent more per request, Claude's estimate). The Berean Standard Bible, which is public domain, may be sent to an AI.

### October 25, 2026: Dan's own theological guidance for the AI (pull request 41)
- Decision: a page of guidance goes with every AI request (Dan's idea). Claude drafted one, and Dan wrote his own: Reformed and evangelical, the Bible inspired and inerrant, careful grammatical-historical reading, grace before effort, for a group where some grew up with faith as duty or shame. After Claude's review he added a short "note for the leader" in each answer (never shared with the group) and the line "Follow their tone and care, not their positions on the debated topics below."
- Why: not recorded for the guidance. The tone line is there because Piper and Carson, named in it, are known for one side of a debated topic the guidance stays neutral on.

### October 25, 2026: the reading plan built early (pull request 43)
- Decision: at Dan's request, the reading plan was built right away, ahead of saving studies: a book, 1 to 3 chapters a day and a start date. Replaces its place right after saving (pull request 37).
- Why: not recorded.

### October 25, 2026: AI questions for each day's reading (pull request 44)
- Decision: opening a day's reading asks the AI for 3 or 4 questions written for one person's quiet time (Dan's choice), saved with the plan.
- Why: Dan likes it (no other reason recorded). The reading shows only the passage name, with no Bible text, so there's no copyright concern, and saving the questions means the same reading never costs twice.

### October 25, 2026: Dan's names for the study methods (pull request 46)
- Decision: the three study methods the app offered get Dan's names: Discover, Look, think, live, and Light, question, arrow, with the usual names (Discovery Bible Study; Observe, Interpret, Apply; the Swedish method) in small print.
- Why: not recorded.

### October 25, 2026: a question style for each reading plan (pull request 47)
- Decision: a reading plan's style is chosen at setup (Quiet time, Discover, Look, think, live, or Light, question, arrow), with "Change" on each day's screen; the AI writes that style's questions for one person.
- Why: not recorded.

### October 26, 2026: short questions, no quotes, correct grammar (pull request 49)
- Decision: Dan added three lines to the guidance: short questions that ask one thing; no quotes, "not even short phrases"; and correct grammar.
- Why: in the first real test (John 1, with Opus 5.5), the questions followed the guidance and every verse reference checked out, but they were long, quoted "come and see," and had one grammar slip.

### October 26, 2026: no study methods; the AI writes the questions right away (pull request 50)
- Decision: no study methods or reading plan styles (Dan's choice). As soon as a passage is typed, the AI writes exactly 4 questions in a set order: what the passage says, God, the heart, a response; the reading plan gets 4 too. Replaces the October 25 choices: the AI following the chosen method (pull request 39), the method names (pull request 46) and the reading plan styles (pull request 47).
- Why: Dan: "they will all be written by AI anyway." When the AI writes for each passage, the questions won't fit a method's mold.
- Revisit if: Dan asks for a method again (the sources checked for the methods are kept in `SPEC.md`).

### October 26, 2026: Sonnet 5.5 writes the questions (pull request 50)
- Decision: Sonnet 5.5 becomes the only model, and the test link (`?test`) shows only the cost of each answer.
- Why: not recorded. Dan picked it after trying John 1 with all three models.
- Turned down: Opus 5.5 and Haiku 5.5.

### October 26, 2026: 5 questions, the fifth about praying together (pull request 51)
- Decision: 5 questions instead of 4, the 5th about praying together (Dan's choice); the reading plan gets 5 too (one way to live it out today, then prayer). Replaces the 4 questions of pull request 50. The button says "Write questions with AI," with a line under it saying it writes 5 new study questions.
- Why: not recorded for the fifth question. The line under the button is there because Dan asked for it to be clear what the button does.

### October 26, 2026: the "Paper and ink" look (pull request 52)
- Decision: the app gets its own look, "Paper and ink" (Dan picked it from two mockups): warm paper, black ink, EB Garamond for reading and Jost for small labels and buttons. Replaces the website's Moon jar design, which the app used before.
- Why: Dan asked for a big visual update: the app doesn't have to look like his website; it should look like a real app, clean like Kinfolk magazine, so people like to look at it and use it.
- Turned down: the other mockup, which kept his celadon green.

### October 26, 2026: a loading screen, and "Go deeper with AI" (pull request 53)
- Decision: while the AI writes, the screen says so and shows five numbered placeholder lines that gently fade in and out (Dan asked). The button says "Go deeper with AI" (Dan's words), replacing "Write questions with AI" (pull request 51).
- Why: the screen looked blank whenever the phone already had the passcode. No reason recorded for the new button words.

### October 26, 2026: the passage shown in the ESV (pull request 54)
- Decision: the passage shows in the ESV (Dan's choice), in a fold-out above the questions and on today's reading, from Crossway's free ESV API through the Worker, under Crossway's rules. The AI is never sent the ESV text. Replaces the choice of no Bible text for now (pull request 36).
- Why: Dan wanted the passage shown in the app if it was free and not hard.

### October 26, 2026: the ESV on hold (pull request 55)
- Decision: no ESV key is set, so the app shows only a "Read it on esv.org" link; the code stays. Replaces the ESV choice of pull request 54, for now.
- Why: Dan may let people subscribe to the app someday, and Crossway's free terms are only for non-commercial apps (Crossway licenses only organizations, not individuals).
- Revisit if: Dan brings it up (don't ask him to set up the key otherwise). If a paid app is still possible, look at the Berean Standard Bible first.

### October 26, 2026: Dan's words on the start screen (pull request 56)
- Decision: the start screen uses Dan's own words, exactly: "Prepare for a Bible study" and "Bible reading plan companion," each with his one-line description (`SPEC.md`, "Words on the start screen"). Sentence case was his choice when asked (he typed them with capitals first).
- Why: not recorded.

### October 26, 2026: a bigger esv.org link (pull request 56)
- Decision: the esv.org link became a big row, "Read John 15 on esv.org," instead of small grey text (Dan asked); in pull request 58 it became a boxed button.
- Why: not recorded.

### October 26, 2026: Dan's next wishes, in his order (no pull request)
- Decision: Dan's next big wishes, in his order: (1) saving studies (built in pull request 57), (2) working without reception (pull request 59), (3) a passage picker (pull request 66).
- Why: he wanted the app to remember studies and work where there's no reception, like an app on a phone, and a way to pick the passage instead of always typing it.

### October 26, 2026: the Save button says what it saves (pull request 58)
- Decision: "Save these questions for John 1," then "Saved on this phone," or "Save your changes" after any change (Dan asked), across the bar's full width, with Share and Copy under it.
- Why: not recorded.

### October 26, 2026: the home screen icon and its name (pull request 59)
- Decision: the icon is the full name, "Living in the Word," in EB Garamond on the paper color (Dan's pick of four), and the name under it is "In the Word" (Dan's pick).
- Why: not recorded.

### October 26, 2026: a plainer leader box, and "Remove" moved up (pull request 60)
- Decision: the "For the leader" box no longer says "Not shared with the group," and "Remove from saved studies" sits right under the Save bar instead of at the bottom of the page (Dan asked, from his Android phone).
- Why: the line wasn't needed. No reason recorded for the move.

### October 26, 2026: security and limits first, then sign-ups (no pull request)
- Decision: Dan chose "security and limits first," then a sign-up plan, then sign-ups; subscriptions last.
- Why: he asked for sign-ups so people don't need the shared passcode, a limit for each person so nobody can spam the AI and waste credits, maybe subscriptions someday, and checks so nobody can misuse the AI or break the app. The reason for the order isn't recorded.

### October 26, 2026: only real Bible passages reach the AI (pull request 61)
- Decision: the server checks every passage (a book of the Bible, then chapter and verse numbers) before anything costs money (Dan's request). Anything else gets "The AI didn't recognize that passage," and the AI is never asked.
- Why: Dan asked for checks so nobody can misuse the AI.

### October 26, 2026: no automatic retry on another model (pull request 61)
- Decision: the server no longer asks Anthropic to retry a declined request on another model; a decline shows the general questions.
- Why: a fix found by an independent security review (a separate Claude agent). For Sonnet 5.5 the retry only covered declines about cybersecurity or building other AI models, so it never helped Bible questions and could only help someone misusing the app.

### October 26, 2026: daily limits, with Dan's numbers (pull request 62)
- Decision: 20 sets of questions a day for each internet connection, 60 for everyone together, and a lockout after 10 wrong passcodes in a day from one connection. The counts start over at midnight Pacific time and keep only a scrambled code for each connection, never the internet address, for today and yesterday.
- Why: so nobody can spam the AI and waste credits. The lockout was the security review's top finding: with no limit, a short passcode could be guessed by a program trying thousands a day.
- Revisit if: sign-up step S6: raise the 60 for everyone to about 200, or remove it.

### October 26, 2026: sign-ups, invite only at first (pull request 64)
- Decision: only people Dan invites (his small group and people he chooses) can use the AI helper. At step S6, each person gets their own daily limit (20, the same number as now), everyone together keeps 60, and the shared passcode goes away: sign-ups replace the passcode of pull request 39.
- Why: Dan asked for sign-ups so people don't need the shared passcode. No reason recorded for invite only.
- Revisit if: Dan wants it open to anyone, maybe with subscriptions.

### October 26, 2026: sign in with an email code or Google; Apple later (pull request 64)
- Decision: sign in with a code sent by email and typed into the app, or with "Continue with Google"; Sign in with Apple only later, if wanted. A code lasts 10 minutes and 5 wrong tries, and a phone stays signed in about 90 days.
- Why: Dan chose them after asking for more research when he saw the costs; they're the usual ways people expect to sign in. Typed codes work inside the home screen app, even on an iPhone. Apple needs its developer membership, 99 USD a year.
- Turned down: Firebase Authentication (its email links open in the browser, so on an iPhone people could end up signed in in Safari instead), and Supabase, Clerk and Auth0 (each adds an outside service with its own screens).
- Revisit if: the app goes to Apple's App Store: there, Google sign-in also needs an equal private option, like Sign in with Apple (rule 4.8). Raise it at step S5.

### October 26, 2026: Dan's own web address, danielyoonwrites.com (pull request 64)
- Decision: Dan's own web address, about $11 a year. He named it `danielyoonwrites.com` (step S1) and bought it at Cloudflare the same day ($10.46 a year).
- Why: sign-in emails come from it and the AI helper's server can live at it; it's also needed for Google's sign-in screen and later for subscriptions.

### October 26, 2026: sign-in emails through Resend (pull request 64)
- Decision: the sign-in codes go out through Resend, free up to 3,000 emails a month and 100 a day, from an address on Dan's web address.
- Why: Resend's free plan is far more than a small group needs.
- Turned down: Cloudflare's own email sending, which is in public beta and needs the paid Workers plan.

### October 26, 2026: a cleaner screen when a passage isn't recognized (pull request 65)
- Decision: the screen shows only the passage name, the message and a "Change the passage" button, with nothing else underneath (Dan asked after seeing "Write me a poem" turned away live).
- Why: not recorded.

### October 26, 2026: auto-renew stays off for danielyoonwrites.com (no pull request)
- Decision: the web address's auto-renew stays off, by Dan's choice. It expires October 26, 2027.
- Why: Dan: "stop asking until like Sept next year."
- Revisit if: it's September 2027: remind him once. Don't bring it up before then.

### October 26, 2026: verse numbers follow the NASB, ESV and NIV (pull request 66)
- Decision: the passage picker's verse numbers follow the NASB, ESV and NIV (Dan asked while it was being built): 3 John has 15 verses, and the 16 verses the ESV and NIV keep only in footnotes (like Matthew 17:21) show lighter, with a note.
- Why: Dan likes those three more than the KJV.
- Turned down: the KJV's numbering (it keeps 3 John's last greeting in verse 14).

### October 26, 2026: "Choose from the Bible" above the typing box (pull request 67)
- Decision: "Choose from the Bible" moved above the typing box, as a box with an arrow, with "Or type it" between them (Dan asked after trying it in KakaoTalk's browser). Replaces its first place under the box (pull request 66).
- Why: under the box, it looked like a choice between "Choose from the Bible" and "Go deeper with AI."

### October 26, 2026: pastoral care for passages of suffering, violence or evil (pull request 68)
- Decision: a new section in the AI's guidance (Dan's request): name what happened soberly, without graphic detail, and stay with it; make room for lament (added to the reading plan's prayer question too); notice how the author presents it; care for the people in the room; honest hard questions; a response that fits; and a heads-up for the leader. For every passage, a question never offers a list of options. The line that God's judgments aren't a pattern for us was Claude's, for Dan to review.
- Why: a Matthew 2 question named the children killed in Bethlehem, then turned in the same breath to praying "for those who don't yet know Jesus." Dan asked that passages like Exodus 1, Matthew 2, Esther 9 and Judges 19 never be taken lightly or glossed over, but handled gracefully and tactfully.
- Status: since October 31, 2026, the heads-up for the leader is only for hard things the passage itself tells of (October 31, 2026: "don't draw attention to something the text itself doesn't," pull request 95).

### October 26, 2026: 3 to 5 questions (pull request 69)
- Decision: the AI writes 3 to 5 questions instead of exactly 5 (Dan's rule), leaving out any that would repeat another or don't fit the passage. The first (what it says) and the last (prayer) are always written: Claude's choice, which Dan merged without changes. On the start screen, "five questions" became "three to five questions." Replaces the 5 questions of pull request 51.
- Why: on Judges 19, questions 1 and 2 repeated each other, and a question was forced that didn't fit. The rule is so the AI doesn't repeat itself or make up questions that don't fit.

### October 26, 2026: general words for hard things, and only what the passage shows about God (pull request 69)
- Decision: the questions and the note for the leader use general words like "sexual violence," never graphic terms, and show only what the passage itself shows about God (Dan's feedback).
- Why: in Dan's Judges 19 test, the note for the leader used a graphic term, and a question claimed the passage shows "God's care for the weak" (copied from the guidance's own example list) when God is silent there.

### October 26, 2026: no questions about God's silence (pull request 70)
- Decision: in passages of tragedy or trauma, no questions about God's silence, where God was, or why he didn't stop it (Dan's rule). Show only what the passage shows of God, like his protection of the child Jesus in Matthew 2; where it shows little of God (Judges 19), leave the question about God out. Replaces the wording from pull requests 68 and 69 that invited honest questions "like where God was."
- Why: Dan: such questions "can hurt people's faith." The live Judges 19 test asked about God's silence, which Claude's own wording had invited.

### October 26, 2026: a short commentary for the leader, folded (pull request 71)
- Decision: Dan chose "Short commentary, folded": one paragraph of about 100 words (the main point, the background, anything to be ready for), written in the same answer as the questions, in a fold-out, "For the leader," closed until tapped. The reading plan's "A note on this reading" is a fold-out too. Replaces the short note for the leader (pull request 41).
- Why: Dan first thought of dropping the note, then asked about a paragraph if costs stay low. Written in the same request as the questions to keep costs down, it adds only about 0.2 to 0.5 cent a set (Claude's estimate).
- Turned down: removing the note, keeping it as it was, and a separate commentary button (about 1 cent each time).

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

### October 28, 2026: the plan for phones and app stores, free steps first (pull request 79)
- Decision: `STORE-PLAN.md` sets the order. First the free steps that help on every path (the back gesture, install help, a tidier app description with screenshots, the "check it" line, a privacy page, a backup for saved studies, "Delete my account," "Report this question," a review account). Then maybe Google Play's internal testing, and Apple's App Store only if iPhone members ask for it. Dan merged it after asking for a double-check.
- Why: Dan asked to "prepare this app even more for eventually phone download and then eventually for app stores," then: "I really want to make sure app development for Android and Apple go right so double check and research again." The research found the home-screen web app is already a complete way to have the app, and that store apps now fall under state age laws that need native code (Texas now; California and Alabama from January 1, 2027).
- Turned down (in the plan): TestFlight as the lasting way to share the app (its builds expire after 90 days); Capacitor (it needs npm, against this repository's rules, and moves saved studies to a new address); an email link as the "Report" button (Google wants reporting without leaving the app).
- Revisit if: Dan decides to go to the stores. Then the owner's decisions in `STORE-PLAN.md` ("Decisions only the owner makes") come first, one at a time.

### October 28, 2026: Android's back gesture goes back one screen (pull request 80)
- Decision: the app adds one history entry for each screen in its Back list (`visited` in `app.js`, renamed from `history`) after a tap, and takes entries away when the list gets shorter. The back gesture then goes back one screen, like the Back button, and closes the app only from the start screen.
- Why: Dan chose it first ("A") after the store plan's double-check found that the back gesture closed the installed app from any screen.
- Turned down: adding one entry again right after each back gesture (simpler, but Chrome then marks it skippable, so the next gesture closes the app: seen in Chromium's code and in a test); the CloseWatcher API (Chrome only, not Safari or Firefox).
- Revisit if: the gesture skips a screen or closes the app early on Dan's phone.

### October 28, 2026: Sonnet 5.5 again, at high effort with one line from Anthropic's guide (pull request 84)
- Decision: `MODEL` in `server/worker.js` is `claude-sonnet-5-5` again, with `EFFORT` `high` (both models ran at `medium` before) and "Think the problem through before you answer." at the very end of the guidance (`THINK_FIRST`). `MAX_TOKENS` is 8,000 (it was 4,000), so the most one answer can cost stays about 8 cents.
- Why: Dan: "Opus answers are good but it is expensive and takes a while to load. Is it possible to update the guidelines and possibly use sonnet to get similar results?" Claude's research on Anthropic's pages (October 28, 2026): Sonnet 5.5 costs half as much per token; with JSON answers it "often answers without thinking first, particularly at `low` and `medium` effort"; the suggested fix is `high` effort plus that line. Dan chose "B" from Claude's options: "Skip the test. Switch to Sonnet with the two fixes now, and switch back if you don't like it."
- Turned down: a blind side-by-side test first (Claude's recommendation, about 5 cents a passage); staying with Opus 5.5; Opus 5.5 at `low` effort (effort doesn't change the cost of reading the guidance, 1.85 of the 2.96 cents for Romans 14).
- Revisit if: the questions feel shallower than Opus's, the cost line isn't clearly under about 3 cents, it isn't faster, or a hard passage gets declined (Sonnet's `general_harms` safety check). Going back to Opus is four lines in `server/worker.js`: `MODEL`, `EFFORT`, `THINK_FIRST` and `MAX_TOKENS` (back to 4,000, to keep the 8-cent cap).

### October 29, 2026: Sonnet 5.5 stays, and uneven sets get a guidance fix (no pull request)
- Decision: keep Sonnet 5.5 at `high` effort, and even out the sets through the guidance, starting with question 2 (next entry).
- Why: Dan, after pasting pull request 84: "hmmm the questions are a bit inconsistent, some better than others, but it seems useable." Then he chose "A": send a weaker and a stronger set so Claude could suggest a guidance line. Its real cost on Romans 14: about 2.32 and 2.21 cents a set (Opus: 2.96).
- Turned down: keeping it as it is ("B"); `xhigh` effort ("C": more tokens, so it costs more and is slower); going back to Opus ("D").

### October 29, 2026: question 2 asks why what the passage shows about God matters there (pull request 85)
- Decision: question 2 in `PATTERNS` (`server/worker.js`) gets one more sentence. Group study: "Guide the group a bit: not just who God is, but why that matters in this specific passage." Reading plan: "Guide the reader a bit: not just who God is, but why that matters in this specific reading."
- Why: Dan, about two Sonnet sets for Romans 14: "These are all ok, but I think question 2 is a little weak, not much guidance in what they should be thinking about Christ in light of the context. So I think a better way is to try to guide them a bit, not just looking at who Jesus is, but why that matters in this specific context." He chose "A": both the group study and the reading plan.
- Turned down: the group study only ("B"); a line for every question (one prayer question could fit any passage, "How can we pray for our church to welcome one another across our differences?", but the other set's was tied to verse 17; left for later).
- Revisit if: question 2 starts repeating question 3 (the heart question), or prayer questions keep fitting any passage.

### October 29, 2026: the "check it" line (pull request 86)
- Decision: wherever the AI's words show, a small line in italics: "Written by AI, which can make mistakes. Check what it says against your Bible, and change anything before you use it." (group study, replacing "Written for this passage. Read each one, and change anything before you use it."). The reading plan's shorter version, "Written by AI, which can make mistakes. Check what it says against your Bible.", sits just above "A note on this reading." Only when the AI wrote the questions; `CHECK_IT` in `app.js`.
- Why: store plan step 4. Anthropic's Commercial Terms, section D.3: the customer "must notify its Users, that factual assertions in Outputs should not be relied upon without independently checking their accuracy". Anthropic's Usage Policy (effective November 12, 2026) asks consumer-facing chatbots and AI agents to tell people they're dealing with AI. Dan chose "A" (short and plain), then: "I just want to make sure we are doing everything right according to what is needed, and that it won't confuse anyone. If it might, then let's take out the pastor line."
- Turned down: "Guidelines by a pastor, words by AI." (Dan's idea, so people know it isn't only AI; left out because it could sound like a pastor checked each set, which works against checking); the store plan's example, "Written by AI. Check them against Scripture before you use them." (it doesn't say the AI can make mistakes, and "them" could sound like only the questions).
- Revisit if: Dan wants people to know a pastor wrote the guidelines; that could go on the start screen, apart from the warning.

### October 29, 2026: install help, for Android and iPhone (pull request 87)
- Decision: one quiet button at the bottom of the start screen. In Chrome it says "Install the app" and opens Chrome's own install window; elsewhere it says "Add the app to your home screen" and opens a short screen with the steps for iPhone or Android (both on a computer). Neither shows once the app is opened from the home screen. The Saved studies tip points to the start screen.
- Why: store plan step 2; Dan chose it ("a") after the "check it" line. A button plus its own screen keeps the start screen short, one thing per screen (his design rules), and reaches iPhone people too, who never get Chrome's install window.
- Turned down: a KakaoTalk step (in the store plan). Dan: "im confused, why is this downloading into kakaotalk? I never mentioned wanting that. Android and iPhone is fine." The steps' first line, opening the page in Chrome or Safari, covers a link opened inside KakaoTalk. Also turned down: putting the steps only in the Saved studies tip (the plan's first idea), where few would see them.
- Revisit if: the menu names on the steps screen don't match Dan's phone (they come from search results), or iPhone people in the group get stuck.

### October 29, 2026: the owner's page, sign-up step S4 (pull request 89)
- Decision: "Invite people" at the bottom of the start screen, only for the owner. Two screens: the list (each person's use today, "Turn off" or "Turn on," "Invite someone," "Send the app's link") and the invite form (their email address, and a name only he sees). Invited people can sign in right away, and no email goes to them. "Turn off" asks first, signs them out on every phone and stops any code they asked for; their row stays in its place, in grey.
- Why: Dan chose "a" (S4) from three next steps, then "A" after seeing the screenshots. The details were Claude's choices, listed with the screenshots for him to change: no invite email, so people hear about it from him and the app sends fewer emails; two screens, for his "one thing per screen" rule; the app learns he's the owner the first time he opens the page, so he doesn't have to sign out and in again.
- Turned down: an email to each invited person (more emails from the app, and more wording to approve); the list and the form on one long screen; moving turned-off people to the end of the list (in testing, the row jumped away from where it was tapped, and the message about it was out of sight at the top); asking Dan to sign out and in again so the app knows he's the owner.
- Revisit if: people in the group miss the link or ask for an email, or the list gets long.
- Status: its "no email to invited people" part was replaced by October 29, 2026: the invite email (pull request 93).

### October 29, 2026: Cloudflare deploys the server by itself (pull request 90)
- Decision: Cloudflare's own GitHub connection (Workers Builds) deploys `server/` after each merge to main. The settings are in `server/wrangler.jsonc`: the Worker's name, `worker.js`, the compatibility date 2026-10-26 (from Dan's dashboard), the `DB` database (`living-in-the-word-limits`, its ID from Dan), logs on, and dashboard variables kept. Secrets stay in the dashboard. Build watch paths stay at `*`, so every merge builds: Cloudflare's docs don't say whether the paths count from the top of the repository or from the root directory, and a wrong guess would quietly stop every build. A build takes about a minute of the 3,000 free minutes a month (Claude's estimate). Dan connected it on October 29, 2026, just after pull request 90 merged, so the first automatic deploy is pull request 91.
- Why: Dan, after pasting `worker.js` by hand for pull request 89: "Is there a way to connect Claude to cloud flare to automate this update every time". He chose "A" from three options. Cloudflare's docs (read as their source on GitHub, October 29, 2026): it deploys on each push to the chosen branch, the free plan has 3,000 build minutes a month, it makes its own API key, and Wrangler never deletes secrets. This runs Cloudflare's npm tool, Wrangler, on Cloudflare's computers: an exception to the repository's "no npm" rule, which Claude named before Dan chose (the root `CLAUDE.md` says so now).
- Turned down: "B", a GitHub Actions workflow (Dan would create a Cloudflare API token and keep it, with his account ID, in GitHub's secrets); "C", pasting by hand each time.
- Revisit if: builds fail, the free build minutes run short, or a setting is changed in Cloudflare's dashboard (the next deploy replaces it with `wrangler.jsonc`).
- Result: pull request 91's merge was the first automatic deploy (build 70ac8d9c succeeded, October 29, 2026).

### October 29, 2026: Cloudflare's preview builds off (no pull request)
- Decision: Dan turned off preview builds (builds of branches other than `main`).
- Why: they run `npx wrangler preview`, which failed on Claude's branch: "Your Wrangler configuration is missing a `previews` block" (Dan's screenshot of the build log). The app doesn't use preview copies of the server.
- Turned down: adding a `previews` block, as the error suggested: it would point preview copies of the server, running unmerged code, at the live database.

### October 29, 2026: the daily limits explained on the owner's page (pull request 92)
- Decision: a "Daily AI limits" section above the list: "To keep the AI's cost safe, each person can write up to 20 sets of questions a day, and everyone together up to 60. A set is one Bible study, one reading-plan day, or one tap of "Write new questions." The counts start over at midnight Pacific time." Then "Today you've used 13 of your 20. Everyone together has used 13 of 60, counting phones that use the passcode." The words are in `index.html`; the numbers come from the server.
- Why: Dan, about "Today you've used 13 of your 20 sets of questions. Everyone together: 13 of 60.": "give more context than that." He chose "A." He also asked for a note that it's "only for testing purposes for now and will be removed when the real app is done" if everyone can see it. Only the owner sees this page (the server checks), so there's no note.
- Turned down: "B," a shorter line ("each study or reading counts as one ... Resets at midnight Pacific time"); the testing note.
- Next: Dan: "Finally I wish sending an invite would email the person the invite." That reverses the S4 choice of no invite email, in its own pull request, with his words.

### October 29, 2026: the invite email (pull request 93)
- Decision: each tap of "Invite" emails the person, in Dan's words (his choice "A"). Subject "Dan invited you to Living in the Word", then: "Hi Sarah, I'd like to invite you to Living in the Word, a small app I made for our Bible studies. It prepares discussion questions for a passage, and it can keep a daily reading plan with you." Then three steps (open the link, tap "Sign in," type this address and the code), signed "Dan." It's sent from the sign-in address, and replies go to Dan's own address (`OWNER_EMAIL`; Claude's choice, put to Dan with the pull request). One address gets at most 3 invite emails a day, within the day's 90 emails (shared with sign-in codes). If it can't be sent, the person is still invited, and the app says to send the link yourself. "Send the app's link" stays, for KakaoTalk or a text.
- Why: Dan: "Finally I wish sending an invite would email the person the invite." It reverses the S4 choice of no invite email (Claude's, in the screenshots he approved). Replies to an email signed "Dan" would otherwise go to the sign-in address, which has no inbox for them. The `reply_to` field was read in Resend's own library (github.com/resend/resend-node, October 29, 2026).
- Turned down: "B," the shortest words ("Dan invited you to Living in the Word, an app for Bible study questions...").
- Revisit if: invitees reply and Dan would rather not share that address, or the emails land in spam.
- Status: Dan merged it as is, replies to his address included (October 29, 2026). Not checked with a real email yet.

### October 29, 2026: the checks saved in the repository (pull request 94)
- Decision: Claude's checks are saved in `living-in-the-word/tests/`: `server-test.mjs` (74 checks of `server/worker.js`, with stand-ins for the database, Resend and the AI) and `app-test.mjs` (76 checks of the app in Chromium). Each runs with one command from the repository folder (`PROGRESS.md`, "How to run and check it").
- Decided by: Dan's handoff instructions ("If you wrote checks this session (tests, Playwright scripts), save them in the project"); the files are Claude's.
- Why: until now each session rewrote its checks ("the scripts aren't in the repository"), which costs time and tokens, and old checks can catch a change that breaks something.
- Turned down: keeping them out of the repository, the earlier habit (Why: not recorded).
- Note: like every file here, they're published with the website. They hold only stand-in values (made-up keys, addresses and passcode).

### October 31, 2026: don't draw attention to something the text itself doesn't (pull request 95)
- Decision: one more rule in the AI's guidance (`GUIDANCE` in `server/worker.js`, step 7 of "How to read the passage"): "Don't draw attention to something the text itself doesn't draw attention to. When a passage only names someone, as a genealogy does, don't bring up sins, abuse or violence from their story elsewhere in the Bible, in the questions or in the commentary for the leader. This isn't hiding anything; it lets the passage's own emphasis lead." The heads-up for the leader now says "when the passage itself tells of things like the death of children or sexual violence." For the group study and the reading plan (the guidance is shared).
- Why: the reading plan's note on Matthew 1 said several of the genealogy's stories "involve sexual sin, abuse of power, or violence. David's treatment of Bathsheba and Uriah is one example, so be ready to treat it soberly if it comes up." Dan: "we don't need to include the mention of sexual sin and abuse of power because that isn't even a prominent part of the genealogy, so don't draw attention to something that the text does not necessarily draw attention to. Of course that does not mean to ignore it or anything, but just that we don't need to draw attention to everything that the text itself does not."
- Decided by: Dan (the rule, October 31, 2026); the wording is Claude's, in his words where possible, for him to change.
- Turned down: nothing else was offered.
- Revisit if: a passage that does tell of hard things (Matthew 2, Judges 19) stops getting its heads-up, or questions start skipping what a passage does stress.

### October 31, 2026: the reading plan's questions ready ahead (pull request 96)
- Decision: once the open reading's questions are saved, the app quietly asks the AI for the next reading's too and saves them with the plan, so the next reading opens with its questions ready (`prepareAhead` in `app.js`). Only one reading ahead. Nothing shows on screen while it's written, unless that reading is opened first ("Read the next one now"), which then shows the usual "Writing questions for ..." until they arrive. Same sign-in, same daily limits; no change to the server or the AI's settings.
- Why: Dan, October 31, 2026: "I noticed this sonnet version is still quite slow, maybe as slow as Opus... Is it my guidelines and directions that is causing this? How can I fix that and improve it for speed without losing the accuracy and the good question generation I currently have? If there is not a way, then don't change anything." Claude found the wait is mostly the AI's hidden thinking (the "high" effort and "Think the problem through" line since October 28), not the guidance's length, and that lowering effort would lower quality (Anthropic's Sonnet 5.5 guide, read October 31, 2026). Of the three options, Dan chose "(a)": "Let's do a."
- Turned down: "(b)" Opus 5.5 in fast mode (up to 2.5 times faster writing, but about 6 cents a set instead of about 2.3, by Claude's estimate, and it needs the Start tier or higher); "(c)" changing nothing; `medium` effort, Haiku 5.5, streaming and a shorter guidance (Claude didn't recommend them; reasons in `PROGRESS.md`, "Speed").
- Cost: the same per reading, since each reading's questions are written once either way. If a plan ends early, at most one set goes unused. If the app is closed within about half a minute of opening a reading, the next one's set may not arrive; then it's written when that reading opens, as before (that set may still be billed).
- Revisit if: the wait for "Prepare for a Bible study" still bothers Dan (then fast mode, option "(b)"), or sets written ahead often go unused.
