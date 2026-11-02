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
