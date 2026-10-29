// Living in the Word: the small server for the AI helper (a Cloudflare Worker).
//
// What it does: the app sends a passage name (like "John 4:1-26"), whether it's for
// a group study or the reading plan, and either the phone's sign-in (see "Signing in")
// or the passcode. This server checks them, checks that the passage really is a Bible
// passage and that today's limits aren't used up, asks Claude (Anthropic's AI) for 3 to 5
// questions about it, and sends them back.
// It can also send back the passage itself, from Crossway's free ESV API (see "The Bible text" below).
//
// Why a server: the website is public, so a key in the app could be copied.
// The keys and the passcode are NOT in this file. They're saved in Cloudflare's
// dashboard as secrets named ANTHROPIC_API_KEY, ESV_API_KEY and PASSCODE (see AI-PLAN.md),
// and RESEND_API_KEY and OWNER_EMAIL for signing in (see SIGNUP-PLAN.md).
// The daily counts and the sign-ins are in a Cloudflare D1 database connected as DB
// (see "Daily limits" and "Signing in").
//
// How to update it: copy this whole file into the Worker's code editor in
// Cloudflare's dashboard, then Deploy. Keep this copy in the repository the same.


// ---------- The guidance sent with every request ----------
// Anything it asks the AI to tell the leader goes in the "commentary for the leader"
// (leader_note below): one short paragraph, in a fold-out above the questions, never shared.
// Written by the owner on October 25, 2026, with two small additions he chose:
// the line about following the named pastors' tone, not their positions, and
// the "sees them" fix. Three more after the first real test, October 26, 2026:
// short questions that ask one thing, correct grammar, and no quotes, not even
// short phrases. Then "When a passage tells of suffering, violence or evil" (the owner
// asked, October 26, 2026, after a Matthew 2 question named the children killed in
// Bethlehem and turned to another topic in the same breath). After he tried Judges 19
// (October 26, 2026): general words like "sexual violence" instead of graphic terms, only
// what the passage itself shows about God, and 3 to 5 questions that each bring something new.
// Then no questions about God's silence in a tragedy (the owner: they can be traumatizing and
// hurt people's faith; October 26, 2026). Then a short commentary for the leader, one paragraph,
// instead of a one-line note (the owner's choice, October 26, 2026).
// Edit the words between the ` marks.
const GUIDANCE = `Guidance for the AI: Living in the Word

You help Christians prepare discussion questions for a small group Bible study. The small group leader reviews the questions before the group sees them. Read each passage the way a careful, faithful pastor would, then write questions that ordinary believers can answer from their own Bibles.

What we believe about the Bible
- The Bible, as God originally gave it, is the inspired, inerrant Word of the living God. It is true in everything it affirms and is our final authority for what we believe and how we live. Treat it with reverence.
- God spoke through human authors, in their own languages, styles and settings. So a passage means what God, through its human author, meant to say to its first readers. That meaning is single and fixed, yet applicable to our lives in many ways. Our job is to understand that meaning, before understanding what it means “for me.”
- Scripture's main message is clear enough for ordinary believers to understand. Its parts never contradict each other, and together they tell one story centered on Jesus.
- The Holy Spirit, who inspired the Bible, still works through it, helping believers understand it and live it out.

Our theological home
- The historic Christian faith summed up in the Apostles' Creed and the Nicene Creed, and the gospel the Reformation recovered: salvation by grace alone, through faith alone, in Christ alone, as Scripture alone teaches, for the glory of God alone.
- Reformed and evangelical. God is holy and rules over all things, including salvation. We are sinners who cannot save ourselves. Jesus died in our place and rose again, and God freely saves everyone who trusts in him. God's glory is the goal of everything, and our deepest joy is found in him.
- Handle Scripture in the spirit of pastors and scholars like John Piper, Tim Keller and D. A. Carson: God-centered, Christ-exalting, careful with the text and warm toward people. Follow their tone and care, not their positions on the debated topics below. Never name or quote them in the questions.

How to read the passage
Do this work before writing any question. Look for the plain, normal sense: what the words naturally mean in their grammar and historical setting (the grammatical-historical sense), with figures of speech read as figures.
1. Observe first. Notice what the passage actually says: who, what, where, what happens, repeated words, contrasts, commands, promises, questions, and connecting words like "therefore," "because," "but" and "so that." Small words sometimes carry the argument.
2. Let context decide the meaning. Read from near to far: the sentence, the paragraph, the chapter, the book, then the whole Bible. Ask what the author was saying to his first readers, and why.
3. Respect the kind of writing. Read stories as stories, poetry as poetry, proverbs as wise sayings rather than promises, the laws of Moses in light of their fulfillment in Christ, and letters as arguments to follow. Read prophecy and apocalyptic writing with care for their images. A story shows what happened, and not every action in it is a model to copy. Look for what the author is teaching through it.
4. Trace the flow of thought. Find the main statements and how the rest supports them: why, how, so that, therefore. Notice the main verbs and who is acting. When a passage tells what God has done before telling us what to do, keep that order.
5. Handle words with care. A word means what its author uses it to mean in that context. Don't define it by its root, by meanings from later times, or by English words that come from it. Don't pour every possible meaning of a word into one verse. Notice key words the author repeats, and how he uses them.
6. Let Scripture interpret Scripture. Read unclear passages in light of clearer ones, and never set one passage against another. When a question points to another passage, give only its reference, and only if you're sure it fits.
7. Follow the passage's main emphasis. Let what the author stresses most lead the questions, without ignoring the passage's other themes. Don't chase ideas the passage sparks that aren't part of the author's own flow of thought.
8. See how it leads to Christ along the lines the Bible itself draws, since later Scripture shows more of what God meant: promise and fulfillment, and themes like covenant, king, temple, sacrifice and exile. Don't invent hidden symbols or force a connection the text doesn't support.
9. Then move to life: from what it says, to what it meant for the first readers, to what it means for us. Ask what the passage shows about God before asking what it asks of us.

Keep the scholarship behind the scenes
- The group is lay people. Do the careful reading yourself, then write simple questions. Keep Greek and Hebrew, historical background and scholarly debates out of the questions.
- Help people see things in the passage for themselves, so they grow confident reading their own Bibles.
- Background the group needs goes in the commentary for the leader (see the end), not in the questions.

How to apply it
- Aim at the heart, not only behavior: what we love, trust, fear and hope in. Help people notice what they look to instead of God, and how the gospel frees them.
- Grace comes before effort. Obedience grows out of what God has done for us in Christ; it never earns his love. Avoid both moralism (just try harder) and shrugging off sin.
- Aim at worship and joy in God, not just more information. Invite a real response: trust, repentance, thanks, prayer, obedience and love for others.
- Connect the passage to real life: work, family, relationships, and the questions our culture raises.

Who the questions are for
- A small group of Christian adults. Some are long-time believers, some are newer or unsure.
- Many grew up in church, some where faith felt like duty, performance or shame. Make grace clear, and leave room for honesty.
- Write so the long-time church member and the skeptic in the room both feel the passage speaks to them.
- Plain, warm, everyday words. Explain any church word briefly.
- Honest questions that make room for doubt and real struggles, without pressing anyone to share.
- Every question can be answered from the passage and opens real conversation, not one-word answers.
- Keep each question short: one or two plain sentences that ask one thing. Don't stack several questions into one, or offer a list of options to choose from.
- Use correct grammar. Read each question once more before you finish.

When a passage tells of suffering, violence or evil
Some passages tell of terrible things: baby boys killed on a king's orders (Exodus 1, Matthew 2), sexual violence against a woman handed over to a mob (Judges 19), the killing of enemies (Esther 9), war, abuse, slavery and grief. Handle them the way a caring pastor sits with a grieving family: slowly, honestly and gently. Someone in the group may have lost a child, survived abuse or violence, or carry wounds like these, and the way the questions treat the passage tells them whether God and his people take that pain seriously.
- Give it the weight the Bible gives it. Name what happened honestly and soberly, without softening it or hurrying past it, but in general words like "sexual violence," "abuse" or "killed" rather than graphic or crude terms, in the questions and in the commentary for the leader.
- Stay with it. When a question touches the hard part, let it stay there instead of using it as a doorway to another topic: a question that names the tragedy and then turns to something else in the same breath brushes past real people's suffering. When the hard part is one piece of a longer passage, as in Matthew 2, still follow the passage's main emphasis, and give the hard part its own question rather than a passing mention.
- Make room for lament. The Bible itself grieves: Matthew records Rachel weeping for her children (Matthew 2:18), and many psalms cry out to God. Here the prayer question can lead the group into lament, such as honest grief, a cry for God's justice, or prayer for people who suffer the same things today. Choose the one that fits the passage best and ask about it alone. Don't end with a cheerful turn or a quick lesson, which would undo it.
- Notice how the author presents what happened. Telling a story doesn't mean God approves of everything in it. Where the author shows something as evil, as Judges does with its refrain that Israel had no king and everyone did what was right in their own eyes (Judges 17:6, 21:25), help the group see it. Where the text reports violence without saying whether it was right, as in Esther 9, don't celebrate it or make it a model to copy: bring out the context the passage itself gives, and leave room for honest unease. When the passage shows God's own judgment, as in the flood or the fall of Jericho, let it show his holiness and justice the way the text does, never casually, and make clear it isn't a pattern for us to follow.
- Care for the people in the room. Never ask anyone to share their own experience of trauma, never blame the victims or make their suffering a lesson about them, and don't ask what a victim should have done.
- Don't ask about God's silence, where God was, or why he didn't stop it. For someone who has lived through trauma, being asked to dwell on God's silence in a story like this can wound their faith. Show only what the passage itself shows about God, such as his protection of the child Jesus in Matthew 2 or his kindness to the midwives in Exodus 1. When a passage shows little of God directly, as in Judges 19, don't claim it shows his care or protection either: leave the question about God out. Don't explain the evil away or force a tidy answer, and let hope in Christ be real without making the grief disappear.
- Let the response fit the weight of the passage. A light task after a story of cruelty rings hollow; something like comforting someone who grieves, caring for someone vulnerable, or trusting God's justice instead of taking revenge fits better. Ask about one.
- In the commentary for the leader, include a short heads-up when the passage tells of things like the death of children or sexual violence, so the leader can prepare and give people room.

Care with the text
- Never quote verses, not even short phrases. Point to verse numbers ("in verse 10"). People read different translations, so build questions on what the passage says, not on one translation's wording.
- Keep clear the difference between what the text says and what we conclude from it. Don't present an interpretation as if the text said it.
- Don't quote any author, pastor or commentary.
- Many modern Bibles set Mark 16:9–20 and John 7:53–8:11 apart, with a note that the earliest manuscripts don't have them. Point this out in the commentary for the leader before writing questions on either. Don't build a question on a verse that many modern Bibles leave out of the text or move to a footnote.
- If you don't recognize the passage, or it doesn't exist, say so instead of guessing. If you aren't sure what a passage means, write a question that sends the group back to the text instead of handing them an answer.

Where Christians differ
- Hold firmly to what the creeds and the gospel teach.
- Where faithful evangelicals disagree, such as baptism, the end times, spiritual gifts, women in church leadership, and church government, don't pick a side. Ask open questions that send the group back to the text.
- When a passage teaches God's sovereign choice and grace, as in Ephesians 1 or Romans 9, let the questions bring out plainly what it says. Give full weight to human responsibility wherever the text does too, and don't read election into passages that don't raise it. Speak kindly of Christians who read these passages differently.
- Stay away from partisan politics.

The commentary for the leader
- Write one short paragraph for the leader only, about 100 words: four or five short, plain sentences. The group never sees it. Choose what helps most: the passage's main point and how it unfolds, any background the group needs to follow it, and anything the leader should be ready for, like a heads-up on a hard passage or the note on Mark 16:9–20 and John 7:53–8:11. Write it warmly, like a pastor briefing a friend before the study, and don't repeat the questions.

The questions
- Write 3 to 5 questions, in the order given below: only as many as the passage really supports. Each one should bring out something new, so don't ask two questions about the same thing. The reading principles above still apply.`;


// ---------- The order of the questions ----------
// The owner chose no study methods (October 26, 2026): since the AI writes questions for
// each passage, the methods' templates got in the way. Then 5 questions instead of 4, the
// 5th about prayer (October 26, 2026). Then 3 to 5 (the owner's rule, October 26, 2026, after
// Judges 19), so the AI never repeats itself or makes up a question that doesn't fit; the
// first and the last are always written. Then question 2 also asks why what the passage
// shows about God matters there (the owner's words, October 29, 2026, after a Romans 14
// question 2 asked only who Jesus is). "study" is for a small group; "personal" is for one
// day of the reading plan. Edit the words between the ` marks.
const PATTERNS = {
  study: `A small group study. Write 3 to 5 questions, in this order:
1. One question on what the passage says: what happens, who is involved, or what stands out.
2. One question on what the passage shows about God: the Father, the Son or the Holy Spirit. Guide the group a bit: not just who God is, but why that matters in this specific passage.
3. One question on what it means for our hearts: what we love, trust, fear or hope in, in light of the gospel.
4. One question inviting one concrete response this week.
5. One question on what the group can pray about together, drawn from this passage.
Always write the first and the last. Leave out any of the others that would repeat another question or doesn't fit this passage well, rather than making one up.`,
  personal: `Personal reading, one day of a reading plan, for one person's quiet time with God, not a group. Speak to the reader as "you." Write 3 to 5 questions, in this order:
1. One question that helps the reader notice what this reading says.
2. One question on what it shows about God. Guide the reader a bit: not just who God is, but why that matters in this specific reading.
3. One question about the reader's heart: what they love, trust, fear or hope in.
4. One question inviting one way to live it out today.
5. One question that turns the reading into prayer: thanks, trust, lament, repentance or asking.
Always write the first and the last. Leave out any of the others that would repeat another question or doesn't fit this reading well, rather than making one up. Keep them short enough to hold in mind through the day.
Here the commentary for the leader is a short note for the reader instead: speak to them as "you."`,
};


// ---------- Models and prices ----------
// The owner chose Sonnet 5.5 on October 26, 2026, after a side-by-side test on John 1.
// Then Opus 5.5 on October 28, 2026, to see whether its questions go deeper (he wasn't happy
// with their depth). Then Sonnet 5.5 again the same day, to save cost and time (the owner's
// choice), with the two changes Anthropic suggests for JSON answers: EFFORT 'high' and
// THINK_FIRST below. Sonnet costs about half as much per answer as Opus (prices below).
// To go back to Opus: MODEL 'claude-opus-5-5', EFFORT 'medium', THINK_FIRST '' and MAX_TOKENS 4000.
// The others stay in the list only to price an answer if the model is ever changed.
// Prices in US dollars per million tokens, from https://platform.claude.com/docs/en/about-claude/pricing
// (checked again October 28, 2026). Used only to show what each answer cost.
const MODELS = {
  'claude-opus-5-5':   { input: 4,    output: 20 },
  'claude-sonnet-5-5': { input: 2,    output: 10 },
  'claude-haiku-5-5':  { input: 0.10, output: 0.50 },
};
const MODEL = 'claude-sonnet-5-5';

// How much the AI thinks before it writes: 'low', 'medium', 'high', 'xhigh' or 'max'.
// 'high' is Sonnet 5.5's default, 'medium' is Opus 5.5's. From October 26 to 28, 2026, Sonnet
// ran at 'medium', where it often skips thinking when the answer must be JSON.
// https://platform.claude.com/docs/en/build-with-claude/effort
const EFFORT = 'high';

// One line at the very end of the guidance, from Anthropic's Sonnet 5.5 guide ("Reasoning
// tasks with JSON output"): it helps the AI think before it writes a JSON answer.
// https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5
// For Opus 5.5, leave it empty (''): it decides by itself how much to think.
const THINK_FIRST = 'Think the problem through before you answer.';

// The longest an answer can be, thinking included (a hard limit that also caps the cost:
// with Sonnet 5.5, 8,000 tokens is at most 8 cents of writing, the same as 4,000 with Opus).
// The room is for the longer thinking at 'high' effort.
const MAX_TOKENS = 8000;

// Only the website (and a local copy while building) may use this server
const ALLOWED_ORIGINS = ['https://danielyoonwrites.github.io', 'http://127.0.0.1:8765'];


// ---------- Only Bible passages reach the AI ----------
// Before anything costs money, the server checks that the passage looks like a Bible
// passage: a book of the Bible, then chapter and verse numbers, like "John 4:1-26",
// "1 Cor 13", "Psalm 23", "Matthew 5–7" or just "Jude". Anything else (a sentence,
// a question, instructions for the AI) is turned away here, so the AI can't be used
// for other things. The AI still gets the passage exactly as it was typed.

// The 66 books and their chapters, Genesis to Revelation (the same checked list as BOOKS in app.js)
const BOOKS = [
  ['Genesis', 50], ['Exodus', 40], ['Leviticus', 27], ['Numbers', 36], ['Deuteronomy', 34],
  ['Joshua', 24], ['Judges', 21], ['Ruth', 4], ['1 Samuel', 31], ['2 Samuel', 24],
  ['1 Kings', 22], ['2 Kings', 25], ['1 Chronicles', 29], ['2 Chronicles', 36], ['Ezra', 10],
  ['Nehemiah', 13], ['Esther', 10], ['Job', 42], ['Psalms', 150], ['Proverbs', 31],
  ['Ecclesiastes', 12], ['Song of Solomon', 8], ['Isaiah', 66], ['Jeremiah', 52], ['Lamentations', 5],
  ['Ezekiel', 48], ['Daniel', 12], ['Hosea', 14], ['Joel', 3], ['Amos', 9],
  ['Obadiah', 1], ['Jonah', 4], ['Micah', 7], ['Nahum', 3], ['Habakkuk', 3],
  ['Zephaniah', 3], ['Haggai', 2], ['Zechariah', 14], ['Malachi', 4],
  ['Matthew', 28], ['Mark', 16], ['Luke', 24], ['John', 21], ['Acts', 28],
  ['Romans', 16], ['1 Corinthians', 16], ['2 Corinthians', 13], ['Galatians', 6], ['Ephesians', 6],
  ['Philippians', 4], ['Colossians', 4], ['1 Thessalonians', 5], ['2 Thessalonians', 3], ['1 Timothy', 6],
  ['2 Timothy', 4], ['Titus', 3], ['Philemon', 1], ['Hebrews', 13], ['James', 5],
  ['1 Peter', 5], ['2 Peter', 3], ['1 John', 5], ['2 John', 1], ['3 John', 1],
  ['Jude', 1], ['Revelation', 22],
];

// Each book's name squeezed together for matching, like "1corinthians"
const BOOK_KEYS = BOOKS.map(([name]) => name.toLowerCase().replace(/[^a-z0-9]/g, ''));

// Short forms and other names that aren't the start of the book's name. (Any clear start
// of a name, like "Gen", "Rom" or "1 Cor", works without being listed here.) Common short
// forms from the SBL and Chicago style guides, checked through search results only
// (October 26, 2026), plus a few names people use.
const OTHER_NAMES = {
  gn: 'genesis', lv: 'leviticus', nm: 'numbers', dt: 'deuteronomy',
  jgs: 'judges', jdg: 'judges', jdgs: 'judges', sm: 'samuel', kgs: 'kings', jb: 'job',
  pss: 'psalms', prv: 'proverbs', qoh: 'ecclesiastes', qoheleth: 'ecclesiastes',
  sg: 'songofsolomon', songofsongs: 'songofsolomon', cant: 'songofsolomon', canticles: 'songofsolomon',
  dn: 'daniel', jl: 'joel', hb: 'habakkuk', hg: 'haggai',
  mt: 'matthew', mk: 'mark', mrk: 'mark', lk: 'luke', jn: 'john', jhn: 'john',
  phil: 'philippians', phlm: 'philemon', phm: 'philemon', tm: 'timothy',
  jas: 'james', pt: 'peter', rv: 'revelation', revelations: 'revelation',
};

// Returns the book's number in BOOKS (0 for Genesis), or -1 if it isn't a book.
// number is '', '1', '2' or '3'; name is letters only, like "cor".
function findBook(number, name) {
  const exact = BOOK_KEYS.indexOf(number + name);
  if (exact >= 0) return exact;
  if (OTHER_NAMES[name]) return BOOK_KEYS.indexOf(number + OTHER_NAMES[name]);
  if (name.length < 2) return -1;
  // The start of exactly one book's name, like "gen" or "1 cor" ("jo" could be five books)
  const starts = BOOK_KEYS.filter((key) => key.startsWith(number + name));
  return starts.length === 1 ? BOOK_KEYS.indexOf(starts[0]) : -1;
}

// "First John", "1st John" and "I John" all mean 1 John
const NUMBER_WORDS = { first: '1', '1st': '1', i: '1', second: '2', '2nd': '2', ii: '2', third: '3', '3rd': '3', iii: '3' };

// True if the text looks like one or more Bible passages
function looksLikePassage(text) {
  const tidy = text.toLowerCase()
    .replace(/[–—]/g, '-')                               // dashes
    .replace(/\s+(?:to|through|thru)\s+(?=\d)/g, '-')    // "5 to 7"
    .replace(/\b(?:chapters?|chap\.)\s*(?=\d)/g, ' ')    // "John chapter 3"
    .replace(/\s*\b(?:verses?|vv?\.?)\s*(?=\d)/g, ':')   // "John 3 verse 16"
    .replace(/(\d)\.(?=\d)/g, '$1:')                     // "John 3.16"
    .replace(/(\d)[abc]\b/g, '$1')                       // "John 3:16a"
    .replace(/,\s*(?=[a-z])|\s+and\s+/g, ';')            // "John 3, Romans 5"
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.$/, '');                                // "John 3:16."
  if (!tidy) return false;

  let book = -1;
  return tidy.split(';').every((part, index) => {
    // [a number word, like "First" or "II"] [or a number, like "1"] [the book's name] [the numbers]
    const match = /^(?:(?:(first|second|third|1st|2nd|3rd|i{1,3})\s+|([123])\s*)?([a-z][a-z.\s]*?))?\s*(\d[\d\s:,-]*)?$/.exec(part.trim());
    if (!match) return false;
    const [, numberWord, digit, nameWords, place] = match;
    if (nameWords) {
      const number = digit || NUMBER_WORDS[numberWord] || '';
      book = findBook(number, nameWords.replace(/[^a-z]/g, ''));
      if (book < 0) return false;
    } else if (index === 0 || !place) {
      return false;   // numbers alone need a book before them, like "John 3; 4:1-10"
    }
    if (!place) return true;   // a whole book, like "Jude" or "Ruth"

    // Numbers joined by ":", ",", "-" (like "3:16-18, 21" or "5-7"), each 1 to 200
    const spots = place.trim();
    if (!/^\d+(?:\s*[:,-]\s*\d+)*$/.test(spots)) return false;
    if (spots.match(/\d+/g).some((n) => n < 1 || n > 200)) return false;

    // The chapter numbers must be in the book. Without ":", every number is a chapter
    // ("Matthew 5-7"); with ":", the numbers before a ":" are chapters ("Genesis 1:1-2:3").
    // Books of one chapter skip this: "Jude 3" means verse 3.
    const chapters = BOOKS[book][1];
    if (chapters === 1) return true;
    const chapterNumbers = spots.includes(':') ? (spots.match(/\d+(?=\s*:)/g) || []) : spots.match(/\d+/g);
    return chapterNumbers.every((n) => Number(n) <= chapters);
  });
}


// ---------- Daily limits ----------
// How many sets of questions the AI may write each day, so nobody can use up the credits
// (the owner's choice, October 26, 2026). Every set counts: a study, a reading-plan day,
// or "Write new questions." Someone signed in has their own count, wherever they are
// (the owner's choice, October 28, 2026); a phone using the passcode counts with its
// internet connection. Wrong passcodes and wrong sign-in codes are counted too, so nobody
// can guess them by trying thousands of times. The counts start over at midnight Pacific time.
const DAILY_LIMIT_EACH = 20;       // sets of questions for each person signed in, or each internet connection using the passcode
const DAILY_LIMIT_ALL = 60;        // sets of questions for everyone together
const WRONG_LIMIT = 10;            // wrong passcodes or sign-in codes from each internet connection

// The counts are kept in a small Cloudflare database (D1), connected to this Worker under
// the name DB (see AI-PLAN.md). One row a day for everyone, and for each person or connection:
//   day "2026-10-26", who "everyone", "person:dan@example.com", "questions:9f2c...",
//   "wrong:9f2c...", "codes:dan@example.com", "code-asks:9f2c..." or "emails", count 7
// Each connection gets a scrambled code instead of its internet address, so the address
// itself is never kept. Days before yesterday are deleted.

// The database's tables. The server makes any that are missing (see makeTables).
//   usage: the daily counts above
//   people: who may sign in besides the owner (the owner's page adds them, sign-up step S4)
//   codes: sign-in codes, kept only scrambled, one at a time for each email address
//   sessions: one row for each signed-in phone, its key kept only scrambled
const TABLES = [
  'CREATE TABLE IF NOT EXISTS usage (day TEXT NOT NULL, who TEXT NOT NULL, count INTEGER NOT NULL, PRIMARY KEY (day, who))',
  "CREATE TABLE IF NOT EXISTS people (email TEXT PRIMARY KEY, name TEXT NOT NULL DEFAULT '', invited TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1)",
  'CREATE TABLE IF NOT EXISTS codes (email TEXT PRIMARY KEY, code TEXT NOT NULL, expires INTEGER NOT NULL, tries INTEGER NOT NULL DEFAULT 0)',
  'CREATE TABLE IF NOT EXISTS sessions (key TEXT PRIMARY KEY, email TEXT NOT NULL, expires INTEGER NOT NULL)',
];

// Makes the tables the first time they're needed, then remembers they're there until
// Cloudflare restarts the Worker. ("IF NOT EXISTS" leaves tables that are already there alone.)
let tablesMade = false;
async function makeTables(env) {
  if (tablesMade) return;
  for (const sql of TABLES) await env.DB.prepare(sql).run();
  tablesMade = true;
}

// The date in Pacific time, like "2026-10-26" (in UTC if the time zone isn't available)
function dayInPacific(time = Date.now()) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date(time));
    const part = (type) => parts.find((p) => p.type === type).value;
    return part('year') + '-' + part('month') + '-' + part('day');
  } catch (error) {
    return new Date(time).toISOString().slice(0, 10);
  }
}

// Scrambles text one way (SHA-256), so what's kept can't be turned back into the original
async function scramble(text) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// The scrambled code for the phone's internet connection. The passcode is mixed in,
// so the code can't be turned back into the address.
async function connectionCode(request, env, day) {
  const address = request.headers.get('CF-Connecting-IP') || 'unknown';
  return (await scramble(env.PASSCODE + '|' + day + '|' + address)).slice(0, 24);
}

// Today's counts for the given names, like { everyone: 7, 'questions:9f2c...': 2 }
async function readCounts(env, day, names) {
  const marks = names.map(() => '?').join(', ');
  const { results } = await env.DB.prepare('SELECT who, count FROM usage WHERE day = ? AND who IN (' + marks + ')')
    .bind(day, ...names).all();
  const counts = {};
  names.forEach((name) => { counts[name] = 0; });
  results.forEach((row) => { counts[row.who] = row.count; });
  return counts;
}

// Adds one to each count, then reads them back, all in one step: D1 runs a batch as one
// transaction, one at a time, so requests arriving together still get different numbers
// and can't slip past a limit together. Also deletes the days before yesterday.
async function addOne(env, day, names) {
  const steps = [];
  names.forEach((name) => {
    steps.push(env.DB.prepare('INSERT OR IGNORE INTO usage (day, who, count) VALUES (?, ?, 0)').bind(day, name));
    steps.push(env.DB.prepare('UPDATE usage SET count = count + 1 WHERE day = ? AND who = ?').bind(day, name));
  });
  steps.push(env.DB.prepare('DELETE FROM usage WHERE day < ?').bind(dayInPacific(Date.now() - 86400000)));
  const marks = names.map(() => '?').join(', ');
  steps.push(env.DB.prepare('SELECT who, count FROM usage WHERE day = ? AND who IN (' + marks + ')').bind(day, ...names));
  const results = await env.DB.batch(steps);
  const counts = {};
  results[results.length - 1].results.forEach((row) => { counts[row.who] = row.count; });
  return counts;
}


// ---------- Signing in (sign-up step S3, see SIGNUP-PLAN.md) ----------
// Instead of the shared passcode, a person types their email address, gets a 6-digit code
// by email and types it into the app. That phone then gets a long random key of its own
// (a "session"), which the app sends with each request. Only the owner (his address is saved
// in Cloudflare as the secret OWNER_EMAIL) and the people he invites can sign in. While
// sign-ups are being built, the passcode still works too (it goes away in step S6).
// The emails go out through Resend (resend.com), with a key saved in Cloudflare as the
// secret RESEND_API_KEY. Nothing about a person is ever sent to the AI.
const EMAIL_FROM = 'Living in the Word <sign-in@mail.danielyoonwrites.com>';
const CODE_MINUTES = 10;    // a code works for 10 minutes
const CODE_TRIES = 5;       // and for 5 tries
const SESSION_DAYS = 90;    // a phone stays signed in for about 90 days
const CODES_EACH = 5;       // codes a day for each email address
const CODE_ASKS_EACH = 30;  // codes asked for a day from each internet connection (a group on one Wi-Fi shares it)
const EMAILS_ALL = 90;      // sign-in emails a day for everyone (Resend's free plan sends 100 a day)
const SIGNED_OUT = 'signed-out';

// An email address in lowercase, or '' if it doesn't look like one
function cleanEmail(text) {
  if (typeof text !== 'string') return '';
  const email = text.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

// True if this address may sign in: the owner's, or one he invited and hasn't turned off
async function mayUseApp(env, email) {
  if (email && email === cleanEmail(env.OWNER_EMAIL)) return true;
  const person = await env.DB.prepare('SELECT active FROM people WHERE email = ?').bind(email).first();
  return Boolean(person && person.active === 1);
}

// A 6-digit code, every one equally likely. (4,294,000,000 is a whole number of millions,
// so the rare numbers above it are skipped instead of making some codes likelier.)
function newCode() {
  const number = new Uint32Array(1);
  do {
    crypto.getRandomValues(number);
  } while (number[0] >= 4294000000);
  return String(number[0] % 1000000).padStart(6, '0');
}

// A long random key for a signed-in phone: 64 letters and numbers, impossible to guess
function newKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// The session key the app sent, from the Authorization header, or '' if there isn't one
function sessionKey(request) {
  return (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
}

// Who's signed in on the phone that sent this request: their email address; '' if the
// request carries no session key; or SIGNED_OUT if the key is wrong, ran out, or belongs
// to someone the owner turned off
async function signedInPerson(request, env) {
  const key = sessionKey(request);
  if (!key) return '';
  if (!/^[0-9a-f]{64}$/.test(key)) return SIGNED_OUT;
  const session = await env.DB.prepare('SELECT email, expires FROM sessions WHERE key = ?')
    .bind(await scramble(key)).first();
  if (!session || session.expires < Date.now()) return SIGNED_OUT;
  return (await mayUseApp(env, session.email)) ? session.email : SIGNED_OUT;
}

// "Email me a code": sends a new code to an address that may sign in. The answer is the
// same for any address, so nobody can use it to find out who's invited.
async function sendCode(input, request, env, cors) {
  const email = cleanEmail(input.email);
  if (!email) return reply({ error: 'bad-email' }, 400, cors);
  if (!env.RESEND_API_KEY || !cleanEmail(env.OWNER_EMAIL)) return reply({ error: 'not-set-up' }, 503, cors);

  const day = dayInPacific();
  const asks = 'code-asks:' + await connectionCode(request, env, day);
  if ((await addOne(env, day, [asks]))[asks] > CODE_ASKS_EACH) return reply({ error: 'too-many-codes' }, 429, cors);
  if (!(await mayUseApp(env, email))) return reply({ sent: true }, 200, cors);

  const mine = 'codes:' + email;
  const counts = await addOne(env, day, [mine, 'emails']);
  if (counts[mine] > CODES_EACH || counts.emails > EMAILS_ALL) return reply({ error: 'too-many-codes' }, 429, cors);

  // A new code replaces any earlier one for this address. Only a scrambled copy is kept.
  const code = newCode();
  await env.DB.batch([
    env.DB.prepare('DELETE FROM codes WHERE expires < ?').bind(Date.now()),
    env.DB.prepare('INSERT OR REPLACE INTO codes (email, code, expires, tries) VALUES (?, ?, ?, 0)')
      .bind(email, await scramble(email + '|' + code), Date.now() + CODE_MINUTES * 60000),
  ]);
  const problem = await emailCode(env.RESEND_API_KEY, email, code);
  // Resend's reason goes back too, so the test link can show it (like a web address
  // that isn't verified yet). It never holds a key.
  if (problem) return reply({ error: 'email-failed', detail: problem }, 502, cors);
  return reply({ sent: true }, 200, cors);
}

// The email with the code, sent through Resend's API. The request is the same one
// Resend's own code library sends (github.com/resend/resend-node, read October 28, 2026).
// Returns '' when it's sent, or else Resend's reason.
async function emailCode(apiKey, email, code) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'authorization': 'Bearer ' + apiKey,
        'content-type': 'application/json',
        'user-agent': 'living-in-the-word',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [email],
        subject: code + ' is your Living in the Word code',
        text: 'Your code to sign in to Living in the Word:\n\n' + code + '\n\n' +
          'Type it into the app within ' + CODE_MINUTES + ' minutes. If you didn’t ask for it, you can ignore this email.',
      }),
    });
    if (response.ok) return '';
    const answer = await response.json().catch(() => ({}));
    return String(answer.message || 'Resend answered ' + response.status)
      .replace(/re_\w+/g, 're_…')   // never pass on anything that looks like a Resend key
      .slice(0, 200);
  } catch (error) {
    return 'Resend couldn’t be reached';
  }
}

// "Sign in": checks the code, and gives the phone its own session key. Each check uses up
// one of the code's tries before the code is compared, so tries sent at the same moment
// can't add up to more than CODE_TRIES.
async function checkCode(input, request, env, cors) {
  const email = cleanEmail(input.email);
  const code = typeof input.code === 'string' ? input.code.replace(/\D/g, '') : '';
  if (!email || code.length !== 6) return reply({ error: 'wrong-code' }, 400, cors);

  const day = dayInPacific();
  const wrong = 'wrong:' + await connectionCode(request, env, day);
  if ((await readCounts(env, day, [wrong]))[wrong] >= WRONG_LIMIT) return reply({ error: 'too-many-tries' }, 429, cors);

  const [, found] = await env.DB.batch([
    env.DB.prepare('UPDATE codes SET tries = tries + 1 WHERE email = ?').bind(email),
    env.DB.prepare('SELECT code, expires, tries FROM codes WHERE email = ?').bind(email),
  ]);
  const saved = found.results[0];
  if (!saved || saved.expires < Date.now() || saved.tries > CODE_TRIES) return reply({ error: 'code-expired' }, 401, cors);
  if (saved.code !== await scramble(email + '|' + code)) {
    await addOne(env, day, [wrong]);
    return reply({ error: 'wrong-code', triesLeft: CODE_TRIES - saved.tries }, 401, cors);
  }
  // The owner may have turned this person off since the code was sent
  if (!(await mayUseApp(env, email))) return reply({ error: 'code-expired' }, 401, cors);

  // The right code: it's used up, old sessions are cleared out, and this phone gets its key.
  // Only a scrambled copy of the key is kept, so the database alone can't sign anyone in.
  const key = newKey();
  await env.DB.batch([
    env.DB.prepare('DELETE FROM codes WHERE email = ?').bind(email),
    env.DB.prepare('DELETE FROM sessions WHERE expires < ?').bind(Date.now()),
    env.DB.prepare('INSERT INTO sessions (key, email, expires) VALUES (?, ?, ?)')
      .bind(await scramble(key), email, Date.now() + SESSION_DAYS * 86400000),
  ]);
  return reply({ session: key, email }, 200, cors);
}

// "Sign out": this phone's key stops working
async function signOut(request, env, cors) {
  const key = sessionKey(request);
  if (/^[0-9a-f]{64}$/.test(key)) {
    await env.DB.prepare('DELETE FROM sessions WHERE key = ?').bind(await scramble(key)).run();
  }
  return reply({ signedOut: true }, 200, cors);
}


// ---------- The Bible text (ESV) ----------
// The passage itself, shown in the app above the questions. It comes from Crossway's
// ESV API (https://api.esv.org), free for non-commercial use, with a key saved in
// Cloudflare as a secret named ESV_API_KEY. Crossway's rules (read October 26, 2026):
// no more than 500 verses, or half of any book, at a time; never change the words;
// show "(ESV)" with the text, the copyright notice and a link to esv.org (the app does).
// The AI is never sent the ESV text: Crossway's rules don't say whether that's allowed.
const ESV_URL = 'https://api.esv.org/v3/passage/text/';

// Chapters in each book, Genesis to Revelation (from BOOKS above),
// used to keep each answer under half a book
const CHAPTERS = BOOKS.map(([, chapters]) => chapters);

// Asks Crossway for the passage as plain text, with verse numbers like [12]. No headings,
// no footnotes, and "(ESV)" at the end, which their docs say fulfills the copyright display.
async function getEsvText(key, passage) {
  if (!key) return { error: 'text-not-set-up' };
  const query = new URLSearchParams({
    q: passage,
    'include-passage-references': 'false',
    'include-headings': 'false',
    'include-footnotes': 'false',
    'include-short-copyright': 'true',
    'indent-paragraphs': '0',
    'indent-poetry-lines': '2',
  });
  const response = await fetch(ESV_URL + '?' + query, {
    headers: { authorization: 'Token ' + key },
  });
  if (!response.ok) return { error: 'text-unavailable' };
  const data = await response.json();
  const text = Array.isArray(data.passages) ? data.passages.join('\n\n').trim() : '';
  if (!text || !Array.isArray(data.parsed) || !data.parsed.length) return { error: 'unknown-passage' };
  if (tooLong(data.parsed, text)) return { error: 'too-long' };
  return { canonical: data.canonical || passage, text };
}

// Crossway's limit: no more than 500 verses, or more than half of any book.
// Verses are counted by their numbers, like [12]. Half a book is counted in chapters
// (a careful measure: part of a chapter counts as a whole one). Books of one or two
// chapters may be shown whole, as Crossway's rules allow for them.
// Crossway numbers each verse like 43004001: book 43 (John), chapter 4, verse 1.
function tooLong(parsed, text) {
  if ((text.match(/\[\d+\]/g) || []).length > 500) return true;
  const chaptersPerBook = {};
  for (const [start, end] of parsed) {
    const book = Math.floor(start / 1000000);
    if (Math.floor(end / 1000000) !== book) return true;   // runs into another book
    const first = Math.floor(start / 1000) % 1000;
    const last = Math.floor(end / 1000) % 1000;
    chaptersPerBook[book] = (chaptersPerBook[book] || 0) + (last - first + 1);
  }
  return Object.keys(chaptersPerBook).some((book) => {
    const total = CHAPTERS[book - 1];
    return !total || (total > 2 && chaptersPerBook[book] * 2 > total);
  });
}


// ---------- Answering the app ----------

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const cors = corsHeaders(origin);

    // The browser asks first whether it may send (a "preflight" check)
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: ALLOWED_ORIGINS.includes(origin) ? 204 : 403, headers: cors });
    }
    if (request.method !== 'POST') return reply({ error: 'not-found' }, 404, cors);
    if (!ALLOWED_ORIGINS.includes(origin)) return reply({ error: 'not-allowed' }, 403, cors);

    let input;
    try {
      input = await request.json();
    } catch (error) {
      return reply({ error: 'bad-request' }, 400, cors);
    }
    // Only a { ... } message from the app (a bare "null" used to crash the server)
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return reply({ error: 'bad-request' }, 400, cors);
    }

    // Without the database, nothing goes further: the limits are what keep the credits safe
    // (see "Daily limits"), and the sign-ins are kept there too.
    if (!env.DB) return reply({ error: 'not-set-up' }, 503, cors);
    const day = dayInPacific();
    let mine;   // the name of the daily count for this person, or for this connection
    try {
      await makeTables(env);

      // Signing in and out (see "Signing in")
      if (input.action === 'send-code') return await sendCode(input, request, env, cors);
      if (input.action === 'check-code') return await checkCode(input, request, env, cors);
      if (input.action === 'sign-out') return await signOut(request, env, cors);

      // Who's asking is checked before anything costs money: someone signed in on this
      // phone, or a phone with the passcode
      const person = await signedInPerson(request, env);
      if (person === SIGNED_OUT) return reply({ error: 'signed-out' }, 401, cors);
      if (person) {
        mine = 'person:' + person;
      } else {
        const code = await connectionCode(request, env, day);
        const wrong = 'wrong:' + code;
        // Too many wrong tries from this connection today: no more until tomorrow
        if ((await readCounts(env, day, [wrong]))[wrong] >= WRONG_LIMIT) return reply({ error: 'too-many-tries' }, 429, cors);
        // A wrong passcode is counted
        if (!env.PASSCODE || typeof input.passcode !== 'string' || input.passcode !== env.PASSCODE) {
          try {
            await addOne(env, day, [wrong]);
          } catch (error) {
            // Not counted this time; the answer is the same
          }
          return reply({ error: 'wrong-passcode' }, 401, cors);
        }
        mine = 'questions:' + code;
      }
    } catch (error) {
      return reply({ error: 'ai-unavailable' }, 503, cors);
    }

    const passage = typeof input.passage === 'string' ? input.passage.trim() : '';
    // The reading plan asks for "personal" questions. (Older copies of the app sent a
    // study method's name, or personal: true; those still work.)
    const pattern = input.method === 'personal' || input.personal === true ? 'personal' : 'study';
    if (!passage || passage.length > 80) {
      return reply({ error: 'bad-request' }, 400, cors);
    }

    // Only Bible passages go any further, so the AI can't be used for anything else
    // (see "Only Bible passages reach the AI"). The app shows "didn't recognize that passage."
    if (!looksLikePassage(passage)) {
      const notAPassage = input.want === 'text' ? { error: 'unknown-passage' } : { knownPassage: false, leaderNote: '', questions: [] };
      return reply(notAPassage, 400, cors);
    }

    // The app asks for the passage itself separately, so it can show while the AI writes
    if (input.want === 'text') {
      let text;
      try {
        text = await getEsvText(env.ESV_API_KEY, passage);
      } catch (error) {
        text = { error: 'text-unavailable' };
      }
      return reply(text, text.error ? 502 : 200, cors);
    }

    // Today's limits, before the AI is asked. A set is counted even if the AI then fails.
    let after;
    try {
      const counts = await readCounts(env, day, [mine, 'everyone']);
      if (counts[mine] >= DAILY_LIMIT_EACH || counts.everyone >= DAILY_LIMIT_ALL) {
        return reply({ error: 'daily-limit' }, 429, cors);
      }
      after = await addOne(env, day, [mine, 'everyone']);
    } catch (error) {
      return reply({ error: 'ai-unavailable' }, 503, cors);
    }
    // Requests that arrived together are checked again with their own numbers
    if (after[mine] > DAILY_LIMIT_EACH || after.everyone > DAILY_LIMIT_ALL) {
      return reply({ error: 'daily-limit' }, 429, cors);
    }

    let answer;
    try {
      answer = await askClaude(env.ANTHROPIC_API_KEY, passage, pattern);
    } catch (error) {
      return reply({ error: 'ai-unavailable' }, 502, cors);
    }
    return reply(answer, answer.error ? 502 : 200, cors);
  },
};

// Asks Claude for the questions. Plain fetch (no npm), in the format of Anthropic's docs:
// https://platform.claude.com/docs/en/build-with-claude/structured-outputs
async function askClaude(apiKey, passage, pattern) {
  const body = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: GUIDANCE + '\n\n' + PATTERNS[pattern] + (THINK_FIRST ? '\n\n' + THINK_FIRST : ''),
    messages: [{ role: 'user', content: 'Passage: ' + passage }],
    output_config: {
      effort: EFFORT,
      // The answer comes back as JSON in this shape
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            known_passage: {
              type: 'boolean',
              description: 'False if the passage reference is not a real Bible passage you recognize.',
            },
            leader_note: {
              type: 'string',
              description: 'The commentary for the leader, never shown to the group: one short paragraph, about 100 words in four or five short sentences, on the passage\'s main point, the background needed, and anything to be ready for (like a heads-up on a hard passage, or the note about Mark 16:9-20 or John 7:53-8:11). For a reading plan, a short note for the reader. Empty if known_passage is false.',
            },
            questions: {
              type: 'array',
              items: { type: 'string' },
              description: '3 to 5 questions, in order. Empty if known_passage is false.',
            },
          },
          required: ['known_passage', 'leader_note', 'questions'],
          additionalProperties: false,
        },
      },
    },
  };

  // The key goes in the Authorization header, as Anthropic's docs show:
  // https://platform.claude.com/docs/en/manage-claude/authentication
  // (The key must be tied to one workspace when it's made, or another header is needed.)
  const headers = {
    'content-type': 'application/json',
    'authorization': 'Bearer ' + apiKey,
    'anthropic-version': '2026-10-21',
  };

  // No automatic retry on another model when a safety check declines (removed October 26, 2026).
  // For Sonnet 5.5 it only retried declines about cybersecurity or building other AI models,
  // never Bible questions, so it could only help someone misusing the app. A decline shows
  // the general questions instead.
  // https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const result = await response.json();

  // The monthly spending limit, a rate limit, or the month's credits were used up
  if (response.status === 429 || (result.error && /usage limits|credit balance/i.test(result.error.message || ''))) {
    return { error: 'limit-reached' };
  }
  if (!response.ok) return { error: 'ai-unavailable' };
  if (result.stop_reason === 'refusal') return { error: 'declined' };
  if (result.stop_reason === 'max_tokens') return { error: 'too-long' };

  // The JSON is in the text part of the answer (thinking parts come first and are skipped)
  const text = (result.content || []).filter((block) => block.type === 'text').map((block) => block.text).join('');
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return { error: 'ai-unavailable' };
  }

  const usage = result.usage || {};
  const price = MODELS[result.model] || MODELS[MODEL];
  const cost = ((usage.input_tokens || 0) * price.input + (usage.output_tokens || 0) * price.output) / 1e6;

  return {
    knownPassage: parsed.known_passage === true,
    leaderNote: typeof parsed.leader_note === 'string' ? parsed.leader_note.trim() : '',
    questions: Array.isArray(parsed.questions) ? parsed.questions.filter((q) => typeof q === 'string' && q.trim()) : [],
    model: result.model || MODEL,
    inputTokens: usage.input_tokens || 0,
    outputTokens: usage.output_tokens || 0,
    cost,   // in US dollars, like 0.031
  };
}

function corsHeaders(origin) {
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
  if (ALLOWED_ORIGINS.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function reply(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'content-type': 'application/json' },
  });
}
