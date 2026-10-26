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

1. "Which passage?" Type it, like "John 4:1-26," and tap "Go deeper with AI" (the owner's words, October 26, 2026; it said "Write questions with AI" before). A line under the button says what happens: the AI helper writes 5 new study questions for this passage (the owner asked for this to be clear, October 26, 2026).
2. The AI helper writes 5 questions for that passage (see "The questions" below). While it writes, the screen says "Writing 5 questions for John 4:1-26. This can take up to a minute." and shows five numbered placeholder lines that gently fade in and out, so it never looks blank (the owner asked, October 26, 2026). If the AI can't be reached, 5 general questions show instead, with a short note why. There used to be a choice of study method here; the owner removed it on October 26, 2026 (pull request 50).
3. The questions appear, with the passage at the top. Edit any question, remove one, or add your own. "Write new questions" asks the AI again. Nothing is shared until the owner chooses to.
4. Share (the owner's first pick): "Share" sends the passage and questions as plain text through the phone's share menu, for example to a KakaoTalk group chat. "Copy" is there too, in case sharing doesn't work.
5. Lead (the owner's other pick): "Lead the study" shows one question at a time in big text, with Next and Back, for leading in the room or on a screen.
6. Recent studies are kept on the phone, so a study can be reused or shared again.
7. Later: a page that prints cleanly (the owner's "maybe also").
8. Reading plan (the owner's idea, October 25, 2026): set a plan once, like "Matthew, one chapter a day, starting Nov 1." Each day the app shows today's reading, like "Today: Matthew 3," with a few questions to meditate on and "Done for today." No streaks and no guilt: a missed day just waits, the same kindness rule as First step smaller. In stage 1 the questions follow a method, so they're the same each day (a method made for personal reflection, such as lectio divina, could fit; check sources before using it). In stage 2, AI writes questions for that day's chapter, which the owner can read before meditating.

## The questions

Since October 26, 2026 (the owner's choice, pull request 50), there's no study method to choose, for the group study or the reading plan. His reason: when the AI writes the questions for each passage, they won't fit a method's mold anyway. The AI writes exactly 5 questions, in this order (`PATTERNS` in `server/worker.js`). The owner moved from 4 to 5 the same day (pull request 51), and chose prayer for the 5th.

- Group study: what the passage says (what happens, who is involved, what stands out); what it shows about God (the Father, the Son or the Holy Spirit); what it means for our hearts (what we love, trust, fear or hope in, in light of the gospel); one concrete response this week; what the group can pray about together.
- Reading plan, for one person's quiet time: notice what the reading says; what it shows about God; the reader's heart; one way to live it out today; turning it into prayer (thanks, trust, repentance or asking).

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

## The look: "Paper and ink" (October 26, 2026)

The owner asked for a big visual update: the app doesn't have to look like his website. It should look like a real app, clean like Kinfolk magazine, so people like to look at it and use it. He picked direction A, "Paper and ink," from two mockups (the other kept his celadon green).

Colors (in `style.css`, at the top)
- paper `#F3EFE7`: the background. Warm, never pure white.
- ink `#1D1B18`: main text and the main buttons (solid ink with paper-colored words).
- muted `#6B655C`: labels, hints, small print. Checked: about 5 to 1 against paper and 4.5 to 1 against soft, enough for small text.
- line `#DCD4C7`: thin lines between rows only.
- soft `#E9E3D8`: the shaded box behind the AI's notes.

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

The owner wanted the passage shown in the app if it was free and not hard, and chose the ESV (pull request 54).

- How it shows: a fold-out above the questions, "Read John 4:1-26 ESV," closed until tapped, so the questions stay near the top. The same on today's reading, where it takes the place of "Read it in your own Bible." Verse numbers are small and grey; no headings or footnotes. While the AI writes the questions, the passage can already be read.
- Where it comes from: Crossway's ESV API (https://api.esv.org), through the app's own server, with a free key saved in Cloudflare as `ESV_API_KEY`. The app asks the server for the text separately from the questions (`want: 'text'`), with the same passcode.
- If it can't show (no key yet, no passcode, no connection, a passage Crossway doesn't recognize, or one that's too long), a "Read it on esv.org" link shows instead, to esv.org's page for that passage (like https://www.esv.org/John+4:1-26/, checked October 26, 2026).
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

- Type "John 4:1-26," get 5 questions written for it, edit one, and share it to a chat: the chat shows the passage and the questions as plain text.
- "Lead the study" shows one question at a time and goes forward and back.
- Close the browser and reopen it: recent studies are there.

## Tech notes

- Plain HTML, CSS and JavaScript. No build tools, no npm.
- Sharing uses the browser's share feature (`navigator.share`) when it's available, with "Copy" as the fallback. Check how it works in KakaoTalk's built-in browser during step 3.
- Recent studies are saved in `localStorage` under `living-in-the-word`, as JSON with a version number.
- File links end in `?v=1`; raise the number when a file changes.
- The reading plan needs the number of chapters in each book of the Bible (Matthew has 28, for example). Take the list from a reliable source and check it when building; never type it from memory. Checked October 25, 2026: two independent datasets agree on every book, 66 books and 1,189 chapters (https://github.com/thiagobodruk/bible and https://github.com/scrollmapper/bible_databases, both based on the KJV; English Bibles share these chapter counts). The list is `BOOKS` in `app.js`.

## Build plan (one pull request each, each with a check the owner does)

1. This spec and the folder's `CLAUDE.md`. Check: read it.
2. Type a passage, choose a method, see and edit the questions. Built October 25, 2026 (not saved yet; edits last while the page is open). Methods removed October 26, 2026 (pull request 50): the AI writes questions right away (5 since pull request 51). Check: try it with a real passage for your group, and fix any wording.
3. The AI helper, moved up on October 25, 2026. Its own steps, A to D, are in `AI-PLAN.md`: the plan, sign-ups, the server with a side-by-side model test, then the "Suggest questions" button.
4. Share and Copy. Built October 25, 2026 (pull request 45): the passage and the numbered questions as plain text (the method's name too, until methods were removed), never the note for the leader; empty questions are left out. Share uses the phone's share menu (`navigator.share`) and is hidden where it isn't available (most computers); Copy uses the clipboard, then an older way, and if a browser blocks both it shows the text to select by hand. Not yet checked in KakaoTalk's built-in browser (Claude can't open KakaoTalk). Check: share a study to yourself in KakaoTalk, from Chrome and from inside KakaoTalk.
5. Lead the study, one question at a time. Check: lead from your phone or a laptop.
6. Recent studies saved on the phone. Check: close the browser, reopen it, they're there.
6b. Reading plan: set a plan, see today's reading and questions, mark it done, and come back the next day (the owner chose to put it right after saving, October 25, 2026). Moved up and built October 25, 2026, at the owner's request (pull request 43): a start screen ("Prepare a study" or "Today's reading"); choose a book, 1 to 3 chapters a day and a start date; "Reading 3 of 28: Matthew 3" with three Swedish-method questions; "Done for today"; "Read the next one now"; missed days wait; saved on the phone. AI questions for each reading came next (AI-PLAN.md, step E); since October 26, 2026, the AI writes 4 and there are no styles to choose. Check: set a plan for a book you're reading and use it for a few days.
7. A page that prints cleanly.

## Open questions (ask one at a time)

- The general questions' wording (see "The questions"): drafted October 26, 2026, waiting for the owner's review.
