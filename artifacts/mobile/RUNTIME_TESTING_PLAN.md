# Runtime Testing Plan - Supabase Authentication

**Date:** November 12, 2026  
**Test Environment:** artifacts/mobile/ (No Docker)  
**Status:** Not Started - Local Supabase setup not initiated

---

## Table of Contents

1. [Test Environment Setup](#1-test-environment-setup)
2. [Authentication Flow Tests](#2-authentication-flow-tests)
3. [Security Tests](#3-security-tests)
4. [Edge Case Tests](#4-edge-case-tests)
5. [Test Execution Log](#5-test-execution-log)

---

## 1. Test Environment Setup

### 1.1 Current Environment Status

**Workspace:** `artifacts/mobile/`

- [x] Node.js available
- [ ] Docker not installed
- [ ] Supabase CLI not installed
- [ ] No existing Supabase local configuration directory
- [ ] No migration directory; current schema is a flat SQL file

### 1.2 Current Configuration

**Authentication Status:**
- [ ] Firebase Auth inactive
- [x] Supabase Auth is the only active authentication provider

### 1.3 Prerequisites for Testing

To execute runtime tests, the following will be required:

- [ ] Docker Desktop (version 20.10+) - **Not installed**
- [ ] Supabase CLI (`npm install -g supabase`) - **Not installed**
- [ ] Local Supabase setup - **Not started**

### 1.4 Current State

The runtime testing environment has **not been initiated**. The current setup includes:

- Configuration files with placeholder/test credentials
- Supabase integration configured as the sole authentication provider
- No local Supabase development environment

**Next Steps Required:** Docker and Supabase CLI installation followed by local Supabase setup.

### 1.5 Testing Status Summary

- [ ] All 14 runtime tests remain **NOT TESTED**
- [ ] Firebase Auth is **INACTIVE**
- [ ] Supabase Auth is the **ONLY active authentication provider**
- [ ] Local Supabase setup **HAS NOT STARTED**
---

## 2. Authentication Flow Tests

### Test 2.1: Guest Session Creation

**Objective:** Verify `continueAsGuest()` creates an anonymous session.

**Pre-conditions:**
- Supabase local instance running
- App configured with local Supabase URL
- No existing session

**Test Steps:**
1. Open the mobile app
2. Navigate to authentication screen
3. Tap "Continue as Guest"
4. Wait for authentication

**Expected Result:**
- [ ] Guest session created successfully
- [ ] User ID (UUID) generated
- [ ] Session persisted in AsyncStorage
- [ ] No error messages
- [ ] Navigated to main screen

**Actual Result:**
```
[Paste any error messages or observations]
```

---

### Test 2.2: Guest UUID Continuity

**Objective:** Verify UUID remains constant during email linking.

**Pre-conditions:**
- Guest session already exists
- User has a valid UUID

**Test Steps:**
1. Start with active guest session
2. Record current user UUID
3. Navigate to "Link Email" flow
4. Complete email/password setup
5. Check user UUID after linking

**Expected Result:**
- [ ] UUID before linking: `__________-__________-__________`
- [ ] UUID after linking: `__________-__________-__________`
- [ ] UUIDs are identical (continuity preserved)
- [ ] User data preserved

**Actual Result:**
```
UUID Before: ______________________
UUID After:  ______________________
Match: [ ] Yes [ ] No

[Notes about data loss or issues]
```

---

### Test 2.3: Email Registration

**Objective:** Verify `signUp()` creates a new user account.

**Pre-conditions:**
- No existing user with test email
- Supabase local instance running
- Inbucket email service available

**Test Steps:**
1. Navigate to registration screen
2. Enter valid email (e.g., `testuser@example.com`)
3. Enter strong password (min 6 characters)
4. Submit registration form
5. Check Inbucket at `http://localhost:54324`

**Expected Result:**
- [ ] User account created successfully
- [ ] Verification email sent to Inbucket
- [ ] Email contains verification link (no OTP code)
- [ ] User prompted to verify email
- [ ] No error messages

**Actual Result:**
```
[ ] Registration successful
[ ] Email received in Inbucket
[ ] Verification link present

[Error messages or issues]
```

---

### Test 2.4: Email Verification

**Objective:** Verify `verifyOtp()` completes verification via link (no manual OTP).

**Pre-conditions:**
- User registered with email
- Verification email sent
- Inbucket accessible

**Test Steps:**
1. Register new user (see Test 2.3)
2. Open Inbucket at `http://localhost:54324`
3. Find verification email
4. Click verification link
5. Note URL parameters (token/token_hash)
6. Verify app handles verification automatically

**Expected Result:**
- [ ] Email received in Inbucket
- [ ] Verification link works (redirects to app)
- [ ] App automatically verifies token
- [ ] User marked as email-verified
- [ ] Session updated with verified user
- [ ] No manual OTP code entry required

**Actual Result:**
```
[ ] Email received
[ ] Link clicked successfully
[ ] Auto-verification worked
[ ] User status updated

[Verification URL parameters:]
[Token/Token_hash extracted:]
```

---

### Test 2.5: Password Recovery

**Objective:** Verify `resetPassword()` and `updatePassword()` flows.

**Pre-conditions:**
- User has verified email account
- User knows current password

**Test Steps:**
1. Navigate to login screen
2. Tap "Forgot Password?"
3. Enter registered email address
4. Submit password reset request
5. Check Inbucket for reset email
6. Click reset link
7. Enter new password
8. Confirm new password
9. Log in with new password

**Expected Result:**
- [ ] Reset email sent to Inbucket
- [ ] Reset link redirects to app
- [ ] New password accepted
- [ ] User can log in with new password
- [ ] Old password no longer works
- [ ] Session created after password reset

**Actual Result:**
```
[ ] Reset email sent
[ ] Reset link works
[ ] Password updated successfully
[ ] Login with new password: [ ] Success [ ] Failed

[Error messages or observations]
```

---

### Test 2.6: Session Persistence

**Objective:** Verify sessions restored after app restart.

**Pre-conditions:**
- User logged in (guest or email)
- App will be closed/restarted

**Test Steps:**
1. Log in as user
2. Note session status
3. Close app completely
4. Reopen app
5. Check if session restored automatically

**Expected Result:**
- [ ] Session persisted in AsyncStorage
- [ ] App restores session on restart
- [ ] User automatically logged in
- [ ] No login screen shown
- [ ] User data accessible

**Actual Result:**
```
Session before restart: [ ] Active [ ] Expired
Session after restart:  [ ] Active [ ] Expired
Auto-login successful:  [ ] Yes [ ] No

[Notes about session restoration]
```

---

### Test 2.7: Sign Out

**Objective:** Verify `signOut()` clears session and user data.

**Pre-conditions:**
- User is logged in

**Test Steps:**
1. Navigate to profile/settings
2. Tap "Sign Out" button
3. Confirm sign out action
4. Check session status

**Expected Result:**
- [ ] Session cleared from AsyncStorage
- [ ] Navigated to login screen
- [ ] User cannot access protected routes
- [ ] No error messages
- [ ] App returns to unauthenticated state

**Actual Result:**
```
[ ] Sign out successful
[ ] Session cleared
[ ] Navigation to login screen

[Error messages or issues]
```

- [ ] API URL: `http://localhost:54321`
- [ ] Database: PostgreSQL on port 54322
- [ ] Studio: `http://localhost:54323`
---

## 3. Security Tests

### Test 3.1: RLS Enforcement

**Objective:** Verify Row Level Security prevents cross-user data access.

**Pre-conditions:**
- Two test users exist (User A and User B)
- Both users have created some data

**Test Steps:**
1. Log in as User A
2. Create user-specific data (e.g., wrong_answers)
3. Record user_id associated with data
4. Log out and log in as User B
5. Attempt to query User A's data directly
6. Verify RLS prevents access

**Expected Result:**
- [ ] User A can only access their own data
- [ ] User B cannot see User A's data
- [ ] Queries for other users' data return empty
- [ ] RLS policies enforced at database level
- [ ] No data leakage between users

**Actual Result:**
```
User A data visible to User B: [ ] Yes (FAIL) [ ] No (PASS)
RLS policy active: [ ] Yes [ ] No

[SQL queries and results:]
```

---

### Test 3.2: Recovery Expiration

**Objective:** Verify recovery authorization expires after 30 minutes.

**Pre-conditions:**
- User requested password reset
- Recovery link sent

**Test Steps:**
1. Request password reset
2. Note timestamp when reset requested
3. Wait 30+ minutes (or simulate)
4. Attempt to use recovery link
5. Try to reset password with expired authorization

**Expected Result:**
- [ ] Recovery link expires after 30 minutes
- [ ] Expired link shows error message
- [ ] User cannot reset password
- [ ] User prompted to request new reset

**Actual Result:**
```
Recovery request time: ________________
Link expiration time: ________________
Link tested at:        ________________

[ ] Link expired correctly
[ ] Error message displayed

[Error message text:]
```

---

### Test 3.3: Token Expiration

**Objective:** Verify JWT token expiration and automatic refresh.

**Pre-conditions:**
- User logged in
- JWT token has expiration (typically 1 hour)

**Test Steps:**
1. Log in as user
2. Note JWT token expiration time
3. Wait for token to expire (or simulate)
4. Attempt authenticated request
5. Verify automatic token refresh

**Expected Result:**
- [ ] JWT token has expiration timestamp
- [ ] App automatically refreshes token
- [ ] User remains logged in after refresh
- [ ] No error messages during refresh
- [ ] Session continues without interruption

**Actual Result:**
```
Token expiration:     ________________
Token refreshed:      [ ] Yes [ ] No
User session active:  [ ] Yes [ ] No

[Notes about token handling]
```

---

### Test 3.4: Error Handling

**Objective:** Verify proper error handling for various scenarios.

**Pre-conditions:**
- App configured with Supabase
- Network connectivity available

**Test Steps:**
1. **Network Error:** Disable internet and attempt login
2. **Invalid Credentials:** Enter wrong password
3. **Expired Session:** Wait for session expiry, access protected route
4. **Invalid Token:** Corrupt JWT token, make request

**Expected Result:**
- [ ] Network errors show user-friendly messages
- [ ] Invalid credentials show appropriate error
- [ ] Expired sessions redirect to login
- [ ] Invalid tokens trigger re-authentication
- [ ] No technical error messages exposed
- [ ] App recovers gracefully

**Actual Result:**
```
Network Error:
[ ] Handled correctly
[Error message:]

Invalid Credentials:
[ ] Handled correctly
[Error message:]

Expired Session:
[ ] Handled correctly
[Redirect to login:]

Invalid Token:
[ ] Handled correctly
[Recovery action:]
```
---

## 4. Edge Case Tests

### Test 4.1: Guest to Email Upgrade

**Objective:** Verify UUID continuity and data preservation when upgrading guest to email.

**Pre-conditions:**
- Active guest session
- User has created data as guest

**Test Steps:**
1. Start with guest session
2. Create user data (practice sessions, answers)
3. Record current user UUID
4. Navigate to "Create Account" flow
5. Complete email/password registration
6. Verify UUID remains the same
7. Check all previous data still accessible

**Expected Result:**
- [ ] UUID remains constant during upgrade
- [ ] All guest data preserved
- [ ] User email updated
- [ ] Password set
- [ ] Session updated to email user
- [ ] No data loss

**Actual Result:**
```
UUID before upgrade:     ________________
UUID after upgrade:      ________________
UUID match:              [ ] Yes [ ] No

Data preserved:
[ ] Practice sessions
[ ] Wrong answers
[ ] User performance
[ ] Other: ___________

[Data loss details:]
```

---

### Test 4.2: Password Reset with Expired Link

**Objective:** Verify proper handling of expired password reset links.

**Pre-conditions:**
- User requested password reset
- Reset link has expired (30+ minutes old)

**Test Steps:**
1. Request password reset
2. Wait for link to expire (30+ minutes)
3. Click expired reset link
4. Attempt to reset password
5. Verify error handling

**Expected Result:**
- [ ] Expired link shows clear error message
- [ ] User cannot reset password
- [ ] User prompted to request new reset link
- [ ] "Request New Link" button works
- [ ] No session is created

**Actual Result:**
```
[ ] Expired link detected
[ ] Error message displayed
[ ] New link request works

[Error message text:]
```

---

### Test 4.3: Concurrent Sessions

**Objective:** Verify behavior when multiple sessions are active.

**Pre-conditions:**
- User account exists
- Multiple devices/sessions available

**Test Steps:**
1. Log in on Device A
2. Log in on Device B
3. Perform actions on both simultaneously
4. Sign out on Device A
5. Verify session status on Device B

**Expected Result:**
- [ ] Multiple sessions are allowed
- [ ] Each session has independent JWT token
- [ ] Sign out on one device doesn't affect others
- [ ] User data syncs across devices
- [ ] No session conflicts

**Actual Result:**
```
Device A session: [ ] Active [ ] Terminated
Device B session: [ ] Active [ ] Terminated
Data sync: [ ] Working [ ] Not working

[Notes about concurrent session behavior]
```

---

### Test 4.4: Network Failure

**Objective:** Verify app behavior during network failures.

**Pre-conditions:**
- App running
- Network connectivity available initially

**Test Steps:**
1. Log in successfully
2. Enable airplane mode / disconnect internet
3. Attempt authenticated actions
4. Restore network connection
5. Verify app recovery

**Expected Result:**
- [ ] App detects network failure
- [ ] User sees offline message
- [ ] Actions fail gracefully
- [ ] App recovers when network restored
- [ ] Session remains valid
- [ ] Cached data accessible (if applicable)

**Actual Result:**
```
Network failure detected: [ ] Yes [ ] No
User notification: [ ] Shown [ ] Not shown

After network restoration:
[ ] App recovered
[ ] Session still valid
[ ] Actions work

[Error messages or issues:]
```
---

## 5. Test Execution Log

### Test Results Summary

| Test ID | Test Name | Status | Tester | Date | Notes |
|---------|-----------|--------|--------|------|-------|
| 2.1 | Guest Session Creation | ⏳ Pending | | | |
| 2.2 | Guest UUID Continuity | ⏳ Pending | | | |
| 2.3 | Email Registration | ⏳ Pending | | | |
| 2.4 | Email Verification | ⏳ Pending | | | |
| 2.5 | Password Recovery | ⏳ Pending | | | |
| 2.6 | Session Persistence | ⏳ Pending | | | |
| 2.7 | Sign Out | ⏳ Pending | | | |
| 3.1 | RLS Enforcement | ⏳ Pending | | | |
| 3.2 | Recovery Expiration | ⏳ Pending | | | |
| 3.3 | Token Expiration | ⏳ Pending | | | |
| 3.4 | Error Handling | ⏳ Pending | | | |
| 4.1 | Guest to Email Upgrade | ⏳ Pending | | | |
| 4.2 | Password Reset Expired Link | ⏳ Pending | | | |
| 4.3 | Concurrent Sessions | ⏳ Pending | | | |
| 4.4 | Network Failure | ⏳ Pending | | | |

### Bug Tracking

| Bug ID | Test ID | Severity | Description | Status | Assigned To |
|--------|---------|----------|-------------|--------|-------------|
| | | | | | |

---

## Appendix A: Test Data

### Test Users

```
Guest User: (created via anonymous sign-in)
Email User 1: testuser1@example.com / Password123!
Email User 2: testuser2@example.com / Password456!
```

### Test Email Addresses (Inbucket)

All emails captured by Inbucket at `http://localhost:54324`

---

## Appendix B: Quick Commands

```bash
# Start Supabase local
supabase start

# Stop Supabase local
supabase stop

# View logs
supabase logs

# Access database
supabase db connect

# Open Studio (web UI)
# Visit http://localhost:54323

# Check email (Inbucket)
# Visit http://localhost:54324
```

---

**Document Version:** 1.0  
**Last Updated:** November 12, 2026  
**Next Review:** After completing initial test execution
