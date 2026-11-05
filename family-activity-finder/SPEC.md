# SPEC: Family activity finder (working name)

A little app at https://danielyoonwrites.github.io/family-activity-finder (folder `family-activity-finder/` in the website repository; the name and address may change, open question 1). Planned with the owner, November 5, 2026.

## Who it's for

Built to work for anyone, used just by the owner for now (his "A," November 5, 2026). It's for parents of young children who want to fill the hours nearby without spending much, or anything. In the owner's words: "a helpful app for parents who are trying to fill the hours without exceeding a certain budget or using money at all." He tests it on his Android phone, in Chrome.

## What it is

You tell the app your city, how many miles beyond it you're willing to go, your kids' ages and your budget (free, or up to an amount). It shows what's on nearby: library storytimes, city events (like a trunk-or-treat), parks, museum free days. Each thing shows its time, place, ages, cost and a link to where it was found. You can add it to your plan for the day.

## How it finds things (decided November 5, 2026)

Official calendars first, AI search second (the owner's "A"):

1. **A list of official calendars for each area**: the libraries, the city, the parks. The server reads them every morning and keeps one clean list of what's on.
2. **The AI sorts that list**: what ages each thing is for, free or paid, good for little ones, and a plain note when a listing is unclear.
3. **A web search adds one-time events** the calendars don't list (a festival, a trunk-or-treat), each with its link and "check before you go."

The first list is built for the owner's area. Other places can use the web search until their calendars are added.

### What two tests taught (November 5, 2026, in the owner's area)

Claude ran both tests in a work session, standing in for the app (the app's own searches would run on Anthropic's computers). The places and sources are in the owner's private notes, not here, because this repository is public.

1. **Search results alone weren't enough.** Most were from 2024 or 2025, and one listing that looked like this week's was from the year before. Check the year on every date.
2. **Official pages beat summaries.** Search results gave a library storytime's time and place wrong, and a parent-run events list had the wrong place too. The library's own page had both right. So the app trusts the official calendar first and links to it.
3. **Some calendars can be read directly.** One library's calendar (LibCal, by Springshare) publishes an iCal feed: a month of events (347) in one download, with ages in the descriptions. A library system nearby uses LibCal too. Two other calendars show the whole month on one page.
4. **Time zones.** That feed gives times in UTC: an event that looked like Thursday was Wednesday at 4 p.m. Pacific. Convert every time to the area's own time.
5. **Name the city and the state.** Searches also brought back a same-named county in another state and a same-named town in another.
6. **Nearby towns matter.** A library just outside the three cities searched had a toddler program the same day, which is why the miles setting matters.
7. **Sources disagree** on fees, hours and ages, so every item shows its source and "check before you go." When the AI can't confirm something, it says so.
8. **Some sites refuse automated visitors** (one city's calendar answered 403). Posts by influencers (Instagram, TikTok) barely show up in search results. Use them only when they're very current and match an official source (the owner's rule).

## What you do in the app (version 1, a first sketch)

1. The first time: your city, the miles beyond it, your kids' ages and your budget. They're saved on the phone.
2. The main screen: what's on today (other days are open question 7), a short list of what fits, soonest first. Each item: its name, time, place, ages, cost (or "cost not stated"), how far, and where it came from.
3. Tap an item: the details, its link, and "Add to my day."
4. My day: a calendar of what you've added, to plan a day. The owner: "having a calendar built into the app to add and plan a day would be crucial."

## Must-haves

- **Right before full.** Nothing shows as certain that isn't. Each item shows its source link and when it was checked; old listings are dropped, not shown.
- **Phone first**: one thing per screen, short lists, big buttons (the owner's rules).
- **Free or cheap**: the budget filter. "Cost not stated" is its own label, never counted as free.
- **Kids' ages, the budget and the day's plan stay on the phone** (Claude's plan): the server sends every event with its age range, and the phone picks the ones that fit.

## Not in version 1 (ideas for later)

- Other parents signing in, and other areas getting their own calendar lists. (An untested idea: the AI could find a new city's calendars the first time someone looks there.)
- Reminders, sharing a plan, maps, reviews.
- Installing it on the home screen like an app.

## Privacy and safety

- The repository and the website are public: never put the owner's city, his kids' ages, names or schools, or a key in this folder, in a commit or in a screenshot. Tests use made-up calendars and places.
- Where the first area's calendar list lives is open question 2: in the public code (anyone reading it could tell the area), or kept in Cloudflare.
- The phone asks the server only for an area's list. Ages, the budget and plans never leave the phone.
- No analytics or tracking.

## Tech notes (Claude's plan; the owner can change any of it)

- Plain HTML, CSS and JavaScript in this folder, with no build tools.
- Its own Cloudflare Worker and D1 database (in `family-activity-finder/server/`), kept apart from the other apps' servers, deployed by Cloudflare after each merge like Living in the Word's.
- **The morning job**: Cloudflare's Cron Triggers run a Worker on a schedule, in UTC time (Cloudflare's docs, read as their source on GitHub, November 5, 2026: `workers/configuration/cron-triggers.mdx`). It reads each calendar, turns every event into one shape (name, start and end in the area's time, place, ages, cost, link, when it was read), drops past and wrong-year ones, and saves the list.
- **The free plan's limits**: on the Workers Free plan, each run gets 10 milliseconds of computer time (waiting on the network doesn't count) and 50 outside requests, and an account gets 5 Cron Triggers. The Workers Paid plan starts at $5 a month and allows up to 15 minutes for a scheduled run that runs hourly or less often (Cloudflare's docs, the same day: `workers/platform/limits.mdx` and `pricing.mdx`). Reading a big feed may not fit in 10 milliseconds (untested). If it doesn't: one calendar per run, or the paid plan (open question 6; ask before anything costs money).
- **The AI**: Claude, through Anthropic's API, called from the Worker, like Living in the Word. Web search costs $10 per 1,000 searches (1 cent each), plus normal token costs for what it reads; web fetch (opening a page) has no extra charge beyond tokens (Anthropic's pricing page, opened November 5, 2026). The AI runs only in the morning job, for one area, so the cost has a ceiling each day. Claude's guess, not measured: about 10 searches a day, so about 10 cents a day for searches plus the reading. Measure it in build step 5.
- **Miles**: start with the straight-line distance from your city's center to each place. Typing the places' locations once into the first area's list is Claude's plan; settle it in build step 2.
- **LibCal feeds**: the iCal address is `https://<library>.libcal.com/ical_subscribe.php?src=p&cid=<calendar id>`, and the calendar id is in the page's calendar picker (worked November 5, 2026).
- **Saved checks** use made-up calendars in the real formats (an iCal feed, a month on one page), so the tests never depend on the sites being up and never show the owner's area.

## Build plan (one pull request each, each with a check the owner does)

1. This plan, with the folder's `CLAUDE.md`, `PROGRESS.md` and `DECISIONS.md`. Check: read "How it finds things" and this build plan.
2. Reading the calendars: the first area's list, and a reader that turns each kind of calendar (an iCal feed, a month on one page) into the one shape, with the year and the time zone checked. Saved checks with made-up calendars. Check: Claude shows today's list next to the libraries' own pages, and you compare them on your phone.
3. The server and the morning job, with a one-time setup in Cloudflare (every step given). Check: the next morning, the list has that day's events.
4. The app's first screen: your settings (saved on the phone) and today's list, filtered by ages, budget and miles. Check: on your phone, set ages and a budget, and see only what fits.
5. The AI sorting and the web search for one-time events, with the cost measured. Check: one-time events show with their links, and the day's cost is in the notes.
6. My day: the calendar in the app, to add things and plan a day. Check: add two things and see them in order on My day.
7. Polish after a week of real use.

## Open questions (ask one at a time)

1. The name and the web address (the working name is "Family activity finder").
2. Where the first area's calendar list lives: in the public code (anyone reading it could tell the area), or kept in Cloudflare.
3. My day: inside the app only, or also "Add to my phone's calendar" (Google Calendar on Android).
4. The budget choices (for example: free only, up to $10, up to $25, any).
5. The look: "Paper and ink," like Living in the Word and Idea board, or something new.
6. If Cloudflare's free plan is too small for the morning job: one calendar per run, or the $5-a-month paid plan.
7. Which days the main screen shows: today only, today and tomorrow, this weekend, or a date you choose.
8. Which calendars go on the first area's list: Claude drafts it in build step 2, and the owner adds any he knows (a church's, a park's).
