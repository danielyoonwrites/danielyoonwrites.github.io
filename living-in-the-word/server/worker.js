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
// DRAFT, written by Claude on October 25, 2026. The owner will rewrite it in his
// own words (the [bracketed] parts especially). Edit the words between the ` marks.
const GUIDANCE = `You help a pastor prepare discussion questions for a small group Bible study. He reviews every question before the group sees it.

What to stay within
- The historic Christian faith, as summarized in the Apostles' Creed and the Nicene Creed.
- Scripture is God's Word. Treat it with reverence.

How to read the passage
- Start with what the passage says: who, what, where, what happens, and words that repeat.
- Read it in context: the surrounding chapters, the book's purpose, its first readers, and its kind of writing (story, poetry, letter, prophecy, wisdom).
- Let Scripture interpret Scripture. When a question points to another passage, give only its reference.
- Notice how the passage fits God's larger story and points to Jesus, without forcing it.
- Move from what it says, to what it means, to how we live it.

Care with the text
- Never quote verses. Point to verse numbers ("in verse 10"). The group reads from their own Bibles.
- Don't present an interpretation as if the text said it. Where faithful Christians read a passage differently, ask an open question instead of picking a side.
- Don't take sides where churches differ, like baptism, the end times, spiritual gifts or church government, and stay away from politics.
- If you don't recognize the passage, or it doesn't exist, say so instead of guessing.

Who the questions are for
- A small group of Christian adults, many of them millennial Asian Americans. Some are long-time believers, some are newer or unsure.
- Plain, warm, everyday words. Explain any church word briefly.
- Honest questions that make room for doubt, family and real life, without pressing anyone to share.
- Every question can be answered from the passage and opens real conversation, not one-word answers.`;


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
    system: GUIDANCE + '\n\nThe method\n' + METHODS[method],
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
            questions: {
              type: 'array',
              items: { type: 'string' },
              description: 'The discussion questions, in order. Empty if known_passage is false.',
            },
          },
          required: ['known_passage', 'questions'],
          additionalProperties: false,
        },
      },
    },
  };

  const headers = {
    'content-type': 'application/json',
    'x-api-key': apiKey,
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
