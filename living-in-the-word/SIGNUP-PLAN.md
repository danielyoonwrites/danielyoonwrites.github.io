# Plan: sign-ups (stage 3)

So people can use the AI helper without the shared passcode, each with their own daily limit, and so the app can have subscriptions someday. Planned with the owner on October 26, 2026, after the security work (pull requests 61 to 63). Nothing here is built yet: this plan is for the owner to read and approve first.

## Decided (October 26, 2026)

- **Invite only, at first** (the owner's choice). Only people the owner invites can use the AI helper: his small group and people he chooses. It can open to anyone later, maybe with subscriptions.
- **Sign in with an email code, or with Google** (the owner's choice, after comparing costs; see "What was checked"). These are the usual ways people expect to sign in.
  - **Email code:** type your email address, get a code by email, type it into the app. Codes are typed in, so they work inside the home screen app, even on an iPhone.
  - **Google:** "Continue with Google." Free.
  - **Apple: later, if wanted.** It needs Apple's developer membership, 99 USD a year.
- **The owner's own web address** (the owner's choice, about $11 a year). Sign-in emails come from it, and the AI helper's server can live at it. It's also needed for Google's sign-in screen and later for subscriptions.
- **Each person has their own daily limit** (20 sets of questions a day, the same number as now), and everyone together keeps 60 a day.
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

S2. The owner's setup, no code, one step at a time with screenshots:
- buy the web address at Cloudflare (done October 26, 2026)
- set up Resend and prove the address is yours (started October 26, 2026, with `mail.danielyoonwrites.com`; waiting for "Verified")
- save the new keys in Cloudflare as secrets: `RESEND_API_KEY` (a Sending-access key, only for that address) and `OWNER_EMAIL`

The Google "client ID" moved to S5, when Google sign-in is built.

Check: a test email arrives.

S3. Sign in with an email code, in the server and the app. During the change, the passcode still works too. The owner's own email address can sign in right away. Check: sign in on your phone with a code, and sign out.

S4. The owner's page: invite by email, see who's invited and today's use, turn someone off. Check: invite one person from your group; they sign in.

S5. "Continue with Google." First the owner makes a Google "client ID" and saves it in Cloudflare as the secret `GOOGLE_CLIENT_ID`. Check: sign in with Google on your phone, and on an iPhone if someone in the group has one.

S6. Limits for each person, and the passcode removed. Check: a day of normal use.

Later: Apple, moving the app, saved studies in the account, subscriptions.

## Tech notes

- No build tools, no npm. Google's button script loads from Google; everything else is the app's own code.
- The session key is kept on the phone, under the app's own storage key, and sent with each request in a header, never in the web address.
- Emails sent through Resend's web API from the Worker, with the key as a Cloudflare secret.
- Google's signed answer is checked with the browser-standard crypto built into Workers, against Google's published keys.
- Days are counted in Pacific time, as the daily limits are now.
