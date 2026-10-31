---
name: "pickup"
description: "Resume from the last handoff: read the progress notes and decision log, check them against the repo, and sum up where things stand. Use when the user says pickup, resume or catch me up."
---

# Pick up from a handoff

1. Find the project. If I named one (for example `/pickup quiet room`), use it. If not, read the root HANDOFF.md or CLAUDE.md and ask me which project, with the options listed.
2. Run `git fetch` first, so you see what's on GitHub now, not what this copy saw last. If a branch that isn't merged has newer notes than main, tell me, and read those notes instead. To compare a branch with main, list the changed files first (`git diff --stat`), then read only what you need.
3. Read, in this order: that project's CLAUDE.md, its progress notes (PROGRESS.md, or the handoff file the repo uses), and DECISIONS.md. In DECISIONS.md, read the "In force" list, the 3 newest entries, and any entry that matches the main words of the next step (search the file for them). Read other entries the progress notes mention only when the next step touches them. If there's no "In force" list yet, read the whole log, and treat an entry as replaced when a later entry says it replaces it. Read specs and plans only as far as the next step needs.
4. If a spec or note disagrees with a decision in force, the decision wins. Tell me about the mismatch; don't fix it quietly, and don't dig into it further unless I ask.
5. Check the notes against reality: `git status`, `git log --oneline -15`, any commits made after the date on the notes, and any open pull requests. Tell me about anything that doesn't match, for example a pull request the notes call open that's already merged. If there are no handoff notes at all, say so, and build a short picture from git and the open pull requests, labeled "rebuilt from git, not from a handoff".
6. Check that it still works before anything new: run the saved checks under "How to run and check it" (older notes call it "How to check it works"). Only run checks that are local and safe: never deploy, push, or change real data. Report each check with the command and its result. If one fails, say so first, and ask before building on top of it. If no checks are saved, say so; don't spend the session rebuilding them unless I ask.
7. Reply with a short summary: five bullets of one or two lines each, with no sub-bullets:
   - Where things stand, and whether the checks passed
   - What's waiting on me, with the days left for anything that has a date
   - The next step
   - The two or three decisions that matter most for the next step, each with its one-line reason
   - What to avoid (dead ends), and any mismatch or question
8. Then wait for my go-ahead, unless my message already said what to do.

Don't reopen a logged decision unless I ask. If something makes an old decision look wrong, tell me and ask before changing it.