# Fewer spam calls: decisions

Each decision with its reason, oldest first. Only add to this file; if a decision changes, add a new entry that says which one it replaces. Copied in on October 28, 2026 from SPEC.md and the root HANDOFF.md.

### October 2026: a free guide for anyone in the US, written for a grandparent (pull request 20)
- Decision: a one-page guide to the free steps that cut down robocalls and spam calls. It's for anyone in the US, written so a grandparent could follow it: large text, one step at a time, no tech words, short sentences, one action per line. Shared with the owner's church first. Californians also see the DROP step.
- Why: not recorded.

### October 2026: an honest promise (pull request 20)
- Decision: fewer spam calls, not none, and the page says so.
- Why: no guide or tool stops them all.

### October 2026: every fact from an official source (pull request 20)
- Decision: every fact on the page comes from an official source (the FTC, the FCC, the phone company, the phone maker, the State of California), checked when the page changes, with the "Last checked" date and the sources list updated each time. A fact that can't be checked is left out or marked, never guessed.
- Why: menu paths on phones change often.

### October 2026: nothing personal asked for, saved or sent (pull request 20)
- Decision: the page never asks for, sends or stores a phone number or any other personal information. Nothing is saved or sent anywhere. No analytics or tracking.
- Why: not recorded.

### October 2026: the Moon jar design, made easier for older readers (pull request 20)
- Decision: the website's Moon jar design, with body text at 20px instead of 18px, buttons and choices at least 48px tall, numbered steps with one short instruction per line, and print styles that hide the choices and keep the steps and sources.
- Why: for older readers.

### October 2026: left out of this version (pull request 20)
- Decision: no submitting anything on someone's behalf (Do Not Call, DROP or reports), no blocking calls itself, and no Spanish or Korean versions yet (an idea for later).
- Why: blocking calls itself needs a real phone app. For the others, not recorded.

### October 24, 2026: questions first, then one step at a time (pull request 22)
- Decision: three questions first, one per screen, with big buttons: what kind of phone (iPhone, Samsung Galaxy, another Android phone like a Pixel, or "I'm not sure," with a hint), which phone company you pay (T-Mobile, Verizon, AT&T, or another company / not sure, with a hint), and whether you live in California. Then only the matching steps, one per screen, with "Done, next step" and "Back," then "You're all set," with "Start over." Without JavaScript, every step shows on one page.
- Why: the owner read the first version, and a full checklist was too much text for seniors.
- Turned down: the full checklist (the first version, pull request 21) and the optional choices first planned for build step 3, which this replaced.

### October 24, 2026: every step trimmed to the essentials (pull request 22)
- Decision: each step keeps only the essentials. For the Do Not Call list, calling the number comes first. The iPhone step shows only "Silence" for unknown callers.
- Why: calling is easier than signing up online; showing only "Silence" keeps it simple.
- Turned down: showing all of iPhone's choices for unknown callers (Never, Ask Reason for Calling, Silence).

### October 24, 2026: buttons that match the website (pull request 23)
- Decision: answer choices look like the Writing page's "Start here" list, with thin lines and a small arrow; "Done, next step" looks like the website's Subscribe button; "Back" is a small gray label.
- Why: the owner found the first buttons ugly.

### October 24, 2026: nothing below the buttons until the last screen (pull request 23)
- Decision: nothing shows below the buttons while answering or stepping through. The sources (a fold-out, "Where this comes from," with the "last checked" date) and "Made by Daniel Yoon" appear only on the last screen.
- Why: not recorded.

### October 24, 2026: a version number on the file links (pull request 23)
- Decision: the links to `style.css` and `guide.js` end in `?v=2`; raise the number whenever either file changes.
- Why: so phones load new copies right away. GitHub Pages lets browsers keep files for 10 minutes (`cache-control: max-age=600`, checked October 24, 2026).

### October 24, 2026: every fact rechecked on the official page (pull request 24)
- Decision: each fact is checked by opening the official page (from GitHub, through Jina Reader) and reading the exact lines, and rechecked before each update. What wasn't there came out: T-Mobile's "#632# to turn off" code and DROP's "About 10 minutes." DROP reaches "over 600" data brokers. Facts that rest only on search results are marked: the Samsung steps, and "free" for Verizon and AT&T.
- Why: the "#632#" code wasn't found on T-Mobile's pages, and "About 10 minutes" wasn't found on DROP's; "over 600" is on DROP's home page (an older March 2026 flyer says 500); Samsung's site blocked the page reader.

### October 2026: Korean and Spanish versions delayed (no pull request)
- Decision: delayed by Dan. When resumed: a language choice on the first screen, one page per language, phone menu words taken from Apple, Google and Samsung's own Korean and Spanish help pages, and a native speaker reviews each version before it's shared.
- Why: not recorded.
