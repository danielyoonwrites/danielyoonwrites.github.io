# SPEC: First step smaller

A little app at https://danielyoonwrites.github.io/first-step-smaller (folder `first-step-smaller/` in the website repository). Planned with the owner, October 2026.

## Who it's for

People who put things off because they feel too big or too heavy, like anxious, ADHD and avoidant people.

- Stage 1: the owner uses it himself every day for a couple of weeks and fixes what annoys him.
- Stage 3: anyone online. (Stage 2 is an optional AI helper; see "Ideas for later".)

## What it is, and isn't

A little app for facing a task or anything you've been putting off, one small step at a time. It's not a therapy tool and never claims to treat anything (decided October 2026).

## How it works

One thing per screen, with big buttons.

1. "What have you been putting off?" You type it.
2. "How heavy does it feel?" 1 (light) to 5 (very heavy).
3. Make it smaller. The app asks simple questions to shrink it to a first step of about 2 minutes, like "What's the very first thing your hands would do?" and "Could it be even smaller?" You type the step yourself.
4. "Your first step" shows alone on the screen, with "Done" and "Not now."
5. After "Done": "How was it, really?" 1 to 5.
6. The app shows the two together, like "It felt like a 4. It was a 2." Then "One more small step" or "Stop here."
7. "Not now" keeps it in a "Waiting" list to come back to, with no guilt.
8. A history shows past steps with how heavy each felt before and after.

## Must-haves

- Kind words only: no streaks, no red marks, no "you failed." Stopping is always fine.
- Nothing leaves the phone. What people type is saved only in that browser on that device. No accounts, no analytics, no tracking. The only outside request is Google Fonts, which never sees what people type.
- "Save a backup" downloads a small file with everything; "Restore a backup" brings it back. "Delete everything" clears it all.
- Phone first, then computer. Moon jar design, the same as the website.
- A small link back to the website at the bottom.

## Not in stage 1

- AI suggestions, a chain of next steps, reminders or notifications, accounts or syncing between devices, sharing.

## Ideas for later

- Stage 2: an optional "Help me make it smaller" AI button (decided October 2026: no AI now, maybe later). It would need a small server so the AI key stays secret, each use costs money, and what people type would go to an outside company, so it must be optional and say so plainly.
- A chain of steps: after one step, plan the next one.
- Add to the phone's home screen and work without internet.
- Accounts and syncing, only if people need it. The backup file is designed so it can be imported into an account later.

## Privacy and safety

- Saved only on the device. Clearing browser data or losing the phone deletes it, unless there's a backup file. The app says so next to the backup button.
- iPhone caveat, not confirmed: reports from 2020 to 2022 say Safari deletes a site's saved data after 7 days of using Safari without visiting that site; apps added to the home screen are said to be exempt, but some developers reported deletions anyway. WebKit's own page couldn't be opened from Claude's session. Test on a real iPhone before stage 3. Secondary sources: [Michael Tsai](https://mjtsai.com/blog/2020/03/26/safari-13-1-third-party-cookie-blocking-and-7-day-script-writeable-storage/), [Search Engine Land](https://searchengineland.com/what-safaris-7-day-cap-on-script-writeable-storage-means-for-pwa-developers-332519), [WebKit bug 237350](https://bugs.webkit.org/show_bug.cgi?id=237350).
- Before stage 3: check that no other app already uses the name.

## How we'll know it works

- Add something, shrink it, do it and rate it. Close the browser and reopen it: it's still in the history.
- Save a backup, delete everything, restore the backup: everything comes back.
- With the browser's network tools open, using the app sends nothing anywhere except loading the page and fonts.

## Tech notes

- Plain HTML, CSS and JavaScript. No build tools, no npm.
- Saved in the browser's `localStorage` under one key, `first-step-smaller`, as JSON with a version number (`{ "version": 1, "items": [...] }`). The backup file is the same JSON.
- File links end in `?v=1`; raise the number when a file changes (GitHub Pages lets browsers keep files for 10 minutes).
- Sentence case, no exclamation marks, no emoji.

## Build plan (one pull request each, each with a check the owner does)

1. This spec and the folder's `CLAUDE.md`. Check: read it.
2. The screens, nothing saved yet. Check: go through it on your phone with something real.
3. Saving on the phone, the Waiting list and the history. Check: close the browser, reopen it, everything's there.
4. Save a backup, restore it, delete everything. Check: back up, delete, restore.
5. Polish, then use it daily for a couple of weeks and note what annoys you.
6. Before stage 3: name check, iPhone test, and add it to the Projects page.

## Open questions (ask one at a time)

- The exact words on each screen (drafted in step 2, owner edits).
