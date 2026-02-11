# Specification

## Summary
**Goal:** Prevent the same authenticated student from liking the same comment more than once, and show a clear error message in the UI when a duplicate like is attempted.

**Planned changes:**
- Backend: Enforce a one-like-per-student-per-comment rule for comment likes so repeated like attempts by the same caller do not increment the like count.
- Backend: Return a clear English error message when a duplicate comment-like is attempted (e.g., "You have already liked this comment.").
- Frontend: Display the backend’s duplicate-like error message to the user (e.g., toast/inline alert) without breaking overall UI responsiveness.

**User-visible outcome:** A student can like a comment once; if they try to like the same comment again, they see an English message indicating they already liked it, and they can continue using the app normally.
