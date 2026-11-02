# Idea board: decisions

Each decision with its reason, oldest first. Only add to this file; if a decision changes, add a new entry that says which one it replaces.

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
