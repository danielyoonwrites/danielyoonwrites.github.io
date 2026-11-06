# SPEC: Church board (working name)

A little app at https://danielyoonwrites.github.io/church-board (folder `church-board/` in the website repository; the name and address may change, open question 11). Planned with the owner, November 5, 2026.

"Church board" is only the name used in this public repository. The app's real name, which the owner chose, is kept out of the code, because it would name his church (his "A," November 5, 2026). Signed-in members see the real name, which is saved in Cloudflare and in his private Notion notes ("Church board app (Nov 2026)," under Master Notes).

## Who it's for

Only the owner's church group. It's invite only, and he approves each person by inviting them himself (his "A," November 5, 2026). Adults only, 18 and up (his "A," the same day). He tests it on his Android phone, in Chrome; members will use Android phones and iPhones.

## What it is

A private board for the group: a community forum, a way to find friends to hang out with, and a place for announcements and photos. In the owner's words (November 5, 2026; the name is left out): "It will be used for social purposes for my church but not social media. The main thing is that people in my church group sign up with their name and just a photo. Then they post like a forum, like if anyone wants to grab food, or watch movie, or hangout. And maybe they can post a picture or something from that event. So like a community forum, friend and hangout finder, and maybe announcements and photos can be posted."

### Not social media

The owner's line: "social purposes ... but not social media." Claude's reading of it, for the owner to change:

- No likes, no follower counts, no "seen by" counts.
- Newest first, never sorted by what's popular.
- No ads, no tracking, no AI.
- Nothing public: no part of the board can be seen without signing in, and there's no "share outside the group."
- Short on purpose: a hangout post moves to "Past" after its day (open question 7), so the board stays about what's coming up.

### Free apps that already do this

BAND, made by Naver, has private invite-only groups, posts, photo albums and a calendar with RSVPs, free with paid extras (its App Store listing, seen only in search results, November 5, 2026: https://apps.apple.com/au/app/id542613198?l=en-au). So this one is built as the owner's next learning app, made his way and kept as small as his group needs. A social app works only if people open it: if the group already uses BAND or a KakaoTalk group chat, they may not switch. The trial in build step 9 tests that with two or three people first.

## What you do in the app (version 1, a first sketch)

1. **Joining.** The owner invites you by email address, on a page only he can open (like Living in the Word's). The invite email has the app's link and how to sign in. You type your email address, get a 6-digit code by email, and type it in. The first time, the app asks for only two things: your name and a photo of you. The photo is shrunk on your phone before it's sent.
2. **The board.** Three tabs: Hangouts, Announcements and Photos (the owner's "a," the evening of November 5, 2026, Pacific). Each post shows the person's photo and name, their words, when it was posted, and for a hangout, when and where (if they wrote it).
3. **New post.** One screen: what you want to do ("Anyone want to grab food tonight?"), and, if you like, when, where and a photo. "Post" puts it on the board for everyone signed in.
4. **A post's own screen.** Tap a post to see it whole, with its photos big, and the replies under it: short replies, like a forum (the owner's "a," the evening of November 5, 2026, Pacific). A hangout post has an "I'm in" button, with the photos and names of everyone coming (the owner's "a," the same evening).
5. **Your own posts.** "Remove" ("Post removed. Undo" for a few seconds). The owner can remove anyone's post.
6. **Notifications.** "Turn on notifications" (each person chooses; the owner's "A"). On Android it works in Chrome. On iPhone, only after the app is added to the Home Screen (below, "Notifications").
7. **Me.** Your name and photo (change them), "Sign out" and "Delete my account."

## Must-haves

- **Private.** Only invited people who are signed in can see anything. The page isn't listed in search engines.
- **Phone first**: one thing per screen, short lists, big buttons (the owner's rules).
- **Little friction**: joining asks for an email code, a name and a photo, nothing else.
- **Kind and safe**: the owner can remove any post, everyone can remove their own, and "Delete my account" removes everything the server has about you.

## Not in version 1 (ideas for later)

- Private messages between members (everything stays in the group's view).
- Several groups, leaders for each, or other churches.
- A calendar of hangouts, or adding one to your phone's calendar.
- Videos.

## Privacy and safety

- The repository and the website are public: never put the app's real name, the church's name, any member's name, face or email address, or a key in this folder, in a commit, in a pull request or in a screenshot. Saved checks and screenshots use made-up people and drawn pictures.
- Members see each other's names and photos, never email addresses.
- The board goes only to this app's own server, on the owner's Cloudflare account: never to an AI, analytics or anyone else. The app's code is public; the board isn't.
- A shrunk photo is a new picture, so it leaves out the original's hidden details, like where it was taken (the way Idea board's photos do; its saved checks test this, pull request 109).
- Adults only: the owner's invite page says "Invite adults only (18 and up)." He knows each person he invites.
- Photos from events may show children, even though members are adults. The rule for that is open question 5.
- "Delete my account": your name, photo, email address, posts, photos and notification settings, gone from the server.

## Notifications (the owner's "A," November 5, 2026)

- Phone notifications that each person turns on, built as their own step after posting works (build step 7).
- Android: Chrome can show notifications from a web app (Claude's understanding; tested in build step 7).
- iPhone: Apple's WebKit blog announced notifications for web apps added to the Home Screen with iOS 16.4, in 2023 (seen only in search results, November 5, 2026: https://webkit.org/?p=13878; that site is blocked in this cloud session). So the app needs a Home Screen icon and its own small background helper (a "service worker"), like Living in the Word has, and a tip on iPhones: "Add to Home Screen first."
- Inside KakaoTalk's built-in browser, notifications probably won't work (unverified; tested in build step 7). The app shows "Open in Chrome" there.
- Turned down: an email for every new post (Resend's free plan sends 100 emails a day, shared with Living in the Word), one summary email a day (too slow for same-day hangouts) and no alerts.

## Tech notes (Claude's plan; the owner can change any of it)

- Plain HTML, CSS and JavaScript in this folder, with no build tools.
- **Its own Cloudflare Worker and D1 database** (in `church-board/server/`), kept apart from the other apps' servers so a problem in one can't break another, deployed by Cloudflare after each merge like Living in the Word's (Workers Builds).
- **The real name** is saved in Cloudflare as a secret, `BOARD_NAME`, like Living in the Word's `OWNER_EMAIL`, which every deploy has kept. The server sends it to signed-in members and puts it in the invite emails. Before you sign in, the page says only "Sign in."
- **Signing in**: an email code, like Living in the Word's (6 digits, gone after 10 minutes or 5 wrong tries; a phone stays signed in about 90 days; codes and session keys kept only scrambled). Emails go through Resend, and if it's the same Resend account, they share its free plan's 100 a day and 3,000 a month (from Resend's blog, seen through search results, per `living-in-the-word/SIGNUP-PLAN.md`). Living in the Word already allows itself 90 a day (`EMAILS_ALL` in its `worker.js`). This app's share is open question 9.
- **Photos** are shrunk on the phone before sending, like Idea board's (a JPEG, 1600 pixels on the long side for a post's photo; smaller for a person's own photo). Where they're kept is open question 8: D1 has 500 MB per database on the free plan, and R2, Cloudflare's file storage, is free up to 10 GB-month (Cloudflare's docs, read as their source on GitHub, November 2, 2026, per `idea-board/SPEC.md`). Whether R2 needs a payment method on file is unverified.
- **The free plan's limits**: on Workers Free, each request gets 10 milliseconds of computer time (waiting on the network doesn't count) and an account gets 100,000 requests a day, shared with the other apps' servers (Cloudflare's docs, read as their source on GitHub, November 4 and 5, 2026, per `video-editor/SPEC.md` and `family-activity-finder/SPEC.md`). Shrinking photos on the phone keeps the server's work small.
- **Notifications** (Claude's plan, unverified until built): the server sends a push with no words in it, and the phone's background helper then asks the server what's new and shows it. That way the server only signs each push and doesn't have to encrypt the message, which is simpler to build without any outside code. Whether it fits in the free plan's 10 milliseconds is measured in build step 7.
- **The Home Screen icon's name** comes from a public file (the app's manifest), so it would say "Church board" unless that's settled another way (unverified; build step 7).
- **Saved checks** use made-up members, made-up posts and drawn pictures, never real people.
- **Cost**: Cloudflare's free plan, Resend's free plan, no AI and the web address the owner already has, so nothing new to pay for (Claude's expectation; R2's payment method is the one unknown). Ask before anything costs money.

## Build plan (one pull request each, each with a check the owner does)

1. This plan, with the folder's `CLAUDE.md`, `PROGRESS.md` and `DECISIONS.md`. Check: read "What you do in the app" and this build plan.
2. The screens, with made-up people and posts, on the phone only (nothing goes to a server yet): signing in (pretend), your name and photo, the three tabs, a new post, a post's own screen. Check: on your phone, try each screen and say what feels slow or odd.
3. The server and signing in: a one-time setup in Cloudflare (every step given), the email code, your invite page and the real name saved in Cloudflare. Check: invite your second email address and sign in with it on your phone.
4. Your name and photo, saved to your account. Check: add them on your phone, then see them on your computer.
5. Posting: hangouts and announcements, seen by everyone signed in; "Remove" for your own posts, and for anyone's when it's you. Check: post from your phone, see it on your computer, then remove it.
6. Photos in posts, kept on the server. Check: post a photo from your phone and open it on your computer.
7. Phone notifications: Android in Chrome first, then iPhone from the Home Screen. Check: turn them on on your phone, post from your computer, and get a notification.
8. Before the group joins: "Delete my account" and the photo rule (open question 5). Check: delete a test account and see its posts and photo gone.
9. A trial with two or three people from the group. Check: they join and post, and you hear what they think. Then polish.

## Open questions (ask one at a time)

1. Replies: answered the evening of November 5, 2026, Pacific: yes, short replies under each post, like a forum (the owner's "a").
2. "I'm in": answered the evening of November 5, 2026, Pacific: yes, a button on each hangout post, with the photos and names of everyone coming (the owner's "a").
3. How the board is arranged: answered the evening of November 5, 2026, Pacific: three tabs, Hangouts, Announcements and Photos (the owner's "a").
3b. Where an event's photos go: under its hangout post, in Photos, or both (split from question 3 so each answer is one choice).
4. Announcements: only you post them, or you and leaders you pick; and whether they stay at the top.
5. A rule for photos with children in them (members are adults, but church events may have kids): for example, your church's photo policy, or no children's faces.
6. Which notifications: every new post, only hangouts and announcements, or each person chooses.
7. How long posts stay: when a hangout moves to "Past," and how long photos are kept.
8. Where photos are kept on the server: D1 (500 MB free) or R2 (10 GB-month free; whether it needs a payment method on file is unverified).
9. This app's share of the 100 sign-in emails a day (Living in the Word allows itself 90): for example, 10 a day here, since a phone stays signed in about 90 days.
10. The look: "Paper and ink," like Living in the Word and Idea board, or something new.
11. The final name, before the app goes on the Projects page (Facebook sued a site called Teachbook over the "-book" ending in 2010, and it settled in 2012 with Teachbook changing its name; news reports seen only in search results: https://money.cnn.com/2010/08/26/technology/teachbook/ and https://www.eschoolnews.com/2012/09/07/facebook-teachbook-reach-settlement-in-lawsuit/). If the name uses the church's name, maybe ask the church's leaders first. Also the web address, and the Home Screen icon's name.
