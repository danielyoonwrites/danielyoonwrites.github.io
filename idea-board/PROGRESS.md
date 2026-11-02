# Idea board: progress (updated November 2, 2026)

A little app like Apple's Freeform, just for the owner: typed notes, photos and links on boards, the same on his Android phone and on a computer. Read `SPEC.md` (what it does, and the build plan), `DECISIONS.md` (choices and their reasons) and `CLAUDE.md`.

## Where it stands
- Live: https://danielyoonwrites.github.io/idea-board. One board of notes, saved only on the device in use (IndexedDB), in the "Paper and ink" look with "index card" notes. Build step 2 (pull request 104) and the accessibility fixes (pull request 105) are merged.
- Dan tried it on his phone (November 2, 2026): "I tried it on the phone it works pretty well."
- Build step 3 is in pull request 106: several boards. The app opens on "Your boards" (newest first, with how many notes), "New board" asks for a name first, and on a board "← Boards" and "Edit" (rename, or "Remove board," which asks first and then offers Undo). The phone's Back button goes back one step. The 88 saved checks pass (`node idea-board/tests/app-test.mjs`), and axe-core found 0 problems on five screens.
- Not checked yet: the KakaoTalk in-app browser.
- Claude's rough estimate: 6 more small pull requests (build steps 4 to 9).

## Waiting on Dan
1. Merge pull request 106: https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/106, Conversation tab, Merge pull request, Confirm merge.
2. The check, after the merge (publishing takes a minute or two; the phone may keep the old copy for up to 10 minutes): on your phone, open Chrome and go to https://danielyoonwrites.github.io/idea-board. "Your boards" shows "My board" with its notes. Tap "New board," type a name, tap "Done," add a note, then tap "← Boards": both boards are in the list. Open one, tap "Edit," change its name, tap "Done." Then tap < at the bottom of the phone: it goes back one step at a time, to the list.

## Open pull requests
- Pull request 106, build step 3.

## Next step
After the merge: build plan step 4, photos (add one from the phone, shrunk before saving; move it and change its size).
