# Specification

## Summary
**Goal:** Prevent the same authenticated student from liking the same post more than once, and show a clear message when a duplicate like is attempted.

**Planned changes:**
- Update backend like handling to enforce one-like-per-student-per-post with persisted per-post like ownership tracking and a deterministic “already liked” error on duplicates.
- Add/extend conditional migration/upgrade logic so existing persisted posts initialize the new liked-by tracking without breaking `getPosts` or `likePost`.
- Update the frontend Like interaction to handle duplicate-like rejections by showing an English user-facing message and resetting the button/loading state; show a generic English error for other failures.

**User-visible outcome:** When a student taps Like on the same post multiple times, the like count only increases once and the app informs them they have already liked the post.
