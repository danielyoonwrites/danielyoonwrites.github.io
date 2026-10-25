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

1. "What have you been putting off?" You type the big task.
2. Make it smaller: "What's one small thing you could do first?" (chosen October 25, 2026, over "What's the very first thing your hands would do?", which sounded odd). You type a step of about 2 minutes yourself. Short examples sit under the box, and "Need help?" opens short tips (see below). The second question, "Could it be even smaller?", was removed October 25, 2026: the owner found it added friction.
3. "How heavy does this step feel?" 1 (light) to 5 (very heavy).
4. "Your step" shows alone on the screen, with "Done" and "Not now."
5. After "Done": "How was it, really?" 1 to 5.
6. The app shows the two together, like "It felt like a 4. It was a 2." Then "One more small step," "I finished it" or "Stop here for now."
7. "Not now" and "Stop here for now" keep the task in a "Waiting" list on the start screen, with no guilt. "Not now" also keeps the step you typed, so it's already in the box when you come back. Tapping a waiting task shows its steps so far, with "Next small step," "I finished it" and "Remove this task."
8. "See finished tasks" on the start screen lists finished tasks; each one opens to show its arc.
10. Smaller steps inside steps (the owner's idea, October 25, 2026): any task or step can hold smaller steps, as deep as needed, like "Write a book" > "Chapter 1" > "Write three sentences." Each screen shows one level, with a trail at the top ("Write a book ›") to go back up. Filled squares are done, hollow squares are not done yet.
    - "Add a smaller step" works on anything, including finished tasks, which reopen.
    - "Do the next step" hands you the first step not done yet, in order, going into smaller steps first (the owner's choice: the app picks, so there's no decision in the moment). You change the order with Edit (next build step).
    - After a step, "One more small step" takes the next planned step in the same part, or asks for a new one. "I finished “Chapter 1”" finishes that part, with a way back to the bigger task.
11. Edit (built October 25, 2026): "Edit" on any task or step's screen opens:
    - Rename it.
    - Move up or Move down in its arc, which also changes the order of "Do the next step." Not shown for big tasks, which are listed newest first.
    - Move into another task: put it at the end of another task's arc, like moving "Write a chapter of my book" into "Write a book." To keep the list short, it offers big tasks and parts that already hold steps.
    - Make it a task of its own: takes it out of its bigger task and lists it under Waiting (a done step becomes a finished task).
    - Remove it, and everything inside it, after a confirm.
12. Backup and delete (built October 25, 2026): "Backup and delete" on the start screen opens its own screen.
    - "Save a backup" downloads `first-step-smaller-backup-<date>.json` and shows "Last backup: Oct 25." Some apps' built-in browsers can't save files; the screen suggests Chrome.
    - "Restore a backup" opens the phone's file picker, checks the file, says how many tasks it holds, and asks before replacing anything. It keeps a copy of what was there under `first-step-smaller-before-restore`. A file that isn't a backup changes nothing. Backups from version 1 are converted.
    - "Delete everything" asks first, then removes all saved data, including the copies kept for safety.
9. The arc (decided October 25, 2026): each small step is saved under its big task, so the history shows how a big task got done, one manageable step at a time. You still only think about one step at a time.

```
Clean the garage                  Finished
  Oct 24   Clear one shelf        felt 4, was 2
  Oct 25   Sort one box           felt 3, was 2
  Oct 27   Take bags to the car   felt 3, was 1
  3 small steps over 4 days
```

Changed October 25, 2026, while building step 2: you rate each small step, not the whole task, so every line of the arc compares like with like.

## "Need help?" tips

Short, with no studies named on the page (the owner's choice, October 25, 2026). Where each comes from, for anyone who asks. These were found through search summaries on October 25, 2026; the original papers couldn't be opened from Claude's session, so open them before quoting any numbers.

- "Make it concrete: 'Open the email,' not 'Deal with email.'" People who thought about a task concretely did it sooner than people who thought about it abstractly: McCrea, Liberman, Trope and Sherman (2008), "Construal level and procrastination," *Psychological Science* 19(12).
- "Pick when and where: 'After dinner, at the kitchen table.'" If-then plans ("implementation intentions") helped people reach goals across 94 tests: Gollwitzer and Sheeran (2006), *Advances in Experimental Social Psychology* 38.
- "Only think about the next step. The finish line can wait." Close-by small goals built confidence and progress faster than a distant goal, in a study of children learning math: Bandura and Schunk (1981), *Journal of Personality and Social Psychology* 41. Other studies found mixed results.
- "Waited a long time? Forgive yourself, and start from here." Students who forgave themselves for procrastinating before one exam procrastinated less before the next: Wohl, Pychyl and Bennett (2010), *Personality and Individual Differences* 48(7). A survey study, so it shows a link, not proof.
- Background for the whole app: breaking overwhelming tasks into steps was part of a cognitive behavioral therapy program that helped adults with ADHD in a randomized trial: Safren and others (2010), *JAMA* 304(8).

## Must-haves

- Kind words only: no streaks, no red marks, no "you failed." Stopping is always fine.
- Nothing leaves the phone. What people type is saved only in that browser on that device. No accounts, no analytics, no tracking. The only outside request is Google Fonts, which never sees what people type.
- "Save a backup" downloads a small file with everything; "Restore a backup" brings it back. "Delete everything" clears it all.
- Phone first, then computer. Moon jar design, the same as the website.
- A small link back to the website at the bottom.

## Not in stage 1

- AI suggestions, reminders or notifications, accounts or syncing between devices, sharing. (Planning steps ahead was added October 25, 2026, with the guardrail that the app still hands you one step at a time.)

## Ideas for later

- Stage 2: an optional "Help me make it smaller" AI button (decided October 2026: no AI now, maybe later). It would need a small server so the AI key stays secret, each use costs money, and what people type would go to an outside company, so it must be optional and say so plainly.
- Add a new task to an arc already in progress (the owner's idea, October 25, 2026): done through Edit, "Move into another task."
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
- Saved in the browser's `localStorage` under one key, `first-step-smaller`, as JSON with a version number. Version 2 (October 25, 2026) is a tree: any task or step can hold smaller steps.
  `{ "version": 2, "tasks": [ { "id": "...", "text": "Write a book", "status": "waiting", "created": "2026-10-25", "updated": 1761350000000, "children": [ { "id": "...", "text": "Chapter 1", "status": "finished", "finished": "2026-10-26", "children": [ { "id": "...", "text": "Write three sentences", "status": "done", "before": 3, "after": 1, "date": "2026-10-24", "children": [] } ] } ] } ] }`
  `status` is "waiting" (not done yet), "done" (a step done, with `before`, `after` and `date`) or "finished" (marked "I finished it"). `lastBackup` is the date of the last "Save a backup." The backup file is the same JSON. When a backup is restored, every field is checked: unknown statuses become "waiting," ratings outside 1 to 5 and malformed dates are dropped, repeated ids get new ones, and names are shown as plain text, never run as code.
- Version 1 (a flat list of steps per task) is turned into version 2 automatically when the app opens, after keeping a copy under `first-step-smaller-version-1`. If saved data can't be read, the app keeps a copy under `first-step-smaller-unreadable` instead of writing over it. If the browser won't let it save (some private modes), the start screen says so.
- File links end in `?v=1`; raise the number when a file changes (GitHub Pages lets browsers keep files for 10 minutes).
- Sentence case, no exclamation marks, no emoji.

## Build plan (one pull request each, each with a check the owner does)

1. This spec and the folder's `CLAUDE.md`. Check: read it.
2. The screens, nothing saved yet, including the arc for the task in progress. Check: go through it on your phone with something real. (Built October 25, 2026; new wording for the first question and "Need help?" tips added the same day, and the "Could it be even smaller?" screen removed.)
3. Saving on the phone, the Waiting list, and the history with an arc for each task. Check: close the browser, reopen it, everything's there. (Built October 25, 2026.)
3a. Smaller steps inside steps, "Add a smaller step," and "Do the next step" in order. Check: make a task with two parts and steps inside one part, then tap "Do the next step." (Built October 25, 2026.)
3b. Edit: rename, move up or down, move into another task, make it a task of its own, remove. Check: reorder two steps and see "Do the next step" follow the new order. (Built October 25, 2026.)
4. Save a backup, restore it, delete everything. Check: back up, delete, restore. (Built October 25, 2026.)
5. Polish, then use it daily for a couple of weeks and note what annoys you.
6. Before stage 3: name check, iPhone test, and add it to the Projects page.

## Open questions (ask one at a time)

- The exact words on each screen (drafted in step 2, owner edits).
