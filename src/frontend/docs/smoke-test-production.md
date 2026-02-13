# Production Smoke Test Checklist

This document provides a step-by-step checklist for verifying core functionality after publishing to production.

## Prerequisites

- Production URL is accessible
- You have a test account with Internet Identity
- Browser developer tools are open (for error monitoring)

## Test Execution

### 1. Authentication Flow

**Test:** Internet Identity Login
- [ ] Navigate to production URL
- [ ] Click "Sign In" button
- [ ] Internet Identity authentication flow completes successfully
- [ ] App redirects to feed after successful login
- [ ] No console errors during authentication

**Expected Result:** User is authenticated and sees the main feed

**If Failed:** 
- Document error message from console
- Note the exact step where failure occurred
- Check if Internet Identity service is operational

---

### 2. Profile & Username

**Test:** User Profile Load
- [ ] After login, profile loads automatically
- [ ] Username is displayed in header or profile section
- [ ] No "set username" modal appears for existing users

**Expected Result:** Existing user profile loads without requiring re-setup

**If Failed:**
- Check if profile data exists in backend
- Verify principal ID matches expected account
- Document console errors

---

### 3. Feed Display

**Test:** Feed Page Load
- [ ] Feed page displays without errors
- [ ] Existing posts are visible
- [ ] Posts show correct author names
- [ ] Images load correctly (if posts have images)
- [ ] Like counts are displayed
- [ ] Comments are visible when expanded

**Expected Result:** All existing posts display correctly with proper formatting

**If Failed:**
- Note which posts fail to load (if specific)
- Check console for API errors
- Verify backend canister is responding

---

### 4. Weekly Poll Panel

**Test:** Poll Display in Feed
- [ ] Weekly poll panel appears at top of feed
- [ ] Panel displays appropriate state based on day:
  - **Monday-Thursday:** "Check back Friday" message
  - **Friday (before voting):** Voting interface with top 5 posts from current week
  - **Friday (after voting):** Confirmation message (not results)
  - **Saturday-Sunday:** Results display with vote counts and percentages
- [ ] No runtime errors when rendering poll
- [ ] Panel is responsive and properly styled
- [ ] With 0 posts from current week, poll renders without crashing

**Expected Result:** Poll panel renders without crashing, shows correct state for current day

**If Failed:**
- Document exact error message
- Note the day of week when testing
- Check if poll data is being generated correctly
- Verify no "Something Went Wrong" screen appears

---

### 5. Weekly Poll Voting (Friday Only)

**Test:** Poll Voting Flow
- [ ] On Friday, poll shows top 5 posts from current week
- [ ] Post options show author name and content snippet
- [ ] Can select a post option
- [ ] Can select "Other" and enter custom text
- [ ] Custom text validation works (blocks disallowed terms)
- [ ] "Submit Vote" button is enabled when option selected
- [ ] Click "Submit Vote"
- [ ] Success toast appears
- [ ] Poll shows confirmation message (not results yet)
- [ ] Cannot vote again (button disabled or hidden)

**Expected Result:** User can vote once on Friday, sees confirmation

**If Failed:**
- Document which step failed
- Check console for errors
- Verify localStorage is working

---

### 6. Weekly Poll Results (Saturday-Sunday Only)

**Test:** Poll Results Display
- [ ] On Saturday/Sunday, poll shows results
- [ ] Vote counts are displayed for each option
- [ ] Percentages are calculated correctly
- [ ] User's own vote is marked with "(Your vote)"
- [ ] Custom "Other" responses appear in results
- [ ] Options are sorted by vote count (descending)
- [ ] Progress bars display correctly
- [ ] No division-by-zero errors with 0 total votes

**Expected Result:** Results display correctly with accurate counts and percentages

**If Failed:**
- Document calculation errors
- Check if vote data is persisted correctly
- Verify no runtime errors in console

---

### 7. Create Post Flow

**Test:** New Post Creation
- [ ] Navigate to "Post" tab/page
- [ ] Text input field is functional
- [ ] Image upload button works (optional)
- [ ] "Post" button is enabled when content is entered
- [ ] Click "Post" button
- [ ] Success message appears
- [ ] Redirected to feed
- [ ] New post appears in feed

**Expected Result:** User can create and publish a new post successfully

**Prerequisites:** 
- User must have a username set
- User must not be suspended

**If Failed:**
- Check if user account is suspended
- Verify backend accepts new posts
- Document error message from toast/console

---

### 8. Polls Page

**Test:** Full Polls Page Load
- [ ] Navigate to "Polls" tab
- [ ] Polls page loads without errors
- [ ] Page description mentions "top 5 posts ranked by likes and comments"
- [ ] Weekly poll panel displays (same behavior as feed)
- [ ] Page layout is correct
- [ ] No console errors

**Expected Result:** Polls page renders successfully with poll panel

**If Failed:**
- Document console errors
- Check if routing is configured correctly
- Verify poll component renders in isolation

---

### 9. Comment & Like Functionality

**Test:** Interaction Features
- [ ] Click "Like" on a post (heart icon)
- [ ] Like count increments
- [ ] Click on a post to view comments
- [ ] Add a new comment
- [ ] Comment appears in thread
- [ ] Like a comment
- [ ] Comment like count increments

**Expected Result:** All interaction features work without errors

**If Failed:**
- Note which specific action failed
- Check for duplicate-like error handling (should show toast)
- Verify backend mutations are working

---

### 10. Navigation

**Test:** Bottom Navigation
- [ ] Click each tab in bottom navigation:
  - [ ] Feed
  - [ ] Post
  - [ ] Polls
  - [ ] Profile
- [ ] Each page loads correctly
- [ ] Active tab is highlighted
- [ ] No navigation errors

**Expected Result:** All navigation links work and pages load

**If Failed:**
- Document which page fails to load
- Check routing configuration

---

### 11. Profile & Logout

**Test:** Profile Page & Logout
- [ ] Navigate to Profile tab
- [ ] Username is displayed
- [ ] Account info is visible
- [ ] "Share App" button works (Web Share API or copy link)
- [ ] Click "Logout" button
- [ ] User is logged out
- [ ] Redirected to login screen
- [ ] Can log back in successfully

**Expected Result:** Profile displays correctly and logout works

**If Failed:**
- Document which element fails
- Check if logout clears session properly

---

## Error Capture Guidelines

When a test fails, capture the following information:

1. **Browser Console Error:**
   - Copy the full error message
   - Include stack trace if available
   - Note any network errors (failed API calls)

2. **Context:**
   - Date and time of test
   - Browser and version
   - User principal ID (if relevant)
   - Exact steps taken before error

3. **Visual Evidence:**
   - Screenshot of error state
   - Screenshot of console errors
   - Note any UI elements that appear broken

## Recording Results

Document all test results in `smoke-test-results.md` using the provided template.

## Critical Failures

If any of the following occur, consider rolling back:
- ❌ Users cannot authenticate
- ❌ Feed fails to load entirely
- ❌ App crashes on startup (white screen or "Something Went Wrong")
- ❌ Existing posts are missing or corrupted
- ❌ Users cannot create new posts
- ❌ Poll panel causes app crash

For non-critical issues (styling, minor bugs), document and address in a follow-up release.
