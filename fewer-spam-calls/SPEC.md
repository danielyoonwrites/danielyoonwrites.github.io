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
- Nothing below the buttons while answering or stepping through. The sources (a fold-out "Where this comes from," with the "last checked" date) and "Made by Daniel Yoon" appear only on the last screen.
- Buttons match the website (changed October 24, 2026, after the owner found the first buttons ugly): answers look like the Writing page's "Start here" list, with thin lines and a small arrow; "Done, next step" looks like the website's Subscribe button; "Back" is a small gray label.
- File links end in `?v=2` so phones load new copies right away. GitHub Pages lets browsers keep files for 10 minutes (`cache-control: max-age=600`, checked October 24, 2026). Raise the number whenever `style.css` or `guide.js` changes.
- Without JavaScript, every step shows on one page.

## The steps

Facts rechecked October 24, 2026 by opening each official page from GitHub (through Jina Reader) and reading the exact lines. Recheck before each update.

1. **Join the Do Not Call list.** Free. Call 1-888-382-1222 (TTY 1-866-290-4236) from the phone you want to register, or use DoNotCall.gov. Online sign-up needs an email link clicked within 72 hours. Up to 31 days for sales calls to stop. Never expires. Doesn't stop scammers. (FTC, confirmed.)
2. **Phone company's spam blocking.**
   - T-Mobile: "Dial #662# from your T-Mobile device" turns on Scam Block; also in the free T-Life app (postpaid). Scam ID and Scam Block are free. (T-Mobile, confirmed.) The "#632# to turn off" code was not found on T-Mobile's pages and was removed.
   - Verizon: Verizon Protect app, Services, Call Filter, Manage, Spam & category filters, Spam filter switch. Devices that can't use the app use My Verizon. (Verizon, confirmed.) "Free" comes from Verizon's FAQ as quoted in search results.
   - AT&T: ActiveArmor app; fraud calls are blocked automatically; on the Calls tab, spam calls can be allowed, blocked or sent to voicemail. (AT&T, confirmed.) "Free" comes from AT&T pages in search results.
   - Another company: call your phone company and ask (FCC advice).
3. **Phone's own call screening.**
   - iPhone: Settings, Apps, Phone; unknown callers: Never, Ask Reason for Calling, or Silence (sent to voicemail). (Apple's current guide, confirmed.) The guide shows "Silence" only, to keep it simple.
   - Google's Phone app: More options, Settings, Caller ID and spam; turn on "See caller ID & spam" and "Filter spam calls." Phones with automatic Call Screen block spam there instead. (Google, confirmed.)
   - Samsung: Phone app, three dots, Settings, Caller ID and spam protection, Block spam and scam calls. NOT confirmed directly: Samsung blocked the page reader; based on search results of Samsung's Smart Call page. Recheck.
4. **California DROP.** privacy.ca.gov/drop. One request to over 600 registered data brokers (DROP's home page; an older March 2026 flyer says 500). Three steps: verify you live in California, create a profile, submit. Asks for information such as name, date of birth and email; only some is required. 8-digit DROP ID; keep it private. You may submit for someone else with their permission, after verifying their residency. Brokers process at least every 45 days starting August 1, 2026; status updates can take up to 90 days. (California, confirmed.) "About 10 minutes" was not found on DROP's pages and was removed.
5. **When one gets through.** Hang up. Don't press a number (it can lead to more robocalls). Caller ID is easy to fake. Report at DoNotCall.gov; if you lost money, ReportFraud.ftc.gov. Forward spam texts to 7726. (FTC, confirmed.)

## Sources (opened October 24, 2026)

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
- California: DROP sign-up and terms, https://consumer.drop.privacy.ca.gov/
- FTC: Robocalls, https://consumer.ftc.gov/articles/robocalls
- T-Mobile: Block unwanted calls, https://www.t-mobile.com/support/plans-features/block-unwanted-calls
- Verizon: Enable spam filter, https://www.verizon.com/support/knowledge-base-217615/

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
4. Final pass: recheck every fact, and check the iPhone steps on a real iPhone. Check: follow the steps for your own phone and carrier. (Facts rechecked October 24, 2026; Samsung still to confirm.)
