# SPEC: Living in the Word

A little app at https://danielyoonwrites.github.io/living-in-the-word (folder `living-in-the-word/` in the website repository). Planned with the owner, October 2026.

## Who it's for

- Stage 1: the owner, preparing Bible study discussion questions for his small group. He reviews every question before anyone sees it.
- Stage 2: the same, plus an AI helper (see below).
- Stage 3: anyone online, like other small group leaders.

## What it does

Type a Bible passage (a verse, a chapter or a longer passage, like "John 4:1-26"), get basic discussion questions for it, edit them, then share them with the group or lead the study from them.

## How it works (stage 1, no AI)

One thing per screen, with big buttons.

1. "Which passage?" Type it, like "John 4:1-26."
2. Choose a way to study it. Discovery Bible Study is already selected; Observe, Interpret, Apply and the Swedish method are one tap away (the owner's choice, October 25, 2026).
3. The questions appear, with the passage at the top. Edit any question, remove one, or add your own. Nothing is shared until the owner chooses to.
4. Share (the owner's first pick): "Share" sends the passage and questions as plain text through the phone's share menu, for example to a KakaoTalk group chat. "Copy" is there too, in case sharing doesn't work.
5. Lead (the owner's other pick): "Lead the study" shows one question at a time in big text, with Next and Back, for leading in the room or on a screen.
6. Recent studies are kept on the phone, so a study can be reused or shared again.
7. Later: a page that prints cleanly (the owner's "maybe also").
8. Reading plan (the owner's idea, October 25, 2026): set a plan once, like "Matthew, one chapter a day, starting Nov 1." Each day the app shows today's reading, like "Today: Matthew 3," with a few questions to meditate on and "Done for today." No streaks and no guilt: a missed day just waits, the same kindness rule as First step smaller. In stage 1 the questions follow a method, so they're the same each day (a method made for personal reflection, such as lectio divina, could fit; check sources before using it). In stage 2, AI writes questions for that day's chapter, which the owner can read before meditating.

## Question methods

The exact wording is drafted in build step 2 and reviewed by the owner before use. There's no single official wording for Discovery Bible Study; churches word it differently.

- Discovery Bible Study: What does this passage say about God? What does it say about people? How will I obey it? Who will I share it with? Some guides add retelling the passage in your own words.
- Observe, Interpret, Apply (the inductive method): What does it say? What does it mean? What should I do?
- The Swedish method: a light bulb (what stands out or shines), a question mark (what's hard to understand), and an arrow (how it applies to my life).

Draft wording, built in step 2 (October 25, 2026), waiting for the owner's review. It's written in `app.js` at the top, under "The questions for each method." These are Claude's own words following each method's pattern, not quotes from a guide.

- Discovery Bible Study. Tip: "Read the passage aloud, maybe twice, then go through the questions together."
  1. Can someone retell the passage in their own words?
  2. What does this passage say about God?
  3. What does it say about people?
  4. How will I obey what it says this week?
  5. Who will I share it with this week?
- Observe, Interpret, Apply. Tip: "Read the passage aloud. Stay with what it says before moving to what it means."
  1. What does the passage say? Notice who, what, when and where, and any words that repeat.
  2. What does it mean? What do other parts of the Bible say about this?
  3. What should I do about it?
- The Swedish method. Tip: "Read the passage aloud. Give everyone a few quiet minutes with it, then share one of each."
  1. Light bulb: what stands out or shines for you?
  2. Question mark: what is hard to understand, or what would you ask?
  3. Arrow: how does it apply to your life?

What was checked for the draft (web search results, October 25, 2026; the pages themselves couldn't be opened from Claude's session, so this is unverified against the original guides):
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


- A "Suggest questions for this passage" button. Suggestions show as drafts the owner reviews and edits; they're never shared on their own.
- New skill: a small server, so the AI key stays secret (anything in a public website's code can be seen by anyone). Each use costs money, so it needs a spending limit.
- What's sent is the passage and the chosen method, not anything personal.
- AI can misquote Scripture or add interpretations, which is why the owner reviews everything.
- Which AI, where the server runs and the cost limits are decided in a separate plan before stage 2, after checking current docs. Claude effort for stage 2: Extra high (the owner asked; Claude Code docs describe it as "deeper reasoning at higher token spend").

## Bible text (parked)

- Stage 1 doesn't show the Bible text itself, only the passage name.
- A "Read the passage" link to an online Bible might come in step 2; check the site's link format and terms first.
- Showing the text inside the app means checking each translation's usage rules first, since most modern translations have them.

## Must-haves

- Phone first, then computer. Moon jar design, the same as the website.
- Stage 1 sends nothing anywhere; recent studies are saved only on the phone. No accounts, analytics or tracking.
- Sentence case, no exclamation marks, no emoji. "the Word," meaning Scripture, keeps its capital.
- A small link back to the website at the bottom.

## Not in stage 1

- AI suggestions, the Bible text, printing, accounts, collecting group members' answers, reminders or notifications for the reading plan.

## Name

"Living in the Word" (the owner's choice, October 25, 2026). A web search found no app with this name, but there's a sermon podcast called "Living in the Word" (Pastor Anita Harrington) and a ministry called "Life in the Word." Search again, and do a trademark search, before stage 3.

## How we'll know it works

- Type "John 4:1-26," get the Discovery Bible Study questions, switch to the Swedish method, edit one question, and share it to a chat: the chat shows the passage and the questions as plain text.
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
2. Type a passage, choose a method, see and edit the questions. Built October 25, 2026 (not saved yet; edits last while the page is open). Check: try it with a real passage for your group, and fix any wording.
3. The AI helper, moved up on October 25, 2026. Its own steps, A to D, are in `AI-PLAN.md`: the plan, sign-ups, the server with a side-by-side model test, then the "Suggest questions" button.
4. Share and Copy. Built October 25, 2026 (pull request 45): the passage, the method's name and the numbered questions as plain text, never the note for the leader; empty questions are left out. Share uses the phone's share menu (`navigator.share`) and is hidden where it isn't available (most computers); Copy uses the clipboard, then an older way, and if a browser blocks both it shows the text to select by hand. Not yet checked in KakaoTalk's built-in browser (Claude can't open KakaoTalk). Check: share a study to yourself in KakaoTalk, from Chrome and from inside KakaoTalk.
5. Lead the study, one question at a time. Check: lead from your phone or a laptop.
6. Recent studies saved on the phone. Check: close the browser, reopen it, they're there.
6b. Reading plan: set a plan, see today's reading and questions, mark it done, and come back the next day (the owner chose to put it right after saving, October 25, 2026). Moved up and built October 25, 2026, at the owner's request (pull request 43): a start screen ("Prepare a study" or "Today's reading"); choose a book, 1 to 3 chapters a day and a start date; "Reading 3 of 28: Matthew 3" with three Swedish-method questions; "Done for today"; "Read the next one now"; missed days wait; saved on the phone. AI questions for each reading come next (AI-PLAN.md, step E). Check: set a plan for a book you're reading and use it for a few days.
7. A page that prints cleanly.

## Open questions (ask one at a time)

- The exact question wording for each method: drafted in step 2 (see "Question methods"), waiting for the owner's review.
