# Specification

## Summary
**Goal:** Let authenticated students delete posts they authored, with proper authorization checks and a confirmation-based UI flow.

**Planned changes:**
- Add a backend method to delete a post by postId, allowing only the authenticated author to delete and returning clear errors for unauthorized, non-author, or missing post cases.
- Ensure deletion removes the post from persistent storage and from getPosts(), and also removes any associated comments and attached image blob/access.
- Update the feed UI so that only the author of a post sees a “Delete Post” option in an overflow/menu action.
- Add a confirmation dialog for deletion and a React Query mutation that calls the backend delete method.
- On successful deletion, automatically refresh the feed by invalidating/refetching the posts query; on failure, show an English error message using backend-provided text when available.
- Keep existing report actions for non-authored posts unchanged.

**User-visible outcome:** Signed-in students can delete their own posts from the feed after confirming, and the post disappears immediately; students cannot delete other users’ posts.
