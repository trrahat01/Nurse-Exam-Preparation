$content = @'
# Privacy Policy — Nurse Exam Preparation

**Last updated:** August 2026

This Privacy Policy describes how **Nurse Exam Preparation** ("we", "our", "the App") collects, uses, stores, and protects your information, and explains your rights over your personal data. By using the App you agree to the practices described in this policy.

## 1. Information We Collect

### 1.1 Account Information
When you create an account we collect:
- **Email address**
- **Display name** (you provide)
- A **hashed password** (never stored in plain text; handled by our authentication provider)

### 1.2 Usage & Performance Data
To power your study experience we store data you generate while using the app:
- **Practice & Mock Exam Results** (scores, correct/wrong answers, time taken, pass/fail)
- **Question history / exposures** (which questions you have already seen)
- **Bookmarked questions**
- **Wrong-answer records**
- **Daily practice and study streak statistics**
- **Performance analytics** (per-subject accuracy)

### 1.3 Device & Technical Data
We may collect non-personal technical information (such as device type and app version) to keep the app working reliably and to fix bugs. This data cannot identify you personally.

## 2. How We Use Your Information
We use your information to:
- Provide, maintain, and improve the App and its features.
- Track your learning progress and generate analytics/reports.
- Sync bookmarks, results, and history across your devices.
- Respond to your requests (e.g., password reset, support).
- Ensure the security and integrity of the App.

We **do not** sell your personal information to anyone.

## 3. How We Store & Protect Your Data
- Your data is stored securely on **Supabase** (our backend/database provider) in protected cloud infrastructure.
- Passwords are hashed and never stored in readable form.
- Access to your data is restricted by per-user permission rules (Row Level Security), so only you can read or modify your own records.
- We use encryption in transit (HTTPS) for data sent between your device and our servers.

> **Guest mode:** If you use the app as a guest without signing in, your progress (results, seen questions, bookmarks) is stored **only on your device** and is not uploaded to our servers.

## 4. Data Retention
We retain your data for as long as your account is active and you continue to use the App. If you request deletion, we delete your records as described in Section 5.

## 5. Your Rights & Data Deletion
You have the right to:
- **Access** the personal data we hold about you.
- **Correct** inaccurate information.
- **Delete** your account and all associated data.

### How to delete your data / account
- **In the App:** Go to **Profile → Settings → Delete Account / Delete My Data**, then confirm. This permanently removes your account, results, bookmarks, history, and all related records from our servers.
- **By request:** Email us at **trdevworks@gmail.com** and we will process your deletion request within a reasonable time (typically within 30 days).

Once deleted, your data **cannot be recovered**.

## 6. Third-Party Services
The App relies on the following third-party providers:
| Service | Purpose |
|---------|---------|
| **Supabase** | Authentication, database storage, backend services |
| **Expo** | App build & distribution tooling |

These providers process data only to the extent needed to provide their services and have their own privacy policies.

## 7. Children's Privacy
The App is intended for adult learners and is not directed at children under the age of 13. We do not knowingly collect personal information from children.

## 8. Changes to This Policy
We may update this Privacy Policy from time to time. We will note the "Last updated" date at the top of this page. Continued use of the App after changes constitutes acceptance of the updated policy.

## 9. Contact Us
If you have questions about this Privacy Policy or wish to request deletion of your data, contact us at:

- **Email:** trdevworks@gmail.com

&copy; 2026 Nurse Exam Preparation. All rights reserved.
'@
Set-Content -Path 'PRIVACY_POLICY.md' -Value $content -Encoding UTF8
Write-Output 'PRIVACY_POLICY.md created'
