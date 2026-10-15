# Release Notes — v2.4.0

## What's New
- 🧠 **Smart Review** — a spaced-repetition study queue built on your Weak Topics. Missed questions are scheduled (1 day → 3 → 7 → 15), and Home shows a "Smart Review" card whenever questions are due today. Answer correctly to level up the interval; miss it and it resets. Turn forgetting into daily short reviews.
- 🔥 **Streak Freeze (restore via rewarded ad)** — if you miss a study day, your streak is automatically snapshot. Watch a short rewarded ad on your Profile to bring back your streak (up to 3 freezes).
- 🎯 **Rewarded ads reliability fix** — rewarded ads are now **preloaded in the background** at app launch and kept warm, so "Watch Ad" plays instantly instead of failing to load on the spot. Also auto-reloads a fresh ad after each watch.

## Technical
- Version 2.4.0 · version code 61 · build number 61
- New `src/lib/spacedRepetition.ts` (SM-2-lite scheduler), `preloadRewardedAd()` in `src/lib/ads.ts`, streak freeze in `src/lib/streak.ts`
- Smart Review integrated into `examStore.submitExam`, Home screen & Profile

---

# Release Notes — v2.3.7

## What's New
- 📱 **Removed the portrait-only orientation lock** — the app now supports large screens, foldables & tablets (Android 16 ready). Layouts remain responsive in both orientations.

## Technical
- Version 2.3.7 · version code 60 · build number 60
- `app.json`: removed `"orientation": "portrait"` (clears the Play Console "resizability/orientation restrictions" recommendation)

---

# Release Notes — v2.3.6

## What's New
- 🔒 **Privacy Policy rewritten for the guest-only app** — the policy now accurately states there are no accounts, all study data stays on-device, and advertising (AdMob/Start.io) is disclosed. Live at `https://mtcorestudio.github.io/nurse-prep-pages/privacy-policy.html`
- 📋 Data Deletion page updated to match (local data only — no server-side account deletion needed)

## Technical
- Version 2.3.6 · version code 59 · build number 59
- App bundle is code 58 (guest-only removal) + updated privacy link pages (no app code change needed for the policy, but shipped together in this release)

---

# Release Notes — v2.3.5

## What's New
- 🚫 **Removed all login & sign-up** — the app is now fully guest-only
  - No Sign In / Create Account screens (login, register, forgot-password, reset-password & edit-profile screens removed)
  - Profile & Settings no longer show sign-in prompts or Sign Out buttons
  - All progress (streaks, results, bookmarks, XP/badges, settings) is stored locally on the device
- 🔒 Removed Firebase Auth config/code paths (no account data collected or transmitted)

## Technical
- Version 2.3.5 · version code 58 · build number 58
- Removed `app/auth/*`, `app/edit-profile.tsx`, `app/reset-password.tsx`, `src/lib/recovery.ts`, `src/lib/firebase.ts`
- `authStore` now guest-only (`isGuest: true`, `user: null`); SDK Firebase Auth code removed
- Supabase question/content + local progress storage untouched

---

# Release Notes — v2.3.4

## What's New
- 🌐 New "Community & Developer" section in the app — tap to open the app's Facebook page and the MT Core Studio developer page on Google Play

## Technical
- Version 2.3.4 · version code 57 · build number 57

---

# Release Notes — v2.3.3

## What's New
- 🎯 **Start.io AdMob mediation fallback** — when AdMob has no fill, Start.io ads automatically show (banner, interstitial & rewarded)
- 📄 app-ads.txt updated with Start.io DIRECT + reseller entries

## Technical
- Version 2.3.3 · version code 56 · build number 56
- Native: `io.start:admob-mediation:3.1.1` via config plugin `plugins/withStartioAdmob.js`

---
# Release Notes — v2.3.2

## What's New
- 🔧 Compliance + AD_ID hotfix build — fresh version code **52** (code 50/51 already used in Play Store)
- ✅ All official source links use direct HTTPS (DGNM `https://dgnm.gov.bd`, BPSC `https://bpsc.gov.bd`, MOHFW `https://mohfw.gov.bd`)
- ✅ `com.google.android.gms.permission.AD_ID` permission present in manifest (verified in AAB)
- ✅ Non-government disclaimer in-app (About → Important Disclaimer) and in Play listing

## Technical
- Version 2.3.0 (build 52) · version code 52 · build number 52 · compliance hotfix build

---

# Release Notes — v2.3.1

## What's New
- 🔧 Compliance hotfix: fixed the Bangladesh Public Service Commission source link (now `https://bpsc.gov.bd` — valid HTTPS, loads directly) to resolve the Play Store "Misleading Claims · Broken or Inaccessible Source Link" rejection
- ✅ All official source links in-app now use direct HTTPS URLs (DGNM `https://dgnm.gov.bd`, BPSC `https://bpsc.gov.bd`, MOHFW `https://mohfw.gov.bd`)
- ✅ Non-government disclaimer already shown in-app (About → Important Disclaimer) and in the Play listing

## Technical
- Version 2.3.0 (build 51) · version code 51 · build number 51 · compliance hotfix build

---

# Release Notes — v2.3.1

## What's New
- 🛡️ Compliance update: new in-app Disclaimer & Sources page (independent-app disclaimer, government information notice, verified official sources, privacy policy link)
- ✉️ Support/contact email updated to mtcorestudio@gmail.com
- 🔗 Updated privacy & data-deletion links to the live developer site

## Technical
- Version 2.3.1 · version code 54 · build number 54

---

# Release Notes — v2.3.0

## What's New
- 🎱 Rewarded ads: watch an ad to re-quiz the questions you missed right after an exam
- 🚀 Fresh production build

## Technical
- Version 2.3.0 · version code 50 · build number 50

---

# Release Notes — v2.2.0

## What's New
- 🚀 Fresh production build (version code 40)

## Technical
- Version 2.2.0 · version code 40 · build number 40

---

# Release Notes — v2.1.0

## What's New
- 🚀 Fresh release build (version code 30)

## Technical
- Version 2.1.0 · version code 30 · build number 30

---

# Release Notes — v2.0.0

## What's New
- 🚀 Major release update (fresh version code 20 for Play Store)
- All prior features retained: readiness gauge, XP/levels/badges, daily streak reminders, Weak Topics, flashcards, AdMob ads, R8 optimization

## Technical
- Version 2.0.0 · version code 20 · build number 20

---

# Release Notes — v1.9.4

## What's New
- 🔧 New build version for the Play Store release (R8-optimized, includes AD_ID permission + deobfuscation)

## Technical
- Version 1.9.4 · version code 15 · build number 15

---

# Release Notes — v1.9.2

## What's New
- 🔧 New version code for the Play Store release (R8 build with deobfuscation support)

## Technical
- Version 1.9.2 · version code 13 · build number 13

---

# Release Notes — v1.9.1

## What's New
- 🔧 Enables R8/ProGuard minification for smaller, safer release builds
- 🧩 Deobfuscation (mapping) file now generated for Play Console crash analysis

## Technical
- Version 1.9.1 · version code 12 · build number 12

---

# Release Notes — v1.9.0

## What's New
- 📣 Stable release update — performance & reliability improvements
- 🎯 Improved exam flow, readiness gauge & gamification polish

## Technical
- Version 1.9.0 · version code 11 · build number 11

---

# Release Notes â€” v1.8.0

## What's New
- ðŸŽ¯ Predicted Exam Readiness gauge on Home & Analytics
- ðŸ† XP, levels & badges with category leaderboards
- ðŸ”¥ Daily streak reminders â€” â€œtake your 20 questionsâ€
- âœ… Weak Topics auto-clear on mastery
- ðŸ… Badge celebrations on results
- ðŸ“£ Production AdMob ads enabled

## Technical
- Version 1.8.0 Â· version code 10 Â· build number 10

---

# Release Notes â€” v1.7.0

## What's New
- ðŸŽ¯ **Rewarded Ads** â€” watch a short ad to unlock a **hint** in practice mode (earns more than banners/interstitials)
- ðŸ“‰ **Weak Topics (wrong-answer bank)** â€” missed questions are auto-collected; re-quiz them until you master them
- ðŸƒ **Flashcards mode** â€” turn your bookmarked questions into swipe-style flashcards
- ðŸ”¥ **Daily Streak / Best Streak / Today's Quiz** â€” now refresh live on your Profile (fixed)
- ðŸ› Fixed category MCQs loading (real Supabase chapters + accurate totals)

## Technical
- Version 1.7.0 Â· version code 8 Â· build number 8

