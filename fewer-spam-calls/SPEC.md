# SPEC: Fewer spam calls

A one-page guide at https://danielyoonwrites.github.io/fewer-spam-calls that walks people through the free steps that cut down robocalls and spam calls. Built with the owner, October 2026.

## Who it's for

Anyone in the US, written so a grandparent could follow it: large text, one step at a time, no tech words. Shared with the owner's church first. Californians also see the DROP step.

## The promise

Honest: fewer spam calls, not none. No guide or tool stops them all, and the page says so.

## How the page works

Changed October 24, 2026, after the owner read the first version: a full checklist was too much text for seniors.

- Three questions first, one per screen, with big buttons:
  - What kind of phone do you have? iPhone, Samsung Galaxy, another Android phone (like a Pixel), or I'm not sure (with a hint: an apple logo on the back means iPhone)
  - Which phone company do you pay? T-Mobile, Verizon, AT&T, or another company / not sure (hint: it's on your phone bill)
  - Do you live in California? Yes or no
- Then only the matching steps, one per screen: "Step 1 of 4," a few short lines, a big "Done, next step" button and a "Back" button.
- Then "You're all set," with "Start over."
- Every step is trimmed to the essentials. Calling the Do Not Call number comes first, since it's easier than signing up online.
- Nothing is saved or sent anywhere. The page never asks for a phone number. No tracking.
- Sources sit in a fold-out "Where this comes from" at the bottom, with the "last checked" date.
- Without JavaScript, every step shows on one page.

## The steps

Facts checked October 24, 2026, from search results of official pages (sources below). Recheck before each update.

1. **Join the Do Not Call Registry.** Free. At DoNotCall.gov, or call 1-888-382-1222 (TTY 1-866-290-4236) from the phone you want to register. Online sign-up sends an email you must confirm within 72 hours. Your number is on the list the next day, but sales calls can take up to 31 days to stop. Registration never expires. It stops law-abiding telemarketers, not scammers. Warning: emails saying your registration is expiring are fake.
2. **Turn on your carrier's free spam blocking.**
   - T-Mobile: dial #662# to turn on Scam Block (free; #632# turns it off). It may block a call you wanted.
   - Verizon: Call Filter is free. In the Verizon Protect app: Services, Call Filter, Manage, then turn on the spam filter. Or in My Verizon: Settings & preferences, Call Filter.
   - AT&T: the free ActiveArmor app blocks fraud calls automatically and can block spam calls or send them to voicemail.
   - Another carrier: call your phone company and ask about free spam blocking (FCC advice).
3. **Turn on your phone's own call screening.**
   - iPhone: Settings, Apps, Phone, then choose how to handle unknown callers: "Ask Reason for Calling" or "Silence." (Apple's page describes iOS 26; check the exact path on iOS 27 when building.) Tip: save your doctor, pharmacy and family as contacts first, so their calls still ring.
   - Android with Google's Phone app (for example Pixel): Phone app, More, Settings, Caller ID & spam or Spam and Call Screen, then turn on spam filtering or Call Screen.
   - Samsung Galaxy: Phone app, the three dots, Settings, Caller ID and spam protection, then Block spam and scam calls.
4. **Californians: use DROP.** At privacy.ca.gov/drop. One free request asks all registered data brokers (over 500) to delete your information, which makes your number less widely sold. About 10 minutes. You confirm you live in California through the California Identity Gateway (or Login.gov if you already have an account). Required: name, date of birth, email; add your phone numbers too. Keep your 8-digit DROP ID to check on it later. Brokers have had to process requests since August 1, 2026, checking every 45 days. In some cases you can submit a request for another California resident, like a parent. It reduces how far your number spreads; it won't stop scammers who dial random numbers.
5. **When one gets through.** Hang up. Don't press any buttons, even "to be removed." Caller ID can be faked. Report the call at DoNotCall.gov (or ReportFraud.ftc.gov if you lost money). Forward spam texts to 7726.

## Sources (opened as search results October 24, 2026)

- FTC: National Do Not Call Registry FAQs, https://consumer.ftc.gov/articles/national-do-not-call-registry-faqs
- FTC: How to block unwanted calls, https://consumer.ftc.gov/articles/how-block-unwanted-calls
- FTC: How to recognize and report spam text messages, https://consumer.ftc.gov/articles/how-recognize-and-report-spam-text-messages
- FCC: Call blocking tools and resources, https://www.fcc.gov/call-blocking
- T-Mobile: Help with scams and spam, https://www.t-mobile.com/support/plans-features/help-with-scams-spam-and-fraud
- Verizon: Call Filter FAQs, https://www.verizon.com/support/call-filter-faqs/
- AT&T: Use the ActiveArmor app, https://www.att.com/support/article/wireless/KM1147710/
- Apple: Screen and block calls on iPhone, https://support.apple.com/guide/iphone/screen-and-block-calls-iphe4b3f7823/ios
- Google: Use caller ID and spam protection, https://support.google.com/phoneapp/answer/3459196
- Samsung: Block spam calls with Smart Call, https://www.samsung.com/us/support/answer/ANS10003438/
- California: DROP, https://privacy.ca.gov/drop/ and Help with DROP, https://privacy.ca.gov/drop/help-with-drop/

## Design

Same Moon jar design as the website (see the website's `CLAUDE.md`), with these changes for older readers:
- Body text 20px instead of 18px.
- Buttons and choices at least 48px tall, easy to tap.
- Steps numbered, with one short instruction per line.
- Print styles: hide the choices, keep the steps and sources.

## Not in this version

- Asking for or storing a phone number.
- Submitting anything on someone's behalf (Do Not Call, DROP or reports).
- Blocking calls itself (that needs a real phone app).
- Spanish or Korean versions (an idea for later).

## Build plan (one pull request each, each with a check the owner does)

1. This spec, plus `CLAUDE.md` for the folder. Check: read it. (Merged, pull request 20.)
2. The page with the full checklist, sources and "last checked" date, no choices yet. Check: read it on a phone; tap every link. (Built October 24, 2026; parts for one phone, carrier or state are already tagged so step 3 can hide them.)
3. Questions first, then one step at a time (replaced the optional choices; built October 24, 2026). Check: go through it on a phone with your own answers, then with "I'm not sure."
4. Final pass: recheck every fact, and check the iPhone steps on a real iPhone. Check: follow the steps for your own phone and carrier.
