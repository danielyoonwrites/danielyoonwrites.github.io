# Idea board: decisions

Each decision with its reason, oldest first. Only add to this file; if a decision changes, add a new entry that says which one it replaces.

## In force (built November 2, 2026, at the end of the tenth session; pull requests 108 to 110 changed lines)

Every decision below that still holds, one line each; it's rewritten at each handoff. The log under it has each one with its reason, and is only added to.

- November 2, 2026: Dan builds his own app like Apple's Freeform (his "A": a plan first), instead of Canva Whiteboards, Excalidraw or Concepts.
- November 2, 2026: version 1 holds typed notes, photos and links.
- November 2, 2026: built to work for everyone, used just by Dan for now: each person's boards are their own, nothing is shared, and only Dan's address can sign in until sign-ups open; the same boards on his phone and computer (build steps 6 and 7). (Replaces "just for Dan.")
- November 2, 2026: saving to an account (build steps 6 and 7) comes before links (build step 5), Dan's wish.
- November 2, 2026: its own Cloudflare Worker and D1 database, apart from Living in the Word's (Claude's choice, put to Dan with pull request 103).
- November 2, 2026: the name "Idea board," at https://danielyoonwrites.github.io/idea-board (Dan's "a").
- November 2, 2026: the "Paper and ink" look, like Living in the Word (Dan's "B").
- November 2, 2026: several boards, with a list on the start screen (Dan's "a").
- November 2, 2026: signing in with an email code, like Living in the Word, from build step 6 (Dan's "a").
- November 2, 2026: a tap opens a note on its own screen; dragging moves it; every letter is saved; an empty note isn't kept; "Remove" offers Undo for 8 seconds; a new note goes in an open spot; "Show all"; faint dots; − and + only on computers; notes grow taller instead of a resize corner.
- November 2, 2026: "index card" notes, a little lighter than the paper (Dan: "I like the index card idea").
- November 2, 2026: easy to see and read: note edges 3.2 to 1, note words 21 pixels, buttons at least 48 by 48, no words under 13 pixels, buttons on two rows at 200% zoom.
- November 2, 2026: the app opens on "Your boards" (newest first); "New board" asks for a name first; on a board "← Boards" and "Edit"; "Remove board" asks first, then offers Undo; the phone's Back button goes back one step.
- November 2, 2026: notes line up: a note you let go of glides onto the nearest spot on the dots (every 64 board pixels, the same at every zoom), a new note goes in line with the note nearest the middle, and notes saved before stay put until they're moved (Dan's "a").
- November 2, 2026: photos (build step 4): "Add" opens a new note's screen, where "Photo" adds a photo instead (Dan's "A"); photos already on the phone only, "Take a photo" after build step 7 (Dan's "C"); a tap opens a photo on its own screen with "Done" and "Remove" (Dan's "A"); a thin ink size corner just outside the photo (Dan's "A").
- November 2, 2026: photos are shrunk on the device (1600 pixels on the long side, a JPEG without hidden details) and kept in their own database, "idea-board-photos"; a photo's width settles in steps that line up with notes (Claude's choices, put to Dan with pull request 109).

## Log (oldest first)

### November 2, 2026: build our own app like Freeform, starting with a plan (pull request 103)
- Decision: the owner builds his own app like Apple's Freeform, starting with a plan only. His choice "A" of three: a plan first (Claude's recommendation), later (after Living in the Word's current step), or use Canva.
- Why: Freeform runs only on Apple devices (Apple's iCloud help lists only iPhone, iPad and Mac; through search results, November 2, 2026). The owner: "Wait I didn't mean using Canva , I meant making my own app. But if that isn't worth it let me know." Claude's answer: worth it as his next learning app, not worth it just to get a whiteboard. The owner: "A, unless this will take a very long time." Claude's rough estimate: 8 small pull requests after the plan.
- Turned down: Canva Whiteboards (free, with notes, photos and saving across devices, per Canva's Help Center, November 2, 2026), Excalidraw (free and open source; it autosaves in the browser, per its GitHub page) and Concepts (made for drawing). Also checked, through search results: Microsoft Whiteboard (Microsoft set its Android app to retire on October 16, 2026) and Google Jamboard (shut down December 31, 2024).

### November 2, 2026: typed notes, photos and links (pull request 103)
- Decision: version 1 holds typed notes, photos and links.
- Why: the owner's answer "A" when asked what he'd mostly put on the board ("Typed notes, photos and links").

### November 2, 2026: just for the owner, the same boards on the phone and the computer (pull request 103)
- Decision: only the owner uses it, with no sharing. The boards are saved to his account, so they open on his Android phone and in a computer's web browser.
- Why: the owner said it won't be shared, and: "It would just need a way to save so it can be accessed both on Android phones and web page on computer."
- Turned down: saving only on the phone, like First step smaller, because then the computer can't open the boards.

### November 2, 2026: its own small server, apart from Living in the Word's (pull request 103)
- Decision: Claude's choice, put to the owner with pull request 103: its own Cloudflare Worker and D1 database, not added to Living in the Word's server.
- Why: a problem in one app's server can't break the other, and photos can't fill Living in the Word's database (D1's free plan has 500 MB per database: Cloudflare's docs, read as their source on GitHub, November 2, 2026).
- Turned down: adding the boards to Living in the Word's server. It would need no new setup in Cloudflare, but it ties the two apps together.

### November 2, 2026: the name, "Idea board" (pull request 103)
- Decision: the app is called "Idea board," at https://danielyoonwrites.github.io/idea-board (folder `idea-board/`).
- Why: the owner's choice "a" of three: "Idea board" (Claude's recommendation: plain, and says what it is), "Thinking table," or "Room to think."
- Turned down: "Thinking table," and "Room to think," which sounds like "Quiet room" (nice or confusing).

### November 2, 2026: the look, "Paper and ink" (pull request 104)
- Decision: the same look as Living in the Word: warm paper, black ink, EB Garamond and Jost, thin lines, square corners.
- Why: the owner's choice "B" of three: Moon jar like the website (Claude's recommendation), "Paper and ink" like Living in the Word ("clean, like Kinfolk magazine"), or a new look of its own.
- Turned down: Moon jar, and a new look.

### November 2, 2026: several boards (pull request 104)
- Decision: several boards, with a short list on the start screen (build step 3).
- Why: the owner's choice "a" (Claude's recommendation): one board for each thing, like a sermon series or a story, so no board gets crowded.
- Turned down: one big board for everything (simpler, with no list).

### November 2, 2026: signing in with an email code (pull request 104)
- Decision: an email code, like Living in the Word's: the email address, a 6-digit code by email, then that device stays signed in (Living in the Word: 90 days).
- Why: the owner's choice "a" (Claude's recommendation): nothing to remember, the way he already signs in to Living in the Word, and that code already exists to copy.
- Turned down: a long passphrase typed once on each device (no email needed, but it has to be remembered).

### November 2, 2026: how the first board works (pull request 104)
- Decision: Claude's choices, put to the owner with pull request 104 and its screenshots:
  - A tap opens a note on its own screen, with a big box to type in, "Done" and "Remove"; dragging moves it. The phone's Back button (<) closes an open note and keeps the words.
  - Every letter is saved as you type. An empty note isn't kept. "Remove" shows "Note removed. Undo" for 8 seconds.
  - A new note goes in an open spot near the middle of the screen, never covering another, and the board glides to show it. "Show all" fits every note on the screen.
  - Faint dots on the board, so you can see it move. The − and + buttons show only on a computer (phones pinch).
  - A note grows taller when its words need more room, instead of having a corner to resize it.
  - The notes look like index cards, a little lighter than the paper (to confirm: open question 5 in `SPEC.md`).
- Why: one thing per screen; on a phone, typing on a zoomed-out board would mean tiny letters. Notes added one after another first piled up and hid each other's words in the screenshots, so each now gets its own spot.
- Turned down: typing straight onto the note on the board, and new notes stacked a little lower and to the right of the last one.

### November 2, 2026: the notes' color, "index card" (pull request 105)
- Decision: the notes stay "index card," a little lighter than the paper, with a soft shadow.
- Why: the owner, after trying the board: "wow this is nice. I like the index card idea."
- Turned down: "soft shade" (darker than the paper) and "pale yellow."

### November 2, 2026: easier to see and read (pull request 105)
- Decision: four changes from an accessibility check: the notes' edges are a darker warm grey (`#8C8478`, 3.2 to 1 against the paper, from 1.3); note words are 21 pixels (from 19); the bottom buttons go onto two rows, and "Undo" under "Note removed," when the screen is narrow or the phone's zoom is turned up; and every button is at least 48 by 48 (Done, Remove and Undo were 40 to 44 pixels tall). Also: the Undo button's line is easier to see (4.7 to 1, from 2.2), and screen readers no longer read out "Saving" after every letter. Claude's choices, put to the owner with pull request 105 and before-and-after screenshots.
- Why: the owner: "I would like to check accessibility information to make sure it is easy to see and read." The check used WCAG 2.2's rules (read in W3C's source on GitHub), Android's 48-by-48 guide (through search results), and axe-core 4.10.2, which found 0 problems on four screens before and after. The words already passed (note words 16.2 to 1, small grey words 6.75 to 1). What didn't: at 200% zoom on a phone the buttons ran off both edges, and the notes' edges were faint (WCAG asks 3 to 1 for what you need to see a control).
- Turned down for now: − and + on phones too (one-finger zoom, WCAG 2.5.1), and a way to move notes without dragging (2.5.7); both are about using it, not seeing it, and both add buttons.

### November 2, 2026: several boards, how they work (pull request 106)
- Decision: Claude's choices for build step 3, put to the owner with pull request 106 and its screenshots:
  - The app always opens on "Your boards," the one changed last at the top, each with how many notes it has ("No notes yet," "1 note," "3 notes").
  - "New board" asks for the name first, on its own screen, then opens the board. An empty name becomes "Untitled board." The phone's Back button on that screen makes no board.
  - On a board: "← Boards," the board's name, and "Edit," which opens the name screen to rename it or "Remove board."
  - "Remove board" asks first, on the same screen ("Remove “Sermon series” and its 3 notes?" with "Remove" and "Keep it"), then "Board removed. Undo" shows for 8 seconds.
  - The phone's Back button goes back one step: note to board, board to list.
  - "Saved on this device" moved from the top bar into the board's top right corner (the bar now holds the board's name) and fades 3 seconds after each save.
  - The board saved by build step 2 ("My board") shows in the list as it is; nothing had to change in what's saved.
- Why: one thing per screen; a board is easier to find with a name; removing a whole board loses more than one note, so it asks first and still offers Undo. The owner, after trying build step 2 and the accessibility fixes on his phone: "I tried it on the phone it works pretty well." Then he chose "A" (start build step 3).
- Turned down: opening straight on the last board (the plan says the app opens on the list), new boards called "Untitled" until renamed (they would pile up in the list), and a phone pop-up to confirm removing (the question stays on the app's own screen).

### November 2, 2026: notes line up on the dots (pull request 108)
- Decision: a note you let go of glides onto the nearest spot on the board's dots, so notes line up in rows and columns. Dan's choice "a" of three: notes settle onto the dots (Claude's recommendation), guide lines while dragging, or not now.
- Why: Dan, after trying build step 3 on his phone ("it feels good and works well"): "Could there be a way to have maybe some sort of grid line or system that might help the different post it notes be aligned, like at the same height or something to help it look more organized? If that is hard and not worth the effort let me know." Claude: not hard, and worth it; the dots already on the board can be the grid, settling acts the same way every time under a finger, and photos (build step 4) can line up the same way.
- How it works (Claude's choices, put to Dan with pull request 108 and its screenshots):
  - The spots are every 64 board pixels: every second dot at the normal zoom, every dot when zoomed out. They're the same at every zoom, so any two notes can line up exactly. The dots look as before (32 board pixels apart at the normal zoom), drawn so a dot sits on every spot.
  - The note glides there in 0.15 seconds (no glide with reduced motion turned on).
  - A new note goes in the same rows and columns as the note nearest the middle of the screen (256 board pixels apart: a note's width and a gap).
  - Notes saved before stay where they are until they're moved; nothing moves by itself. Notes still grow taller when their words need room, so their tops line up, not always their bottoms.
- Also fixed, found by the saved checks: a tap on a note near the top of the screen put the cursor where the finger was (the tap's own click lands on the typing box a moment later), so typing went into the middle of the words. The cursor now goes back to the end.
- Turned down: guide lines while dragging (more work, and the pull can feel jumpy under a finger); not now; settling onto whichever dots show at the zoom you're at (the first try: zoomed out, fewer dots show, so a note placed close in could never line up exactly with one placed zoomed out); every dot as a spot (zoomed out the way a phone shows several notes, a finger would have only about 6 to 8 screen pixels of leeway).

### November 2, 2026: how to add a photo, and from where (pull request 109)
- Decision: "Add a note" became "Add." It opens a new note's screen as before, with a "Photo" button at the top until you type something. "Photo" opens the phone's own photo picker (on a computer, the file window). Photos already on the phone only for now; "Take a photo" comes after build step 7.
- Why: Dan's "A" of three for where to tap (Claude's recommendation): notes stay one tap, photos take two, and the bottom buttons stay on one row. Claude measured that a third button doesn't fit there on a phone: 328 pixels of room on a 360-pixel screen, and "Show all" and "Add a note" already take 288. For the camera, Dan's "C" of three (Claude's recommendation): in Chromium's source (`SelectFileDialog.java`, main branch, read November 2, 2026), a picture taken through the camera from a web page goes to a temporary file that's cleared after an hour, not to the phone's photos, so until boards are saved to his account the board's smaller copy would be the only one.
- Turned down: a separate "Add a photo" button (two rows of buttons on a phone); one "Add" button that asks "Note or photo?" (the plan's first idea: an extra tap and screen for every note); "Take a photo" now.

### November 2, 2026: a photo on the board (pull request 109)
- Decision: a tap opens a photo on its own screen, big, with "Done" and "Remove" ("Photo removed. Undo" for 8 seconds); the phone's Back button closes it. Dragging moves a photo, and it settles on the dots like a note. Its size corner is a thin ink corner, like a picture frame's, just outside the photo's bottom-right corner, on the paper.
- Why: Dan's "A" for both (Claude's recommendations): it works like a note, one thing per screen; the ink corner matches the thin lines of "Paper and ink," and on the paper it shows on dark and light photos alike.
- Turned down: a first tap that selects and a second that opens; nothing on a tap, with an × to remove; a round handle; a square tab with an arrow.

### November 2, 2026: how photos work underneath (pull request 109)
- Decision: Claude's choices, put to Dan with pull request 109 and its screenshots:
  - A photo is shrunk on the device to 1600 pixels on the long side, as a JPEG (quality 0.85), turned the right way up. It's a new picture, so it leaves out the hidden details a phone's photo carries, like where it was taken; the saved checks prove it with a made-up location.
  - Photos are kept in their own database, "idea-board-photos" (`{ id, blob, width, height, made }`); the board's item is `{ id, type: 'photo', photoId, x, y, width, ratio, made, changed }`. This replaces the plan of a new store in the boards' database (`SPEC.md`, "Tech notes," written at the end of the tenth session): that needed the boards' database opened as version 2, and a phone still running the old copy of the app (up to 10 minutes after a merge) would then fail to open the boards, or hold up the change while its tab stayed open.
  - A new photo is as wide as a note (220). Its width settles to a whole number of spots less the gap between notes, from 156 to 988, so it can be exactly as wide as one, two, three or four notes side by side, and it keeps its shape. The corner's grab area is 48 by 48 on the screen at any zoom, and the corner hides when the photo is under 120 pixels wide on the screen.
  - A photo's file goes for good only once removing it (or its board) can't be undone; a file no board uses is tidied away at the start, once it's a day old.
  - The list counts photos ("1 note and 1 photo"), and "Remove board" names them too.
- Why: never lose work; and the server (build steps 6 and 7) can keep one photo per row (D1 allows 2 MB per row, per `SPEC.md`, "Tech notes").
- Turned down: a new store in the boards' database (above); photos inside the board's own record (a board would hit 2 MB after about six photos).

### November 2, 2026: built to work for everyone, used just by Dan for now (pull request 110)
- Decision: the server and the saving (build steps 6 and 7) are built so each person who signs in has their own boards and photos, kept apart from everyone else's. For now only Dan's address can sign in (the server keeps a list of allowed addresses). Opening sign-ups to everyone comes later, with its own questions first (limits, costs, privacy). Nothing is shared between people, and there's no working on a board together live.
- Why: Claude asked whose boards it should save ("a) Just yours" or "b) Anyone's"), because Dan wrote "someone's board." Dan: "I have cloud flare, I am using it for another project in Claude code already. Let's mainly use it for me for now, but we should build it to work for everyone."
- Replaces: "just for the owner" (pull request 103) and, in `CLAUDE.md`, "no other accounts" and signing in only with `OWNER_EMAIL`.

### November 2, 2026: saving before links (pull request 110)
- Decision: build steps 6 and 7 (the server, signing in, saving to the account) come next, before step 5 (links).
- Why: Dan, after trying photos on his computer: "maybe we should add a way to save so that someone's board can be accessed on phone or computer."

### November 2, 2026: the dots drawn exactly (pull request 110)
- Decision: Claude's fix: the dots are drawn on a canvas behind the board, each exactly on its spot, instead of as a repeating background.
- Why: on his computer, Dan couldn't line a photo up with the note "act 1." The main cause: "act 1" and "act 2" were made before lining up and sat between spots; Dan dragged each once, and then it lined up ("it works"). But his screenshot also showed the dots a few pixels away from the spots: browsers round the little squares of a repeating background. In a test browser the dots were 1 to 4 screen pixels off before the fix, and under 0.1 after.
- Turned down: keeping the repeating background (the dots could mislead the eye).
