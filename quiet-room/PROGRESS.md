# Quiet Room: progress

The handoff file. Any new session, or a session after its memory was compressed, reads this first and picks up from "Next". Every pull request updates it.

Last updated: October 24, 2026

## Where we are

- Step 1 built (October 24): `quiet-room/index.html` and `quiet-room/style.css`, a page with the title, the line under it, "The room opens soon," and a link back to the website. No live features or Firebase yet.
- `SPEC.md`, `CLAUDE.md` and this file are merged (pull request 17).

## Decisions

- The app lives in the `quiet-room/` folder of the website repository, so it publishes at https://danielyoonwrites.github.io/quiet-room through the existing publish workflow.
- Firebase JavaScript SDK 13.1.0 from the CDN, modular API (Firebase docs and npm, October 2026).
- Room name: "Quiet room" (sentence case on the page). Chosen October 24 over "Study room" and "Work room."
- Line under the title, written by the owner (October 24): "A quiet place to read, study, or work alongside friends. No notifications, no games, no distractions."
- No age rule on the page (October 24): the owner decided it isn't needed, since people can't communicate. Revisit if chat is ever added. No line asking people to keep the link within the group either (October 24); the owner will mention it when he shares the link.
- The page asks search engines not to list it (`noindex`), since the room is shared by link.
- Small words in step 1 (owner can change them in the pull request): footer "Made by Daniel Yoon" linking to https://danielyoonwrites.github.io; until joining works, "The room opens soon."
- Avatars (October 24): cute blobs with faces, the owner's idea. Six presets, one drawing each; status shown as a small label, with "stepped away" slightly faded (proposed). Saved in the database as a short label like "avatar-3" so the rules can accept only the six, and a later avatar builder can add more. A rough sketch of six (Moon, Sprout, Pebble, Reader, Scarf, Sleepy) was shown October 24; final drawings come in step 2 and must use only the Moon jar colors.
- Remember each person's name, avatar and activity in their own browser (not the database), so returning on the same browser is one tap. Proposed October 24; the owner didn't object. Anonymous sign-in keeps the same account on the same browser; a new device, private window, cleared data or (on iPhone Safari) about 7 days of Safari use without visiting means a new account.
- Stale seats (proposed, not yet approved by the owner): each seat stores `online` and `lastSeen`; Firebase's `onDisconnect` marks it offline with the server time ("stepped away"); every browser hides seats away more than 15 minutes; the rules let anyone signed in delete a seat only when it has been away more than 15 minutes by the server's clock. Everything else about a seat can only be changed by its owner.

## Build plan (one pull request per step, each with a check the owner does)

1. Page with no live features: room name, the line under it, "The room opens soon," link back to the website
2. Six original avatar drawings
3. Firebase setup in the console, walked through step by step; database in locked mode
4. Security rules and tests, before any feature uses them
5. Join: name, avatar, what you're doing
6. Live room
7. Focusing or on a break; change what you're doing
8. Stepped away, hiding and cleaning up stale seats
9. Personal timer (25, 50 or none), worked out from its start time
10. Phone polish, including iPhone Safari
11. Trial run with 2 or 3 friends

## Open questions (ask one at a time)

None right now. Labels like "Focusing," "On a break," "Stepped away" and the activity names come from the spec.

Answered:
- Room name: "Quiet room" (October 24).
- Line under the title: chosen October 24 (see Decisions).
- Weekly quiet hour: not needed yet (October 24). Moved to "Ideas for later" in `SPEC.md`.
- New idea from the owner: tracking what you got done (chapters read, minutes studied). Added to "Ideas for later", not Stage 1.

## Facts checked (October 2026)

- Spark plan: 100 simultaneous connections (can't be raised), 1 GB stored, 10 GB a month downloaded.
- New account creation: 100 per hour per internet address (Firebase Auth limits page; not confirmed for anonymous sign-ups specifically).
- Firebase's database emulator runs in Claude's cloud sessions when started directly; see `CLAUDE.md`.

## Next

- Paused after step 1 (merged in pull request 19, October 24) while the owner builds a small side project, `fewer-spam-calls/`. Pick up here when he's ready.
- Then step 2: draw the six blob avatars in Moon jar colors only. Fix from the sketch: no near-white fill, give Sleepy open eyes, smooth Scarf's bottom edge. Show previews before the pull request.
