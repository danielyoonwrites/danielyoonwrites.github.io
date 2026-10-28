# Plan: phones and app stores

How Living in the Word gets onto phones: installed from the browser, on Google Play, and maybe on Apple's App Store. Planned October 28, 2026, after the owner asked to "prepare this app even more for eventually phone download and then eventually for app stores." Double-checked the same day, when he asked to "double check and research again... check all the cases." Nothing here is built yet. It follows the October 27, 2026 decision in `DECISIONS.md` ("no app store for now"): sign-ups come first.

How the facts were checked: seven research passes on October 28, 2026, reading official pages and source code wherever Claude's session could reach them. Google's help pages (support.google.com, play.google.com), WebKit's blog, Apple's Support pages, state legislature sites and developer.chrome.com couldn't be opened, so facts from them are marked "(search results only)." Check those on the real page before paying or packaging. This isn't legal advice: where it says "lawyer," a short consultation is wise.

## The short version

- The home-screen web app is already a complete way to have the app. On Android, installing it from Chrome makes a real app (Chrome builds a "WebAPK" that shows in the app drawer). On iPhones it opens full screen and works without reception.
- Most of the work is the same for every path, costs nothing and helps the group right away: the back gesture, install help, a "check it" line, a privacy page, and a backup for saved studies.
- The stores add paperwork more than features. Google Play: $25 once, an ID check and forms. Its internal testing can reach up to 100 invited Android users without the 12-tester test (search results only). Apple: $99 a year, a Mac that runs Xcode 26, Swift work, and a real chance of rejection under guideline 4.2.
- Since 2026, store apps (not web apps) fall under state age laws: Texas's applies now; California's and Alabama's start January 1, 2027. They call for age-check code that only a native app can run. A lawyer should confirm that the web app stays outside them.
- Recommendation: do the free steps now; then decide who the app is for and its permanent address; try Google Play's internal testing once deletion, reporting and a review account exist; treat Apple as a separate project, only if iPhone members ask for it.

## Where it stands (checked October 28, 2026)

Works:
- Chrome finds no install problems (re-run in Chromium 153 at phone size). A service worker is no longer needed to install, though the app keeps one for offline use (Chromium source code).
- Already in place, and the stores will like it: the start screen says the AI writes the questions and "Only the passage name is sent"; the server tells the AI "Never quote verses, not even short phrases" (`server/worker.js`), which guards against Apple's rule 1.1.5 on "inaccurate or misleading quotations of religious texts"; the code box has `autocomplete="one-time-code"`; the start page opens offline.

Problems found:
1. **Android's back gesture closes the app from any screen.** In an installed app (from Chrome or from Play), back walks through the page's history and closes the app when there's none (Chromium source code). The app switches screens with its own list and never adds to the browser's history. The list is even named `history` (`app.js`, line 27), which hides the browser's own `history`. The on-screen Back buttons work.
2. **KakaoTalk.** Nothing can be installed from inside KakaoTalk's built-in browser, and studies saved there stay there.
3. **No "check it" line.** Anthropic's Commercial Terms (section D.3, read on anthropic.com; effective June 17, 2025) say the app's maker "must notify its Users, that factual assertions in Outputs should not be relied upon without independently checking their accuracy." This applies today, store or not.
4. **The icons have no transparency layer.** Google Play's listing icon is a 32-bit PNG with alpha (search results only); the app's icons are 24-bit. Re-save them before listing.

## How saved studies are kept (corrected)

- By origin and by browser, not by the full address. The origin here is `https://danielyoonwrites.github.io`. Moving the app to another folder on github.io keeps the studies; moving it to `danielyoonwrites.com` leaves them behind (tested locally).
- Each browser keeps its own copy: Chrome, Samsung Internet and KakaoTalk's built-in browser each have their own. On Android, a Chrome tab and the app installed from Chrome share one copy; the Play app shares Chrome's copy when Chrome is the default browser.
- On iPhones, the home-screen app keeps its own copy, separate from Safari's (Apple, WWDC23). An App Store app would be a third copy.
- So a backup file (save and restore studies) helps on every path.

## Decisions only the owner makes (asked one at a time)

1. **Go to the stores at all?** Recommendation: the web app now; Google Play's internal testing later; Apple only if iPhone members ask.
2. **Who is it for?** 18 and over is simplest: Anthropic's rules for apps used by minors and the children's privacy law (COPPA) stay out. 13 and over brings age checks, content filtering, monitoring and a public COPPA statement (Anthropic's guidelines for organizations serving minors, March 16, 2026). Under 13 isn't possible on Google Play this way: Google's own Bubblewrap tool says these apps "are currently incompatible with applications targeting children under the age of 13." Recommendation: 18 and over while it's invite only.
3. **The permanent address:** keep `danielyoonwrites.github.io/living-in-the-word`, or move to `danielyoonwrites.com`. A move needs the backup step first and the new address added to `ALLOWED_ORIGINS` in `server/worker.js`, and a custom domain on this repository reportedly moves the whole website (search results only). Decide before packaging for any store and before the group saves many studies.
4. **"Continue with Google" (sign-up step S5):** if the app ever goes to Apple's App Store with it, Apple's rule 4.8 also asks for Sign in with Apple or an equal private option. Email codes alone are exempt. Recommendation: hold S5 until the store question is settled.
5. **Whose name is on the listings:** personal (his legal name is public on both stores; Google Play also shows his country and a contact email, and his home address only if the app makes money; search results only, and one Google page in them disagrees), or the church's (a D-U-N-S number, a website and someone who can sign for it).
6. **Which email address is public** on the listings.
7. **Europe and the UK:** leave them out, which avoids the EU's trader rules and GDPR questions. Recommendation: leave them out.
8. **Free for good, or paid someday:** paid brings in-app purchase rules, no ESV text without a license, and "significant change" notices under Texas's law.
9. **If Apple:** which Mac and which wrapper (see "Apple").

## Steps (one pull request each for code, each with a check the owner does)

Free, and useful now:
1. **Back gesture:** going back moves one screen instead of closing the app (`window.history.pushState` and the `popstate` event; rename the `history` list). Check: in the installed app, open Saved studies and swipe back: the start screen shows.
2. **Install help:** an "Install the app" button in Chrome (from Chrome's `beforeinstallprompt` event; it never shows on iPhones, in Firefox or inside KakaoTalk), an Android line in the home-screen tip, a fuller iPhone line (open the link in Safari, tap Share, then Add to Home Screen, and leave "Open as Web App" on), and a hint shown only inside KakaoTalk to open the page in Chrome first. Check: install from Chrome; open the link in KakaoTalk and see the hint.
3. **Manifest tidy-up:** `"id": "/living-in-the-word/"` (exactly this; `"./"` or `"/"` would make a different app), `"purpose": "any"` on the two regular icons, `lang`, a category, and two or three screenshots of 1080 by 2160 pixels marked `"form_factor": "narrow"` (that size suits both Chrome's bigger install window and Google Play's listing). Check: see the bigger install window with pictures.
4. **The "check it" line** under the AI's questions, for example: "Written by AI. Check them against Scripture before you use them." Check: read it under a set of questions.
5. **Decide** who it's for and the permanent address (decisions 2 and 3).
6. **The privacy page,** `privacy.html`, linked from the start screen: who runs the app and how to reach him; what the server keeps (email addresses, scrambled sign-in codes and session keys, daily counts) and why; that only the passage name goes to Anthropic's Claude, which doesn't train on it and keeps it about 30 days (search results only), or up to 2 years if flagged for a safety review (Anthropic's docs); who else handles data (Cloudflare, Resend); that saved studies stay on the phone; how long things are kept; how to delete the account; who the app is for; that nothing tracks people; and the date. Check: approve every sentence.
7. **Back up and restore saved studies,** as a file. Check: back up, restore in another browser, see the studies.
8. **Only if moving:** move the app and add the new address to `ALLOWED_ORIGINS`. Check: restore studies at the new address; the AI works there.
9. **Sign-up step S4,** the invite page (already next in `SIGNUP-PLAN.md`). Its "turn someone off" also covers Apple's rule 1.2 on blocking abusive users.
10. **"Delete my account"** in the app, plus a public web page for deletion requests; the server removes everything about that person. Check: a test account, once deleted, can't sign in.
11. **"Report this question":** a small form on the page that sends the passage, the questions and a comment through the Worker to the owner by email. An email link isn't enough: Google wants reporting "without needing to exit the app" (search results only). Check: report one; the email arrives.
12. **A review account** that signs in without an inbox, with its own small daily limit. Google asks for "reusable login credentials that can bypass" one-time codes (search results only); Apple's rule 2.1 wants a working demo account. Check: sign in from a fresh browser without opening any email.

Then, only if the owner chooses the stores:

13. **Decide:** stores or not, and Google sign-in or not.
14. **Google Play internal testing** (see "Google Play"). $25 once. Check: the app installs from Play with no address bar.
15. Optional: a closed test with 12 or more Android testers for 14 days, then a public listing.
16. **Apple groundwork** before paying: check the Mac, find an iPhone to test on, choose the wrapper, add local reminders for the reading plan, add Sign in with Apple if S5 happened, and add age-check code after a lawyer's advice.
17. **Apple:** enroll, fill in App Store Connect, submit for unlisted distribution. $99 a year.

## Google Play

The account (search results only):
- A personal account costs $25 once. He must be 18 or older, with a government ID and a card in his legal name; the check takes about 3 business days. New personal accounts also prove they have a real Android phone (Android 10 or later) by signing in to the Play Console app.
- Personal accounts made after November 13, 2023 need "a minimum of 12 testers who have been opted in continuously for at least 14 days" in a closed test before applying for a public listing, and Google reviews that application. It gates only the public listing.
- Internal testing: up to 100 testers added by email, no 12-tester test, only the first release is reviewed, and no Data safety form while the app is only there. Each tester needs an Android phone and a Google account. No Google page says internal testing may last forever, but test releases count as activity that keeps the account open.
- A church account needs a D-U-N-S number, which "can take up to 30 days." Third parties say organization accounts skip the 12-tester test; Google's own pages don't say so.

Packaging with PWABuilder (read in the source code):
- PWABuilder's free service uses Google's Bubblewrap 1.25.0, which targets Android 16 (API level 36). Google Play has required that for new apps and updates since August 31, 2026 (read on developer.android.com). A Play app made this way has no native code, so Google's 16 KB memory-page rule is already met.
- Change three defaults. The package ID defaults to `io.github.danielyoonwrites.twa`; it's permanent, so pick a specific one, like `io.github.danielyoonwrites.livingintheword`. Turn notifications off (on by default, they add a permission the app doesn't use). Keep the "Custom Tabs" fallback (the WebView fallback starts with empty storage and has no Share).
- Keep `signing.keystore` and `signing-key-info.txt` safe. PWABuilder: "You'll need them to deploy future versions of your app."
- The file that proves the website and the Play app belong together, `assetlinks.json`, goes at the site root: `https://danielyoonwrites.github.io/.well-known/assetlinks.json`, never inside the app's folder (PWABuilder's asset links FAQ). It's served as JSON over HTTPS, with no redirects. It lists two fingerprints: the upload key's, and the Play App Signing key's (Play Console, Setup, App integrity, after the first upload). If it's wrong, the app shows an address bar at the top. Because it covers the whole site, the Play app would also show the website's other pages full screen.
- Publishing that file: `.github/workflows/publish.yml` uses `actions/upload-pages-artifact@v3`, which keeps folders whose names start with a dot. Version 4 always drops them; version 5 (April 8, 2026) added `include-hidden-files: true` (read in the action's code). Never move to version 4.
- The Play app runs inside the person's default browser when it can (Chrome or Samsung Internet) and shares that browser's storage.

The forms (search results only):
- Privacy policy: a web page link (not a PDF) in Play Console and inside the app. Every app needs one.
- App access: the review account (step 12).
- Ads: none. Content rating: fill in the questionnaire. Target audience: decision 2. Financial features and Health apps: every app answers these; here, "none."
- Data safety (from closed testing on): email address collected for account management; passage names as "Other user-generated content," not "processed ephemerally," since Anthropic keeps requests about 30 days; Cloudflare, Resend and Anthropic likely count as service providers, so it isn't "sharing"; encrypted in transit; accounts can be deleted, with the deletion page's link.
- Account deletion: needed, because the first sign-in creates an account. An in-app path plus a web page; "Temporary account deactivation, disabling, or 'freezing' the app account does not qualify."
- AI-generated content: covers content "generated by any combination of text, voice, and image prompt input," so it covers this app; reporting must work without leaving the app (step 11).
- Listing: name up to 30 characters, short description up to 80; icon 512 by 512 (32-bit PNG with alpha); a feature graphic of 1024 by 500 (required); at least 2 screenshots, the long side at most twice the short side.
- Review: "up to 7 days or longer in exceptional cases."
- Android's new developer verification (from September 30, 2026, in four countries; worldwide in 2027) registers Play apps automatically (read on developer.android.com).

## Apple

The account (read on developer.apple.com):
- $99 a year; an Apple Account with two-step sign-in; a photo of a government ID in the Apple Developer app. For an individual, the "personal legal name will be listed as the seller on the App Store."
- The fee waiver isn't open to individuals. Only a legal entity "officially recognized" as a nonprofit (for example by the IRS) that sells no digital goods qualifies, so only the church, enrolled as an organization, could use it, and it ends if anything is ever sold.

The Mac (read on developer.apple.com):
- Uploads must be built with Xcode 26 or later (since April 28, 2026), and with the iOS 27 SDK from April 2027. iOS 27 is the current iPhone release.
- Xcode 26.0 to 26.3 need macOS Sequoia 15.6 or later; Xcode 26.4 and later need macOS Tahoe 26.2; Xcode 27 needs Tahoe 26.6. Apple says macOS 26 is the last release for Intel Macs.
- Any Apple-silicon MacBook (M1 or later) works. Of the Intel MacBooks, only the MacBook Pro 16-inch (2019) and 13-inch (2020, four ports) run Tahoe (search results only); the others stop at Sequoia and Xcode 26.3, which is enough only until April 2027. Check: Apple menu, About This Mac.

The wrapper:
- PWABuilder's iPhone package is labeled "Experimental": a Swift app around WKWebView, built with CocoaPods on a Mac (PWABuilder's docs, read on GitHub). Its template includes Google's Firebase Messaging, supports iPad and Mac by default (so iPad screenshots too), asks for camera, microphone and location, and allows insecure connections; PWABuilder itself says to "disable all capabilities your app does not need." So it needs Swift cleanup. A small hand-written Swift shell is the other option. Capacitor needs npm (against this repository's rules) and moves the page to `capacitor://localhost`, which the Worker would turn away.
- A wrapper that loads the live site keeps the page's origin, so the Worker and the page's security rules should work unchanged (test it). Service workers need Apple's "App-Bound Domains" (PWABuilder turns it on). Saved studies would be a third separate copy.

The rules (App Review Guidelines, last updated October 16, 2026, read):
- 4.2: "Your app should include features, content, and UI that elevate it beyond a repackaged website." Wrapped apps with offline use, push notifications and AI features have still been rejected (forum posts, anecdotal). The most realistic native feature: daily reading-plan reminders with local notifications.
- 2.1: a working demo account; a demo mode only "with prior approval by Apple." An invite-only app with emailed codes was rejected when the reviewer couldn't get the code (Apple's forums, 2024).
- 5.1.1(i): the privacy policy link in App Store Connect and "within the app." 5.1.1(v): "If your app supports account creation, you must also offer account deletion within the app."
- 5.1.2(i), added November 13, 2025: disclosure and "explicit permission" before personal data goes to "third-party AI." A passage name alone is arguably not personal data; a one-time notice with an OK button ("Passage names are sent to Anthropic's Claude; nothing about you is sent") is cheap insurance.
- 1.1.5: no "inaccurate or misleading quotations of religious texts."
- 1.2: "AI content creation apps" must have a way to filter objectionable material, a way to report offensive content, a way to block abusive users, and published contact information.
- 4.8: only if Google sign-in is added.
- 2.5.19: no hidden or undocumented features. Big new features belong in app updates, not only in website changes.

Distribution:
- Unlisted distribution fits an invite-only group: the app isn't in search or charts, opens only from a direct link, and still gets full review. Apple suggests "a mechanism within your app to prevent unauthorized use"; the invite list is one. Developers report waits from about a week to over four weeks (Apple's forums).
- TestFlight builds expire after 90 days, so TestFlight suits only a short pilot.

App Store Connect:
- App Privacy label: email address collected and linked to the person; passage names as "Other User Content."
- A Support URL with contact information; the age rating questionnaire (keep the app to its own website, with outside links opening in Safari, so "Unrestricted Web Access," which forces a 16+ rating, stays off); at least one iPhone screenshot set (iPad too, if the app runs on iPad); `ITSAppUsesNonExemptEncryption` set to NO (HTTPS only); an EU trader answer (Apple: not distributing in the EU means "you're not acting as a trader").
- Review: Apple says 90% of submissions are reviewed within 48 hours, but a 4.2 dispute can take several rounds.

## State age laws (they follow store apps)

- **Texas SB 2420: in force.** Apple applied it to new Texas accounts from June 4, 2026 (Apple's notice of June 3, 2026, read). Developers must use the store's age information for Texas users and tell the stores before any "significant change" (search results only). Apple's Q&A (read): even an 18+ app must "check the age of the people using your app" where the law requires it. Apple's and Google's age tools are native code only (Apple's Declared Age Range API in Swift; Google's Play Age Signals API for Android).
- **California AB 1043:** from January 1, 2027 (search results only).
- **Alabama HB 161:** January 1, 2027 in most sources (search results only).
- **Utah:** delayed to May 6, 2027 by HB 498 (search results only).
- **Louisiana:** delayed to July 1, 2027 by HB 977 (search results only).
- No exemption for free, adults-only or small apps turned up. A web app opened in a browser appears to be outside these laws: that's the research's reading, not a lawyer's.

## What the first version of this plan got wrong

- The `assetlinks.json` file goes only at the site root, never under the app's own address.
- `upload-pages-artifact` version 4 always drops folders whose names start with a dot; the switch to keep them came in version 5.
- Saved studies are kept per origin and per browser, not per full address.
- A report button that opens an email isn't enough for Google.
- Google's AI rule covers this app; it isn't limited to chatbots and image makers.
- Apple's fee waiver isn't open to individuals.
- Screenshots: Google Play allows a long side of at most twice the short side (Chrome allows 2.3 times), so use 1080 by 2160.
- New since the first version: the back gesture, KakaoTalk's separate storage, the "check it" line, the state age laws, the Mac requirement, and private distribution (Google Play's internal testing, Apple's unlisted apps).

## What couldn't be checked

- The current wording of every Google Play help page (blocked): the 12-tester rule, internal testing limits, account deletion, the AI policy, App access, the listing sizes, and whether Play asks for an EU trader declaration.
- Whether a church account really skips the 12-tester test.
- Chrome's exact menu label, Kakao's own wording for opening a page in another browser, and how the install window and the Play app look on a real phone.
- WebKit's and Apple Support's own wording for "Open as Web App" and Safari's 7-day rule.
- How WKWebView handles saved data, Share and the AutoFill of emailed codes.
- The Texas statute's text and any appeal ruling after mid-October 2026; whether California's AB 1043 counts a web app.
- The trademark office's own database: no app or live US trademark with the exact name "Living in the Word" turned up in search results, but the "Living Word" field is crowded. A lawyer's search before charging. Crossway's own pages couldn't be read either.

## Main sources (read October 28, 2026 unless marked)

- Apple: App Review Guidelines (updated October 16, 2026), https://developer.apple.com/app-store/review/guidelines/ ; upcoming requirements, https://developer.apple.com/news/upcoming-requirements/ ; Xcode system requirements, https://developer.apple.com/xcode/system-requirements/ ; age assurance Q&A, https://developer.apple.com/support/age-assurance/ ; the Texas notice (June 3, 2026), https://developer.apple.com/news/?id=sg176nne ; unlisted apps, https://developer.apple.com/support/unlisted-app-distribution/ ; fee waiver, https://developer.apple.com/support/membership-fee-waiver/
- Anthropic: Commercial Terms (effective June 17, 2025), https://www.anthropic.com/legal/commercial-terms ; guidelines for organizations serving minors (March 16, 2026), https://support.claude.com/en/articles/9307344-responsible-use-of-anthropic-s-models-guidelines-for-organizations-serving-minors
- Android: target API level, https://developer.android.com/google/play/requirements/target-sdk ; developer verification, https://developer.android.com/developer-verification
- PWABuilder (GitHub): Android, https://github.com/pwa-builder/pwabuilder/blob/main/docs/builder/android.md ; asset links FAQ, https://github.com/pwa-builder/pwabuilder/blob/main/docs/builder/asset-links-faq.md ; App Store, https://github.com/pwa-builder/pwabuilder/blob/main/docs/builder/app-store.md ; Bubblewrap's template, https://github.com/GoogleChromeLabs/bubblewrap/blob/main/packages/core/template_project/app/build.gradle
- GitHub's publish step: https://github.com/actions/upload-pages-artifact (tags v3, v4 and v5)
- Google Play help, search results only: testing requirements, https://support.google.com/googleplay/android-developer/answer/14151465 ; account deletion, https://support.google.com/googleplay/android-developer/answer/13327111 ; AI-generated content, https://support.google.com/googleplay/android-developer/answer/14094294 ; App access, https://support.google.com/googleplay/android-developer/answer/15748846 ; listing images, https://support.google.com/googleplay/android-developer/answer/9866151
