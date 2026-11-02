# SPEC: Idea board

A little app at https://danielyoonwrites.github.io/idea-board (folder `idea-board/` in the website repository; "Idea board" is a working name). Planned with the owner, November 2, 2026.

## Who it's for

Just the owner, on his Android phone (in Chrome) and in a computer's web browser. It isn't shared with anyone, and there's no working on it together live. In his words: "It would just need a way to save so it can be accessed both on Android phones and web page on computer."

## What it is

One big board for typed notes, photos and links, like Apple's Freeform, which runs only on iPhone, iPad and Mac (Apple's iCloud help, through search results, November 2, 2026). Free apps already do this (Canva Whiteboards has notes, photos and saving across devices, per Canva's Help Center, November 2, 2026), so this one is built as the owner's next learning app, made his way.

## How it works (version 1)

1. The start screen lists your boards, newest first, with "New board."
2. A board fills the screen. Drag an empty spot to move around (one finger on the phone, the mouse on a computer). Pinch with two fingers to zoom (on a computer, the mouse wheel or the + and − buttons).
3. One "Add" button offers Note, Photo or Link, placed in the middle of the screen.
   - Note: a square note you type into. Tap it later to change the words.
   - Photo: one from the phone's photos (or the computer's files). The app makes a smaller copy before saving it.
   - Link: a web address and an optional title, shown as a small card. Tapping it opens the page in a new tab.
4. Drag anything to move it. Tap something to pick it, then "Remove" (with "Undo" for a few seconds). A picked note or photo has a corner to drag, to make it bigger or smaller.
5. Everything saves by itself, to your account, so the same boards open on the phone and the computer.
6. "Download a copy" saves every board, with its photos, in one file. "Restore a copy" brings them back.

## Must-haves

- Phone first: big buttons, and moving the board never gets mixed up with moving a note.
- Never lose work: each change is saved within a couple of seconds, and there's a backup file.
- Nothing is overwritten between the phone and the computer. If a board changed on the other device, the app says so and loads the newest one first.
- Only the owner can open his boards.

## Not in version 1 (ideas for later)

- Drawing with a finger or a pen; shapes, arrows and lines between notes.
- Sharing a board, or working on it together live.
- Working without reception.
- Installing it on the home screen like an app.
- Search, PDFs and other files, videos, templates, AI help.

## Privacy and safety

- Only a device signed in with the owner's own address can open the boards.
- The boards go only to this app's own server, on the owner's Cloudflare account: never to an AI, analytics or anyone else. The app's code is public; the boards aren't.
- The smaller copy of a photo is a new picture, so it leaves out the original's hidden details, like where it was taken (Claude's plan; checked in build step 4).

## The look

Not chosen yet (open question 2). Claude's suggestion: the Moon jar design, like the website and the other small apps (`.claude/rules/moon-jar.md`). Its rules keep glaze for thin lines only, so the notes' color is chosen in build step 2, with screenshots.

## Tech notes (Claude's plan; the owner can change any of it)

- Plain HTML, CSS and JavaScript in this folder, with no build tools. File links end in `?v=1`, raised whenever a file changes.
- The board is ordinary page boxes on a large surface that moves and zooms with a CSS transform, so text stays sharp. Touch and mouse both go through Pointer Events.
- On the device, boards are kept in the browser's IndexedDB, because `localStorage` is too small for photos.
- Photos are shrunk on the device before saving, to about 1600 pixels on the long side, as JPEG (tested for sharpness in step 4).
- The server (build step 6): its own small Cloudflare Worker in `idea-board/server/`, with its own D1 database, deployed by itself after each merge like Living in the Word's (Workers Builds). It's kept apart from Living in the Word's server, so a problem in one can't break the other and photos can't fill Living in the Word's database.
- Room on Cloudflare's free plan: D1 has 500 MB per database, 5 GB per account and 2 MB per row (Cloudflare's docs, read as their source on GitHub, November 2, 2026: https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/d1/platform/limits.mdx). Claude's estimate, unverified: about 1,500 shrunk photos fit in 500 MB. If that's ever too small, photos can move to R2, whose free tier is 10 GB-month (the same docs, `r2/pricing.mdx`). Whether R2 needs a payment method on file wasn't on that page (unverified).
- Signing in (build step 6): an email code sent only to `OWNER_EMAIL`, like Living in the Word's, through Resend. Codes and session keys are kept only scrambled. If both apps use the same Resend account, they share its daily limit (Resend's free plan: 100 emails a day and 3,000 a month, per Living in the Word's `DECISIONS.md`, October 2026).
- Saving between devices (build step 7): each board has a version number. The server refuses a save made from an older copy, and the app loads the newest one instead, so nothing is overwritten.

## Build plan (one pull request each, each with a check the owner does)

1. This plan, with the folder's `CLAUDE.md`, `PROGRESS.md` and `DECISIONS.md`. Check: read "How it works" and this build plan.
2. One board, saved on this device for now: move around, zoom, add a note, type in it, move it, remove it (with Undo). Check: on your phone, add three notes, move them, zoom out, then close Chrome and open the page again: they're still there. Then try it on your computer.
3. Several boards: the start screen, "New board," rename, remove. Check: make two boards and switch between them.
4. Photos: add one (shrunk before saving), move it, change its size. Check: add a photo from your phone; it looks sharp enough, and it moves and resizes.
5. Links: a web address and a title; tapping the card opens the page. Check: add a link to your Substack and tap it.
6. The server and signing in: a one-time setup in Cloudflare (with every step), then signing in with an email code. Check: sign in on your phone and on your computer.
7. Saving to your account: the boards already on the phone move to it, and the same boards open on the phone and the computer, without overwriting. Check: add a note on your phone and see it on your computer, then the other way around.
8. "Download a copy" and "Restore a copy." Check: download a copy, remove a board, restore the copy: the board comes back.
9. Polish after a week of real use, then decide whether it goes on the Projects page.

## Open questions (ask one at a time)

1. The name: "Idea board" is a working name.
2. The look: Moon jar like the website (Claude's suggestion), or its own.
3. Several boards (Claude's suggestion, build step 3), or one big board.
4. Signing in: an email code like Living in the Word (Claude's suggestion), or a long passphrase typed once on each device.
