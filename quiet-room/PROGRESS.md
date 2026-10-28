# Quiet room: progress (updated October 28, 2026)

The app: https://danielyoonwrites.github.io/quiet-room. Read `SPEC.md` (what it does and why), `DECISIONS.md` (choices and their reasons) and `CLAUDE.md`.

The handoff file. Any new session, or a session after its memory was compressed, reads this first and picks up from "Next step." Every pull request updates it.

## Where it stands
- Paused after step 1 since October 24, 2026 (see "Next step").
- Step 1 built and live (October 24, 2026, pull request 19): `quiet-room/index.html` and `quiet-room/style.css`, a page with the title, the line under it, "The room opens soon," and a link back to the website. No live features or Firebase yet.
- `SPEC.md`, `CLAUDE.md` and this file are merged (pull request 17). `DECISIONS.md` was added on October 28, 2026, in the notes cleanup.
- Build plan (one pull request per step, each with a check the owner does):
  1. Page with no live features: room name, the line under it, "The room opens soon," link back to the website (done, pull request 19)
  2. Six original avatar drawings (next)
  3. Firebase setup in the console, walked through step by step; database in locked mode
  4. Security rules and tests, before any feature uses them
  5. Join: name, avatar, what you're doing
  6. Live room
  7. Focusing or on a break; change what you're doing
  8. Stepped away, hiding and cleaning up stale seats
  9. Personal timer (25, 50 or none), worked out from its start time
  10. Phone polish, including iPhone Safari
  11. Trial run with 2 or 3 friends
- Facts checked (October 2026):
  - Spark plan: 100 simultaneous connections (can't be raised), 1 GB stored, 10 GB a month downloaded.
  - New account creation: 100 per hour per internet address (Firebase Auth limits page; not confirmed for anonymous sign-ups specifically).

## Waiting on Dan
No open questions right now (ask one at a time when they come). Labels like "Focusing," "On a break," "Stepped away" and the activity names come from the spec.
1. Say when you want to pick the Quiet room back up; nothing here is urgent. To start, open https://claude.ai/code, start a new session with this repository, set the effort to High, and paste `/pickup quiet room` (or, without the skill: "Read HANDOFF.md, then quiet-room/PROGRESS.md, DECISIONS.md and CLAUDE.md, and continue from the next step.").
2. Say yes to, or change, two ideas that are only proposed. Both are written out in https://github.com/danielyoonwrites/danielyoonwrites.github.io/blob/main/quiet-room/DECISIONS.md:
   - Stale seats (not yet approved): every browser hides a seat that has been "stepped away" for more than 15 minutes, and then anyone signed in may delete it. The plan shapes the security rules, so it's needed before step 4. The spec also asks for its tradeoffs, which aren't written down yet: Claude explains them when asking.
   - Status on an avatar: a small label, with "stepped away" slightly faded.
3. At step 5 (Join), decide whether the room link needs a secret code. Anyone can see the `quiet-room` folder in the public repository (https://github.com/danielyoonwrites/danielyoonwrites.github.io/tree/main/quiet-room), so the room's privacy can't rest on the page address alone.

## Open pull requests
None for the Quiet room (checked on GitHub, October 28, 2026). Pull requests 17, 18 and 19 were merged on October 24, 2026. This notes cleanup (part 2, planned as pull request 82) adds `DECISIONS.md` and this layout, if it isn't merged yet.

## Next step
Paused after step 1 (merged in pull request 19, October 24, 2026) while Dan built a small side project, `fewer-spam-calls/`. Still paused on October 28, 2026. Pick up here when he's ready:
1. Step 2: draw the six blob avatars in Moon jar colors only. Fix from the sketch: no near-white fill, give Sleepy open eyes, smooth Scarf's bottom edge. Show previews before the pull request.
2. Then step 3, Firebase setup: Dan does the clicking in the console, one step at a time, after checking the current Firebase docs. The database starts in locked mode.

Effort: High for most steps; Extra high for step 4 (security rules) and step 8 (stepped away and stale seats).

## Dead ends
- Loading the rules into Firebase's emulator with the Firebase CLI, in Claude's cloud sessions: the session's network filter blocks that request. Run the database emulator jar directly instead (steps in `CLAUDE.md`, "Testing the rules"; it worked in October 2026).

## How to check it works
- Step 1, on a phone: open https://danielyoonwrites.github.io/quiet-room. It shows "Quiet room," Dan's line under it and "The room opens soon." At the bottom, "Made by Daniel Yoon" opens https://danielyoonwrites.github.io.
- Once the room is built, the spec's checks (`SPEC.md`, "How we'll know it works"): with two browsers open, a status change in one shows in the other within a few seconds; closing one tab makes that avatar show "stepped away," then disappear after 15 minutes; a test proves one person can't change another person's seat.
- The rules (from step 4): `quiet-room/database.rules.json` (not made yet), with tests next to it. Firebase's database emulator runs in Claude's cloud sessions when started directly; see `CLAUDE.md`. If it can't run, Dan gets checks to run in the Rules Playground in the Firebase console.
