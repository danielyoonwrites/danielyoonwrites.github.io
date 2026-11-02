# Idea board: progress (updated November 2, 2026)

A little app like Apple's Freeform, just for the owner: typed notes, photos and links on one big board, the same on his Android phone and on a computer. Read `SPEC.md` (what it does, and the build plan), `DECISIONS.md` (choices and their reasons) and `CLAUDE.md`.

## Where it stands
- Planned November 2, 2026 (pull request 103, merged). The plan's four questions are answered: the name "Idea board," the look "Paper and ink," several boards, and signing in with an email code.
- Build step 2 is in pull request 104: one board of notes, saved only on this device (IndexedDB). Drag an empty spot to move around, pinch to zoom (on a computer, the mouse wheel or − and +), "Add a note," tap a note to open it on its own screen, drag a note to move it, "Remove" with Undo, and "Show all." The phone's Back button closes an open note. The 44 saved checks pass (`node idea-board/tests/app-test.mjs`).
- Open question 5: the notes' color, "index card" (Claude's suggestion), "soft shade" or "pale yellow" (screenshots with pull request 104).
- Not checked yet: how it feels on a real phone, and in the KakaoTalk in-app browser.
- Claude's rough estimate: 7 more small pull requests (build steps 3 to 9).

## Waiting on Dan
1. Pick the notes' color: A, "index card"; B, "soft shade"; or C, "pale yellow."
2. Merge pull request 104: https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/104, Conversation tab, Merge pull request, Confirm merge.
3. The check, after the merge (publishing takes a minute or two): on your phone, open Chrome and go to https://danielyoonwrites.github.io/idea-board. Tap "Add a note," type a few words, tap "Done"; do it three times. Drag a note to move it, drag an empty spot to move the board, pinch with two fingers to zoom out, then tap "Show all." Tap a note, then tap < at the bottom of the phone: the note closes and you're still on the board. Close Chrome (tap |||, then swipe Chrome away) and open the link again: the notes are still there. Then open the link on your computer: its board starts empty (saving to your account comes in build step 7); try the mouse wheel, − and +.

## Open pull requests
- Pull request 104, build step 2.

## Next step
After the merge and Dan's check: build plan step 3, several boards (the start screen, "New board," rename, remove).
