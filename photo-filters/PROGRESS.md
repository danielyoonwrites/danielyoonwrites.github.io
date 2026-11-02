# Photo Filters: progress (updated November 2, 2026)

A little app that puts Dan's own looks on his photos, in the browser of his phone (Chrome) and his MacBook (Safari), with the photos never leaving the device. It will be live at https://danielyoonwrites.github.io/photo-filters once pull request 115 is merged (not listed in search engines). Read `SPEC.md` ("Build plan for Milestone 1," "Questions to ask Dan first"), `DECISIONS.md` and `CLAUDE.md`.

## Where things stand
- Done: build step 1, the plan (pull request 114, merged November 2, 2026). Dan's answers: build it in this repository ("a"); the name "Photo Filters" ("call it Photo Filters"); Chrome on the phone and Safari on the MacBook ("b"); keep all five looks for now ("a"); then "ok" to the Milestone 1 plan. His Notion page "Photo Looks app: Claude Code spec (Nov 2026)" has the summary and the checked facts.
- In progress: pull request 115, build step 2, choosing a photo:
  - "Choose photo," in a bar at the bottom, opens the phone's photo picker (or the computer's file window).
  - The photo shows right side up, as a copy about 1,080 pixels wide, with its size under it, for example "4,000 × 3,000 pixels (12.0 MP)."
  - A file the browser can't open gets "This browser couldn't open that file. Please choose a JPEG photo."
  - A made-up test photo for the MacBook check: https://danielyoonwrites.github.io/photo-filters/tests/test-photos.html (tall, saved turned with rotation tag 6, with a made-up location at 30 degrees north, 140 degrees west).
- Checked in Chromium: 49 saved checks pass. A 12 MP photo showed about 0.4 seconds after it was chosen (on Claude's cloud computer, not a phone).
- Not checked yet: Safari (Dan's MacBook check settles whether it turns photos right side up), and photos bigger than 12 MP.
- Branch: `ccr-23f232dc-auju6c` (this session's), restarted from main after each merge.
- Open pull requests: pull request 115.

## Next step
Build step 3: Warm natural next to the original (`SPEC.md`, "Build plan for Milestone 1").

## Waiting on Dan
1. Merge pull request 115: https://github.com/danielyoonwrites/danielyoonwrites.github.io/pull/115, Conversation tab, Merge pull request, Confirm merge. Publishing takes a minute or two.
2. The check on the phone (Chrome):
   1. Open Chrome and go to https://danielyoonwrites.github.io/photo-filters
   2. Tap "Choose photo" and pick a tall photo you took holding the phone upright.
   3. It shows right side up, with its size under it.
   4. Tap "Choose photo" again and pick a wide photo. It shows right side up too.
3. The check on the MacBook (Safari):
   1. Open Safari and go to https://danielyoonwrites.github.io/photo-filters/tests/test-photos.html
   2. Click "Download the test photo." If Safari asks whether to allow downloads from this site, click Allow. Safari saves it in your Downloads folder, unless you changed where downloads go (seen in search results, not Apple's own page).
   3. Go to https://danielyoonwrites.github.io/photo-filters, click "Choose photo," and pick tall-test-photo.jpg from Downloads.
   4. It shows right side up (the word TOP at the top left), with "3,000 × 4,000 pixels (12.0 MP)" under it.

## How to run and check it
- Saved checks: `node photo-filters/tests/app-test.mjs` from the repository folder. It runs Chromium at 360 wide with touch, 1280 with a mouse, and 180 (a phone with its zoom at 200%), serving the repository on http://127.0.0.1:8767 (that port must be free). Success ends "49 passed, 0 failed" (under a minute). Screenshots go to the temporary folder it prints.
- The test photos are drawn in the page; `withPhoneDetails()` adds a rotation tag and a made-up location, like a phone's camera. The MacBook test photo, `tests/tall-test-photo.jpg`, was made once the same way (a drawn scene, turned and tagged); section G checks it.
