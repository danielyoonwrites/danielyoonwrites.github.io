# SPEC: Living in the Word

A little app at https://danielyoonwrites.github.io/living-in-the-word (folder `living-in-the-word/` in the website repository). Planned with the owner, October 2026.

## Who it's for

- Stage 1: the owner, preparing Bible study discussion questions for his small group. He reviews every question before anyone sees it.
- Stage 2: the same, plus an AI helper (see below).
- Stage 3: anyone online, like other small group leaders.

## What it does

Type a Bible passage (a verse, a chapter or a longer passage, like "John 4:1-26"), get 4 discussion questions written for it by the AI helper, edit them, then share them with the group or lead the study from them.

## How it works

One thing per screen, with big buttons.

1. "Which passage?" Type it, like "John 4:1-26," and tap "Go deeper with AI" (the owner's words, October 26, 2026; it said "Write questions with AI" before). A line under the button says what happens: the AI helper writes 3 to 5 new study questions for this passage (the owner asked for this to be clear, October 26, 2026).
2. The AI helper writes 3 to 5 questions for that passage (see "The questions" below). While it writes, the screen says "Writing questions for John 4:1-26. This can take up to a minute." and shows five numbered placeholder lines that gently fade in and out, so it never looks blank (the owner asked, October 26, 2026). If the AI can't be reached, 5 general questions show instead, with a short note why. There used to be a choice of study method here; the owner removed it on October 26, 2026 (pull request 50).
3. The questions appear, with the passage at the top. Edit any question, remove one, or add your own. "Write new questions" asks the AI again. Nothing is shared until the owner chooses to.
4. Share (the owner's first pick): "Share" sends the passage and questions as plain text through the phone's share menu, for example to a KakaoTalk group chat. "Copy" is there too, in case sharing doesn't work.
5. Lead (the owner's other pick): "Lead the study" shows one question at a time in big text, with Next and Back, for leading in the room or on a screen.
6. Saved studies: tap Save to keep a study's questions on the phone, to use, change or share again (built October 26, 2026; see "Saved studies").
7. Later: a page that prints cleanly (the owner's "maybe also").
8. Reading plan (the owner's idea, October 25, 2026): set a plan once, like "Matthew, one chapter a day, starting Nov 1." Each day the app shows today's reading, like "Today: Matthew 3," with a few questions to meditate on and "Done for today." No streaks and no guilt: a missed day just waits, the same kindness rule as First step smaller. In stage 1 the questions follow a method, so they're the same each day (a method made for personal reflection, such as lectio divina, could fit; check sources before using it). In stage 2, AI writes questions for that day's chapter, which the owner can read before meditating.

## The questions

Since October 26, 2026 (the owner's choice, pull request 50), there's no study method to choose, for the group study or the reading plan. His reason: when the AI writes the questions for each passage, they won't fit a method's mold anyway. The AI writes 3 to 5 questions, in this order (`PATTERNS` in `server/worker.js`). The owner moved from 4 to 5 the same day (pull request 51), and chose prayer for the 5th. Then 3 to 5 (the owner's rule, October 26, 2026, pull request 69, after Judges 19 repeated itself and forced a question that didn't fit): the AI always writes the first and the last, and leaves out any of the others that would repeat another question or doesn't fit the passage well. Each question should bring out something new.

- Group study: what the passage says (what happens, who is involved, what stands out); what it shows about God (the Father, the Son or the Holy Spirit); what it means for our hearts (what we love, trust, fear or hope in, in light of the gospel); one concrete response this week; what the group can pray about together.
- Reading plan, for one person's quiet time: notice what the reading says; what it shows about God; the reader's heart; one way to live it out today; turning it into prayer (thanks, trust, lament, repentance or asking).

Passages of suffering, violence or evil (the owner's request, October 26, 2026, pull request 68). A question on Matthew 2 named the children killed in Bethlehem, then turned in the same breath to praying "for those who don't yet know Jesus." The owner asked for pastoral care with passages like Exodus 1, Matthew 2, Esther 9 and Judges 19: never taking them lightly or glossing over them. The AI's guidance now has a section, "When a passage tells of suffering, violence or evil" (`GUIDANCE` in `server/worker.js`):
- Name what happened soberly, without hurrying past it, in general words like "sexual violence," "abuse" or "killed," never graphic terms, in the questions and the commentary for the leader (the owner asked after a Judges 19 note said "gang rape," pull request 69). Stay with it instead of turning to another topic. When the hard part is one piece of a longer passage (Matthew 2), it gets its own question, and the rest of the passage still gets its due.
- Make room for lament: the prayer question can be honest grief, a cry for justice, or prayer for people who suffer the same things today (one of these, not a list).
- Also for every passage: a question doesn't offer a list of options to choose from (the Matthew 2 question did).
- Notice how the author presents what happened. Judges shows evil as evil. Where the text doesn't say whether violence was right (Esther 9), don't celebrate it or make it a model. God's own judgments aren't a pattern for us.
- Never ask anyone to share their own trauma, never blame victims, and don't ask what a victim should have done.
- Don't ask about God's silence, where God was, or why he didn't stop it: for someone who has lived through trauma, that can wound their faith (the owner's rule, pull request 70, after a Judges 19 question asked about God's silence). Show only what the passage itself shows about God, like his protection of the child Jesus in Matthew 2 or his kindness to the midwives in Exodus 1. Where it shows little of God directly (Judges 19), don't claim his care or protection either (the owner's feedback, pull request 69): leave the question about God out. Don't force a tidy answer, and let hope in Christ be real without making the grief disappear.
- Let the response fit the weight of the passage.
- Give the leader a short heads-up in the commentary for the leader (for example, about the death of children or sexual violence).

The commentary for the leader (the owner's choice, October 26, 2026, pull request 71). It replaced a note of one or two sentences that showed only now and then; the owner chose "Short commentary, folded" over removing it. In the same answer as the questions, the AI writes one short paragraph, about 100 words in four or five short sentences, for the leader only (test runs without a length came out at 170 to 200 words): the passage's main point and how it unfolds, the background the group needs, and anything to be ready for (a heads-up on a hard passage, or the note on Mark 16:9–20 and John 7:53–8:11). It shows in a fold-out, "For the leader," right above the questions: closed until tapped at first, open from the start since October 28, 2026 (the owner's choice, after Opus 5.5 wrote it better), and still closes with a tap. It's never shared and is saved with a study. In the reading plan it's a short note for the reader, in its own fold-out, "A note on this reading." Cost: about 0.2 to 0.5 cent more per set (Claude's estimate; the test link, with ?test at the end of the address, shows the real cost).

General questions show when the AI helper can't answer or isn't set up (while it writes, placeholder lines show instead). Drafted by Claude, waiting for the owner's review (`GENERAL_QUESTIONS` and `READING_QUESTIONS` in `app.js`):
- Group study: What stands out to you in this passage? / What does this passage show about God? / How does it speak to what we love, trust or hope in? / What is one way you will respond to it this week? / What can we pray about together from this passage?
- Reading plan: What stands out to you in today's reading? / What does it show you about God? / How does it speak to what you love, trust or hope in? / What is one way you can live it out today? / What do you want to say to God about it?

### Removed: study methods (October 26, 2026)

From October 25 to 26, 2026, the group study offered three named methods: Discover (Discovery Bible Study), Look, think, live (Observe, Interpret, Apply), and Light, question, arrow (the Swedish method), plus Quiet time for the reading plan (pull requests 38, 46 and 47). Their wording is in the repository's history. Plans saved with a style still work; the style is ignored. The sources below are kept in case a method ever comes back.

What was checked for the method drafts (web search results, October 25, 2026; the pages themselves couldn't be opened from Claude's session, so this is unverified against the original guides):
- Discovery Bible Study: versions agree on God, people, obey, share. A Fellowship of Christian Athletes template asks about God and people, then how the group will obey that week and who they'll share with: https://resources.fca.org/resources/discovery-bible-study-training
- Observe, Interpret, Apply: "What does it say? What does it mean? What should I do?" (Revive Our Hearts, below). Christianity.com's guide suggests who, what, when, where and why questions, looking for repeated words, and letting Scripture interpret Scripture: https://www.christianity.com/wiki/bible/the-inductive-method-of-bible-study-the-basics-11530093.html
- The Swedish method: light bulb, question mark, arrow; usually about 10 minutes of quiet study, then sharing in rounds; Ada Lum is said to have met it in a Swedish student group (Scripture Engagement and The Briefing, https://thebriefing.com.au/?p=5445). The draft tip says "a few quiet minutes" instead of a number.

Earlier sources (search results, October 25, 2026; the guides themselves weren't opened from Claude's session):
- Canyon Ridge, Discovery Bible Study: https://canyonridge.org/dbs
- InterVarsity, Discovery Bible Study: https://ism.intervarsity.org/node/3389
- InterVarsity, Leading Inductive Bible Study: https://library.intervarsity.org/library/leading-inductive-bible-study
- Revive Our Hearts, Inductive Bible Study 101: https://reviveourhearts.com/articles/inductive-bible-study-101
- Scripture Engagement, The Swedish Method: https://scripture-engagement.org/?p=545
- Desiring God, Six Questions to Ask When Studying the Bible in a Group: https://www.desiringgod.org/articles/six-questions-to-ask-when-studying-the-bible-in-a-group

## Stage 2: questions written for the specific passage (next, see AI-PLAN.md)

Moved up on October 25, 2026: after trying step 2, the owner pointed out that questions that are the same for every passage could just be printed once. Questions written for the passage are what make the app worth using. The full plan, with what was decided and checked, is in `AI-PLAN.md`.


- The AI writes the questions as soon as a passage is typed (since October 26, 2026; before that, a "Suggest questions for this passage" button). They're drafts the owner reviews and edits; they're never shared on their own.
- New skill: a small server, so the AI key stays secret (anything in a public website's code can be seen by anyone). Each use costs money, so it needs a spending limit.
- What's sent is the passage name and whether it's for a group study or the reading plan, not anything personal.
- AI can misquote Scripture or add interpretations, which is why the owner reviews everything.
- Which AI, where the server runs and the cost limits are decided in a separate plan before stage 2, after checking current docs. Claude effort for stage 2: Extra high (the owner asked; Claude Code docs describe it as "deeper reasoning at higher token spend").

## Saved studies (October 26, 2026)

The owner asked to save questions for a passage and have the app remember them, like an app on a phone.

- Save, in the bar at the bottom of the questions screen, keeps the passage, its questions (without empty ones) and the note for the leader on this phone. It says what it saves: "Save these questions for John 1" (the owner asked for this, October 26, 2026), then "Saved on this phone," or "Save your changes" after any change. It spans the bar's width, with Share and Copy side by side under it.
- One saved study per passage: saving again keeps the newest. "John 15" and "john 15" count as the same passage.
- "Saved studies" on the start screen (row 03) lists them, newest first, with how many questions and the date. Tap one to open it, change it, share it or write new questions. "Remove from saved studies," right under the Save bar (the owner asked, October 26, 2026, pull request 60), takes it off the list, after asking.
- Typing a saved passage opens its saved questions instead of asking the AI, so it costs nothing and works even when the AI can't be reached.
- Kept in the browser's storage under `living-in-the-word` (`studies`), only on this phone and in this browser. If the browser won't save (a private window), the app says so. The Bible text is never saved.

## Safety and limits (the owner's request, October 26, 2026)

The owner asked for four things: sign-ups, so people don't need the shared passcode; a limit on how often each person uses the AI, so nobody can spam it and waste credits; maybe subscriptions someday, so people can use it as much as their plan allows; and checks so nobody can misuse the AI or break the app. He chose to start with the checks and limits, then sign-ups. Subscriptions come last.

- Only Bible passages reach the AI (pull request 61). The server checks every passage before anything costs money: a book of the Bible (its full name, a clear start of it like "Gen" or "1 Cor", or a common short form like "Jn" or "Ps"), then chapter and verse numbers like "4:1-26", "5-7" or "3:16, 18". A book alone, like "Jude", works too. Chapter numbers must be in the book ("John 22" is turned away). Anything else, like a sentence, a question or instructions for the AI, gets "The AI didn't recognize that passage," and the AI is never asked. That screen then shows only the passage name, the message and a "Change the passage" button back to the box, with nothing else underneath (the owner asked, October 26, 2026, pull request 65).
- What still gets through: any real passage, typed by someone who has the passcode. That's what the daily limit is for.
- An independent security review (a separate Claude agent, October 26, 2026) checked the server and the app. Fixed in pull request 61: the server no longer asks Anthropic to retry a declined request on another model (it only helped misuse), and an empty message no longer crashes the server. Done with the daily limits (pull request 62): wrong passcode guesses are limited (with no limit, a short passcode could be guessed by a program trying thousands a day). Done in pull request 63 ("the app can't be broken"): a Content-Security-Policy (a browser rule in `index.html`: the page may only run its own script, use its own style sheet and Google's fonts, and talk to the AI helper's server; tested: code sneaked into the page doesn't run); damaged saved data is skipped instead of breaking the app; a reading whose AI questions failed isn't asked for again by itself (only when "Questions for this reading" is tapped, without asking for the passcode again); "too long" gets its own message ("Try a shorter passage"); and on a slow connection the offline copy only uses the exact same version of a file, so a newer page never runs with an older script. Checked, nothing found: the app never runs the AI's words or saved text as code; error messages don't leak keys; other people's questions can't be reached.
- Good to know: every page on danielyoonwrites.github.io shares the same browser storage, so a mistake on any page of the website could expose the passcode, or a phone's sign-in key. Nothing on the site can do that today; keep it that way (never put text into a page as HTML).
- Not accepted yet: book names in Korean (like 요한복음 3), translations after the passage (like "John 3:16 ESV"), and two books joined by a comma when the second starts with a number (like "1 John 3, 2 John"). Each gets the "didn't recognize" message.
- Daily limits (pull request 62; numbers chosen by the owner, October 26, 2026): 20 sets of questions a day for each internet connection, 60 for everyone together, and 10 wrong passcodes a day for each connection. People on the same Wi-Fi share a connection. When a limit is reached, the app shows the general questions with "Today's AI limit is reached… It starts again tomorrow," or "Too many wrong passcodes were tried from this internet connection today…" The counts start over at midnight Pacific time. Details in `AI-PLAN.md`, "Keeping the bill safe."
- Since sign-up step S3 (October 28, 2026, the owner's request: "built in limits per account for now, since I am not charging yet"), someone signed in has their own 20 a day, wherever they are; a phone with the passcode still counts with its connection.
- Sign-ups: planned in `SIGNUP-PLAN.md` (October 26, 2026). Invite only at first; sign in with an email code or with Google; the owner's own web address (about $11 a year); Apple later if wanted (99 USD a year).
- Signing in with an email code (step S3, built October 28, 2026): "Sign in" at the bottom of the start screen, or when the AI is asked for on a phone that isn't signed in. Type the email address, get a 6-digit code by email, type it in. Only the owner and the people he invites can sign in, and the app never says whether an address is invited ("If ... is invited, a 6-digit code is on its way"). A phone stays signed in for 90 days; "Sign out" keeps saved studies and the reading plan. Until step S6, "Have a passcode? Use it instead" still works. Everything else, with the limits and what was tested, is in `SIGNUP-PLAN.md`, "What S3 built."

## Works without reception (October 26, 2026)

The owner asked for the app to work where there's no reception, like an app on a phone.

- Add it to the home screen: it opens like an app, without Safari's address bar. The icon is the full name, "Living in the Word," in EB Garamond on the paper color (the owner's choice, October 26, 2026). The name under the icon is "In the Word" (the owner's choice), set in `manifest.webmanifest` (`short_name`) and in `index.html` (`apple-mobile-web-app-title`, which iPhones read).
- The offline helper, `sw.js` (a "service worker"), keeps a copy of the app's files and its fonts (English letters only) on the phone. With reception the newest files load and the copy is updated. With no reception, the copy is used. If the internet takes more than 4 seconds, the copy is used only when it's the same version of the file (since pull request 63), so a newer page never runs with an older script. It never touches or keeps anything sent to or from the AI helper.
- Saved studies and the reading plan were already kept on the phone, so they work without reception. Writing new questions still needs the internet; without it, the app shows the general questions and says it couldn't reach the AI helper.
- A tip on the Saved studies screen says how to add the app to the home screen. It's hidden when the app is opened from the home screen.
- The app asks the phone to keep its saved data (`navigator.storage.persist()`). Some phones say no; nothing changes then.
- Icons: `icons/apple-touch-icon.png` (180 by 180, for iPhones), `icons/icon-192.png` and `icons/icon-512.png` (Android), and `icons/icon-maskable-512.png` (Android, with the words a little smaller so a round mask doesn't cut them). Made from EB Garamond, ink `#1D1B18` on paper `#F3EFE7`, square corners (the phone rounds them), no transparency.
- What couldn't be checked (Apple's and WebKit's pages are blocked from Claude's sessions; from search results only, October 26, 2026):
  - On an iPhone, a home screen app keeps its own saved data, separate from Safari's, so studies saved in Safari don't appear in the home screen app (a WebKit engineer called this "by design" in a 2022 bug comment).
  - Safari may delete a site's saved data after 7 days of using Safari without visiting it; home screen apps keep their own count (WebKit, 2020).
  - Since iOS 26, every site added to the home screen opens as a web app by default.
  - Which name an iPhone shows under the icon: `apple-mobile-web-app-title` works; whether it also reads the manifest's `short_name` wasn't confirmed.

## Choose from the Bible (October 26, 2026)

The owner asked for a way to pick the passage instead of always typing it (pull request 66).

- "Choose from the Bible" sits above the typing box, as a box with an arrow, with "Or type it" between them. So both read as ways to choose the passage, and only "Go deeper with AI" starts the questions (the owner asked, October 26, 2026, pull request 67: under the box, the two buttons looked like a choice between them). It opens the picker. The typing box stays.
- One screen each: Old or New Testament, then the book (two to a row), then the chapter ("Which psalm?" for Psalms), then the verses. A book of one chapter (Obadiah, Philemon, 2 John, 3 John, Jude) goes straight to its verses.
- The verses: "The whole chapter" ("The whole psalm," "The whole book"), or tap the first verse, then the last, in either order. The chosen verses are shaded, with the first and last filled in ink. A bar at the bottom shows the passage, like "John 3:16–21," with "Go deeper with AI."
- Names as Bibles print them: "John 3" for a whole chapter, "John 3:16" for one verse, "John 3:16–21" for a few, "Psalm 23" for one psalm, and "Jude" or "Jude 3–5" for a book of one chapter. The server accepts every name the picker can make (checked: 7,127 names, from every chapter).
- The choice goes into the typing box and starts the study the same way as typing it, so a saved passage still opens its saved questions. Back goes through the picker with the choice kept, then to the box with the choice in it.

The verse numbers follow the NASB, ESV and NIV, not the KJV (the owner asked while it was being built: he likes those three more). What was checked, October 26, 2026:
- Two datasets on GitHub: github.com/thiagobodruk/bible (its NASB 2020, ESV, NIV and KJV) and github.com/scrollmapper/bible_databases (KJV). All have 66 books and 1,189 chapters, and the two KJV copies agree on every chapter.
- Every chapter ends on the same verse number in all of them, except 3 John: the NASB, ESV and NIV number its last greeting as verse 15, and the KJV keeps it in verse 14. The picker shows 15.
- Revelation 12 ends at verse 17 in all four. The sentence about the dragon standing on the sand is 13:1 in the NASB (1995 and 2020) and the NIV, and the end of 12:17 in the ESV (search results quoting Bible.com, Blue Letter Bible and esv.org; some other Bibles, like the NRSV, make it 12:18).
- 16 verses are only in a footnote in the ESV and NIV: Matthew 17:21, 18:11 and 23:14; Mark 7:16, 9:44, 9:46, 11:26 and 15:28; Luke 17:36 and 23:17; John 5:4; Acts 8:37, 15:34, 24:7 and 28:29; Romans 16:24. These Bibles keep the numbers (Matthew 17 goes from verse 20 to 22). The picker shows them lighter, with a dashed line and a note ("Verse 21 is lighter because the ESV and NIV have it only in a footnote"), and they can still be chosen. Checked: in the datasets, the ESV and NIV skip exactly these verses (the verses on either side line up). That they're in footnotes was checked through search results for Matthew 17:21 (ESV), Mark 9:44 and 46 (NIV), Acts 8:37 (NIV) and John 5:4 (ESV and NIV); the other footnotes weren't each looked up.
- Matthew 12:47 is only in a footnote in the ESV; the NIV and NASB have it (the NASB in brackets), so it isn't lighter.
- The NASB 2020 copy leaves out 13 of the 16 as well, but has Mark 11:26, Luke 17:36 and Luke 23:17. That wasn't checked further (Bible Gateway and Bible Hub are blocked from Claude's sessions), so the note names only the ESV and NIV.
- The lists are `VERSES` and `IN_FOOTNOTES` in `app.js`.

## Words on the start screen (the owner's, October 26, 2026; use them exactly)

- "Prepare for a Bible study" / "Tell me what passage you are going over, and I will generate three to five questions for your Bible study."
- "Bible reading plan companion" / "Set up a Bible reading plan (like one chapter of Matthew a day), and I will generate three to five questions for the chapter you read today." Once a plan is set up, a line under it says where it is, like "Next: Matthew 3. Reading 3 of 28."
- Sentence case, the owner's choice when asked (he typed them with capitals first).
- "five questions" became "three to five questions" with the 3 to 5 rule (pull request 69), so the words stay true; the rest is his wording.

## The look: "Paper and ink" (October 26, 2026)

The owner asked for a big visual update: the app doesn't have to look like his website. It should look like a real app, clean like Kinfolk magazine, so people like to look at it and use it. He picked direction A, "Paper and ink," from two mockups (the other kept his celadon green).

Colors (in `style.css`, at the top)
- paper `#F3EFE7`: the background. Warm, never pure white.
- ink `#1D1B18`: main text and the main buttons (solid ink with paper-colored words).
- muted `#57524A` (darker since October 28, 2026; it was `#6B655C`): labels, hints, small print. Checked with the WCAG formula: 6.8 to 1 against paper and 6.1 to 1 against soft (it was 5.0 and 4.5, right at the limit).
- line `#DCD4C7`: thin lines between rows only.
- soft `#E9E3D8`: the shaded box behind the AI's notes.

The magazine look (the owner's choice, October 28, 2026, from two mockups, "Magazine" and "Quiet column"; inspired by Kinfolk pages he shared):
- Start screen: today's date between two thin lines like a dateline ("WEDNESDAY" on the left, "OCTOBER 28" on the right); the title and the line under it centered; the three choices like a table of contents, with the number in its own column; "Signed in as" centered.
- Each screen's small label, title and tip are centered; under a passage or reading name, a short line. Text you read and type stays left-aligned.
- Questions are numbered i., ii., iii. in italic, centered above each question, which is a little bigger (about 24 pixels).
- The commentary for the leader and the note on a reading sit in the soft shaded box, under a small capital "FOR THE LEADER."
- The big start-screen title is the app's name. In the mockup it was a made-up headline; the owner can give his own words for it.

Readability (the owner asked, October 28, 2026; research in his Notion): nothing is smaller than 13 pixels except the ESV verse numbers (about 12). Labels 13.5, Back and button words 14, quiet buttons 13 and in ink instead of grey. Apple's Human Interface Guidelines (opened October 28, 2026): 17 points normal and 11 the minimum for iPhone text, larger for thin fonts; 4.5 to 1 contrast up to 17 points.

Type (Google Fonts)
- EB Garamond, Regular and Italic, for everything you read: titles, questions, notes.
- Jost, Regular and Medium, only for small capital labels ("PREPARE A STUDY"), numbers (01, 02) and button words, spaced out.
- No bold. Big titles (the passage name is the biggest thing on the questions screen).

Layout
- One column, phone width, also on a computer.
- A thin bar at the top of each screen with Back on the left and "Living in the Word" on the right; it stays at the top while scrolling. The start screen has no bar: today's date, the big title, and two tap-able rows with arrows.
- Questions are numbered 01, 02, 03 with thin lines between them, and look like plain words until tapped. Share and Copy stay at the bottom of the screen while scrolling, and step aside while you type in a question.
- Typing boxes are a single line to write on. "Chapters a day" is three boxes; the chosen one is filled in.
- Square corners, lots of open space. Sentence case, no exclamation marks, no emoji (as before).

What Kinfolk's look is (web search results, October 26, 2026; Kinfolk's site and the design articles are blocked from Claude's session, so these weren't opened and are unverified): minimal layouts with generous white space, muted natural photography, a classic serif paired with a simple sans-serif, and few colors. Garamond was its text typeface around its 2015 redesign, and a later redesign for its tenth anniversary brought in custom typefaces. Search results pointed to It's Nice That (itsnicethat.com) and D&AD (dandad.org). The app borrows the feel, not Kinfolk's fonts, logo or photos.

Parked: a real photo on the start screen (Kinfolk is photo-led; the website's rule is real photos only, window light, ordinary things).

## The Bible text (ESV, October 26, 2026)

**On hold (the owner's choice, October 26, 2026).** The code is built and published, but no ESV key is set, so the app never shows Bible text: only a "Read it on esv.org" link. His reason: someday he may let people subscribe to the app. Crossway's free terms are only for non-commercial apps (no charge for any part), and Crossway licenses only organizations, not individuals. The NIV through API.Bible has the same non-commercial limit. If he wants the passage in the app and a paid app is still possible, look at the Berean Standard Bible first: API.Bible's licensing FAQ calls it public domain and allows it for display and AI (read October 26, 2026); its own terms page (https://berean.bible/terms.htm) hasn't been opened yet. To turn the ESV on instead, only the key is needed (steps in HANDOFF.md).

The owner wanted the passage shown in the app if it was free and not hard, and chose the ESV (pull request 54).

- How it shows: a fold-out above the questions, "Read John 4:1-26 ESV," closed until tapped, so the questions stay near the top. The same on today's reading, where it takes the place of "Read it in your own Bible." Verse numbers are small and grey; no headings or footnotes. While the AI writes the questions, the passage can already be read.
- Where it comes from: Crossway's ESV API (https://api.esv.org), through the app's own server, with a free key saved in Cloudflare as `ESV_API_KEY`. The app asks the server for the text separately from the questions (`want: 'text'`), with the same passcode.
- If it can't show (no key yet, no passcode, no connection, a passage Crossway doesn't recognize, or one that's too long), a big "Read John 4:1-26 on esv.org" row shows instead (made bigger at the owner's request, October 26, 2026), linking to esv.org's page for that passage (like https://www.esv.org/John+4:1-26/, checked October 26, 2026).
- The AI is never sent the ESV text. Crossway's rules don't mention AI. API.Bible's rules forbid sending copyrighted Bible text to an AI, which is why the NIV wasn't chosen for that either.
- Shared text (Share and Copy) has only the passage name and the questions, as before.

Crossway's rules for the free ESV API (read on api.esv.org, October 26, 2026, through GitHub's computers and Jina Reader):
- "free of charge for non-commercial use." Non-commercial: "A non-commercial site does not charge for access to any part of the site." Commercial: "primarily designed to motivate visitors to buy something, to pay for a service, or to give a donation, or it accepts advertising or sponsorships." If the app ever asks for money, donations or ads, a license is needed, and Crossway's "policy is to license to organizations, not to individuals or solo developers."
- At most 500 verses, or half a book, per request and on any page. The server refuses more (counting verse numbers, and chapters against the book's length; books of one or two chapters may show whole, since Crossway's request rule makes that exception).
- 5,000 requests a day, 1,000 an hour, 60 a minute. Store no more than 500 verses: the app keeps the text only while the page is open and never saves it.
- No changes to the words. "(ESV)" comes at the end of the text, which Crossway's docs say "fulfills your copyright display requirements." The app also shows Crossway's copyright notice under the text and a link to esv.org, as their terms ask for each page.
- "You may not sell, share, or publish your access key." It lives only in Cloudflare.
- For "individuals and non-commercial organizations that use the service in ways consistent with the historic Christian understanding of doctrine and the Bible."

Other options looked at the same day: the NIV is free to show through API.Bible's non-commercial plan (5,000 requests a month), but API.Bible forbids sending it to an AI; the Berean Standard Bible (public domain) may be sent to an AI. Parked: giving the AI the BSB text, so its questions come from the real words.

## Must-haves

- Phone first, then computer. The app's own look, "Paper and ink" (see "The look"), since October 26, 2026. Before that it used the website's Moon jar design.
- Stage 1 sends nothing anywhere; recent studies are saved only on the phone. No accounts, analytics or tracking.
- Sentence case, no exclamation marks, no emoji. "the Word," meaning Scripture, keeps its capital.
- A small link back to the website at the bottom.

## Not in stage 1

- AI suggestions, printing, accounts, collecting group members' answers, reminders or notifications for the reading plan.

## Name

"Living in the Word" (the owner's choice, October 25, 2026). A web search found no app with this name, but there's a sermon podcast called "Living in the Word" (Pastor Anita Harrington) and a ministry called "Life in the Word." Search again, and do a trademark search, before stage 3.

## How we'll know it works

- Type "John 4:1-26," get 3 to 5 questions written for it, edit one, and share it to a chat: the chat shows the passage and the questions as plain text.
- "Lead the study" shows one question at a time and goes forward and back.
- Close the browser and reopen it: recent studies are there.

## Tech notes

- Plain HTML, CSS and JavaScript. No build tools, no npm.
- Sharing uses the browser's share feature (`navigator.share`) when it's available, with "Copy" as the fallback. Check how it works in KakaoTalk's built-in browser during step 3.
- Recent studies are saved in `localStorage` under `living-in-the-word`, as JSON with a version number.
- File links end in `?v=1`; raise the number when a file changes.
- The reading plan needs the number of chapters in each book of the Bible (Matthew has 28, for example). Take the list from a reliable source and check it when building; never type it from memory. Checked October 25, 2026: two independent datasets agree on every book, 66 books and 1,189 chapters (https://github.com/thiagobodruk/bible and https://github.com/scrollmapper/bible_databases, both based on the KJV; English Bibles share these chapter counts). The list is `BOOKS` in `app.js`.
- The passage picker needs how many verses each chapter has: `VERSES` in `app.js`, in the same order as `BOOKS`, following the NASB, ESV and NIV (see "Choose from the Bible"). Never type these from memory either.

## Build plan (one pull request each, each with a check the owner does)

1. This spec and the folder's `CLAUDE.md`. Check: read it.
2. Type a passage, choose a method, see and edit the questions. Built October 25, 2026 (not saved yet; edits last while the page is open). Methods removed October 26, 2026 (pull request 50): the AI writes questions right away (5 since pull request 51). Check: try it with a real passage for your group, and fix any wording.
3. The AI helper, moved up on October 25, 2026. Its own steps, A to D, are in `AI-PLAN.md`: the plan, sign-ups, the server with a side-by-side model test, then the "Suggest questions" button.
4. Share and Copy. Built October 25, 2026 (pull request 45): the passage and the numbered questions as plain text (the method's name too, until methods were removed), never the note for the leader; empty questions are left out. Share uses the phone's share menu (`navigator.share`) and is hidden where it isn't available (most computers); Copy uses the clipboard, then an older way, and if a browser blocks both it shows the text to select by hand. Not yet checked in KakaoTalk's built-in browser (Claude can't open KakaoTalk). Check: share a study to yourself in KakaoTalk, from Chrome and from inside KakaoTalk.
5. Lead the study, one question at a time. Check: lead from your phone or a laptop.
6. Saved studies (the owner's request, October 26, 2026, pull request 57): a Save button with the questions and a "Saved studies" list on the start screen. Check: save a study, close the browser, reopen it, it's there.
6c. Works without reception (the owner's request, October 26, 2026, pull request 59): an app you add to your home screen, with a copy kept on the phone so it opens offline and saved studies can be read anywhere (see "Works without reception"). Check: on your iPhone, open the app in Safari, add it to the home screen, open it from there once with reception, then turn on Airplane Mode and open it again. Also check whether studies you saved in Safari show up in the home screen app.
6e. Safety and limits (the owner's request, October 26, 2026; see "Safety and limits"): (1) only real Bible passages reach the AI, pull request 61; (2) daily limits, pull request 62; (2b) the app can't be broken, pull request 63 (check: the app works as before, and a reading plan day still gets its questions) (check: after the Cloudflare steps in `AI-PLAN.md`, write questions, then see today's rows in the database); (3) a plan for sign-ups, so people don't need the passcode and each person has their own limit: `SIGNUP-PLAN.md` (pull request 64; the owner chose invite only, an email code or Google, and his own web address, about $11 a year); (4) build sign-ups, step by step: S3, signing in with an email code and each person's own daily limit, built October 28, 2026 (check: the owner's steps in `SIGNUP-PLAN.md`, "What S3 built"); later, subscriptions. Check for (1): after pasting `server/worker.js` into Cloudflare, type "Write me a poem" and see "didn't recognize that passage," then type "John 15" and get questions.
6d. A passage picker (the owner's request): Old or New Testament, then the books, then the chapters, then the whole chapter or a range of verses; the typing box stays. Built October 26, 2026 (pull request 66; see "Choose from the Bible"), with the verse numbers following the NASB, ESV and NIV (the owner asked during the build). Check: tap "Prepare for a Bible study," then "Choose from the Bible": New Testament, John, 3, tap 16 then 21, and "Go deeper with AI." Also open Matthew 17: verse 21 is lighter, with a note.
6b. Reading plan: set a plan, see today's reading and questions, mark it done, and come back the next day (the owner chose to put it right after saving, October 25, 2026). Moved up and built October 25, 2026, at the owner's request (pull request 43): a start screen ("Prepare a study" or "Today's reading"); choose a book, 1 to 3 chapters a day and a start date; "Reading 3 of 28: Matthew 3" with three Swedish-method questions; "Done for today"; "Read the next one now"; missed days wait; saved on the phone. AI questions for each reading came next (AI-PLAN.md, step E); since October 26, 2026, the AI writes 4 and there are no styles to choose. Check: set a plan for a book you're reading and use it for a few days.
7. A page that prints cleanly.

## Open questions (ask one at a time)

- The general questions' wording (see "The questions"): drafted October 26, 2026, waiting for the owner's review.
