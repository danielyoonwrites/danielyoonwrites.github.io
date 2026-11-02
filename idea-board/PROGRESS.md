# Idea board: progress (updated November 2, 2026)

A little app like Apple's Freeform, just for the owner: typed notes, photos and links on one big board, the same on his Android phone and on a computer. Read `SPEC.md` (what it does, and the build plan), `DECISIONS.md` (choices and their reasons) and `CLAUDE.md`.

## Where it stands
- Live: https://danielyoonwrites.github.io/idea-board (build step 2, pull request 104, merged November 2, 2026). One board of notes, saved only on the device in use (IndexedDB), in the "Paper and ink" look with "index card" notes (the owner: "I like the index card idea").
- Pull request 105: easier to see and read, after an accessibility check the owner asked for (`SPEC.md`, "Easy to see and read"): darker note edges, 21-pixel note words, buttons on two rows at 200% zoom, every button 48 by 48. The 57 saved checks pass (`node idea-board/tests/app-test.mjs`), and axe-core found 0 problems before and after.
- Not checked yet: how it feels on a real phone, and in the KakaoTalk in-app browser.
- Claude's rough estimate: 7 more small pull requests (build steps 3 to 9).

## Waiting on Dan
1. Merge pull request 105: https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/105, Conversation tab, Merge pull request, Confirm merge.
2. The check, after the merge (publishing takes a minute or two; the phone may keep the old copy for up to 10 minutes): on your phone, open Chrome and go to https://danielyoonwrites.github.io/idea-board. The notes have a clear grey edge and slightly bigger words. Then make the page bigger: in Chrome, tap the three dots (top right), then Zoom, and slide it to 200% (if Zoom isn't in that menu, Google's Chrome help says to turn it on in Chrome's Settings, then Accessibility; read through search results, not opened). The two bottom buttons should sit on two rows, both fully on the screen. Slide the zoom back to 100% after.
3. The phone check from build step 2, if not done yet: add three notes, move them, pinch to zoom out, tap "Show all," tap a note and then < to close it, and close Chrome and open the link again: the notes are still there.

## Open pull requests
- Pull request 105, easier to see and read.

## Next step
After the merge: build plan step 3, several boards (the start screen, "New board," rename, remove).
