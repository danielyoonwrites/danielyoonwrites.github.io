# SPEC: Idea board

A little app at https://danielyoonwrites.github.io/idea-board (folder `idea-board/` in the website repository). Planned with the owner, November 2, 2026.

## Who it's for

Built to work for everyone, used just by the owner for now (his words, November 2, 2026: "Let's mainly use it for me for now, but we should build it to work for everyone"). Each person who signs in has their own boards and photos, kept apart from everyone else's; nothing is shared between people, and there's no working on a board together live. For now only the owner's address can sign in. He uses it on his Android phone (in Chrome) and in a computer's web browser. In his words: "It would just need a way to save so it can be accessed both on Android phones and web page on computer."

## What it is

Boards of typed notes, photos and links (several boards, each one big and endless), like Apple's Freeform, which runs only on iPhone, iPad and Mac (Apple's iCloud help, through search results, November 2, 2026). Free apps already do this (Canva Whiteboards has notes, photos and saving across devices, per Canva's Help Center, November 2, 2026), so this one is built as the owner's next learning app, made his way.

## How it works (version 1)

1. The app opens on "Your boards": your boards, the one changed last at the top, each with how many notes it has, and "New board" at the bottom. "New board" asks for a name first (an empty name becomes "Untitled board"), then opens the new board.
2. A board fills the screen, under a thin bar: "← Boards" (back to the list), the board's name, and "Edit" (rename it, or "Remove board," which asks first: "Remove “Sermon series” and its 3 notes?"; then "Board removed. Undo" shows for 8 seconds). The phone's Back button (<) goes back one step: from a note to its board, from a board to the list. Drag an empty spot to move around (one finger on the phone, the mouse on a computer). Pinch with two fingers to zoom (on a computer, the mouse wheel or the + and − buttons).
3. "Add" opens a new note's screen. Whatever you add lands near the middle of the screen, in line with the notes and photos already there.
   - Note: type into the big box. A square note; tap it later to change the words.
   - Photo: until you type, the note's screen has "Photo" at the top. It opens the phone's own photo picker (on a computer, the file window): choose a photo already on the phone. The app makes a smaller copy before saving it. "Take a photo" (the camera) comes after build step 7 (Dan's "C," pull request 109).
   - Link (build step 5): a web address and an optional title, shown as a small card. Tapping it opens the page in a new tab. How to add one is open question 9.
4. Drag anything to move it. When you let go, it glides onto the nearest spot on the dots, so things line up in rows and columns (Dan's idea, pull request 108). Tap a note to open it on its own screen, with a big box to type in, "Done" and "Remove" ("Note removed. Undo" shows for a few seconds). The phone's Back button (<) closes an open note and keeps the words. A note grows taller when its words need more room. Tap a photo to open it on its own screen, big, with "Done" and "Remove" ("Photo removed. Undo" for 8 seconds). A photo has a thin ink corner at its bottom right: drag it to make the photo bigger or smaller (it keeps its shape, and settles in steps that line up with the notes).
5. Everything saves by itself, to your account, so the same boards open on the phone and the computer.
6. "Download a copy" saves every board, with its photos, in one file. "Restore a copy" brings them back.

## Must-haves

- Phone first: big buttons, and moving the board never gets mixed up with moving a note.
- Never lose work: each change is saved within a couple of seconds, and there's a backup file.
- Nothing is overwritten between the phone and the computer. If a board changed on the other device, the app says so and loads the newest one first.
- Only you can open your boards: each person only their own.

## Not in version 1 (ideas for later)

- Drawing with a finger or a pen; shapes, arrows and lines between notes.
- Sharing a board, or working on it together live.
- Working without reception.
- Installing it on the home screen like an app.
- Search, PDFs and other files, videos, templates, AI help.

## Privacy and safety

- A person's boards open only on a device signed in with that person's own address. For now, only the owner's address can sign in.
- The boards go only to this app's own server, on the owner's Cloudflare account: never to an AI, analytics or anyone else. The app's code is public; the boards aren't.
- The smaller copy of a photo is a new picture, so it leaves out the original's hidden details, like where it was taken (checked by section F of the saved checks, pull request 109, with a made-up location).

## The look

"Paper and ink," like Living in the Word (the owner's choice "B", November 2, 2026): warm paper, black ink, EB Garamond for reading, Jost for small labels and buttons, thin lines, square corners. The colors and fonts are the same as Living in the Word's, at the top of `style.css` (and in `living-in-the-word/SPEC.md`, "The look").

- The board: faint dots on the paper, so you can see it move. Notes settle onto them (on every second dot at the normal zoom, on every dot when zoomed out).
- The notes: "index card," a little lighter than the paper (`--note`, `#FBF8F2`), with a soft shadow (the owner's choice, November 2, 2026: "I like the index card idea"). Their edge is a thin warm grey line (`--edge`, `#8C8478`), dark enough to see easily, and their words are 21 pixels.
- "Your boards": a thin bar with "Idea board," the title "Your boards" in the middle, then one row for each board (its name, how many notes, and an arrow) with thin lines between, like Living in the Word's start screen. "New board" at the bottom.
- On a board: a thin bar with "← Boards," the board's name and "Edit." "Saved on this device" sits in the board's top right corner and fades 3 seconds after each save, so it doesn't sit over a note. The buttons at the bottom: "Show all" and "Add" (on a computer also − and +).
- Photos: the picture in a thin frame (the notes' edge color) with the notes' soft shadow. The size corner is a thin ink corner, like a picture frame's, just outside the photo's bottom-right corner, on the paper (Dan's "A"); the part a finger can grab is 48 by 48 on the screen, and it hides when the photo is under 120 pixels wide on the screen.
- A new note's screen: "Remove," then "Photo" (lines on paper, until you type) and "Done." A photo's own screen: "Remove" and "Done," and the photo as big as fits.
- A board's name screen: "Board name" over a single line to write on, how many notes, and "Remove board" and "Done" at the top.

## Easy to see and read (checked November 2, 2026)

The owner asked: "I would like to check accessibility information to make sure it is easy to see and read." The rules come from WCAG 2.2, read in W3C's own source files on GitHub (https://github.com/w3c/wcag, `guidelines/sc/`), November 2, 2026:
- Words: at least 4.5 to 1 against their background (1.4.3, level AA), or 7 to 1 for level AAA (1.4.6). Large text (18 point, or 14 point bold) needs 3 to 1 (AA).
- What you need to see to use a control: at least 3 to 1 (1.4.11, AA).
- Text can be made 200% bigger without losing anything (1.4.4, AA); a page 320 pixels wide works without scrolling sideways, except things like maps and diagrams (1.4.10, AA).
- Tap targets at least 24 by 24 pixels (2.5.8, AA). Android's guide asks 48 by 48 (its developer docs and Accessibility Help, through search results; not opened).

Where Idea board stands (pull request 105):
- Note words 16.2 to 1 (AAA). Buttons and the top bar 15.0 to 1. The small grey words ("Saved on this device," the hint, the typing box's hint) 6.75 to 1 (AA). Note edges 3.2 to 1 against the paper (they were 1.3), and the Undo button's line 4.7 to 1 (it was 2.2).
- Every button is at least 48 by 48. No words are smaller than 13 pixels at the board's normal zoom (Living in the Word's readability rule). Note words are 21 pixels (they were 19), so "Show all" with three notes on a phone still shows them at about 14.
- With a phone's zoom at 200% (a 360-pixel screen shown as 180), the buttons go onto two rows and "Undo" goes under "Note removed," all on the screen (before, the buttons ran off both edges).
- axe-core 4.10.2 (Deque's open-source checker, run in Chromium for testing only): 0 problems on the empty board, a board with notes, an open note, and "Note removed. Undo." The one thing it couldn't measure, the hint's words over the dots, is 6.75 to 1.
- Kept for later (about using it, not seeing it): zooming on a phone needs two fingers, with "Show all" and opening a note as the one-finger ways (WCAG 2.5.1 asks for a one-finger way); moving a note needs dragging (2.5.7 asks for another way). Far zoomed out, words get small; tapping a note always shows it at 22 pixels.
- Build step 3's screens (the list, a board's name screen, "Remove board") were checked the same way: axe-core 0 problems on five screens, buttons at least 48 by 48, and every button on the screen at 200% zoom (pull request 106).
- Photos (pull request 109): the size corner's grab area is 48 by 48 on the screen at any zoom, its ink is 15 to 1 against the paper (at least 3 to 1 is asked), and a photo's edge 3.2 to 1. A new note's screen (with "Photo") and a photo's own screen keep every button at least 48 by 48, and on the screen at 200% zoom (the buttons go onto more rows). axe-core 4.10.2: 0 problems on eight screens.
- The saved checks keep all of this true: section C of `tests/app-test.mjs`.

## Tech notes (Claude's plan; the owner can change any of it)

- Plain HTML, CSS and JavaScript in this folder, with no build tools. File links end in a version number (`?v=6` after pull request 113), raised whenever a file changes.
- The board is ordinary page boxes on a large surface that moves and zooms with a CSS transform, so text stays sharp. Touch and mouse both go through Pointer Events.
- On the device, boards are kept in the browser's IndexedDB (database `idea-board`, store `boards`, one record per board, data version 1), because `localStorage` is too small for photos. Each change is saved 0.4 seconds after the last one, and at once when the page goes to the background. Where you were looking (how far the board is moved, and the zoom) belongs to the device, not the board, so it's kept in `localStorage` (`idea-board-view:` and the board's id) and will never travel with the board.
- Items of a type this version doesn't know (photos and links, from a later version) are kept and saved, just not drawn, so an older copy of the app (a phone can keep one for up to 10 minutes) never deletes them.
- A new note goes in an open spot near the middle of the screen (below first on a phone held upright, to the right on a wide screen), so it never covers another note, and the board glides to show it. The spot is in the same rows and columns as the note nearest the middle (256 board pixels apart: a note's width and a gap), so new notes line up with the old ones. "Show all" fits every note on the screen. An empty note isn't kept.
- Lining up (pull request 108): when you let go of a note, its top-left corner glides (0.15 seconds; no glide with reduced motion) onto the nearest spot, every 64 board pixels (`SETTLE_GAP` and `onSpot()` in `app.js`). The spots are the same at every zoom, so any two notes can line up exactly; settling onto whichever dots show was tried first and dropped, because a note placed close in could then never line up with one placed zoomed out. The dots stay 32 board pixels apart at the normal zoom (`DOT_GAP`) and are drawn so a dot sits on every spot (below a quarter of the size, there are spots between the dots). Notes saved before stay put until they're moved. Photos settle the same way (pull request 109: `itemSize()`, `itemOutlines()` and `openSpot(width, height)` handle any size); links (build step 5) should too.
- The dots (pull request 113) are drawn on a canvas behind the world (`drawDots()` in `app.js`), each exactly on its spot, and redrawn whenever the board moves (each frame of a glide too). A repeating background was used before: browsers round its little squares, so the dots sat 1 to 4 screen pixels away from the spots in a test browser, and several on Dan's computer.
- A tap that opens a screen also sends a click a moment later, to whatever is under the finger on the new screen. On a note's screen that's the typing box, so `openNote()` puts the cursor back at the end of the words (`putCursorAtEnd()`; found in pull request 108).
- The saved checks: `node idea-board/tests/app-test.mjs` from the repository folder (Chromium at 360 wide with touch, 1280 with a mouse, and 180 for a phone with its zoom at 200%; must end "0 failed"). The accessibility check: `idea-board/tests/axe-check.mjs` (how to run it is in `PROGRESS.md`).
- Photos (pull request 109): a photo doesn't live inside its board's record. Each board is one record, written whole 0.4 seconds after every change, and the server's D1 allows 2 MB per row (about six shrunk photos). So the photos are in their own database on the device, "idea-board-photos" (store `photos`: `{ id, blob, width, height, made }`, the blob being the shrunk JPEG), and the board's item only names it: `{ id, type: 'photo', photoId, x, y, width, ratio, made, changed }` (ratio is height divided by width). On the server, one row (or one R2 file) per photo. A separate database, rather than a new store in the boards' database, means the boards' database didn't change version, so a phone still running the old copy of the app (up to 10 minutes after a merge) still opens it, and keeps the photo items it doesn't draw.
- Photos are shrunk on the device before saving, to 1600 pixels on the long side, as a JPEG (quality 0.85; `shrinkPhoto()` draws the picture on a canvas, the right way up). The photo file is saved before the board names it. It goes for good only once removing it (or its board) can't be undone (`clearRemoved()`); at the start, a file no board uses is tidied away once it's a day old (`tidyPhotoFiles()`).
- A photo's width (board pixels) settles to a whole number of spots less the 36-pixel gap between notes (`settledWidth()`): 156 to 988, so 220 is one note wide, 476 two, 732 three and 988 four. While the corner is dragged, the size follows the finger along the photo's diagonal. The corner's size is set in screen pixels through `--zoom`, which `applyView()` sets on the board.
- The server (build step 6): its own small Cloudflare Worker in `idea-board/server/`, with its own D1 database, deployed by itself after each merge like Living in the Word's (Workers Builds). It's kept apart from Living in the Word's server, so a problem in one can't break the other and photos can't fill Living in the Word's database.
- Room on Cloudflare's free plan: D1 has 500 MB per database, 5 GB per account and 2 MB per row (Cloudflare's docs, read as their source on GitHub, November 2, 2026: https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/d1/platform/limits.mdx). Claude's estimate, unverified: about 1,500 shrunk photos fit in 500 MB. If that's ever too small, photos can move to R2, whose free tier is 10 GB-month (the same docs, `r2/pricing.mdx`). Whether R2 needs a payment method on file wasn't on that page (unverified).
- Signing in (build step 6): an email code, like Living in the Word's, through Resend, sent only to an address on the server's list of allowed addresses (`ALLOWED_EMAILS`: just the owner's for now). The server keeps each person's boards and photos under their own account and answers only that person, so opening sign-ups later is mostly taking the list away (with its own questions first: limits, costs, privacy). Codes and session keys are kept only scrambled. If both apps use the same Resend account, they share its daily limit: Resend's free plan sends 100 emails a day and 3,000 a month (from Resend's blog, seen through search results, per `living-in-the-word/SIGNUP-PLAN.md`), and Living in the Word already allows itself 90 a day (`EMAILS_ALL` in its `worker.js`).
- Going from screen to screen (build step 3): each step deeper (a board, a note, a board's name) adds a step to the browser's Back history, and "Done," "← Boards" and the phone's Back button all go back through it. Whenever the history moves, `followHistory()` in `app.js` shows what that step should show. The app always opens on the list.
- Saving between devices (build step 7): each board has a version number. The server refuses a save made from an older copy, and the app loads the newest one instead, so nothing is overwritten.

## Build plan (one pull request each, each with a check the owner does)

Order: saving to your account (steps 6 and 7) comes before links (step 5), the owner's wish (November 2, 2026).

1. This plan, with the folder's `CLAUDE.md`, `PROGRESS.md` and `DECISIONS.md`. Check: read "How it works" and this build plan.
2. One board, saved on this device for now: move around, zoom, add a note, type in it, move it, remove it (with Undo). Check: on your phone, add three notes, move them, zoom out, then close Chrome and open the page again: they're still there. Then try it on your computer. (Built November 2, 2026, pull request 104.)
3. Several boards: the start screen, "New board," rename, remove. Check: make two boards and switch between them. (Built November 2, 2026, pull request 106.) Then Dan's idea after trying it: notes line up on the dots (pull request 108).
4. Photos: add one (shrunk before saving), move it, change its size. Check: add a photo from your phone; it looks sharp enough, and it moves and resizes. (Built November 2, 2026, pull request 109.)
5. Links: a web address and a title; tapping the card opens the page. Check: add a link to your Substack and tap it.
6. The server and signing in: a one-time setup in Cloudflare (with every step), then signing in with an email code. Check: sign in on your phone and on your computer.
7. Saving to your account: the boards already on the phone move to it, and the same boards open on the phone and the computer, without overwriting. Check: add a note on your phone and see it on your computer, then the other way around.
8. "Download a copy" and "Restore a copy." Check: download a copy, remove a board, restore the copy: the board comes back.
9. Polish after a week of real use. (It went on the website's Projects page early, at Dan's wish, in pull request 124, after a name check: `DECISIONS.md`.)

## Open questions (ask one at a time)

1. The name: answered November 2, 2026, "Idea board" (the owner's choice).
2. The look: answered November 2, 2026, "Paper and ink," like Living in the Word (the owner's choice "B").
3. Several boards or one: answered November 2, 2026, several boards (the owner's choice "a").
4. Signing in: answered November 2, 2026, an email code like Living in the Word (the owner's choice "a").
5. The notes' color: answered November 2, 2026, "index card" (the owner: "I like the index card idea").
6. How to add a photo: answered November 2, 2026, "Add" opens a new note's screen with "Photo" (Dan's "A"); and the camera: photos already on the phone only, "Take a photo" after build step 7 (Dan's "C").
7. What tapping a photo does: answered November 2, 2026, its own screen with the photo big, "Done" and "Remove" (Dan's "A").
8. The size corner: answered November 2, 2026, a thin ink corner like a picture frame's, just outside the photo (Dan's "A"). Always there, 48 by 48 to grab, hidden when the photo is small on the screen; the size settles in steps that line up with notes (Claude's choices).
9. How to add a link (build step 5): for example a "Link" button next to "Photo" on a new note's screen, or a note whose words are only a web address turning into a link card by itself.
10. Where photos are kept on the server (build step 7): in the app's D1 database (free; 500 MB, plenty for the owner alone) or in R2, Cloudflare's file storage (free up to 10 GB-month; whether it needs a payment method on file is unverified). For everyone, later, R2 would fit better.
