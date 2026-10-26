// Living in the Word: the small server for the AI helper (a Cloudflare Worker).
//
// What it does: the app sends a passage name (like "John 4:1-26"), whether it's for
// a group study or the reading plan, and the passcode. This server checks the passcode,
// checks that the passage really is a Bible passage and that today's limits aren't used up,
// asks Claude (Anthropic's AI) for 5 questions about it, and sends them back.
// It can also send back the passage itself, from Crossway's free ESV API (see "The Bible text" below).
//
// Why a server: the website is public, so a key in the app could be copied.
// The keys and the passcode are NOT in this file. They're saved in Cloudflare's
// dashboard as secrets named ANTHROPIC_API_KEY, ESV_API_KEY and PASSCODE (see AI-PLAN.md).
// The daily counts are in a Cloudflare D1 database connected as DB (see "Daily limits").
//
// How to update it: copy this whole file into the Worker's code editor in
// Cloudflare's dashboard, then Deploy. Keep this copy in the repository the same.


// ---------- The guidance sent with every request ----------
// Anything it asks the AI to tell the leader goes in the "note for the leader"
// (see leader_note below), shown above the questions in the app and never shared.
// Written by the owner on October 25, 2026, with two small additions he chose:
// the line about following the named pastors' tone, not their positions, and
// the "sees them" fix. Three more after the first real test, October 26, 2026:
// short questions that ask one thing, correct grammar, and no quotes, not even
// short phrases. Then "When a passage tells of suffering, violence or evil" (the owner
// asked, October 26, 2026, after a Matthew 2 question named the children killed in
// Bethlehem and turned to another topic in the same breath).
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
- If the group can't follow the passage without one fact of background, give it to the leader in one plain sentence.

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
- Keep each question short: one or two plain sentences that ask one thing. Don't stack several questions into one.
- Use correct grammar. Read each question once more before you finish.

When a passage tells of suffering, violence or evil
Some passages tell of terrible things: baby boys killed on a king's orders (Exodus 1, Matthew 2), a woman handed over to a mob and raped all night (Judges 19), the killing of enemies (Esther 9), war, abuse, slavery and grief. Handle them the way a caring pastor sits with a grieving family: slowly, honestly and gently. Someone in the group may have lost a child, survived abuse or violence, or carry wounds like these, and the way the questions treat the passage tells them whether God and his people take that pain seriously.
- Give it the weight the Bible gives it. Name what happened plainly and soberly, without graphic detail, and without softening it or hurrying past it.
- Stay with it. Let the hard part shape the questions instead of using it as a doorway to another topic. A question that names the tragedy and then turns to something else in the same breath brushes past real people's suffering.
- Make room for lament. The Bible itself grieves: Matthew stops to hear Rachel weeping for her children (Matthew 2:18), and many psalms cry out to God. Here the prayer question can be honest grief, a cry for God's justice, or prayer for people who suffer the same things today. Don't end with a cheerful turn or a quick lesson, which would undo it.
- Notice how the author presents what happened. Telling a story doesn't mean God approves of everything in it. Where the author shows something as evil, as Judges does with its refrain that Israel had no king and everyone did what was right in their own eyes (Judges 17:6, 21:25), help the group see it. Where the text reports violence without saying whether it was right, as in Esther 9, don't celebrate it or make it a model to copy: bring out the context the passage itself gives, and leave room for honest unease. When the passage shows God's own judgment, as in the flood or the fall of Jericho, let it show his holiness and justice the way the text does, never casually, and make clear it isn't a pattern for us to follow.
- Care for the people in the room. Never ask anyone to share their own experience of trauma, never blame the victims or make their suffering a lesson about them, and don't ask what a victim should have done.
- Be honest about the questions the passage raises, like where God was. Don't explain the evil away or force a tidy answer. Show what the passage does reveal about God, such as his justice, his care for the weak and his faithfulness through it, and let hope in Christ be real without making the grief disappear.
- Let the response fit the weight of the passage: lament, comfort for someone who grieves, care for the vulnerable, or trusting God's justice instead of taking revenge, rather than a light task.
- In the note for the leader, give a short heads-up when the passage includes things like the death of children or sexual violence, so the leader can prepare and give people room.

Care with the text
- Never quote verses, not even short phrases. Point to verse numbers ("in verse 10"). People read different translations, so build questions on what the passage says, not on one translation's wording.
- Keep clear the difference between what the text says and what we conclude from it. Don't present an interpretation as if the text said it.
- Don't quote any author, pastor or commentary.
- Many modern Bibles set Mark 16:9–20 and John 7:53–8:11 apart, with a note that the earliest manuscripts don't have them. Point this out to the leader before writing questions on either. Don't build a question on a verse that many modern Bibles leave out of the text or move to a footnote.
- If you don't recognize the passage, or it doesn't exist, say so instead of guessing. If you aren't sure what a passage means, write a question that sends the group back to the text instead of handing them an answer.

Where Christians differ
- Hold firmly to what the creeds and the gospel teach.
- Where faithful evangelicals disagree, such as baptism, the end times, spiritual gifts, women in church leadership, and church government, don't pick a side. Ask open questions that send the group back to the text.
- When a passage teaches God's sovereign choice and grace, as in Ephesians 1 or Romans 9, let the questions bring out plainly what it says. Give full weight to human responsibility wherever the text does too, and don't read election into passages that don't raise it. Speak kindly of Christians who read these passages differently.
- Stay away from partisan politics.

The questions
- Write exactly 5 questions, in the order given below. The reading principles above still apply.`;


// ---------- The order of the 5 questions ----------
// The owner chose no study methods (October 26, 2026): since the AI writes questions for
// each passage, the methods' templates got in the way. Then 5 questions instead of 4, the
// 5th about prayer (October 26, 2026). "study" is for a small group; "personal" is for one
// day of the reading plan. Edit the words between the ` marks.
const PATTERNS = {
  study: `A small group study. Write exactly 5 questions, in this order:
1. One question on what the passage says: what happens, who is involved, or what stands out.
2. One question on what the passage shows about God: the Father, the Son or the Holy Spirit.
3. One question on what it means for our hearts: what we love, trust, fear or hope in, in light of the gospel.
4. One question inviting one concrete response this week.
5. One question on what the group can pray about together, drawn from this passage.`,
  personal: `Personal reading, one day of a reading plan, for one person's quiet time with God, not a group. Speak to the reader as "you." Write exactly 5 questions, in this order:
1. One question that helps the reader notice what this reading says.
2. One question on what it shows about God.
3. One question about the reader's heart: what they love, trust, fear or hope in.
4. One question inviting one way to live it out today.
5. One question that turns the reading into prayer: thanks, trust, lament, repentance or asking.
Keep them short enough to hold in mind through the day.`,
};


// ---------- Models and prices ----------
// The owner chose Sonnet 5.5 on October 26, 2026, after a side-by-side test on John 1.
// The others stay in the list only to price an answer if the model is ever changed.
// Prices in US dollars per million tokens, from https://platform.claude.com/docs/en/about-claude/pricing
// (checked October 25, 2026). Used only to show what each answer cost.
const MODELS = {
  'claude-opus-5-5':   { input: 4,    output: 20 },
  'claude-sonnet-5-5': { input: 2,    output: 10 },
  'claude-haiku-5-5':  { input: 0.10, output: 0.50 },
};
const MODEL = 'claude-sonnet-5-5';

// The longest an answer can be, thinking included (a hard limit that also caps the cost:
// with Opus 5.5, 4,000 tokens is at most 8 cents of writing).
const MAX_TOKENS = 4000;

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
// or "Write new questions." Wrong passcodes are counted too, so nobody can guess the
// passcode by trying thousands of times. The counts start over at midnight Pacific time.
const DAILY_LIMIT_EACH = 20;       // sets of questions for each internet connection
const DAILY_LIMIT_ALL = 60;        // sets of questions for everyone together
const WRONG_PASSCODE_LIMIT = 10;   // wrong passcodes for each internet connection

// The counts are kept in a small Cloudflare database (D1), connected to this Worker under
// the name DB (see AI-PLAN.md). One row a day for everyone, and for each connection:
//   day "2026-10-26", who "everyone" or "questions:9f2c..." or "wrong:9f2c...", count 7
// Each connection gets a scrambled code instead of its internet address, so the address
// itself is never kept. Days before yesterday are deleted.

const TABLE = 'CREATE TABLE IF NOT EXISTS usage (day TEXT NOT NULL, who TEXT NOT NULL, count INTEGER NOT NULL, PRIMARY KEY (day, who))';

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

// The scrambled code for the phone's internet connection. The passcode is mixed in,
// so the code can't be turned back into the address.
async function connectionCode(request, env, day) {
  const address = request.headers.get('CF-Connecting-IP') || 'unknown';
  const data = new TextEncoder().encode(env.PASSCODE + '|' + day + '|' + address);
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', data));
  return [...bytes.slice(0, 12)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Today's counts for the given names, like { everyone: 7, 'questions:9f2c...': 2 }
async function readCounts(env, day, names) {
  const marks = names.map(() => '?').join(', ');
  const read = () => env.DB.prepare('SELECT who, count FROM usage WHERE day = ? AND who IN (' + marks + ')')
    .bind(day, ...names).all();
  let answer;
  try {
    answer = await read();
  } catch (error) {
    // The very first time (or if the table was deleted), make the table, then read again
    if (!/no such table/i.test(String(error && error.message))) throw error;
    await env.DB.prepare(TABLE).run();
    answer = await read();
  }
  const { results } = answer;
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

    // Today's counts for this connection (see "Daily limits"). Without the database,
    // nothing goes further: the limits are what keep the credits safe.
    if (!env.DB) return reply({ error: 'not-set-up' }, 503, cors);
    const day = dayInPacific();
    const code = await connectionCode(request, env, day);
    const mine = 'questions:' + code;
    const wrong = 'wrong:' + code;
    let counts;
    try {
      counts = await readCounts(env, day, [mine, wrong, 'everyone']);
    } catch (error) {
      return reply({ error: 'ai-unavailable' }, 503, cors);
    }

    // Too many wrong passcodes from this connection today: no more tries until tomorrow
    if (counts[wrong] >= WRONG_PASSCODE_LIMIT) return reply({ error: 'too-many-tries' }, 429, cors);

    // The passcode is checked before anything costs money. A wrong one is counted.
    if (!env.PASSCODE || typeof input.passcode !== 'string' || input.passcode !== env.PASSCODE) {
      try {
        await addOne(env, day, [wrong]);
      } catch (error) {
        // Not counted this time; the answer is the same
      }
      return reply({ error: 'wrong-passcode' }, 401, cors);
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
    if (counts[mine] >= DAILY_LIMIT_EACH || counts.everyone >= DAILY_LIMIT_ALL) {
      return reply({ error: 'daily-limit' }, 429, cors);
    }
    let after;
    try {
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
    system: GUIDANCE + '\n\n' + PATTERNS[pattern],
    messages: [{ role: 'user', content: 'Passage: ' + passage }],
    output_config: {
      effort: 'medium',
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
              description: 'A short note for the leader only, never shown to the group: one plain sentence of background the group needs, the note about Mark 16:9-20 or John 7:53-8:11, or a short heads-up when the passage tells of things like the death of children or sexual violence. One or two sentences. Empty if there is nothing to say.',
            },
            questions: {
              type: 'array',
              items: { type: 'string' },
              description: 'Exactly 5 questions, in order. Empty if known_passage is false.',
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
    'Access-Control-Allow-Headers': 'content-type',
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
