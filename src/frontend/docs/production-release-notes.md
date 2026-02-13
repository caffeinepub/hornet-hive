# Production Release Notes

## Release Information

**Draft Version Being Promoted:** [Version 19]

**Promotion Date:** [To be filled at publish time]

**Promoted By:** [User/Principal ID]

## Changes in This Release

### Weekly Poll Enhancement - Top 5 Posts by Engagement

- **Feature:** Weekly poll displays the top 5 posts from the current week ranked by engagement (likes + comment count)
- **Week Definition:** Posts are filtered to only include those created within the current local-time week (Monday 00:00 to next Monday 00:00)
- **Behavior:** Poll options are automatically generated based on post engagement from posts created during the current week
- **Voting:** Users vote on Friday for the post they found most engaging
- **Results:** Results are displayed on Saturday and Sunday
- **Other Option:** Users can still submit custom responses via the "Other" option
- **Zero Posts:** If no posts exist from the current week, users can still vote using the "Other" option

### Technical Details

- **Week Window:** Monday 00:00:00 to next Monday 00:00:00 (local time)
- **Candidate Selection:** Only posts with timestamps within the current week window are eligible
- **Poll Generation:** Deterministic ranking by (likes + comment count) descending, with stable tie-breaking by post ID ascending
- **Poll Creation:** Happens automatically on Friday when the user visits the app
- **Options Stability:** Once created for a weekId, poll options remain fixed (no reshuffling due to new likes/comments)
- **Voting Window:** Friday only (local time)
- **Results Window:** Saturday through Sunday
- **Lifecycle:** Poll data is cleaned up on Monday
- **Storage:** All poll logic runs on the frontend using localStorage
- **Display:** Post options show author name and content snippet (truncated to 80 characters)
- **Error Handling:** Robust handling of edge cases (0 posts, corrupted data) prevents crashes

### Lifecycle States

- **Monday-Thursday:** "Available on Friday" message displayed
- **Friday (before voting):** Voting interface with top 5 posts + "Other" option
- **Friday (after voting):** Confirmation message, results not shown yet
- **Saturday-Sunday:** Full results with vote counts and percentages
- **Monday:** Previous week's poll data cleared, new week begins

## Data Impact Assessment

**Data Preservation:** ✅ CONFIRMED
- No backend changes in this release
- All existing posts, comments, likes, and user profiles remain intact
- Poll data is stored locally in browser localStorage (per-user, per-device)
- Previous week's poll data is automatically cleaned up on Monday

**No Data Reset:** This release does NOT reset any data. All user content is preserved.

## Pre-Publish Verification Checklist

Before promoting to production, verify the following in the DRAFT environment:

### Core Functionality
- [ ] Login/logout works correctly
- [ ] Username setup flow works for new users
- [ ] Feed displays all existing posts
- [ ] Post creation works (text and image)
- [ ] Comments can be added to posts
- [ ] Like functionality works for posts and comments
- [ ] Delete functionality works for own posts/comments
- [ ] Report functionality works for posts/comments/accounts

### Weekly Poll - Top 5 Posts
- [ ] Poll is NOT visible on Monday-Thursday (shows "available on Friday" message)
- [ ] Poll appears on Friday with top 5 posts from current week ranked by engagement
- [ ] Post options display author name and content snippet
- [ ] Can vote for one of the top 5 posts on Friday
- [ ] Can vote for "Other" and enter custom response on Friday
- [ ] Custom response validation works (disallowed terms blocked)
- [ ] Cannot vote twice in the same week
- [ ] After voting on Friday, shows confirmation (not results yet)
- [ ] Results are visible on Saturday/Sunday
- [ ] Results show vote counts and percentages correctly
- [ ] User's own vote is marked in results
- [ ] Custom "Other" responses appear in results
- [ ] Poll panel appears both in Feed (compact) and Polls page (full)
- [ ] With 0 posts from current week, poll still renders without crashing
- [ ] "Other" option works even when no post options exist

### Data Integrity
- [ ] All existing posts are still visible
- [ ] All existing comments are still visible
- [ ] Like counts are accurate
- [ ] User profiles are intact
- [ ] No data loss occurred during deployment

### UI/UX
- [ ] Mobile responsive design works
- [ ] Dark mode works correctly
- [ ] Navigation between pages works
- [ ] Loading states display properly
- [ ] Error messages are user-friendly
- [ ] Toast notifications appear for actions
- [ ] No "Something Went Wrong" error screen appears

## Post-Publish Verification

After promoting to production:

1. **Immediate Checks (within 5 minutes)**
   - [ ] Production site loads successfully
   - [ ] Login works
   - [ ] Feed displays posts
   - [ ] Weekly poll displays correctly based on current day

2. **Smoke Test (within 15 minutes)**
   - [ ] Run full smoke test checklist (see smoke-test-production.md)
   - [ ] Document results in smoke-test-results.md

3. **Monitor for Issues (first 24 hours)**
   - [ ] Check for user reports of issues
   - [ ] Monitor error logs if available
   - [ ] Verify poll behavior on Friday (voting)
   - [ ] Verify poll behavior on Saturday (results)

## Rollback Procedure

If critical issues are discovered after promotion:

1. **Identify the Issue**
   - Document the specific problem
   - Determine if it's blocking core functionality

2. **Decision Point**
   - If issue is minor (cosmetic, non-blocking): Document and fix in next release
   - If issue is critical (data loss, auth broken, app unusable): Proceed with rollback

3. **Rollback Steps**
   - Revert to previous production version
   - Verify previous version works correctly
   - Document the issue for future fix

4. **Communication**
   - Notify users if necessary
   - Document lessons learned

## Notes

- Poll data is stored locally per user, so different users may see different vote counts
- Poll options are generated when the user first visits on Friday
- Only posts from the current week (Monday-Monday window) are eligible for the poll
- If no posts exist from the current week, poll still allows "Other" voting
- Tie-breaking for posts with equal engagement is deterministic (by post ID ascending)
- Once created for a weekId, poll options remain stable (no reshuffling)

## Sign-Off

**Verified By:** [Name/Principal]

**Date:** [Date]

**Status:** [ ] Approved for Production / [ ] Rollback Required

---

*This release maintains data integrity and adds enhanced weekly poll functionality based on post engagement from the current week.*
