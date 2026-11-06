# Church board: decisions

Each decision with its reason, oldest first. Only add to this file; if a decision changes, add a new entry that says which one it replaces.

## In force (November 5, 2026)

Every decision below that still holds, one line each; it's rewritten at each handoff. The log under it has each one with its reason, and is only added to.

- November 5, 2026: who can join: only the owner's church group, invite only, and he approves each person (his "A").
- November 5, 2026: adults only, 18 and up (his "A").
- November 5, 2026: phone notifications that each person turns on, built as their own step after posting works (his "A").
- November 5, 2026: the name he chose is a working name, decided for sure before the app goes on the Projects page (his "B").
- November 5, 2026: the church's name stays out of the public code; the folder and notes say "Church board," and the real name is saved in Cloudflare and his private Notion notes (his "A").
- November 5, 2026: planned in the website's repository, in `church-board/`, with the usual pull requests.
- November 6, 2026 (the evening of November 5, Pacific): replies: short replies under each post, like a forum (his "a").
- November 6, 2026 (the evening of November 5, Pacific): "I'm in": a button on each hangout post, with the photos and names of everyone coming (his "a").
- November 6, 2026 (the evening of November 5, Pacific): the board has three tabs, Hangouts, Announcements and Photos (his "a").
- November 6, 2026 (the evening of November 5, Pacific): photos from a hangout show both under its post and in the Photos tab (his "a").
- November 6, 2026 (the evening of November 5, Pacific): announcements are posted by the owner and leaders he picks, with a "Make a leader" switch on his invite page (his "b").
- November 5, 2026: Claude's plan choices, put to the owner with the plan: its own Worker and D1 database, an email code like Living in the Word's, a push with no words in it, and saved checks with made-up people.

## Log (oldest first)

### November 5, 2026: the idea (pull request 149)
- The owner, in the chat (the name is left out, see below): "I'm thinking of a web app. It will be a web page like Facebook, call it [the name]. It will be used for social purposes for my church but not social media. The main thing is that people in my church group sign up with their name and just a photo. Then they post like a forum, like if anyone wants to grab food, or watch movie, or hangout. And maybe they can post a picture or something from that event. So like a community forum, friend and hangout finder, and maybe announcements and photos can be posted"
- Claude's notes in its answer: a name and a photo alone can't keep the app private (anyone could type someone else's name), so it needs a sign-in, like Living in the Word's email code; hangout posts are urgent, so people need to hear about them; and free apps already do this (BAND, by Naver), so whether the group will switch is tested in a small trial first (build step 9).

### November 5, 2026: who can join (pull request 149)
- Decision: only the owner's church group, invite only, with him approving each person. His "A."
- Why: Claude recommended it: the smallest and safest choice, and it reuses the invite-only sign-in he already built for Living in the Word.
- Turned down: "B" (the whole church, with several groups and leaders), "C" (built to work for any church, used by his for now) and "D" (not now: save the idea).

### November 5, 2026: who's in the group (pull request 149)
- Decision: adults only, 18 and up. His "A."
- Why: Claude recommended it: the simplest and safest, with no special rules for minors.
- Turned down: "B" (teens and adults, 13 and up, with a parent's OK for each teen and no private messages) and "C" (all ages; a US law, COPPA, covers collecting the names and photos of children under 13, and whether it covers a free church app is unverified).

### November 5, 2026: how people hear about a new post (pull request 149)
- Decision: phone notifications that each person turns on, built as their own step after posting works. His "A."
- Why: Claude recommended it: free, and in time for "food tonight?" On iPhone, they work only from the Home Screen (Apple's WebKit blog, 2023, seen only in search results).
- Turned down: "B" (an email for every new post: Resend's free plan sends 100 a day, shared with Living in the Word, and 30 members with three posts would already be 90), "C" (one summary email a day: too slow for same-day hangouts) and "D" (no alerts: posts get missed).

### November 5, 2026: the name (pull request 149)
- Decision: the name he chose is a working name, decided for sure before the app goes on the Projects page. His "B."
- Why: Claude recommended it, so the plan could start. The name ends in "-book," and Facebook sued a site called Teachbook over that ending in 2010; it settled in 2012 with Teachbook changing its name (news reports seen only in search results). Claude also said that if the name uses the church's name, it may be worth asking the church's leaders.
- Turned down: "A" (keep it for good), "C" (a name without "-book," which Claude suggested) and "D" (another name).

### November 5, 2026: the church's name stays out of the public code (pull request 149)
- Decision: the folder and the notes use a plain working name, `church-board/` ("Church board"). The app shows the real name only to signed-in members, because it's saved in Cloudflare (`BOARD_NAME`), not in the code. The real name is in his private Notion notes ("Church board app (Nov 2026)," under Master Notes). His "A."
- Why: the repository is public, and anything pushed stays in its history. His About page doesn't name his church, and the real name would link his website to it, the way his city was kept out of the family activity finder (Claude's reason, asked before anything was pushed).
- Turned down: "B" (use the real name in the public code and notes).

### November 5, 2026: Claude's plan choices (pull request 149)
- Its own Cloudflare Worker and D1 database, apart from the other apps, so a problem in one can't break another.
- Signing in with an email code, like Living in the Word's, through Resend; this app's share of the 100 emails a day is open question 9.
- Notifications: a push with no words in it, and the phone asks the server what's new, so the server needn't encrypt anything (unverified until build step 7).
- Three tabs on the board (Hangouts, Announcements, Photos) as a first sketch (open question 3; the owner chose it, below).
- Saved checks and screenshots with made-up people and drawn pictures.
- Claude's reading of "not social media": no likes or counts, newest first, no ads, tracking or AI, nothing public. In `SPEC.md`, "Not social media."
- The owner can change any of these. They're in `SPEC.md`, "Tech notes."

### November 6, 2026, the evening of November 5, Pacific: replies (after pull request 149)
- Decision: people can write short replies under each post, like a forum. His "a."
- Why: Claude recommended it: he said people "post like a forum," and replies let a group sort out a hangout right there ("What time?").
- Turned down: "B" (no replies for now; people work out the details in texts or KakaoTalk).

### November 6, 2026, the evening of November 5, Pacific: "I'm in" (after pull request 149)
- Decision: an "I'm in" button on each hangout post, with the photos and names of everyone coming. His "a."
- Why: Claude recommended it: the person who posted sees at a glance who's coming, without reading every reply.
- Turned down: "B" (no button; people reply "I'm in" under the post).

### November 6, 2026, the evening of November 5, Pacific: the board's tabs (after pull request 149)
- Decision: three tabs, Hangouts, Announcements and Photos. His "a."
- Why: Claude recommended it: it follows his rule of keeping pages short on a phone with tabs, so each tab stays a short list.
- Turned down: "B" (one list with everything, newest first).

### November 6, 2026, the evening of November 5, Pacific: where a hangout's photos go (after pull request 149)
- Decision: both, under the hangout's post and in the Photos tab. His "a."
- Why: Claude recommended it: the photos stay with the hangout they came from, and the Photos tab still shows them all in one place.
- Turned down: "B" (only under the post; the Photos tab only for photos posted on their own) and "C" (only in the Photos tab).

### November 6, 2026, the evening of November 5, Pacific: who posts announcements (after pull request 149)
- Decision: the owner and leaders he picks. His "b." Claude's plan: a "Make a leader" switch on his invite page (build step 3).
- Claude had recommended "A" (only him: the simplest, and the tab stays official). Whether leaders can also remove other people's posts is a new open question, 4b.
- Turned down: "A" (only the owner).
