# Publishing to Production

This document describes how to promote the currently deployed draft version to production.

## Overview

Publishing to production promotes your draft version to the live production environment. This process:
- Updates only the application code (frontend and backend)
- **Preserves all existing production data** (posts, comments, profiles, likes, reports, suspensions)
- Does not perform any state resets or data migrations
- Does not reinitialize canister state

## Pre-Publish Checklist

Before publishing, verify:
1. ✅ Draft version has been tested and is working as expected
2. ✅ All critical user flows function correctly in draft
3. ✅ No breaking changes to data structures that would require migration
4. ✅ Backend changes are backward-compatible with existing data

## Publishing Steps

1. **Verify Draft Status**
   - Ensure your draft version is deployed and accessible
   - Test all critical flows in the draft environment
   - Document the draft version identifier (commit hash, build number, or timestamp)

2. **Initiate Production Promotion**
   - Use the Caffeine platform's publish command or UI
   - Confirm you want to promote the current draft to production
   - Wait for the deployment to complete

3. **Post-Publish Verification**
   - Follow the smoke test checklist in `smoke-test-production.md`
   - Verify that existing production data is intact
   - Test critical user flows in production

## Important Notes

### Data Preservation
- **No data is deleted or reset during publish**
- All posts, comments, user profiles, likes, reports, and suspensions remain intact
- The backend canister state persists across deployments

### Rollback
- If issues are discovered post-publish, contact Caffeine support for rollback options
- Document any errors or issues in `smoke-test-results.md`

### Schema Changes
- This publish does not include schema migrations
- If future updates require data structure changes, they must be handled separately with explicit migration logic

## Troubleshooting

### If the app fails to load after publish:
1. Check browser console for errors
2. Try clearing browser cache and reloading
3. Verify Internet Identity authentication still works
4. Document errors in `smoke-test-results.md`
5. Contact Caffeine support if issues persist

### If data appears missing:
1. Verify you're looking at the production URL (not draft)
2. Check that you're logged in with the correct principal
3. Data should never be missing after a code-only publish
4. If data is genuinely missing, contact Caffeine support immediately
