# Google Play Console - Data Safety Form Guide

## App: Nurse Exam Preparation
## Package: com.nurseexampreparation.nursing

---

## STEP 1: Data collection and security

### Question: Does your app collect or share any of the required user data types?

**Answer: YES**

The app collects:
- **Email address** - Required for account creation and login
- **Name** - Collected during account registration (full_name)
- **App usage data** - Exam results, practice history, bookmarks stored locally

---

### Question: Is all of the user data collected by your app encrypted in transit?

**Answer: YES**

All data is transmitted over HTTPS (TLS 1.2+) via Supabase's secure API endpoints.

---

### Question: Which of the following methods of account creation does your app support?

**Answer: Select "Username and password"**

The app uses email + password authentication through Supabase Auth.

**IMPORTANT:** Also note that the app has a **Guest Mode** - users can use the app without creating an account. This is important to mention in the form.

---

## STEP 2: Data types

### Personal Info
| Data Type | Collected? | Shared? | Required? |
|---|---|---|---|
| Name | YES | NO | YES (for account) |
| Email address | YES | NO | YES (for account) |
| User IDs | YES | NO | YES (for account) |
| Phone number | NO | NO | NO |
| Physical address | NO | NO | NO |
| Other personal info | NO | NO | NO |

### Financial Info
| Data Type | Collected? | Shared? |
|---|---|---|
| Credit card | NO | NO |
| Debit card | NO | NO |
| Bank account | NO | NO |
| Payment history | NO | NO |
| Other financial info | NO | NO |

### Health and Fitness
| Data Type | Collected? | Shared? |
|---|---|---|
| Health info | NO | NO |
| Fitness info | NO | NO |

### Messages
| Data Type | Collected? | Shared? |
|---|---|---|
| Emails | NO | NO |
| SMS | NO | NO |
| Other messages | NO | NO |

### Photos and Videos
| Data Type | Collected? | Shared? |
|---|---|---|
| Photos | NO | NO |
| Videos | NO | NO |

### Audio Files
| Data Type | Collected? | Shared? |
|---|---|---|
| Voice recordings | NO | NO |
| Music files | NO | NO |
| Other audio files | NO | NO |

### Files and Docs
| Data Type | Collected? | Shared? |
|---|---|---|
| Files and docs | NO | NO |

### Calendar
| Data Type | Collected? | Shared? |
|---|---|---|
| Calendar events | NO | NO |

### Contacts
| Data Type | Collected? | Shared? |
|---|---|---|
| Contacts | NO | NO |

### App Activity
| Data Type | Collected? | Shared? |
|---|---|---|
| App interactions | YES | NO |
| In-app search history | NO | NO |
| Installed apps | NO | NO |
| User-generated content | YES (bookmarks, exam results) | NO |
| Other actions | NO | NO |

### Web Browsing
| Data Type | Collected? | Shared? |
|---|---|---|
| Web browsing history | NO | NO |

### App Info and Performance
| Data Type | Collected? | Shared? |
|---|---|---|
| Crash logs | NO | NO |
| Diagnostics | NO | NO |
| Other app performance data | NO | NO |

### Device or Other IDs
| Data Type | Collected? | Shared? |
|---|---|---|
| Device or other IDs | NO | NO |

---

## STEP 3: Data usage and handling

### Is this data collected, shared, or both?
- **Collected but NOT shared** - All data stays within the app

### Is this data processed ephemerally?
- **NO** - Data is stored persistently

### Data usage purposes:
- **App functionality** - Account creation, login, saving exam results
- **Personalization** - Track progress and performance
- **Account management** - User authentication

### Data retention:
- Data is kept until user deletes their account
- Users can request deletion by emailing trdevworks@gmail.com

---

## STEP 4: Preview

### Summary of answers:

1. **Does your app collect or share any of the required user data types?**
   → **YES**

2. **Is all of the user data collected by your app encrypted in transit?**
   → **YES**

3. **Which of the following methods of account creation does your app support?**
   → **Username and password** (email + password)

4. **Data types collected:**
   - Name (Personal Info)
   - Email address (Personal Info)
   - User IDs (Personal Info)
   - App interactions (App Activity)
   - User-generated content (App Activity)

5. **Data shared with third parties:**
   → **NO** - No data is shared

6. **Data usage:**
   - App functionality
   - Personalization
   - Account management

7. **Data retention:**
   - Data kept until account deletion
   - Deletion available via email request

---

## Additional Notes for the Form

### Guest Mode
The app supports **Guest Mode** - users can use all features without creating an account. This means:
- Users who don't create an account have NO personal data collected
- Guest data (bookmarks, exam results) is stored locally on the device only

### Account Deletion
Users can delete their account by:
1. Emailing trdevworks@gmail.com with their account email
2. Data will be permanently deleted within 30 days

### Security
- All data encrypted in transit (HTTPS/TLS)
- Passwords stored securely using Supabase Auth (bcrypt hashing)
- No data shared with third parties
- No advertising SDKs
- No analytics SDKs

---

## Quick Copy-Paste Answers

### For the form:

**Q: Does your app collect or share any of the required user data types?**
A: Yes

**Q: Is all of the user data collected by your app encrypted in transit?**
A: Yes

**Q: Which of the following methods of account creation does your app support?**
A: Username and password

**Q: What data types does your app collect?**
A: 
- Name (Personal Info) - Collected, Not Shared
- Email address (Personal Info) - Collected, Not Shared
- User IDs (Personal Info) - Collected, Not Shared
- App interactions (App Activity) - Collected, Not Shared
- User-generated content (App Activity) - Collected, Not Shared

**Q: Is this data processed ephemerally?**
A: No

**Q: What is the data used for?**
A: 
- App functionality
- Personalization
- Account management

**Q: Do you allow users to request data deletion?**
A: Yes - via email to trdevworks@gmail.com