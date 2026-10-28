# First step smaller: decisions

Each decision with its reason, oldest first. Only add to this file; if a decision changes, add a new entry that says which one it replaces. Copied in on October 28, 2026 from SPEC.md and the root HANDOFF.md.

### October 2026: for people who put things off; not a therapy tool (pull request 28)
- Decision: a little app for facing a task or anything you've been putting off, one small step at a time, for people who put things off because they feel too big or too heavy, like anxious, ADHD and avoidant people. It's not a therapy tool and never claims to treat or fix anything. Stage 1: the owner uses it himself every day for a couple of weeks and fixes what annoys him. Stage 2 is an optional AI helper. Stage 3: anyone online.
- Why: not recorded.

### October 2026: one small step at a time, rated before and after (pull request 28)
- Decision: you name what you've been putting off, make it smaller (a step of about 2 minutes that you type yourself), rate how heavy it feels from 1 (light) to 5 (very heavy), do it, then rate how it really was. The app shows the two together, like "It felt like a 4. It was a 2."
- Why: not recorded.

### October 2026: kind words only (pull request 28)
- Decision: no streaks, no guilt, no red marks, no "you failed." Stopping is always fine.
- Why: not recorded.

### October 2026: one thing per screen, phone first, Moon jar design (pull request 28)
- Decision: one thing per screen, with big buttons and short sentences. Phone first, then computer. The Moon jar design, the same as the website, in sentence case, with no exclamation marks and no emoji. A small link back to the website at the bottom.
- Why: not recorded.

### October 2026: nothing leaves the phone (pull request 28)
- Decision: what people type is saved only in that browser on that device (`localStorage`, key `first-step-smaller`). No accounts, no analytics, no tracking. The only outside request is Google Fonts.
- Why: Google Fonts never sees what people type. For the rest, not recorded.

### October 2026: a backup file, and "Delete everything" (pull request 28)
- Decision: "Save a backup" downloads a small file with everything, "Restore a backup" brings it back, and "Delete everything" clears it all. The app says so next to the backup button: clearing browser data or losing the phone deletes everything, unless there's a backup file.
- Why: everything is saved only on the device, so clearing browser data or losing the phone deletes it, unless there's a backup file.

### October 2026: plain files, saved as versioned JSON (pull request 28)
- Decision: plain HTML, CSS and JavaScript, with no build tools and no npm. Saved under one key as JSON with a version number; the backup file is the same JSON. File links end in `?v=1`, raised whenever a file changes.
- Why: the same versioned JSON for saved data and backups keeps old backups working. The `?v=` number is there because GitHub Pages lets browsers keep files for 10 minutes.

### October 2026: no AI now, maybe later (pull request 28)
- Decision: no AI in stage 1. Stage 2 may add an optional "Help me make it smaller" AI button.
- Why: it would need a small server so the AI key stays secret, each use costs money, and what people type would go to an outside company, so it must be optional and say so plainly.

### October 2026: left out of stage 1 (pull request 28)
- Decision: no AI suggestions, planning steps ahead, reminders or notifications, accounts or syncing between devices, or sharing. Accounts and syncing come later only if people need them; the backup file is designed so it can be imported into an account later.
- Why: not recorded.

### October 2026: a name check and a real iPhone test before stage 3 (pull request 28)
- Decision: before stage 3 (anyone online): check that no other app already uses the name, test on a real iPhone, and add it to the Projects page.
- Why: for the iPhone, reports from 2020 to 2022, not confirmed, say Safari deletes a site's saved data after 7 days of using Safari without visiting that site; apps added to the home screen are said to be exempt, but some developers reported deletions anyway. For the name check and the Projects page, not recorded.

### October 25, 2026: the arc (pull request 29)
- Decision: each small step is saved under its big task, and the arc shows every step of the task with its date and ratings. After a step: "One more small step," "I finished it" or "Stop here for now." You still only think about one step at a time.
- Why: so the history shows how a big task got done, one manageable step at a time.

### October 25, 2026: rate each small step, not the whole task (pull request 29)
- Decision: "How heavy does this step feel?" and "How was it, really?" are asked about each small step. Changed while building step 2.
- Why: so every line of the arc compares like with like.
- Turned down: rating the whole task, as first planned.

### October 25, 2026: new wording for the first question (pull request 30)
- Decision: "What's one small thing you could do first?", with short examples under the box.
- Why: the first wording sounded odd.
- Turned down: "What's the very first thing your hands would do?"

### October 25, 2026: "Need help?" tips, with no studies named (pull request 30)
- Decision: "Need help?" under the box opens short tips. No studies are named on the page; where each tip comes from is in `SPEC.md`, for anyone who asks. Open the original papers before quoting any numbers from them.
- Why: not recorded (the owner's choice). The papers were found only through search summaries; they couldn't be opened from Claude's session.

### October 25, 2026: no "Could it be even smaller?" screen (pull request 31)
- Decision: the second question, "Could it be even smaller?", is removed.
- Why: the owner found it added friction.

### October 25, 2026: saved on the phone, with a Waiting list (pull request 32)
- Decision: "Not now" and "Stop here for now" keep the task in a "Waiting" list on the start screen, with no guilt. "Not now" also keeps the step you typed. A waiting task shows its steps so far, with "Next small step," "I finished it" and "Remove this task." "See finished tasks" lists finished tasks, each with its arc. If saved data can't be read, the app keeps a copy instead of writing over it; if the browser won't let it save (some private modes), the start screen says so.
- Why: the typed step is kept so it's already in the box when you come back. For the rest, not recorded.

### October 25, 2026: smaller steps inside steps (pull request 33)
- Decision: any task or step can hold smaller steps, as deep as needed, like "Write a book" > "Chapter 1" > "Write three sentences." Each screen shows one level, with a trail at the top to go back up; filled squares are done, hollow squares are not done yet. "Add a smaller step" works on anything, including finished tasks, which reopen. Planning steps ahead is now part of stage 1, with a guardrail: the app still hands you one step at a time. This replaces that part of "left out of stage 1" (October 2026). The saved data became version 2, a tree; version 1 data is turned into version 2 when the app opens, after a copy is kept.
- Why: not recorded (the owner's idea).

### October 25, 2026: "Do the next step" picks for you (pull request 33)
- Decision: "Do the next step" hands you the first step not done yet, in order, going into smaller steps first. After a step, "One more small step" takes the next planned step in the same part, or asks for a new one.
- Why: the owner's choice: the app picks, so there's no decision in the moment.

### October 25, 2026: Edit (pull request 34)
- Decision: "Edit" on any task or step's screen: rename it; move it up or down, which also changes the order of "Do the next step" (not shown for big tasks, which are listed newest first); move it into another task; make it a task of its own, listed under Waiting; or remove it and everything inside it, after a confirm.
- Why: "Move into another task" is how the owner's idea of adding a new task to an arc already in progress (October 25, 2026) is done. It offers only big tasks and parts that already hold steps, to keep the list short. For the rest, not recorded.

### October 25, 2026: backup and delete, built (pull request 35)
- Decision: "Backup and delete" on the start screen opens its own screen. "Save a backup" downloads `first-step-smaller-backup-<date>.json` and shows the date of the last backup. "Restore a backup" checks the file and every field in it (names are shown as plain text, never run as code), says how many tasks it holds, and asks before replacing anything, keeping a copy of what was there; a file that isn't a backup changes nothing, and version 1 backups are converted. "Delete everything" asks first, then removes all saved data, including the copies kept for safety.
- Why: some apps' built-in browsers can't save files, so the screen suggests Chrome. For the rest, the October 2026 reason: everything is saved only on the device.

### October 25, 2026: making it installable is parked (no pull request)
- Decision: parked. The recommendation: Level 1, an installable web app (a manifest file, a service worker for offline use and an icon), after the trial.
- Why: a check of three levels on October 25, 2026, through search results. Level 1 is free and about 2 pull requests, and Dan needs to approve an icon. Level 2, the Google Play Store, costs $25 one time, and new personal accounts need a closed test with at least 12 testers for 14 days in a row (packaged with PWABuilder). Level 3, Apple's App Store, costs $99 a year, needs a Mac with Xcode, and Apple often rejects apps that are mostly a website.
