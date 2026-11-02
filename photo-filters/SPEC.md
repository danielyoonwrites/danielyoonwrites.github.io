# SPEC: Photo Filters

Owner: Dan. Written Nov 2, 2026 from camera research done with Claude.

The name is Dan's choice (November 2, 2026: "call it Photo Filters"); the working name was Photo Looks. It lives in this folder, `photo-filters/`, in the website's repository, and will be published at https://danielyoonwrites.github.io/photo-filters, not listed in search engines (Dan's "a," November 2, 2026; not live yet). Tested in Chrome on the phone and Safari on the MacBook (Dan's "b"). Dan's working rules are in `CLAUDE.md`; where things stand is in `PROGRESS.md`, and each decision with its reason in `DECISIONS.md`.

## What this is

A small app that runs in my phone's web browser (Samsung Galaxy S26 Ultra) and on my MacBook. It puts my own "looks" on photos I take with the phone's regular camera, so they look natural and a little soft instead of over-processed. Later it may get a simple camera and a way to use the looks on video.

Why I want it:
- My phone's camera sharpens and processes photos heavily in Auto mode.
- Samsung removed filters from the camera's Video mode in recent updates.
- I want a few consistent looks that I control.

## How I make decisions

I judge looks by seeing them, not from descriptions. So:
- Always show the same photo in several looks side by side.
- Let me press and hold a photo to see the original.
- Use plain-word labels.
- Don't ask me to picture something. Show it to me.

## Rules for every phase

- **Private:** photos never leave my device. No uploads, accounts, analytics, ads or third-party scripts that send data anywhere.
- **Free:** no paid services. If anything might cost money (hosting, libraries, APIs), tell me and ask first.
- **Phone first:** design for a phone screen, with big tap targets and one-handed use.
- **Exports:** full-resolution JPEG, correct rotation, no location (GPS) data.
- **No personal photos in git:** keep test photos in a folder listed in `.gitignore`. For tests that live in the repo, use a public sample image.
  - In this public repository (November 2, 2026): `test-photos/` is listed in this folder's `.gitignore`, and the saved checks draw made-up test pictures, which the screenshots use too.

## Phase 1: looks for photos I already took (build this first)

### What I do in the app

1. Open the app and tap **Choose photo**. Pick a photo from my phone.
2. See a grid: the original plus the five looks below, all on the same photo.
3. Tap a tile to see it big. Press and hold to see the original.
4. Use sliders to adjust the look (see "The looks"). Changes show right away.
5. Tap **Save as my look** and give it a name. Saved looks stay after I close the app.
6. Tap **Export** to save a full-resolution JPEG to my phone. Also offer **Share**, which opens the phone's share sheet, if the browser supports sharing files.
7. **Make a look from a photo:** I pick a reference photo whose look I like, such as an iPhone photo or a café photo. The app makes a look that copies its color and brightness. Use the color transfer method from Reinhard et al., "Color Transfer between Images" (IEEE Computer Graphics and Applications, 2001). Convert both photos to the lαβ color space the paper uses, then match the mean and standard deviation of each channel. Add a strength slider from 0 to 100%, and let me save the result like any other look.

### Milestones (one per session is fine)

1. **First win:** on the MacBook, choose a photo and see it in the Warm natural look next to the original. Export it.
   - Its four steps are in "Build plan for Milestone 1" below, each tested on the phone too.
2. Open the app on my phone over the same Wi-Fi. Show the 6-tile grid.
   - November 2, 2026: the same Wi-Fi isn't needed. The app is on GitHub Pages from the first merge, so it opens on the phone anywhere.
3. Sliders and saving my own looks.
4. Make a look from a reference photo.
5. Put it online on a free host so it opens on my phone anywhere. Make it installable to the home screen and able to work offline.
   - November 2, 2026: GitHub Pages puts it online from the first merge, so this milestone is the home screen and offline parts.

### How I'll test it on my phone

- A 12 MP photo from my phone shows the 6-tile grid within about 3 seconds.
- Moving a slider updates the big preview within about a quarter of a second.
- Exporting a 12 MP photo finishes within about 10 seconds. The file opens in Gallery at full size and right side up.
- Gallery > Details on the exported file shows no location.
- My saved looks are still there after I close and reopen the app.

## Phase 1b: camera recipes screen

A simple checklist screen with the phone settings for each look (content is under "Camera recipes" below). I tap items to check them off, and the checks are remembered. This screen can be built any time, since it's easy.

## Phase 2: camera (an experiment)

- Live camera preview with the chosen look applied. Use the back camera by default and allow switching to the front camera.
- Take a photo with the look applied and keep an unedited copy too.
- Record a short clip (up to 60 seconds) with the look applied.
- Show on screen the actual resolution and frame rate the browser gives. Browser cameras may not match the phone's own camera.
- **Comparison test:** shoot the same scene two ways and show the results side by side so I can pick.
  - The phone's own camera, with the look added afterward in Phase 1.
  - This app's camera.

Check these before building, and don't assume:
- **Secure page:** browsers allow the camera only on secure (https) pages. Opening the dev server from the MacBook's local address on my phone won't allow the camera. Plan for this.
  - November 2, 2026: the app is on GitHub Pages, an https address, with no dev server on the MacBook. Still check the camera itself before building.
- **Photo and video resolution:** what the browser gives on my phone.
- **Full-resolution photos:** whether `ImageCapture.takePhoto()` works.
- **Video formats:** which ones `MediaRecorder` can record. Prefer MP4 for Instagram.

## Phase 3: looks on video (later)

Note (November 2, 2026): the Video editor (`video-editor/`, a separate app in this repository, started the same day) already puts simple filters on videos. Look at it before planning this phase.

- **Option A:** apply a look to a short clip inside the app (60 seconds or less, 1080p) and export MP4. Expect this to be slow, so test it.
- **Option B:** export a look's color steps as a `.cube` 3D LUT (33-point) so video editors can use it.
  - Only the color steps can go in a LUT: exposure, temperature, tint, contrast, saturation, fade, split tone and color transfer.
  - Softness, glow and grain can't go in a LUT.
  - Before building this, check which of the editors I use can load `.cube` files.

## The looks

### Processing order

1. Exposure (in linear light)
2. Temperature and tint
3. Contrast
4. Saturation
5. Fade
6. Split tone
7. Softness
8. Glow
9. Grain

### Definitions

Values are 0 to 1 in sRGB unless noted. L = luminance = 0.2126R + 0.7152G + 0.0722B.

- **Exposure (EV):** convert sRGB to linear, multiply by 2^EV, convert back. Slider: −2 to +2.
- **Temperature t:** R × (1 + t), G × (1 + t/4), B × (1 − t). Slider: −0.20 to +0.20.
- **Tint k** (positive = pink/magenta): R × (1 + k), G × (1 − k), B × (1 + 0.8k). Slider: −0.10 to +0.10.
- **Contrast c:** (x − 0.5) × (1 + c) + 0.5. Slider: −0.5 to +0.5.
- **Saturation s:** x = L + (x − L) × s. Slider: 0 to 2, where 1 means unchanged.
- **Fade:** x = lift + x × (1 − lift − roll). Lift raises the blacks (0 to 0.15); roll lowers the whites (0 to 0.15).
- **Split tone:** x += (1 − L) × shadowColor + L × highlightColor, using small RGB offsets of about ±0.03.
- **Softness** (like Samsung's Picture softening): x = x × (1 − a) + blur × a, where blur is a Gaussian blur. Amount a: 0 to 1. Blur radius = r × image width (r is about 0.002).
- **Glow** (like a black mist lens filter):
  1. Keep only pixels brighter than a luminance threshold.
  2. Blur them (radius = r × image width).
  3. Warm them: R × (1 + w), B × (1 − w).
  4. Screen-blend the result onto the image at the given strength.
- **Grain:** add one-color Gaussian noise with standard deviation = amount. Blur the noise slightly so each grain is about 1–2 pixels on a 4,000-pixel-wide photo. It should look similar in preview and export.

Scale every radius and the grain size with image width so the preview matches the export. For big blurs like glow, blur a smaller copy and scale it back up. It's much faster and looks the same.

### Starting values

These were tuned by eye on a sample photo. I'll adjust them on my own photos.

| Look | Starting values | What it's going for |
|---|---|---|
| Clean natural | softness 0.15 (r 0.002) | Close to what was there |
| Warm natural (iPhone-ish) | temperature +0.05, contrast +0.08, saturation 1.03, softness 0.35 (r 0.0022) | A little warmer, a touch more contrast, softer edges |
| Bright café (Korean-inspired) | exposure +0.5, contrast −0.20, saturation 0.82, tint +0.018, fade lift 0.04, softness 0.45 (r 0.0027), glow 0.18 (threshold 0.6, r 0.023) | Brighter, lower contrast, softer, a little pink |
| Y2K film (Korean-inspired) | saturation 0.76, contrast −0.06, fade lift 0.06 and roll 0.04, split tone shadows (−0.015, +0.005, +0.03) and highlights (+0.03, +0.012, −0.025), softness 0.30 (r 0.0023), glow 0.22 (threshold 0.6, r 0.02, warmth 0.05), grain 0.017 | Muted color, faded blacks, grain, hazy highlights |
| Soft glow | glow 0.70 (threshold 0.5, r 0.027, warmth 0.03), contrast −0.08, softness 0.15 (r 0.002) | Bright spots bloom and edges soften, like a mist lens filter |

Why these looks:
- In camera reviews from early 2026, iPhone 17 Pro photos came out warmer and higher in contrast than the S26 Ultra's.
- The Korean-inspired looks are a bright, soft café style that shows up in Korean editing presets, and the muted, grainy "Y2K digicam" look that young Koreans are seeking out (Korea JoongAng Daily, Aug 2026).

## Technical notes (check these, don't assume)

- **App type:** a static web app (PWA). Suggested stack: Vite and TypeScript; add React only if it helps.
  - Decided November 2, 2026 (Dan's OK on the Milestone 1 plan): plain HTML, CSS and JavaScript with no build tools, like the rest of this repository (its rule, kept November 2, 2026 in the root `DECISIONS.md`), so Dan can open and edit every file by hand.
- **Speed:** do the heavy image work on the GPU (WebGL2) or in a Web Worker so the screen doesn't freeze. Preview at about 1,080 pixels wide and export at full size.
  - Milestone 1 (Claude's choice in the plan): plain JavaScript in a Web Worker, timed against the goals in "How I'll test it on my phone"; WebGL2 only if that's too slow.
- **Photo sizes:** my phone saves about 12 MP by default and can also save 50 MP and 200 MP. Big photos may exceed what the browser can process in one piece. Find the limit, then either process in tiles or explain it plainly and offer a smaller export.
- **File formats:** handle JPEG first. My camera can save HEIF if that setting is on. If the browser can't open a file, say so in plain words.
- **HDR data:** exports are standard JPEGs. If an original has extra HDR brightness data, it won't carry over. Mention that on the export screen.
- **Rotation:** respect the photo's rotation info (EXIF).
- **Location data:** re-encoding drops EXIF data. Confirm that exports have no GPS data.
- **Saving looks:** store them in IndexedDB. Let me export and import my looks as a small JSON file as a backup.
- **Hosting:** pick a free static host and confirm it's free for my situation before setting it up. If the repo has to be public to host for free, double-check that it contains no personal photos.
  - Decided November 2, 2026: GitHub Pages, where the website already is. GitHub's help says Pages is available in public repositories with GitHub Free, and lists these limits: published sites up to 1 GB, a soft limit of 100 GB of traffic a month, and not for running an online business. (Read November 2, 2026 in GitHub's help source on GitHub, `data/reusables/gated-features/pages.md` and `content/pages/getting-started-with-github-pages/github-pages-limits.md` in github/docs, since docs.github.com is blocked in Claude's cloud sessions.) The repository is public, so it never holds personal photos.

### Checked so far (November 2, 2026)

- MDN's browser data (github.com/mdn/browser-compat-data): canvas `toBlob` with JPEG and a quality setting, Chrome 50 and Safari 11; `img.decode()`, Chrome 64 and Safari 11.1; the `download` attribute on links, Chrome 14 and Safari 10.1; `image-orientation: from-image`, Chrome 81 and Safari 13.1.
- In Chromium, Idea board's saved checks show that a photo with a rotation tag is drawn right side up, and that a JPEG saved again through a canvas has no location (`idea-board/tests/app-test.mjs`, section F).
- Seen only in search results (these sites are blocked in Claude's cloud sessions): WebKit bug 209849 (fixed April 2020) says Safari's canvas drawing applies a photo's rotation tag; Apple's Preview guide says Tools > Show Location Info is dimmed when a photo has no location; Samsung's Gallery help says to swipe up on a photo for its details, and a Samsung Members post lists location among them.
- Not checked yet: the biggest photo each browser can handle, and HEIF.

## The look of the app (November 2, 2026)

Claude's choices in the Milestone 1 plan, OK'd with it. Dan sees them in screenshots and can change them.

- Plain, neutral dark gray around the photos, so the background doesn't change how their colors look. The device's own fonts, so the page loads nothing from other sites.
- Like Idea board: a Content-Security-Policy at the top of the page, so it uses only its own files and can't connect to other sites, and `noindex`, so search engines don't list it.

## Camera recipes (content for Phase 1b)

Checked Nov 2, 2026 for the Galaxy S26 Ultra. These are One UI 8.5 menu names. One UI 9 reached US S26 phones starting Sept 23, 2026, so some names may have moved.

### Base settings (all looks)

- **Screen:** Settings > Display > Screen mode > Natural. Turn off Privacy Display and Eye comfort shield while judging color.
- **Scene optimizer:** Camera > Settings > Intelligent features > Photo enhancer > Scene optimizer: Off.
- **Softening:** Camera Assistant (from the Galaxy Store) > Picture softening: Medium.
- **Zoom:** shoot at 1x. Move closer instead of zooming to 2x or 3x.
- **No-HDR photos:** use Pro mode.
- **Video:**
  - Settings > Videos > Video format: HDR videos off, High bitrate on, High efficiency on.
  - Auto FPS off.
  - Back camera, 4K at 30fps.
- **Instagram:** Settings > Data usage and media quality: Upload at highest quality on, Data saver off.

### Per look

1. **Clean natural:** base settings only, no filter.
2. **Warm natural:** Photo-mode filter a little warmer, contrast up a notch. Selfie Color tone: Warm. For video: Log with the Romance LUT.
3. **Bright café:** exposure +0.3 to +0.7, filter contrast and saturation down, Picture softening Medium. For video: Log with the Coming-of-age LUT.
4. **Y2K film:** filter saturation down, contrast slightly down, film grain up, a little warmer. Flash on at night.
5. **Soft glow:** black mist lens filter, 1/8 for subtle or 1/4 for more glow.

### Video note

Filters were removed from Video mode in One UI 8.5 and the One UI 9 beta. To use Log with a LUT:
1. Camera > Settings > Video format > Log, then choose "Video and Pro video."
2. Tap Log > LUT in the viewfinder to preview a look.
3. Apply it later in Gallery > Edit > Apply LUT.

## Build plan for Milestone 1 (one pull request each, each with a check on the phone and the MacBook)

Dan's "ok," November 2, 2026. Each later milestone gets its own short plan first (`CLAUDE.md`, "Plan first").

1. This plan: this spec, `CLAUDE.md`, `PROGRESS.md` and `DECISIONS.md`, with Dan's answers below. Check: read "Questions to ask Dan first." (Pull request 114, merged November 2, 2026.)
2. Choose a photo and see it right side up, with its size in pixels; a plain message if a photo can't be opened. Check, on the phone (Chrome) and the MacBook (Safari): choose a tall photo; it shows right side up, with its size. (Built November 2, 2026, pull request 115, with the first saved checks and a made-up tall test photo for the MacBook, `tests/test-photos.html`, which also carries a made-up location for step 4.)
3. Warm natural next to the original, labeled "Original" and "Warm natural." Check: both appear within a few seconds, and Warm natural looks right to Dan. The saved checks test the math against "The looks."
4. Export: a full-size JPEG of the Warm natural version, with a line showing its size and how long it took, and the HDR note ("Technical notes"). Check on the MacBook: the export opens in Preview right side up and the same size as the original, and Tools > Show Location Info is dimmed (it works on the original; the made-up test photo from step 2 has a location). Check on the phone: under about 10 seconds for a 12 MP photo, right side up in Gallery, and swiping up shows a location on the original but not on the export.

Then Milestone 1 is done, and Claude says so.

## Questions to ask Dan first

1. What should the app be called?
   - Answered November 2, 2026: "call it Photo Filters" (Claude had recommended keeping "Photo Looks").
2. The plan is to start as a web app in the phone's browser. OK, or would you rather build a native Android app? A native app gets more camera control but is much harder to set up.
   - Answered November 2, 2026: a web app in the browser, settled by Dan's "a" (build it in the website's repository); his Notion summary of this spec lists the same choice. A native app stays an option if Phase 2's camera needs it.
3. Which browser do you use on your phone: Chrome or Samsung Internet?
   - Answered November 2, 2026: Chrome on the phone, and Safari on the MacBook (Dan's "b"; Claude added the MacBook, since Milestone 1 is tested there).
4. Where are you running Claude Code (Mac terminal, desktop app or web)? Do you want the project on GitHub?
   - Answered November 2, 2026: Claude Code on the web, with the project on GitHub in this repository's `photo-filters/` folder (Dan's "a"; turned down: a folder on the MacBook with Claude Code in Terminal).
5. Any looks you want to add or drop?
   - Answered November 2, 2026: keep all five for now, and decide after seeing them side by side in Milestone 2 (Dan's "a").

## Not for now

Accounts, cloud sync, posting straight to Instagram, AI face editing, and beauty filters that reshape faces.
