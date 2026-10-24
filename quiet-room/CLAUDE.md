# Quiet Room

A shared, calm study room for the owner's young adults group. It lives in this folder and is published at https://danielyoonwrites.github.io/quiet-room. The full spec is in `SPEC.md`. The owner is a beginner building his first web app and wants to learn as we go.

## Start here

- At the start of every session, read `SPEC.md` and `PROGRESS.md`, then continue from "Next" in `PROGRESS.md`.
- Update `PROGRESS.md` in every pull request: where we are, decisions, answered and open questions, next step.

## Rules for working here

- Explain every change in plain words for a beginner: what changed, why, and how to check it.
- One small feature per pull request, each with a check the owner can do himself before he merges.
- Plain HTML, CSS and JavaScript. No build tools, no npm in the app.
- Load the Firebase JavaScript SDK from its CDN with the modular API, using the version the current Firebase docs give. As of October 2026 that is 13.1.0, for example `https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js`. Check the docs again before upgrading.
- Write the Firebase Realtime Database security rules before the features that use them, and test them.
- Never put passwords, private keys or service account files in the code. The Firebase web config is fine: Firebase says it isn't a secret, and the security rules protect the data.
- The database starts in locked mode, not test mode.
- Store only display name, avatar choice, what they're doing, status and times. No sound, notifications, chat, rankings, ads, analytics or tracking.

## Firebase console

- The owner does the clicking. Check the current Firebase docs first, since the console menus change, then give one step at a time and say exactly what to paste back.

## Testing the rules

- Rules live in `quiet-room/database.rules.json`, with tests next to them.
- In Claude's cloud sessions the Firebase CLI can't load rules into its emulator (the session's network filter blocks that request). Run the database emulator jar directly instead (`java -jar ~/.cache/firebase/emulators/firebase-database-emulator-*.jar --host 127.0.0.1 --port 9000`), load the rules with a PUT to `/.settings/rules.json`, and use `curl --noproxy '*'`. This worked in October 2026.
- If the emulator can't run, give the owner checks to run in the Rules Playground in the Firebase console.

## Design system: "Moon jar" (same as the website)

Colors
- porcelain `#F1EFEA`: background. Warm white, never pure white.
- ink `#1E1C1A`: main text.
- celadon `#386F61`: links, buttons and small labels. Never a background behind body text.
- stone `#6B655C`: secondary text such as times and small print.
- glaze `#DCE6DF`: thin divider lines only.

Type
- All English in Libre Baskerville (Google Fonts), Regular and Italic only. Never bold.
- Small labels: uppercase, letter spacing about 0.14em, celadon.

Layout and words
- Left-aligned text, calm open space, square corners.
- Avatars: simple original drawings in these colors. No copied characters.
- Sentence case, no exclamation marks, no emoji.
- Works on phones first, then laptops.
