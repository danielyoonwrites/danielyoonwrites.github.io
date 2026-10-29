# Plan: sign-ups (stage 3)

So people can use the AI helper without the shared passcode, each with their own daily limit, and so the app can have subscriptions someday. Planned with the owner on October 26, 2026, after the security work (pull requests 61 to 63). Step S3, signing in with an email code and a daily limit for each person, was built on October 28, 2026 (see "What S3 built"), and step S4, the owner's page, on October 29, 2026 (see "What S4 built"); the other steps aren't built yet.

## Decided (October 26, 2026)

- **Invite only, at first** (the owner's choice). Only people the owner invites can use the AI helper: his small group and people he chooses. It can open to anyone later, maybe with subscriptions.
- **Sign in with an email code, or with Google** (the owner's choice, after comparing costs; see "What was checked"). These are the usual ways people expect to sign in.
  - **Email code:** type your email address, get a code by email, type it into the app. Codes are typed in, so they work inside the home screen app, even on an iPhone.
  - **Google:** "Continue with Google." Free.
  - **Apple: later, if wanted.** It needs Apple's developer membership, 99 USD a year.
- **The owner's own web address** (the owner's choice, about $11 a year). Sign-in emails come from it, and the AI helper's server can live at it. It's also needed for Google's sign-in screen and later for subscriptions.
- **Each person has their own daily limit** (20 sets of questions a day, the same number as now), and everyone together keeps 60 a day. On October 28, 2026, the owner asked for it to come with sign-ins, in step S3, rather than wait for step S6: "built in limits per account for now, since I am not charging yet."
- **The shared passcode goes away** once sign-ups work.

Still open (asked one at a time when we get there):
- The web address's name (step S1): done, `danielyoonwrites.com` (bought at Cloudflare, October 26, 2026).
- Moving the app itself to the new address later. Its own address means its own browser storage, apart from the website, but saved studies would need moving (parked below).
- The words of a short privacy page (what's kept, and that it's never sold or shared).

## How it works, for the person

1. The owner invites them by email address on a small page only he can open.
2. They open the app and tap "Sign in": either type their email address and then the code that arrives, or tap "Continue with Google" (that Google account's email must be the invited one).
3. They stay signed in on that phone for about 90 days, then sign in again. "Sign out" any time. "Delete my account" removes everything the server has about them.
4. Everything else works as now. Saved studies and the reading plan stay on the phone, as now.

## How it works, inside

- **The same Cloudflare Worker** gets new tables in the same D1 database:
  - **people:** email address, name, the date they were invited, whether they're on, and whether they're the owner
  - **sign-in codes:** scrambled, used once, gone after 10 minutes or 5 wrong tries
  - **sessions:** a long random key for each signed-in phone, kept on the server only in scrambled form, gone after about 90 days or on "Sign out"
- **Email codes go out through Resend** (an email service), free up to 3,000 emails a month and 100 a day. They come from an address on the owner's web address, like `sign-in@` the new address.
- **Google:** the "Sign in with Google" button comes from Google's own script. The server checks Google's signed answer against Google's public keys, then checks that the email address is verified and invited.
- **Every AI request carries the person's session instead of the passcode.**
  - The passage check, the daily limits and the safety rule (CSP) all stay.
  - The limits count per person instead of per connection.
- **The owner's page:** invite someone by email, see who's invited and how much each person used today, and turn someone off. Only the owner's email address, saved in Cloudflare as a secret, can open it.
- **Safety:**
  - Codes and session keys are kept only in scrambled form.
  - Limits on how many codes one email address or one connection can ask for.
  - Codes expire, and wrong codes are limited.
  - The browser safety rule only adds what Google's button needs.
  - Nothing about a person is ever sent to the AI.

## What was checked (October 26, 2026)

- **Sign in with Apple**, from Apple's own pages:
  - It needs a "Services ID" tied to an Apple app ID, set up in Apple's developer account ([configure for the web](https://developer.apple.com/help/account/capabilities/configure-sign-in-with-apple-for-the-web)).
  - The developer program costs 99 USD per membership year. Nonprofits, schools and government groups can ask for a fee waiver; whether the owner would qualify wasn't checked ([enrollment](https://developer.apple.com/programs/enroll/)).
  - No file has to be uploaded to the website.
  - The membership comparison page couldn't be read in full, so it's an inference, not a direct quote, that the developer account parts need the paid membership.
- **App Store rule 4.8**, from [Apple's guidelines](https://developer.apple.com/app-store/review/guidelines/):
  - An app in Apple's App Store that offers Google sign-in must also offer an equivalent private option, in practice Sign in with Apple.
  - An app that only uses its own sign-in, like email codes, is exempt.
  - It applies to apps, not websites. It matters only if the app goes to the App Store.
- **Web address:** a .com at Cloudflare costs $10.46 a year, $11.17 from November 1, 2026. It's sold at cost and renews at the same price ([CostGoat](https://costgoat.com/pricing/cloudflare-domains), updated October 20, 2026; Cloudflare's own pricing page wasn't in the results). Other endings, like .org or .app, cost differently (not checked).
- **Resend**, from Resend's own blog through search results:
  - The free plan sends 3,000 emails a month and 100 a day ([new free tier](https://resend.com/blog/new-free-tier.md)).
  - Sending from your own web address needs a few DNS records added to prove you own it.
  - Reviews disagree on whether the free plan allows 1 or 3 web addresses; 1 is enough here.
- **Cloudflare's own email sending** is in public beta and needs the paid Workers plan ([changelog, April 2026](https://developers.cloudflare.com/changelog/post/2026-04-16-email-sending-public-beta/)), so Resend is used instead.
- **Firebase Authentication**, the option not chosen:
  - Free up to 50,000 people a month, with Google, Apple and email sign-in ([DeployManage](https://deploymanage.com/firebase-pricing); third-party, since Google's pages are blocked from Claude's sessions).
  - Email links open in the browser. On an iPhone the home screen app keeps its own storage, apart from Safari ([WebKit bug 181849](https://bugs.webkit.org/show_bug.cgi?id=181849)), so people could end up signed in in Safari instead.
  - A Firebase maintainer said in 2017 that Google's pop-up sign-in from an iPhone home screen app wasn't possible ([firebase-js-sdk issue 77](https://github.com/firebase/firebase-js-sdk/issues/77)).
  - Firebase's own guide on its redirect sign-in suggests using your own web address ([redirect best practices](https://firebase.google.com/docs/auth/web/redirect-best-practices)).
- **Other services:**
  - Supabase: free up to 50,000 people, but free projects pause after a week without use, and its built-in email is reported to send only 2 an hour (one blog; not confirmed) ([pricing](https://supabase.com/pricing)).
  - Clerk: free up to 50,000 monthly users ([pricing](https://clerk.com/pricing)).
  - Auth0: free up to 25,000 (third-party).
  - None was chosen: each adds an outside service with its own screens, and most need your own web address for real use anyway.

Not checked (Google's and Cloudflare's docs are blocked from Claude's sessions; to check when building):
- Whether Google reviews an app that asks only for name and email.
- The exact browser safety rule lines Google's button needs.
- How Google's button behaves inside an iPhone home screen app in 2026.
- Whether a Worker can use the owner's web address for free.

Email codes work either way, which is part of why they're in the plan.

## What it costs

- **Web address:** about $11 a year.
- **Sign-in emails:** free on Resend's free plan, far more than a small group needs.
- **Google sign-in:** no fee found.
- **Cloudflare Workers and D1:** the free plan, as now.
- **Apple, if added later:** 99 USD a year.

## Not doing now (parked)

- Sign in with Apple (99 USD a year).
- Moving the app to the new web address, with a way to bring saved studies along.
- Keeping saved studies in the account, so they follow a person to a new phone. This would also fix iPhone's Safari and home screen apps keeping separate saved studies.
- Subscriptions (a payment service like Stripe), researched when the time comes. App Store rule 4.8 too, if the app ever goes to the App Store.
- Passkeys (signing in with a face or fingerprint).

## Build steps (one pull request each, each with a check the owner does)

S1. This plan. Check: read it, and choose the web address's name. Done October 26, 2026 (pull request 64; the name is `danielyoonwrites.com`).

S2. The owner's setup, no code, one step at a time with screenshots (the clicks are in "What S3 built," under "The owner's steps"):
- buy the web address at Cloudflare (done October 26, 2026)
- set up Resend and prove the address is yours (started October 26, 2026, with `mail.danielyoonwrites.com`; waiting for "Verified")
- save the new keys in Cloudflare as secrets: `RESEND_API_KEY` (a Sending-access key, only for that address) and `OWNER_EMAIL`

The Google "client ID" moved to S5, when Google sign-in is built.

Check: a test email arrives.

S3. Sign in with an email code, in the server and the app. During the change, the passcode still works too. The owner's own email address can sign in right away. Built October 28, 2026, with each person's own daily limit (the owner's request); see "What S3 built." Check: sign in on your phone with a code, write questions, and sign out.

S4. The owner's page: invite by email, see who's invited and today's use, turn someone off. Check: invite one person from your group; they sign in. Built October 29, 2026 (pull request 89); see "What S4 built."

S5. "Continue with Google." First the owner makes a Google "client ID" and saves it in Cloudflare as the secret `GOOGLE_CLIENT_ID`. Check: sign in with Google on your phone, and on an iPhone if someone in the group has one.

S6. The passcode removed (each person's limit came early, in S3). Then the sign-in screen loses "Have a passcode?", and the server's scrambled code for each connection needs a secret of its own instead of the passcode (`connectionCode` in `server/worker.js`). Check: a day of normal use.

Later: Apple, moving the app, saved studies in the account, subscriptions.

## What S3 built (October 28, 2026)

For the person:
- At the bottom of the start screen: "Sign in," or "Signed in as dan@example.com." with "Sign out." Signing out says the saved studies and reading plan are still on the phone (they are: only the sign-in is forgotten).
- Asking the AI on a phone that isn't signed in (and has no passcode) opens "Sign in": the email address, then "Email me a code." Then "Check your email": "If [the address] is invited, a 6-digit code is on its way," the code, and "Sign in." Also "Send a new code" and "Use a different email." After signing in, the app goes back to where it was and writes the questions that were asked for.
- The words don't say whether an address is invited: the server answers the same way for any address, so nobody can use the app to find out who's in the group (Claude's choice, for the owner to change if he'd rather say "not invited").
- "Have a passcode? Use it instead" stays on the sign-in screen until step S6. Signing in replaces the passcode on that phone.
- The email comes from `Living in the Word <sign-in@mail.danielyoonwrites.com>`, with the code in the subject ("123456 is your Living in the Word code"), so it shows in the phone's notification.

Inside (`server/worker.js`, "Signing in"):
- Three new tables in the same D1 database, made by the server the first time it's needed: `people` (email, name, the date invited, on or off; step S4 fills it), `codes` (one at a time for each address, scrambled), `sessions` (one for each signed-in phone, its key scrambled).
- A code works for 10 minutes and 5 tries. Each try is used up before the code is compared, so tries sent at the same moment can't add up to more. A new code replaces the old one.
- Limits on codes: 5 a day for one address, 30 code requests a day from one internet connection (a group on one Wi-Fi shares it), 90 emails a day in all (Resend's free plan sends 100 a day: search results that include Resend's own pages, October 28, 2026). Wrong codes count toward the same 10 wrong tries a day per connection as wrong passcodes.
- A phone stays signed in for 90 days. Its key (64 random letters and numbers) travels in the request's Authorization header, never in the web address. The server keeps only a scrambled copy (SHA-256), so the database alone can't sign anyone in. Sign out deletes it. A key that's unknown, ran out, or belongs to someone turned off gets "signed-out," and the app asks to sign in again.
- Daily limits: someone signed in has their own 20 a day, wherever they are (counted as `person:` plus their address); a phone with the passcode still counts with its connection. Everyone together keeps 60 a day. Someone signed in isn't stopped by wrong passcodes tried on their Wi-Fi.
- If Resend refuses an email, its reason comes back to the app and shows only on the test link (the address with `?test`), to help with setup. Anything that looks like a Resend key is blanked out first.
- Nothing about a person goes to the AI: it's still sent only the passage name.

Known limits:
- Someone who knows an invited address could try to guess its code: at most 5 codes a day, 5 tries each, so 25 guesses out of a million a day, and every code emails the real person. Wrong tries from one connection stop at 10 a day.
- The answer for an invited address takes a moment longer (an email is sent), so a determined person timing the answers could tell who's invited. Not prevented; it would take effort for little gain.
- The session key is kept in the browser's storage for the whole website (danielyoonwrites.github.io), like the passcode is now (see SPEC.md, "Safety and limits"). Moving the app to its own address (parked) would separate them.

Tested before the pull request (not with the real Resend or Cloudflare, which Claude can't reach): 67 checks of `server/worker.js` with stand-ins for D1 (Node's own SQLite), Resend and the AI, including 20 wrong codes sent at once (only 5 compared) and 30 requests at once for one person (only 20 reach the AI); and 54 checks of the app in Chromium at 320, 360 and 1280 wide, with the real `server/worker.js` behind it, including the app with today's older server (sign-in says it isn't set up yet, and the passcode still works).

The owner's steps, in order (the labels come from earlier sessions and search results, and may be worded a little differently):
1. Resend (https://resend.com, signed in as `danyoonsignup`): Domains. `mail.danielyoonwrites.com` must say "Verified."
2. Resend: API Keys, Create API key. Name it `living-in-the-word`, choose "Sending access," and choose the domain `mail.danielyoonwrites.com`. Copy the key: Resend shows it only once.
3. Cloudflare: Workers & Pages, `living-in-the-word`, Settings, Variables and Secrets, Add. Type: Secret. Name: `RESEND_API_KEY`. Value: the key. Save (Deploy).
4. The same place: Add, Type: Secret, Name: `OWNER_EMAIL`, Value: the owner's own email address (the one he'll sign in with). Save (Deploy).
5. After the pull request is merged: paste the new `server/worker.js` into the Worker (Edit code, pick the Latest version, select all, paste, Deploy).
6. Check: open the app, tap "Sign in" at the bottom of the start screen, and sign in with the code from the email. Write questions, then sign out. If the email doesn't come, try again on the test link (the address with `?test`): it shows Resend's reason.


## What S4 built (October 29, 2026)

For the owner:
- "Invite people" at the bottom of the start screen, between "Signed in as ..." and "Sign out." Only the owner sees it.
- The "Invite people" screen: "Only the people you invite can sign in. Only you can see this page." Then "Invite someone," "Send the app's link" (the phone's share menu, or the link copied where there's none), and "Inviting doesn't email them, so send them the link yourself." "Daily AI limits" (pull request 92): why there's a limit, what counts as a set, when the counts start over at midnight Pacific time, and today's use: "Today you've used 1 of your 20. Everyone together has used 3 of 60, counting phones that use the passcode." Then everyone invited, by name (or address): the name, the address, "Used 2 of 20 today" (or "Turned off"), and "Turn off" (or "Turn on").
- The "Invite someone" screen: their email address, and their name (optional; only the owner sees it). They can sign in with that address right away. Inviting someone again turns them back on, and changes the name if a new one is typed.
- "Turn off" asks first: "Turn off Sarah Kim? They'll be signed out, and can't sign in until you turn them back on." They're signed out on every phone, and a code they asked for stops working. Their row stays in its place, in grey. "Turn on" lets them sign in again, with a new code.

Inside (`server/worker.js` and `app.js`, both under "The owner's page"):
- Four new requests: `people`, `invite`, `turn-off` and `turn-on`. Each needs the phone's session key, and its address must be `OWNER_EMAIL`; the passcode never opens them. Each answer is the whole list again, with today's counts (`person:` plus the address, and `everyone`).
- The owner's own address can't be invited, turned off or turned on (testing found that turning it off would have signed him out everywhere).
- Names: one line, at most 60 letters, kept in the `people` table for the owner's list only, never sent to the AI. The app shows them as plain text, never as HTML.
- Signing in now answers `owner: true` or `false`, and the app keeps it with the sign-in (`owner` in the saved data). A phone signed in before S4 doesn't know yet: only the owner could sign in then, so it shows "Invite people," and the list's first answer settles it. If the server ever answers "not-owner," the button goes away.
- No email goes to invited people (Claude's choice, in the screenshots the owner approved): the owner tells them himself, and the app sends fewer emails.

Tested before the pull request (not with the real Cloudflare or Resend): 60 checks of `server/worker.js` with stand-ins for D1 (Node's own SQLite), Resend and the AI, including someone who isn't the owner trying every request, the passcode alone, a made-up key, another website, turning off (signed out, no new code, an earlier code stops working), turning back on, inviting again, long names, emoji and a name that looks like code; and 70 checks of the app in Chromium at 320, 360 and 1280 wide, with the real `server/worker.js` behind it, including Back and the back gesture, a phone signed in before S4, someone who isn't the owner, a sign-in that ran out, and no connection.

The owner's steps: after merging, paste the new `server/worker.js` into the Worker (the steps are in `PROGRESS.md` and the pull request), then the check above.


## Tech notes

- No build tools, no npm. Google's button script loads from Google; everything else is the app's own code.
- The session key is kept on the phone, under the app's own storage key, and sent with each request in a header, never in the web address.
- Emails sent through Resend's web API from the Worker, with the key as a Cloudflare secret.
- Google's signed answer is checked with the browser-standard crypto built into Workers, against Google's published keys.
- Days are counted in Pacific time, as the daily limits are now.
