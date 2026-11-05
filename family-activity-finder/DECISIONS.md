# Family activity finder: decisions

Each decision with its reason, oldest first. Only add to this file; if a decision changes, add a new entry that says which one it replaces.

## In force (November 5, 2026)

Every decision below that still holds, one line each; it's rewritten at each handoff. The log under it has each one with its reason, and is only added to.

- November 5, 2026: who it's for: built to work for anyone, used just by the owner for now (his "A").
- November 5, 2026: how it finds things: official calendars first, AI search second (his "A"); it replaced "AI search only," chosen earlier the same day.
- November 5, 2026: a setting for how many miles beyond your city to look (the owner's idea).
- November 5, 2026: a calendar in the app to add things and plan a day (the owner: "crucial").
- November 5, 2026: posts by influencers count only when they're very current and match an official source (the owner's rule).
- November 5, 2026: privacy: the owner's city and his kids' ages never go in the public repository or the website.
- November 5, 2026: planned in the website's repository, in `family-activity-finder/` (a working name), with the usual pull requests.
- November 5, 2026: Claude's plan choices, put to the owner with the plan: its own Worker and D1 database, a morning job, ages and plans kept on the phone, and saved checks with made-up calendars.

## Log (oldest first)

### November 5, 2026: a quick test before any plan (no pull request)
- Decision: Claude first searched the web for the owner's area, the way the app would, before any plan. His "A."
- Why: he wasn't sure the app should use AI ("it might use AI or something. I'm not sure yet"). A test answers that with real results instead of guesses (Claude's recommendation).
- Turned down: "B" (start the written plan) and "C" (save the idea for later).

### November 5, 2026: finding things with AI search (no pull request; replaced the same day)
- Decision: the owner: "For finding, yes let's AI search."
- Turned down: reading only a few sources he picks (more reliable, but it misses things).
- Replaced by "official calendars first, AI search second," below.

### November 5, 2026: a second, more thorough test (no pull request)
- Decision: the owner's "B." In his words: "This isn't enough and I'm not sure if we would do it. Search for today Nov 5 and then do [his city], which means including [two neighboring cities]." And: "I feel like the search is not thorough enough. Check what the must recent posts for websites and city events etc might say, but also check influencers information only if it is very current and trustworthy." (The city names are left out because this repository is public.)
- To open the official calendars, Claude asked for a cloud environment for this repository that allows 19 sites, and the owner approved it (it's named "danielyoonwrites.github.io"; `CLOUD-NOTES.md`).
- What it found: `SPEC.md`, "What two tests taught."
- Turned down: "A" (start the plan) and "C" (leave it for later).

### November 5, 2026: official calendars first, AI search second (pull request [set when opened])
- Decision: the app keeps a list of each area's library, city and park calendars and reads them every morning; the AI sorts what's on (ages, free or paid, good for little ones); then a web search adds one-time events, each with its link. The first list is for the owner's area. The owner's "A."
- Why: in the second test, search results gave a library storytime's time and place wrong, and the library's own page had them right; one library's calendar could be read whole as a feed. The owner had written: "I wish there was a better way to comb through all the relevant and needed data to make this app useful."
- Replaces: "finding things with AI search," above (Claude pointed out it changed his earlier choice).
- Turned down: "B" (AI search only, simpler, but it got that storytime wrong) and "C" (official calendars only: the most accurate and cheapest, but it misses one-time events like a trunk-or-treat).

### November 5, 2026: who it's for (pull request [set when opened])
- Decision: just the owner for now, but built so it could work for anyone. His "A."
- Why: Claude recommended it: he can use it on his own weekends soon, and other parents can come later without a rebuild, the way Idea board was planned.
- Turned down: "B" (other parents he invites, now: sign-in and invitations from the start), "C" (just him, his area only: simplest, but more rework later) and "D" (not now).

### November 5, 2026: the owner's two ideas (pull request [set when opened])
- How far to look: "maybe the app can have an option to see how many miles outside of your chosen city you are willing to search." The second test showed why: a library just outside the three cities had a toddler program that day.
- A calendar in the app: "if this app gets built, I think having a calendar built into the app to add and plan a day would be crucial." Whether it also adds to the phone's own calendar is open question 3.

### November 5, 2026: privacy (pull request [set when opened])
- Decision: the owner's city and his kids' ages stay out of the public repository and the website. The test details, with places and sources, are in his private Notion notes.
- Why: the repository is public. Claude said so in the chat when it asked for them, and the root `CLAUDE.md` keeps the kids' names, faces and schools out of everything.

### November 5, 2026: Claude's plan choices (pull request [set when opened])
- Its own Cloudflare Worker and D1 database, apart from the other apps, so a problem in one can't break another.
- A morning job (Cloudflare's Cron Triggers) that reads the calendars and runs the AI once a day for one area, so the AI's cost has a ceiling and visitors can't run it up.
- Kids' ages, the budget and plans stay on the phone: the server sends every event with its age range, and the phone picks what fits. That way the server never learns anything about the family.
- Saved checks with made-up calendars in the real formats, so the tests don't depend on the sites and never show the owner's area.
- The owner can change any of these. They're in `SPEC.md`, "Tech notes."
