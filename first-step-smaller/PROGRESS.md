# First step smaller: progress (updated October 28, 2026)

The app: https://danielyoonwrites.github.io/first-step-smaller (live, not listed in search engines yet). Read `SPEC.md` (what it does and why), `DECISIONS.md` (choices and their reasons) and `CLAUDE.md`.

## Where it stands
- Built October 25, 2026, in pull requests 28 to 35. Build plan steps 1 to 4 (with 3a and 3b) are done. Next: the owner's own trial (stage 1).
- How it works: name the task; "What's one small thing you could do first?" (with examples and "Need help?" tips); rate how heavy the step feels (1 to 5); do it; rate how it really was ("It felt like a 4. It was a 2."). The arc shows every step of a task with its dates and ratings.
- Any task or step can hold smaller steps, as deep as needed, one level per screen with a trail at the top. "Do the next step" hands over the first step not done yet, in order. Edit: rename, move up or down, move into another task, make it a task of its own, remove. Backup and delete: save a backup file, restore it, delete everything.
- Saved only in the browser (`localStorage`, key `first-step-smaller`, data version 2, a tree). Not a therapy tool. No AI yet.
- Not checked yet: whether a backup saved in Chrome lands in Downloads, and how it works on a real iPhone. Reports say Safari may delete the saved data of sites not visited for 7 days (unconfirmed; WebKit's own page couldn't be opened).
- Before stage 3 (anyone online): a name check, an iPhone test, and adding it to the Projects page (build plan step 6). A web search found no app with the name; a trademark search is still to do.
- Parked: making it installable. The recommendation is Level 1, an installable web app, after the trial (the three levels and their costs are in `DECISIONS.md`).
- Parked: an optional "Help me make it smaller" AI button (no AI now, maybe later). It would need a small server so the AI key stays secret, each use costs money, and what people type would go to an outside company, so it must be optional and say so plainly.
- Open question (ask one at a time): the exact words on each screen (drafted in build step 2; the owner edits).

## Waiting on Dan
1. The daily trial (build plan step 5): use https://danielyoonwrites.github.io/first-step-smaller on your phone every day for a couple of weeks, with real things you've been putting off. Note what annoys you, and any words on the screens you'd change. Then send Claude your notes.
2. A backup check: in Chrome on your phone, open https://danielyoonwrites.github.io/first-step-smaller, tap "Backup and delete" on the start screen, then "Save a backup." Check that the file (`first-step-smaller-backup-<date>.json`) lands in Downloads.
3. Before listing it publicly, on a real iPhone: in Safari, open https://danielyoonwrites.github.io/first-step-smaller, add a task, close Safari and open the page again; the task should still be there. Reports say Safari may delete a site's saved data after 7 days without a visit (unconfirmed), so look again after more than a week away.
4. Before listing https://danielyoonwrites.github.io/first-step-smaller publicly: a trademark search for the name "First step smaller" (a web search found no app with the name).

## Open pull requests
None (checked on GitHub, October 28, 2026). These notes come from the notes cleanup, planned as pull request 82.

## Next step
When Dan sends notes from his trial, fix what annoys him (build plan step 5, polish), one small pull request at a time. Then build plan step 6, before stage 3: the name check, the iPhone test, and adding it to the Projects page. Making it installable (Level 1) waits until after the trial.

## Dead ends
- Opening the original research papers behind the "Need help?" tips from Claude's session (October 25, 2026): they couldn't be opened. The tips' sources come from search summaries, so open the papers before quoting any numbers.
- Opening WebKit's own page about Safari's 7-day rule from Claude's session: it couldn't be opened. The iPhone caveat rests on secondary sources (listed in `SPEC.md`, "Privacy and safety").

## How to check it works
- Open https://danielyoonwrites.github.io/first-step-smaller. Add something, shrink it, do it and rate it. Close the browser and reopen it: it's still in the history.
- Save a backup, delete everything, restore the backup: everything comes back.
- Make a task with two parts and steps inside one part, then tap "Do the next step." Reorder two steps with Edit, and "Do the next step" follows the new order.
- With the browser's network tools open, using the app sends nothing anywhere except loading the page and fonts.
- After any change to a file, raise the `?v=` number on its link, or phones may keep the old copy for up to 10 minutes.
