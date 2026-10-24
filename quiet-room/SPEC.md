# SPEC: Quiet Room, Stage 1

The app will live at https://danielyoonwrites.github.io/quiet-room (GitHub Pages, from this repository).

Who it's for: adults in my young adults group at church who want company while they read, study, read the Bible or work on anything.

What they see: one shared room with desks. Each person's avatar sits at a desk with their name, what they're doing, and whether they're focusing or on a break.

What's different: nothing punishes you for leaving the tab or app, nothing pings you, and it isn't a game. Your seat stays yours while you work anywhere.

## Must-haves
- Join one private room by link; type a display name; pick one of about 6 preset avatars. Draw them yourself as simple, original drawings (no copied characters).
- Pick what you're doing: Reading, Studying, Bible reading, Working, or your own words.
- Set yourself to Focusing or On a break. The app never checks what you do; you set your own status.
- Optional personal timer: 25 or 50 minutes, or none.
- See everyone in the room live.
- If someone's connection drops, their avatar shows "stepped away" and keeps the seat for 15 minutes.
- The room is open any time.
- No sound, notifications, chat, coins, rankings, ads or tracking.
- Works in a browser on laptops and phones.
- A small link back to my website, danielyoonwrites.github.io, at the bottom.

## Not in Stage 1
- Chat or a lounge, an avatar builder, more rooms, public rooms, real accounts (only anonymous sign-in for now), background sound.

## Ideas for later
- A weekly quiet hour shown on the page, so people overlap (decided October 24, 2026: not needed yet).
- Track what you got done with the app, like chapters read or minutes studied. To think through first: it means storing more than Stage 1 does; keep it personal so it never becomes a ranking; and with anonymous sign-in it would stay on one browser, so keeping it across devices needs real accounts.

## Safety and privacy
- Private link only. If the link leaks, I make a new room.
- No age rule on the page (decided October 24, 2026): people can't communicate, so it isn't needed now. Revisit if chat or anything that lets people contact each other is ever added.
- Store only display name, avatar choice, what they're doing, status and times.
- Database rules: each person can change only their own seat.

## How we'll know it works
- Two browsers open: a status change in one shows in the other within a few seconds.
- Close one tab: that avatar shows "stepped away," then disappears after 15 minutes.
- A test proves one person can't change another person's seat.

## Tech notes
- Static page on GitHub Pages. Live presence on Firebase Realtime Database, free Spark plan (100 simultaneous connections; each open browser tab counts as one). Anonymous sign-in.
- Use Firebase's presence pattern (.info/connected and onDisconnect), so a closed tab or lost connection becomes "stepped away."
- Browsers slow down timers in background tabs, so work out the timer from its start time instead of counting second by second.
- On iPhones, Safari can close the live connection soon after you switch away, so a dropped connection means "stepped away," not "left."
- Firebase limits new anonymous sign-ups from the same internet address in a short time. Keep that in mind if several people join from one place.
- Question to settle in the plan: each person can change only their own seat, so other people's browsers can't delete a stale seat. Explain how stale seats get hidden or cleaned up, and the tradeoffs.

## Design system (same as my website, a calm look called "Moon jar")
Colors
- porcelain #F1EFEA: background. Warm white, never pure white.
- ink #1E1C1A: main text.
- celadon #386F61: links, buttons and small labels. Never a background behind body text.
- stone #6B655C: secondary text such as times and small print.
- glaze #DCE6DF: thin divider lines only.

Type
- All English in Libre Baskerville (Google Fonts), Regular and Italic only. Never bold.
- Small labels: uppercase, wide letter spacing (about 0.14em), in celadon.

Layout and words
- Left-aligned text, calm open space, square corners.
- Avatars: simple original drawings in these colors.
- Sentence case, no exclamation marks, no emoji.
