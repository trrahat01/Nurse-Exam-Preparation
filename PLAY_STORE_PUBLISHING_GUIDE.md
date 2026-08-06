# 📱 Nurse Exam Preparation - Google Play Store Publishing Guide

## App Overview
- **App Name:** Nurse Exam Preparation
- **Package Name:** `com.nurseexampreparation.nursing`
- **Version:** 1.0.0
- **Support Email:** trdevworks@gmail.com

---

## Step 1: Prerequisites

### 1.1 Create a Google Play Developer Account
1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Go to Play Console"
3. Sign in with your Google account
4. Pay the one-time registration fee of **$25 USD**
5. Complete your developer profile:
   - Developer name
   - Contact email: `trdevworks@gmail.com`
   - Website (optional)
   - Phone number

### 1.2 Install Required Tools
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login
```

---

## Step 2: Build the App

### 2.1 Configure app.json (Already Done)
The app.json is already configured with:
- Package name: `com.nurseexampreparation.nursing`
- App name: "Nurse Exam Preparation"
- Icon and splash screen configured

### 2.2 Link EAS Project (Important - First Time Only)

If you get this error:
```
⚠️ Detected that your app uses Expo Go for development...
Project config: Slug for project identified by "extra.eas.projectId" (workspace) does not match the "slug" field (nurse-exam-preparation).
Error: build command failed.
```

This happens because the old `extra.eas.projectId` was removed from app.json. Run this to link the project correctly:

```bash
# Navigate to mobile directory
cd artifacts/mobile

# Login to Expo (if not already)
eas login

# Link the project to your Expo account
eas init

# Accept the automatically generated project ID
```

### 2.3 Build the AAB (Android App Bundle)
```bash
# Navigate to mobile directory
cd artifacts/mobile

# Build production AAB for Play Store
eas build --platform android --profile production
```

This will create an `.aab` file that you'll upload to Play Store.

### 2.4 Build APK (For Testing)
```bash
# Build APK for testing on your device
eas build --platform android --profile apk
```

### 2.5 Suppress Expo Go Warning (Optional)
If you see the Expo Go warning during build, you can suppress it:
```bash
EAS_BUILD_NO_EXPO_GO_WARNING=true eas build --platform android --profile production
```

---

## Step 3: Prepare Play Store Listing

### 3.1 App Details
- **App Name:** Nurse Exam Preparation
- **Short Description (80 chars):**
  > Master nursing exams with 40,000+ MCQs, mock tests & detailed analytics for nurses.
- **Full Description:** (Use the text from `play-store-metadata.txt`)

### 3.2 App Category
- **Category:** Education
- **Tags:** nursing exam, nurse mcq, nursing preparation, staff nurse, nursing questions, medical exam prep

### 3.3 Screenshots (Required)
Take 8 screenshots at **1080×1920px**:
1. Welcome/Onboarding screen
2. Home Screen with categories
3. Question with multiple choice options
4. Mock Exam timer in action
5. Quiz Results with score breakdown
6. Answer Review - showing mistakes & correct answer
7. Performance Analytics / Progress chart
8. Category selection for practice

### 3.4 App Icon
- **Icon:** 512×512px PNG (already in `assets/images/icon.png`)
- **Feature Graphic:** 1024×500px (create one for Play Store listing)

### 3.5 Privacy Policy
1. Go to [App Privacy Policy Generator](https://app-privacy-policy-generator.nisrulz.com/)
2. Enter your app name and email: `trdevworks@gmail.com`
3. Generate and host the policy (GitHub Pages or any free hosting)
4. Add the URL in Play Console

---

## Step 4: Upload to Play Console

### 4.1 Create App
1. In Play Console, click **"Create app"**
2. Enter app name: **Nurse Exam Preparation**
3. Select app type: **App**
4. Select category: **Education**
5. Accept the declaration

### 4.2 Set Up App
1. **App access:** All features available without login (guest mode available)
2. **Ads:** No ads
3. **Content rating:** Complete the questionnaire (Education app, no mature content)
4. **Target audience:** 18+ (or appropriate for your region)
5. **News app:** No
6. **Data safety:** Complete the form (user accounts, email, etc.)

### 4.3 Upload AAB
1. Go to **Production** → **Create new release**
2. Upload the `.aab` file from Step 2.3
3. Add release notes:
   ```
   Version 1.0.0
   - 40,000+ MCQs for all nursing exams
   - Full mock tests with timer
   - Performance analytics
   - Answer review with explanations
   - Smart question selection (no repeats)
   ```

---

## Step 5: Data Safety Form

Complete the Data Safety section:
- **Data collected:**
  - Email address (for account creation)
  - Name (for profile)
  - App usage data (for analytics)
- **Data shared:** No data shared with third parties
- **Security:** Data encrypted in transit (HTTPS)
- **Deletion:** Users can delete account by contacting trdevworks@gmail.com

---

## Step 6: Content Rating

Complete the content rating questionnaire:
- **Category:** Education
- **Violence:** None
- **Sexual content:** None
- **Profanity:** None
- **Alcohol/Tobacco/Drugs:** None
- **Rating:** Everyone (or appropriate)

---

## Step 7: Review & Publish

1. Complete all sections in Play Console
2. Click **"Review app"**
3. Submit for review
4. Google typically reviews within **2-7 days**
5. Once approved, your app goes live!

---

## Step 8: Post-Publishing

### 8.1 Monitor Performance
- Check Play Console for crashes and ANRs
- Monitor user reviews and ratings
- Track installs and uninstalls

### 8.2 Update Strategy
- Fix bugs reported by users
- Add new questions regularly
- Update version number in `app.json`
- Build new AAB and upload

### 8.3 Support
- Respond to user reviews
- Check `trdevworks@gmail.com` for user emails
- Address issues within 24-48 hours

---

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
cd artifacts/mobile
npx expo start --clear
eas build --platform android --profile production --clear-cache
```

### EAS Project ID Mismatch Error
```
Project config: Slug for project identified by "extra.eas.projectId" (workspace) does not match the "slug" field (nurse-exam-preparation).
```
**Fix:** Run `eas init` in the mobile directory to properly link the project to your Expo account.

### Package Name Conflict
- `com.nurseexampreparation.nursing` must be unique
- If taken, you'll need to change it in `app.json`

### Supabase Connection Issues
- Verify `.env` file has correct credentials
- Check Supabase project is active
- Ensure RLS policies allow public read for questions

### Expo Go Warning
```
⚠️ Detected that your app uses Expo Go for development...
```
**Fix:** This is just a warning. Set `EAS_BUILD_NO_EXPO_GO_WARNING=true` to suppress it.

---

## Important Notes

1. **Never share your Supabase service key** - only use the anon/publishable key
2. **Keep the package name consistent** - changing it later requires a new app listing
3. **Test thoroughly before publishing** - use the APK build for testing
4. **Keep the support email active** - `trdevworks@gmail.com`
5. **Update the app regularly** - Google favors active apps

---

## Quick Commands Reference

```bash
# Login to Expo
eas login

# Link EAS project (first time only)
cd artifacts/mobile
eas init

# Build production AAB
eas build --platform android --profile production

# Build test APK
eas build --platform android --profile apk

# Run typecheck
npx tsc --noEmit

# Start dev server
npx expo start
```

---

## Contact
For any questions about this guide or the app:
- **Email:** trdevworks@gmail.com