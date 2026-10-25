// Living in the Word: the small server for the AI helper (a Cloudflare Worker).
//
// What it does: the app sends a passage name (like "John 4:1-26"), a study method
// and the passcode. This server checks the passcode, asks Claude (Anthropic's AI)
// for questions about that passage, and sends the questions back.
//
// Why a server: the website is public, so a key in the app could be copied.
// The AI key and the passcode are NOT in this file. They're saved in Cloudflare's
// dashboard as secrets named ANTHROPIC_API_KEY and PASSCODE (see AI-PLAN.md).
//
// How to update it: copy this whole file into the Worker's code editor in
// Cloudflare's dashboard, then Deploy. Keep this copy in the repository the same.


// ---------- The guidance sent with every request ----------
// Anything it asks the AI to tell the leader goes in the "note for the leader"
// (see leader_note below), shown above the questions in the app and never shared.
// Written by the owner on October 25, 2026, with two small additions he chose:
// the line about following the named pastors' tone, not their positions, and
// the "sees them" fix. Edit the words between the ` marks.
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

Care with the text
- Never quote verses. Point to verse numbers ("in verse 10"). People read different translations, so build questions on what the passage says, not on one translation's wording.
- Keep clear the difference between what the text says and what we conclude from it. Don't present an interpretation as if the text said it.
- Don't quote any author, pastor or commentary.
- Many modern Bibles set Mark 16:9–20 and John 7:53–8:11 apart, with a note that the earliest manuscripts don't have them. Point this out to the leader before writing questions on either. Don't build a question on a verse that many modern Bibles leave out of the text or move to a footnote.
- If you don't recognize the passage, or it doesn't exist, say so instead of guessing. If you aren't sure what a passage means, write a question that sends the group back to the text instead of handing them an answer.

Where Christians differ
- Hold firmly to what the creeds and the gospel teach.
- Where faithful evangelicals disagree, such as baptism, the end times, spiritual gifts, women in church leadership, and church government, don't pick a side. Ask open questions that send the group back to the text.
- When a passage teaches God's sovereign choice and grace, as in Ephesians 1 or Romans 9, let the questions bring out plainly what it says. Give full weight to human responsibility wherever the text does too, and don't read election into passages that don't raise it. Speak kindly of Christians who read these passages differently.
- Stay away from partisan politics.

The method
- Follow the method the leader chose, in its order. Whatever the method, the reading principles above still apply.`;


// ---------- The study methods ----------
// The same three methods as the app (app.js). The AI follows the chosen one's pattern.
const METHODS = {
  dbs: `Discovery Bible Study. Write 5 to 7 questions in this order:
1. One question inviting someone to retell the passage in their own words.
2. One or two questions on what this passage shows about God.
3. One or two questions on what it shows about people.
4. One question on how I will obey it this week.
5. One question on who I will share it with this week.`,
  oia: `Observe, Interpret, Apply (inductive Bible study). Write 6 to 8 questions in this order:
1. Two or three questions on what the passage says (observe).
2. Two or three questions on what it means (interpret).
3. One or two questions on what to do about it (apply).`,
  swedish: `The Swedish method. Write 3 to 6 questions in this order:
1. One or two "Light bulb:" questions about what stands out or shines in this passage.
2. One or two "Question mark:" questions about what is hard to understand in this passage.
3. One or two "Arrow:" questions about how this passage applies to our lives.
Start each question with its symbol's name, like "Light bulb: ...".`,
  // The reading plan: one person's quiet time, one day's reading
  devotional: `Personal reading, one day of a reading plan. These questions are for one person's quiet time with God, not for a group, so speak to the reader as "you." Write 3 or 4 questions in this order:
1. One or two questions that help the reader notice what this reading says, especially about God.
2. One question about the reader's heart: what they love, trust, fear or hope in.
3. One question that turns the reading into a response to God: thanks, trust, repentance or prayer.
Keep them short enough to hold in mind through the day.`,
};


// ---------- Models and prices ----------
// Until the owner picks one after the side-by-side test, the app can ask for any of these.
// Prices in US dollars per million tokens, from https://platform.claude.com/docs/en/about-claude/pricing
// (checked October 25, 2026). Used only to show what each answer cost.
const MODELS = {
  'claude-opus-5-5':   { input: 4,    output: 20 },
  'claude-sonnet-5-5': { input: 2,    output: 10 },
  'claude-haiku-5-5':  { input: 0.10, output: 0.50 },
};
const DEFAULT_MODEL = 'claude-opus-5-5';

// The longest an answer can be, thinking included (a hard limit that also caps the cost:
// with Opus 5.5, 4,000 tokens is at most 8 cents of writing).
const MAX_TOKENS = 4000;

// Only the website (and a local copy while building) may use this server
const ALLOWED_ORIGINS = ['https://danielyoonwrites.github.io', 'http://127.0.0.1:8765'];


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

    // The passcode is checked before anything costs money
    if (!env.PASSCODE || typeof input.passcode !== 'string' || input.passcode !== env.PASSCODE) {
      return reply({ error: 'wrong-passcode' }, 401, cors);
    }

    const passage = typeof input.passage === 'string' ? input.passage.trim() : '';
    const method = input.method;
    const model = input.model === undefined ? DEFAULT_MODEL : input.model;
    if (!passage || passage.length > 80 || !METHODS[method] || !MODELS[model]) {
      return reply({ error: 'bad-request' }, 400, cors);
    }

    let answer;
    try {
      answer = await askClaude(env.ANTHROPIC_API_KEY, model, passage, method);
    } catch (error) {
      return reply({ error: 'ai-unavailable' }, 502, cors);
    }
    return reply(answer, answer.error ? 502 : 200, cors);
  },
};

// Asks Claude for the questions. Plain fetch (no npm), in the format of Anthropic's docs:
// https://platform.claude.com/docs/en/build-with-claude/structured-outputs
async function askClaude(apiKey, model, passage, method) {
  const body = {
    model,
    max_tokens: MAX_TOKENS,
    system: GUIDANCE + '\n\nThe method for this request: ' + METHODS[method],
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
              description: 'A short note for the leader only, never shown to the group: one plain sentence of background the group needs, or the note about Mark 16:9-20 or John 7:53-8:11. Empty if there is nothing to say.',
            },
            questions: {
              type: 'array',
              items: { type: 'string' },
              description: 'The discussion questions, in order. Empty if known_passage is false.',
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

  // Opus and Sonnet: if a safety check declines, Anthropic retries on another model by itself.
  // (Haiku has no such fallback.)
  if (model !== 'claude-haiku-5-5') {
    body.fallbacks = 'default';
    headers['anthropic-beta'] = 'server-side-fallback-2026-07-01';
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const result = await response.json();

  // The monthly spending limit (or a rate limit) was reached
  if (response.status === 429 || (result.error && /usage limits/i.test(result.error.message || ''))) {
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
  const price = MODELS[result.model] || MODELS[model];
  const cost = ((usage.input_tokens || 0) * price.input + (usage.output_tokens || 0) * price.output) / 1e6;

  return {
    knownPassage: parsed.known_passage === true,
    leaderNote: typeof parsed.leader_note === 'string' ? parsed.leader_note.trim() : '',
    questions: Array.isArray(parsed.questions) ? parsed.questions.filter((q) => typeof q === 'string' && q.trim()) : [],
    model: result.model || model,
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
