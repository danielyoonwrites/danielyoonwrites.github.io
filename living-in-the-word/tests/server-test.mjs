// Checks for the server (server/worker.js): signing in, the owner's page (sign-up step S4)
// and the invite email, with stand-ins for Cloudflare D1 (Node's own SQLite), Resend and
// Anthropic. Nothing real is called. Written October 29, 2026; see PROGRESS.md, "How to run
// and check it." Run from the repository folder: node living-in-the-word/tests/server-test.mjs
// Needs Node 22 or newer (for node:sqlite). Success ends with "... passed, 0 failed".
import { DatabaseSync } from 'node:sqlite';
import { copyFileSync, mkdtempSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import os from 'node:os';
import path from 'node:path';

// worker.js is copied to a temporary folder as a module (.mjs), so Node can load it
const source = fileURLToPath(new URL('../server/worker.js', import.meta.url));
const work = mkdtempSync(path.join(os.tmpdir(), 'living-in-the-word-tests-'));
copyFileSync(source, path.join(work, 'worker.mjs'));

// ---- D1 stand-in: prepare/bind/first/run/all, and batch as one transaction
export function makeD1() {
  const db = new DatabaseSync(':memory:');
  class Statement {
    constructor(sql, params = []) { this.sql = sql; this.params = params; }
    bind(...params) { return new Statement(this.sql, params); }
    runNow() {
      const statement = db.prepare(this.sql);
      if (/^\s*select/i.test(this.sql)) return { results: statement.all(...this.params).map((row) => ({ ...row })), success: true };
      const info = statement.run(...this.params);
      return { results: [], success: true, meta: { changes: info.changes } };
    }
    async first() {
      const row = db.prepare(this.sql).get(...this.params);
      return row ? { ...row } : null;
    }
    async run() { return this.runNow(); }
    async all() { return this.runNow(); }
  }
  return {
    prepare: (sql) => new Statement(sql),
    async batch(statements) {
      db.exec('BEGIN');
      try {
        const results = statements.map((statement) => statement.runNow());
        db.exec('COMMIT');
        return results;
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
    raw: db,
  };
}

// ---- Stand-ins for Resend and Anthropic
export const mail = [];
export const ai = { calls: 0, delay: 0 };   // delay: milliseconds the stand-in AI takes (for the timing checks)
globalThis.fetch = async (url, init) => {
  if (String(url).startsWith('https://api.resend.com/')) {
    const body = JSON.parse(init.body);
    if (body.to && body.to[0] === 'fail@example.com') {
      return new Response(JSON.stringify({ message: 'The to address is not allowed (key re_abc123secret)' }), { status: 422 });
    }
    mail.push(body);
    return new Response(JSON.stringify({ id: 'email-1' }), { status: 200 });
  }
  if (String(url).startsWith('https://api.anthropic.com/')) {
    ai.calls += 1;
    ai.last = JSON.parse(init.body);   // what the server sent, for the guidance checks
    if (ai.delay) await new Promise((resolve) => setTimeout(resolve, ai.delay));
    const answer = { known_passage: true, leader_note: 'A short note.', questions: ['What stands out?', 'What does it show about God?', 'How will you respond?'] };
    return new Response(JSON.stringify({
      model: 'claude-sonnet-5-5', stop_reason: 'end_turn',
      content: [{ type: 'text', text: JSON.stringify(answer) }],
      usage: { input_tokens: 100, output_tokens: 50 },
    }), { status: 200 });
  }
  throw new Error('Unexpected fetch: ' + url);
};

let copies = 0;
export async function freshWorker() {
  copies += 1;
  // A fresh copy each time: the Worker remembers it already made its tables
  return (await import(pathToFileURL(path.join(work, 'worker.mjs')).href + '?copy=' + copies)).default;
}

export function makeEnv(db = makeD1()) {
  return { DB: db, OWNER_EMAIL: ' Owner@Example.com ', RESEND_API_KEY: 're_test123', PASSCODE: 'quiet river morning', ANTHROPIC_API_KEY: 'sk-test' };
}

export const ORIGIN = 'https://danielyoonwrites.github.io';

export async function call(worker, env, body, { key = '', origin = ORIGIN, ip = '203.0.113.7' } = {}) {
  const headers = { 'content-type': 'application/json', Origin: origin, 'CF-Connecting-IP': ip };
  if (key) headers.Authorization = 'Bearer ' + key;
  const response = await worker.fetch(new Request('https://living-in-the-word.example.workers.dev/', {
    method: 'POST', headers, body: JSON.stringify(body),
  }), env);
  return { status: response.status, body: await response.json() };
}

// Signs in with an email code; returns the check-code answer
export async function signIn(worker, env, email, ip) {
  const before = mail.length;
  const asked = await call(worker, env, { action: 'send-code', email }, { ip });
  if (mail.length === before) return { status: 0, body: { noEmail: true, asked } };
  const code = mail[mail.length - 1].subject.slice(0, 6);
  return call(worker, env, { action: 'check-code', email, code }, { ip });
}

// ---- The checks
let passed = 0;
let failed = 0;
function check(what, ok, detail = '') {
  if (ok) passed += 1;
  else { failed += 1; console.log('FAIL:', what, detail); }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const worker = await freshWorker();
  const env = makeEnv();

  // 1. The owner signs in: the answer says owner: true
  const ownerIn = await signIn(worker, env, 'owner@example.com');
  check('owner signs in', ownerIn.status === 200 && /^[0-9a-f]{64}$/.test(ownerIn.body.session), JSON.stringify(ownerIn));
  check('owner: true on sign-in', ownerIn.body.owner === true, JSON.stringify(ownerIn.body));
  const ownerKey = ownerIn.body.session;

  // 2. An address that isn't invited gets no email (and the same answer as anyone)
  const before = mail.length;
  const notInvited = await call(worker, env, { action: 'send-code', email: 'sarah@example.com' });
  check('not invited: same answer', notInvited.status === 200 && notInvited.body.sent === true);
  check('not invited: no email sent', mail.length === before);

  // 3. The empty list
  const empty = await call(worker, env, { action: 'people' }, { key: ownerKey });
  check('empty list', empty.status === 200 && Array.isArray(empty.body.people) && empty.body.people.length === 0, JSON.stringify(empty));
  check('limits in the answer', empty.body.each === 20 && empty.body.all === 60 && empty.body.you === 0 && empty.body.everyone === 0, JSON.stringify(empty.body));

  // 4. Invite Sarah, with a name; the address is cleaned (spaces, capitals)
  const invited = await call(worker, env, { action: 'invite', email: '  Sarah@Example.COM ', name: '  Sarah   Kim ' }, { key: ownerKey });
  check('invite answers with the list', invited.status === 200 && invited.body.people.length === 1, JSON.stringify(invited));
  const sarahRow = invited.body.people[0] || {};
  check('invited address cleaned', sarahRow.email === 'sarah@example.com', JSON.stringify(sarahRow));
  check('name cleaned', sarahRow.name === 'Sarah Kim', JSON.stringify(sarahRow));
  check('invited is on, 0 today', sarahRow.on === true && sarahRow.today === 0);
  check('invited date is a day', /^\d{4}-\d{2}-\d{2}$/.test(sarahRow.invited || ''), sarahRow.invited);
  const inviteMail = mail[mail.length - 1];
  check('invite: emailed', invited.body.emailed === true, JSON.stringify(invited.body));
  check('invite email: to and from', JSON.stringify(inviteMail.to) === JSON.stringify(['sarah@example.com']) && inviteMail.from === 'Living in the Word <sign-in@mail.danielyoonwrites.com>', JSON.stringify(inviteMail));
  check('invite email: replies go to the owner', inviteMail.reply_to === 'owner@example.com', inviteMail.reply_to);
  check('invite email: subject', inviteMail.subject === 'Dan invited you to Living in the Word', inviteMail.subject);
  check('invite email: words', inviteMail.text === 'Hi Sarah Kim,\n\nI’d like to invite you to Living in the Word, a small app I made for our Bible studies. It prepares discussion questions for a passage, and it can keep a daily reading plan with you.\n\nTo start:\n1. Open https://danielyoonwrites.github.io/living-in-the-word/\n2. Tap “Sign in” at the bottom of the start screen.\n3. Type this email address, sarah@example.com, then the 6-digit code that arrives by email.\n\nDan', JSON.stringify(inviteMail.text));

  // 5. Sarah signs in: owner: false
  const sarahIn = await signIn(worker, env, 'sarah@example.com', '198.51.100.20');
  check('Sarah signs in', sarahIn.status === 200 && Boolean(sarahIn.body.session), JSON.stringify(sarahIn));
  check('owner: false for Sarah', sarahIn.body.owner === false, JSON.stringify(sarahIn.body));
  const sarahKey = sarahIn.body.session;

  // 6. Sarah can't use the owner's page, in any way
  for (const action of ['people', 'invite', 'turn-off', 'turn-on']) {
    const tried = await call(worker, env, { action, email: 'mallory@example.com', name: 'M' }, { key: sarahKey });
    check('Sarah refused: ' + action, tried.status === 403 && tried.body.error === 'not-owner', JSON.stringify(tried));
  }
  const malloryRow = env.DB.raw.prepare("SELECT * FROM people WHERE email = 'mallory@example.com'").get();
  check('Sarah could not invite anyone', !malloryRow);

  // 7. No sign-in, or only the passcode: signed-out, never the list
  const noKey = await call(worker, env, { action: 'people' });
  check('no session: signed-out', noKey.status === 401 && noKey.body.error === 'signed-out', JSON.stringify(noKey));
  const withPasscode = await call(worker, env, { action: 'people', passcode: env.PASSCODE });
  check('passcode alone: signed-out', withPasscode.status === 401 && withPasscode.body.error === 'signed-out', JSON.stringify(withPasscode));
  const madeUpKey = await call(worker, env, { action: 'people' }, { key: 'a'.repeat(64) });
  check('made-up key: signed-out', madeUpKey.status === 401 && madeUpKey.body.error === 'signed-out');
  const otherSite = await call(worker, env, { action: 'people' }, { key: ownerKey, origin: 'https://evil.example' });
  check('another website: refused', otherSite.status === 403 && otherSite.body.error === 'not-allowed');

  // 8. Sarah writes questions twice; the owner once: the counts show
  await call(worker, env, { passage: 'John 15', method: 'study' }, { key: sarahKey });
  await call(worker, env, { passage: 'Romans 14', method: 'study' }, { key: sarahKey });
  await call(worker, env, { passage: 'Psalm 23', method: 'study' }, { key: ownerKey });
  await call(worker, env, { passage: 'Psalm 1', method: 'study', passcode: env.PASSCODE }, { ip: '192.0.2.50' });
  const counts = await call(worker, env, { action: 'people' }, { key: ownerKey });
  check('Sarah used 2 today', counts.body.people[0].today === 2, JSON.stringify(counts.body));
  check('owner used 1 today', counts.body.you === 1, JSON.stringify(counts.body));
  check('everyone together 4 (passcode too)', counts.body.everyone === 4, JSON.stringify(counts.body));
  check('the AI was asked 4 times', ai.calls === 4, String(ai.calls));
  // The guidance goes with every request, with the owner's rule of October 31, 2026
  const guidance = (ai.last && ai.last.system) || '';
  check('guidance: no attention the text itself doesn\'t draw', guidance.includes('Don\'t draw attention to something the text itself doesn\'t draw attention to.'));
  check('guidance: heads-up only for what the passage itself tells', guidance.includes('heads-up when the passage itself tells of'));
  check('the AI gets only the passage name', JSON.stringify(ai.last.messages) === JSON.stringify([{ role: 'user', content: 'Passage: Psalm 1' }]), JSON.stringify(ai.last && ai.last.messages));

  // 9. Errors when inviting
  const bad = await call(worker, env, { action: 'invite', email: 'not an address' }, { key: ownerKey });
  check('bad address', bad.status === 400 && bad.body.error === 'bad-email');
  const self = await call(worker, env, { action: 'invite', email: 'OWNER@example.com' }, { key: ownerKey });
  check('own address', self.status === 400 && self.body.error === 'is-owner');
  const noEmail = await call(worker, env, { action: 'invite' }, { key: ownerKey });
  check('no address', noEmail.status === 400 && noEmail.body.error === 'bad-email');
  const notText = await call(worker, env, { action: 'invite', email: 'x@example.com', name: { a: 1 } }, { key: ownerKey });
  check('a name that isn\'t text is left blank', notText.status === 200 && notText.body.people.find((p) => p.email === 'x@example.com').name === '');
  check('invite email without a name starts "Hi,"', mail[mail.length - 1].text.startsWith('Hi,\n\n') && notText.body.emailed === true, JSON.stringify(mail[mail.length - 1].text.slice(0, 20)));

  // 10. Inviting again: keeps the name if none is typed, changes it if one is
  await call(worker, env, { action: 'invite', email: 'sarah@example.com' }, { key: ownerKey });
  check('invite again without a name: the email still greets her by name', mail[mail.length - 1].text.startsWith('Hi Sarah Kim,\n'), JSON.stringify(mail[mail.length - 1].text.slice(0, 20)));
  let row = env.DB.raw.prepare("SELECT * FROM people WHERE email = 'sarah@example.com'").get();
  check('invite again without a name keeps it', row.name === 'Sarah Kim', JSON.stringify(row));
  await call(worker, env, { action: 'invite', email: 'sarah@example.com', name: 'Sarah K.' }, { key: ownerKey });
  row = env.DB.raw.prepare("SELECT * FROM people WHERE email = 'sarah@example.com'").get();
  check('invite again with a name changes it', row.name === 'Sarah K.');
  const peopleCount = env.DB.raw.prepare('SELECT COUNT(*) AS n FROM people').get().n;
  check('no double rows', peopleCount === 2, String(peopleCount));

  // 11. Long names, line breaks and emoji
  const long = await call(worker, env, { action: 'invite', email: 'long@example.com', name: 'A'.repeat(100) }, { key: ownerKey });
  check('long name cut to 60', long.body.people.find((p) => p.email === 'long@example.com').name.length === 60);
  const odd = await call(worker, env, { action: 'invite', email: 'odd@example.com', name: 'Line\none\ttab \u0007bell 🙂' }, { key: ownerKey });
  check('line breaks and control characters become spaces', odd.body.people.find((p) => p.email === 'odd@example.com').name === 'Line one tab bell 🙂',
    JSON.stringify(odd.body.people.find((p) => p.email === 'odd@example.com')));
  const emoji = await call(worker, env, { action: 'invite', email: 'emoji@example.com', name: '🙂'.repeat(70) }, { key: ownerKey });
  const emojiName = emoji.body.people.find((p) => p.email === 'emoji@example.com').name;
  check('emoji kept whole at 60', Array.from(emojiName).length === 60 && emojiName === '🙂'.repeat(60));
  const html = await call(worker, env, { action: 'invite', email: 'html@example.com', name: '<img src=x onerror=alert(1)>' }, { key: ownerKey });
  check('a name that looks like code is kept as plain text', html.body.people.find((p) => p.email === 'html@example.com').name === '<img src=x onerror=alert(1)>');

  // 12. Turn Sarah off: her phone is signed out, she can't get a code, and the list says so
  const invitedOrder = (await call(worker, env, { action: 'people' }, { key: ownerKey })).body.people.map((p) => p.email);
  const off = await call(worker, env, { action: 'turn-off', email: 'Sarah@example.com' }, { key: ownerKey });
  const offRow = off.body.people.find((p) => p.email === 'sarah@example.com');
  check('turned off in the list', off.status === 200 && offRow.on === false, JSON.stringify(off.body));
  check('turned off stays in its place (by name)', JSON.stringify(off.body.people.map((p) => p.email)) === JSON.stringify(invitedOrder), JSON.stringify(off.body.people.map((p) => p.email)));
  const sarahAsks = await call(worker, env, { passage: 'John 3', method: 'study' }, { key: sarahKey });
  check('turned off: signed out', sarahAsks.status === 401 && sarahAsks.body.error === 'signed-out', JSON.stringify(sarahAsks));
  const sessionsLeft = env.DB.raw.prepare("SELECT COUNT(*) AS n FROM sessions WHERE email = 'sarah@example.com'").get().n;
  check('turned off: her sessions deleted', sessionsLeft === 0);
  const mailBefore = mail.length;
  const sarahCode = await call(worker, env, { action: 'send-code', email: 'sarah@example.com' }, { ip: '198.51.100.20' });
  check('turned off: same answer for a code', sarahCode.body.sent === true);
  check('turned off: no email', mail.length === mailBefore);

  // A code sent before she was turned off stops working
  await call(worker, env, { action: 'turn-on', email: 'sarah@example.com' }, { key: ownerKey });
  await call(worker, env, { action: 'send-code', email: 'sarah@example.com' }, { ip: '198.51.100.21' });
  const pendingCode = mail[mail.length - 1].subject.slice(0, 6);
  await call(worker, env, { action: 'turn-off', email: 'sarah@example.com' }, { key: ownerKey });
  const lateCode = await call(worker, env, { action: 'check-code', email: 'sarah@example.com', code: pendingCode }, { ip: '198.51.100.21' });
  check('turned off: an earlier code stops working', lateCode.status === 401 && lateCode.body.error === 'code-expired', JSON.stringify(lateCode));

  // 13. Turn her back on: she signs in again with a new code
  const on = await call(worker, env, { action: 'turn-on', email: 'sarah@example.com' }, { key: ownerKey });
  check('turned on in the list', on.body.people.find((p) => p.email === 'sarah@example.com').on === true);
  const oldKeyAgain = await call(worker, env, { passage: 'John 3', method: 'study' }, { key: sarahKey });
  check('turned on: the old phone key still doesn\'t work', oldKeyAgain.status === 401 && oldKeyAgain.body.error === 'signed-out');
  const sarahBack = await signIn(worker, env, 'sarah@example.com', '198.51.100.22');
  check('turned on: signs in again', sarahBack.status === 200 && Boolean(sarahBack.body.session), JSON.stringify(sarahBack));

  // 14. Inviting someone who was turned off turns them back on
  await call(worker, env, { action: 'turn-off', email: 'sarah@example.com' }, { key: ownerKey });
  const reinvite = await call(worker, env, { action: 'invite', email: 'sarah@example.com' }, { key: ownerKey });
  check('invite again turns on', reinvite.body.people.find((p) => p.email === 'sarah@example.com').on === true);
  check('fourth invite email to one address in a day: not sent', reinvite.body.emailed === false && reinvite.body.problem === 'too-many-emails', JSON.stringify({ emailed: reinvite.body.emailed, problem: reinvite.body.problem }));
  const inviteCount = env.DB.raw.prepare("SELECT count FROM usage WHERE who = 'invites:sarah@example.com'").get();
  check('invite emails counted for the address', inviteCount && inviteCount.count === 4, JSON.stringify(inviteCount));

  // Resend refuses an address: the person is still invited, the reason comes back without the key
  const refused = await call(worker, env, { action: 'invite', email: 'fail@example.com', name: 'Fail' }, { key: ownerKey });
  check('failed email: still invited', refused.status === 200 && refused.body.people.some((p) => p.email === 'fail@example.com' && p.on), JSON.stringify(refused));
  check('failed email: says so', refused.body.emailed === false && refused.body.problem === 'email-failed', JSON.stringify(refused.body.problem));
  check('failed email: no key in the reason', /not allowed/.test(refused.body.detail || '') && !/abc123secret/.test(refused.body.detail || ''), refused.body.detail);

  // 15. Turning off or on an address that isn't on the list changes nothing
  const ghost = await call(worker, env, { action: 'turn-off', email: 'ghost@example.com' }, { key: ownerKey });
  check('unknown address: list unchanged', ghost.status === 200 && !ghost.body.people.some((p) => p.email === 'ghost@example.com'));
  const badTurn = await call(worker, env, { action: 'turn-off', email: 'nope' }, { key: ownerKey });
  check('turn off with a bad address', badTurn.status === 400 && badTurn.body.error === 'bad-email');

  // 16. The owner can't be turned off or on, and stays signed in
  const ownerOff = await call(worker, env, { action: 'turn-off', email: 'Owner@Example.com' }, { key: ownerKey });
  check('turning off the owner refused', ownerOff.status === 400 && ownerOff.body.error === 'is-owner', JSON.stringify(ownerOff));
  const ownerOn = await call(worker, env, { action: 'turn-on', email: 'owner@example.com' }, { key: ownerKey });
  check('turning on the owner refused', ownerOn.status === 400 && ownerOn.body.error === 'is-owner');
  const ownerStill = await call(worker, env, { action: 'people' }, { key: ownerKey });
  check('owner stays signed in', ownerStill.status === 200, JSON.stringify(ownerStill));
  check('the owner is never in the list', !ownerStill.body.people.some((p) => p.email === 'owner@example.com'));

  // 17. Sorting: by name (or address), whether on or off
  const sorted = ownerStill.body.people.map((p) => p.name || p.email);
  check('everyone sorted by name, on or off', JSON.stringify(sorted) === JSON.stringify([...sorted].sort((a, b) => a.localeCompare(b))), JSON.stringify(sorted));

  // 18. Signing out ends the owner's page too
  await call(worker, env, { action: 'sign-out' }, { key: ownerKey });
  const afterOut = await call(worker, env, { action: 'people' }, { key: ownerKey });
  check('after sign out: signed-out', afterOut.status === 401 && afterOut.body.error === 'signed-out');

  // 19. Without OWNER_EMAIL, nobody is the owner
  const worker2 = await freshWorker();
  const env2 = makeEnv();
  const ownerIn2 = await signIn(worker2, env2, 'owner@example.com');
  env2.OWNER_EMAIL = '';
  const noOwner = await call(worker2, env2, { action: 'people' }, { key: ownerIn2.body.session });
  check('no OWNER_EMAIL: the owner\'s session stops (owner can\'t sign in)', noOwner.status === 401, JSON.stringify(noOwner));

  // 19b. Without Resend's key: invited, but no email
  const worker4 = await freshWorker();
  const env4 = makeEnv();
  const owner4 = (await signIn(worker4, env4, 'owner@example.com')).body.session;
  delete env4.RESEND_API_KEY;
  const noKeyInvite = await call(worker4, env4, { action: 'invite', email: 'nokey@example.com' }, { key: owner4 });
  check('no email key: still invited', noKeyInvite.status === 200 && noKeyInvite.body.people.some((p) => p.email === 'nokey@example.com'), JSON.stringify(noKeyInvite));
  check('no email key: says so', noKeyInvite.body.emailed === false && noKeyInvite.body.problem === 'not-set-up');

  // 20. The old passcode path and sign-in still work as before
  const worker3 = await freshWorker();
  const env3 = makeEnv();
  const viaPasscode = await call(worker3, env3, { passage: 'John 1', method: 'study', passcode: env3.PASSCODE });
  check('passcode still writes questions', viaPasscode.status === 200 && viaPasscode.body.questions.length === 3, JSON.stringify(viaPasscode));
  const wrongPasscode = await call(worker3, env3, { passage: 'John 1', method: 'study', passcode: 'nope' });
  check('wrong passcode still refused', wrongPasscode.status === 401 && wrongPasscode.body.error === 'wrong-passcode');
  const preflight = await worker3.fetch(new Request('https://w.example/', { method: 'OPTIONS', headers: { Origin: ORIGIN } }), env3);
  check('preflight allows the Authorization header', preflight.status === 204 && /authorization/.test(preflight.headers.get('Access-Control-Allow-Headers')));

  // 21. How long the AI took (aiSeconds, for the test link): in seconds, to one decimal place
  check('aiSeconds: about 0 when the AI answers at once', viaPasscode.body.aiSeconds >= 0 && viaPasscode.body.aiSeconds < 0.5, JSON.stringify(viaPasscode.body));
  ai.delay = 1200;
  const timed = await call(worker3, env3, { passage: 'John 2', method: 'study', passcode: env3.PASSCODE });
  ai.delay = 0;
  const seconds = timed.body.aiSeconds;
  check('aiSeconds: 1.2 seconds is about 1.2', seconds >= 1.1 && seconds < 2.5, JSON.stringify(timed.body));
  check('aiSeconds: one decimal place', Number.isInteger(Math.round(seconds * 10)) && String(seconds).split('.')[1]?.length <= 1, String(seconds));

  console.log(passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}
