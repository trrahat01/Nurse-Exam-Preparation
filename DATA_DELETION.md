# User Data Deletion — Nurse Exam Preparation

This document explains how users can delete their personal data and account, and how the app/administrators process deletion requests. This satisfies app store data-safety requirements and user privacy rights.

## Ways to Request Data Deletion

### Option 1 — Delete directly in the App (recommended)
1. Open the App and sign in to your account.
2. Go to **Profile** → **Settings**.
3. Scroll to the bottom and tap **Delete Account / Delete My Data**.
4. Confirm your choice.

This permanently removes your:
- Account / authentication record
- Email and profile information
- Exam & practice results
- Question history (seen questions)
- Bookmarks
- Wrong-answer records
- Daily practice and study streak data
- Performance analytics

**This action is permanent and cannot be undone.**

### Option 2 — Submit a Request by Email
If you cannot use the in-app option, email us at **trdevworks@gmail.com** with the subject **"Data Deletion Request"** and include the email address registered to your account. We will process your request and confirm deletion — typically within 30 days.

## What Gets Deleted
All records tied to your user ID across the following backend tables are removed:
- `user_profiles`
- `mock_results`
- `user_answers`
- `question_exposures`
- `bookmarks`
- `wrong_answers`
- `daily_practice`
- `study_streaks`
- `notifications`
- `user_performance`
- The authenticated account itself

## Guest / Local-Only Data
If you use the app as a **guest** (not signed in), your results and bookmarks are stored **only on your device**. To delete this data:
1. Open the App.
2. Go to **Profile** → **Settings**.
3. Tap **Clear Local Data / Reset** (or uninstall the app).

No server-side deletion is needed because guest data never leaves your device.

## Contact
For any questions or deletion requests:
- **Email:** trdevworks@gmail.com
- **Response time:** typically within 30 days

&copy; 2026 Nurse Exam Preparation. All rights reserved.
