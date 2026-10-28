# Plan: phones and app stores

How Living in the Word gets from "a web page you can add to your home screen" to "an app in Google Play," and maybe later Apple's App Store. Planned October 28, 2026, after the owner asked to "prepare this app even more for eventually phone download and then eventually for app stores." Nothing here is built yet. It follows the October 27, 2026 decision in `DECISIONS.md` ("no app store for now"): sign-ups come first, so this plan fits around them.

## Where it stands

- **Level 1, the home screen app, works.** Added to the home screen, it opens like an app and works without reception (pull request 59).
  - Checked October 28, 2026: Chrome reports no install problems and no errors in `manifest.webmanifest` (tested in Chromium on Claude's computer, at 360 pixels wide).
  - Missing for phones: the tip on the Saved studies screen only explains iPhones ("tap Share in Safari"). The owner and most of his group use Android.
- **Level 2, Google Play:** not started. Needs the items under "What both stores ask for."
- **Level 3, Apple's App Store:** not started. Hardest; last.

## What both stores ask for

Each line says where the rule comes from and how it was checked.

1. **A privacy page,** linked inside the app and in the store listing. Apple's App Review Guidelines, 5.1.1(i): it must say what data is collected, how it's used, who it's shared with, how long it's kept and how to ask for it to be deleted (read on developer.apple.com, October 28, 2026). Google Play asks for a privacy policy link too (search results; Google's help pages are blocked from Claude's sessions).
   - The app already has a short answer: email addresses for sign-in, scrambled codes, daily counts, and passage names sent to the AI. Nothing about a person is ever sent to the AI. Saved studies stay on the phone.
   - Apple's 5.1.2(i) now names "third-party AI": personal data shared with an AI company must be disclosed and agreed to first (read October 28, 2026). This app sends only the passage name, so the page should say so plainly.
2. **"Delete my account" inside the app.** Apple's 5.1.1(v): "If your app supports account creation, you must also offer account deletion within the app" (read October 28, 2026). Google Play asks for the same, plus a web page where someone can ask for deletion even after removing the app (Google's help page "Understanding Google Play's app-account deletion requirements," seen only through search results). Turning an account off doesn't count as deleting it.
   - `SIGNUP-PLAN.md` already promises "Delete my account," but no build step has it yet.
3. **A way to report an AI question,** for Google Play. Google's policy for apps that make content with AI asks for a way to report or flag offensive content without leaving the app (search results quoting Google's help page, from 2023 and 2024; check the current wording before packaging).
4. **A way for the reviewers to sign in.** Apple's 2.1 asks for "an active demo account or fully-featured demo mode" (read October 28, 2026). Google Play's "App access" form asks the same (search results). Email codes go to the person's own inbox, so the reviewers need a test account that works without one. Built with the sign-ups.
5. **Pictures for the listing:** the icon (the app's 512 by 512 icon works), and phone screenshots. Google also wants a wide "feature graphic" (search results).

## The one decision to make before packaging: the app's permanent address

The store app is tied to one web address. Google's version proves it belongs to the website with a file at `<address>/.well-known/assetlinks.json` (PWABuilder's own docs, read on GitHub, October 28, 2026). Saved studies are also kept per address: if the app moves, studies saved at the old address stay behind.

So the address should be settled before the store, and the earlier the better, because every person who saves studies before a move will need to carry them over.

- Option A: keep `danielyoonwrites.github.io/living-in-the-word`. Nothing moves.
- Option B: move it to the owner's own address (`danielyoonwrites.com`), as `SIGNUP-PLAN.md` already parks. It would stay his even if he ever leaves GitHub. Needs a way to bring saved studies along (a backup file, like First step smaller's).

No recommendation yet: it depends on how many people use it by then. Asked when step 6 comes.

## Steps (one pull request each, each with a check the owner does)

Free steps first, in this order. Each makes the app better now, even if it never goes to a store.

1. **Android install.** The home screen tip gets an Android line, and on Android's Chrome an "Install the app" button appears (Chrome offers it to apps that qualify; it never shows on iPhones). Check: on your phone, open the app in Chrome, tap the button, and see the icon on your home screen.
2. **A tidier app description** for phones: an `id` (so the phone keeps recognizing the app even if its start page changes), the language, a category, and two or three screenshots. With screenshots, Android shows a bigger install window with pictures (web.dev, "How to add Richer Install UI," seen through search results: up to 8 PNG or JPEG pictures, each side 320 to 3,840 pixels). The same screenshots work for the store listing. Check: you approve the screenshots, then see the bigger install window on your phone.
3. **The privacy page,** `privacy.html` in this folder, linked from the start screen. Plain words, about a screen long. Check: you read and approve every sentence.
4. **"Delete my account,"** with the sign-in line on the start screen, and the server removes everything it has about that person. The privacy page also gets an email address for asking. Check: make a test account, delete it, and it can't sign in.
5. **"Report this question,"** a small link under the AI's questions. The simplest version opens an email to the owner with the passage and the question filled in. Check: report one to yourself.
6. **Sign-up steps S4 to S6,** as in `SIGNUP-PLAN.md`, plus a review account (item 4 above), and the permanent address (above).
7. **Google Play** (owner's steps, one at a time):
   - A Google Play developer account: 25 USD once (search results quoting Google's help page).
   - A personal account made after November 13, 2023 must first run a closed test with at least 12 testers for 14 days in a row (third-party guides agree; Google's own page couldn't be read). His small group could be the testers. Organization accounts are said to skip it, but need a D-U-N-S number (Google's "Required information" page, seen through search results).
   - Package it at pwabuilder.com (free). Keep the signing key files it gives safe: every future update needs them.
   - Put `assetlinks.json` at `danielyoonwrites.github.io/.well-known/assetlinks.json` (or the new address), then update it with the fingerprint Google Play shows after upload. Note: the publish workflow (`.github/workflows/publish.yml`) uses `actions/upload-pages-artifact@v3`, which includes folders whose names start with a dot. Version 4 leaves them out unless `include-hidden-files: true` is added (checked in the action's own code, October 28, 2026).
   - Store forms: Data safety, content rating, target audience. PWABuilder's docs say web apps on Android can't target children: set the audience to 13 and up.
   - Check: the app installs from Google Play on your phone with no address bar showing.
8. **Apple's App Store, later, if wanted:**
   - 99 USD a year (Apple's enrollment page, read October 28, 2026). A nonprofit organization may ask for a fee waiver; that would be the church publishing it, not the owner personally.
   - A Mac with Xcode (the owner has a MacBook). PWABuilder's iPhone package is an Xcode project.
   - Guideline 4.2: an app should be "elevate[d] beyond a repackaged website." Works without reception, saved studies and the reading plan help. A reading plan reminder (a notification) would help more.
   - Guideline 4.8: only if Google sign-in is added, Sign in with Apple is needed too. Email codes alone don't need it.

## Bigger questions before going public (already known)

- Who pays for the AI (about 3 cents a set with Opus 5.5).
- The ESV text: Crossway's free terms are only for non-commercial apps (`SPEC.md`, "The Bible text").
- A trademark search for the name.

## What couldn't be checked

- Google's help pages (support.google.com) are blocked from Claude's sessions: everything about Google Play here is from search results or third-party guides. Check each one on Google's own page before paying or packaging.
- Whether Google's AI-content rule covers this app exactly: it names chatbots and image, voice and video makers, and leaves out apps that only summarize. A question writer is closest to a chatbot, so plan for the report button.
- Sources: Apple's App Review Guidelines (https://developer.apple.com/app-store/review/guidelines/) and enrollment page (https://developer.apple.com/programs/enroll/); PWABuilder's Android docs (https://github.com/pwa-builder/pwabuilder/blob/main/docs/builder/android.md); `actions/upload-pages-artifact` (https://github.com/actions/upload-pages-artifact); web.dev, "How to add Richer Install UI" (https://web.dev/articles/web-apps/richer-install-ui); Google Play's account deletion help page (https://support.google.com/googleplay/android-developer/answer/13327111) and AI content page (https://support.google.com/googleplay/android-developer/answer/13985936), both through search results only.
