# Quiet room: decisions

Each decision with its reason, oldest first. Only add to this file; if a decision changes, add a new entry that says which one it replaces. Copied in on October 28, 2026 from PROGRESS.md, SPEC.md, CLAUDE.md and the root HANDOFF.md.

### October 24, 2026: a calm shared study room for the young adults group (pull request 17)
- Decision: one shared room with desks, for adults in Dan's young adults group at church. Each person's avatar sits at a desk with their name, what they're doing, and whether they're focusing or on a break. Nothing punishes you for leaving the tab or app, nothing pings you, and it isn't a game; your seat stays yours while you work anywhere. No sound, notifications, chat, coins, rankings, ads or tracking (`CLAUDE.md` adds analytics).
- Why: the spec says it's for adults who want company while they read, study, read the Bible or work on anything.

### October 24, 2026: where the app lives (pull request 17)
- Decision: in the `quiet-room/` folder of the website repository, published by GitHub Pages at https://danielyoonwrites.github.io/quiet-room.
- Why: so it publishes through the existing publish workflow.

### October 24, 2026: what Stage 1 does (pull request 17)
- Decision: join one private room by link; type a display name; pick one of about 6 preset avatars, simple original drawings (no copied characters); pick what you're doing (Reading, Studying, Bible reading, Working, or your own words); set yourself to Focusing or On a break (the app never checks what you do; you set your own status); an optional personal timer of 25 or 50 minutes, or none; see everyone in the room live; works in a browser on laptops and phones; a small link back to danielyoonwrites.github.io at the bottom.
- Why: not recorded.

### October 24, 2026: what Stage 1 leaves out (pull request 17)
- Decision: no chat or lounge, avatar builder, more rooms, public rooms, real accounts (only anonymous sign-in for now) or background sound.
- Why: not recorded.

### October 24, 2026: safety and privacy (pull request 17)
- Decision: private link only; if the link leaks, Dan makes a new room. Store only display name, avatar choice, what they're doing, status and times. Database rules: each person can change only their own seat.
- Why: not recorded (the spec lists these under "Safety and privacy").

### October 24, 2026: Firebase on the free Spark plan, with anonymous sign-in (pull request 17)
- Decision: a static page on GitHub Pages; live presence on Firebase Realtime Database, on the free Spark plan (100 simultaneous connections; each open browser tab counts as one); anonymous sign-in.
- Why: not recorded.

### October 24, 2026: a dropped connection means "stepped away" (pull request 17)
- Decision: use Firebase's presence pattern (`.info/connected` and `onDisconnect`), so a closed tab or lost connection becomes "stepped away." The avatar keeps the seat for 15 minutes.
- Why: on iPhones, Safari can close the live connection soon after you switch away.
- Turned down: treating a dropped connection as "left."

### October 24, 2026: the timer is worked out from its start time (pull request 17)
- Decision: the personal timer is worked out from its start time.
- Why: browsers slow down timers in background tabs.
- Turned down: counting second by second.

### October 24, 2026: the "Moon jar" look, same as the website (pull request 17)
- Decision: the website's calm "Moon jar" design: porcelain, ink, celadon, stone and glaze; Libre Baskerville, Regular and Italic only, never bold; left-aligned text, calm open space, square corners; avatars as simple original drawings in these colors, no copied characters; sentence case, no exclamation marks, no emoji; phones first, then laptops. Details in `SPEC.md` and `CLAUDE.md`.
- Why: not recorded.

### October 24, 2026: Firebase's code from its CDN, version 13.1.0 (pull request 17)
- Decision: load the Firebase JavaScript SDK from its CDN with the modular API, version 13.1.0 (for example `https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js`). Check the docs again before upgrading.
- Why: 13.1.0 is the version the current Firebase docs gave in October 2026 (checked in the Firebase docs and on npm). No other reason was written down; `CLAUDE.md` also says plain HTML, CSS and JavaScript, with no build tools and no npm in the app.

### October 24, 2026: security rules first, and the database starts locked (pull request 17)
- Decision: write the Firebase Realtime Database security rules before the features that use them, and test them (rules in `quiet-room/database.rules.json`, with tests next to them). The database starts in locked mode.
- Why: not recorded.
- Turned down: test mode.

### October 24, 2026: no secrets in the code; the Firebase web config is fine (pull request 17)
- Decision: never put passwords, private keys or service account files in the code. The Firebase web config may be in it.
- Why: Firebase says it isn't a secret, and the security rules protect the data.

### October 24, 2026: Dan does the clicking in the Firebase console (pull request 17)
- Decision: Dan does the clicking in the Firebase console. Claude checks the current Firebase docs first, then gives one step at a time and says exactly what to paste back.
- Why: the docs come first since the console menus change. Why Dan does the clicking: not recorded.

### October 24, 2026: a plan for stale seats, proposed (pull request 17)
- Decision: proposed, not yet approved by Dan. Each seat stores `online` and `lastSeen`; Firebase's `onDisconnect` marks it offline with the server time ("stepped away"); every browser hides seats away more than 15 minutes; the rules let anyone signed in delete a seat only when it has been away more than 15 minutes by the server's clock. Everything else about a seat can only be changed by its owner.
- Why: the spec asked the plan to settle it: each person can change only their own seat, so other people's browsers can't delete a stale seat.

### October 24, 2026: an 11-step build plan (pull request 17)
- Decision: one pull request per step, each with a check Dan does: 1 the page with no live features, 2 six avatar drawings, 3 Firebase setup (database locked), 4 security rules and tests before any feature uses them, 5 join, 6 live room, 7 focusing or on a break and changing what you're doing, 8 stepped away and stale seats, 9 personal timer, 10 phone polish including iPhone Safari, 11 trial run with 2 or 3 friends.
- Why: not recorded.

### October 24, 2026: no weekly quiet hour for now; the room is open any time (pull request 18)
- Decision: no weekly quiet hour yet. The room is open any time, and the quiet hour (shown on the page, so people overlap) moved to "Ideas for later" in `SPEC.md`.
- Why: not recorded.

### October 24, 2026: tracking what you got done is an idea for later (pull request 18)
- Decision: Dan's new idea, tracking what you got done with the app (chapters read, minutes studied), went into "Ideas for later," not Stage 1.
- Why: the spec lists what to think through first: it means storing more than Stage 1 does; keep it personal so it never becomes a ranking; and with anonymous sign-in it would stay on one browser, so keeping it across devices needs real accounts.

### October 24, 2026: the name is "Quiet room" (pull request 19)
- Decision: "Quiet room," in sentence case on the page.
- Why: not recorded.
- Turned down: "Study room" and "Work room."

### October 24, 2026: remember each person's choices in their own browser (pull request 19)
- Decision: remember each person's name, avatar and activity in their own browser, not the database. Proposed October 24; Dan didn't object. Anonymous sign-in keeps the same account on the same browser; a new device, private window, cleared data or (on iPhone Safari) about 7 days of Safari use without visiting means a new account.
- Why: so returning on the same browser is one tap.
- Turned down: keeping them in the database.

### October 24, 2026: Dan's line under the title (pull request 19)
- Decision: the line under the title, written by Dan: "A quiet place to read, study, or work alongside friends. No notifications, no games, no distractions."
- Why: not recorded.

### October 24, 2026: no age rule on the page (pull request 19)
- Decision: no age rule on the page. Revisit if chat, or anything that lets people contact each other, is ever added.
- Why: Dan decided it isn't needed, since people can't communicate.

### October 24, 2026: no line asking people to keep the link in the group (pull request 19)
- Decision: the page doesn't ask people to keep the link within the group.
- Why: Dan will mention it when he shares the link.

### October 24, 2026: the avatars are blobs with faces (pull request 19)
- Decision: six preset avatars, cute blobs with faces, one drawing each, saved in the database as a short label like "avatar-3." A rough sketch of six (Moon, Sprout, Pebble, Reader, Scarf, Sleepy) was shown October 24; the final drawings come in step 2 and must use only the Moon jar colors. Proposed: status shown as a small label, with "stepped away" slightly faded.
- Why: the blobs were Dan's idea ("cute blobs with faces"). The short label is so the rules can accept only the six, and a later avatar builder can add more.

### October 24, 2026: search engines are asked not to list the page (pull request 19)
- Decision: the page has `noindex`, which asks search engines not to list it.
- Why: the room is shared by link.

### October 24, 2026: small words on the step 1 page (pull request 19)
- Decision: the footer says "Made by Daniel Yoon," linking to https://danielyoonwrites.github.io; until joining works, the page says "The room opens soon."
- Why: not recorded. They were small words Dan could change in the pull request.

### October 24, 2026: paused after step 1 (pull request 20)
- Decision: pause the Quiet room after step 1, and pick it up again when Dan is ready.
- Why: Dan was building a small side project, `fewer-spam-calls/`.

### October 24, 2026: Claude's effort for each step (pull request 25)
- Decision: High for most steps; Extra high for step 4 (security rules) and step 8 (stepped away and stale seats).
- Why: not recorded.
