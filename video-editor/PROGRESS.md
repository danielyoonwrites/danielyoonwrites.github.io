# Video editor: progress (updated November 2, 2026)

The plan for a simple video editor, just for the owner, on his Android phone in Chrome: a filter, lighting, text, clip order, crop and speed, with the videos never leaving the phone. Read `SPEC.md` (what it does, the tech notes and the build plan), `DECISIONS.md` (choices and their reasons) and `CLAUDE.md`.

## Where it stands
- Planned November 2, 2026, in pull request 110 (build plan step 1). Nothing is built yet.
- The research behind it is in Dan's Notion (Master Notes, "Simple video editor: how hard to build (Nov 2026)"): doable in Chrome on the phone; the hard part is saving the finished video; Mediabunny does the file work.
- Claude's rough estimate: 8 to 10 small pull requests in all, about as many as Idea board's plan (9 build steps), with harder steps.
- The name is chosen: "Video editor" (Dan's "A"), so the folder and web address stay `video-editor/`. The other open questions come with their build steps, one at a time; the look is next, with build step 3 (`SPEC.md`, "Open questions").

## Waiting on Dan
1. Read the plan: on https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/110, tap the "Files changed" tab, then `video-editor/SPEC.md` ("How it works" and "Build plan").
2. Merge pull request 110: https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/110, Conversation tab, Merge pull request, Confirm merge.

## Open pull requests
- Pull request 110, this plan (only new notes; nothing on the website changes).

## Next step
After the merge: build plan step 2, the phone test (a 5-second black-and-white copy of a video, saved and shared, showing what Chrome can do and how long it took).
- Save Mediabunny 1.65.0's `dist/bundles/mediabunny.min.mjs` (from the npm package) in `video-editor/lib/`, with its `LICENSE` and a short note with the source link.
- Make test videos in the cloud session (never the owner's). Check what Claude's test browser can make (it may lack H.264 and AAC; unverified), and say in the pull request which parts only the phone can check.
- Show screenshots before the pull request.

## Dead ends
- jsDelivr, unpkg and chromestatus.com couldn't be reached from Claude's session (November 2, 2026). Mediabunny's files come from the npm registry (`registry.npmjs.org`, reachable); Chrome's feature pages, only through search results.
