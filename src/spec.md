# Specification

## Summary
**Goal:** Build “Hornet Hive,” a mobile-first student social feed with Internet Identity login, unique (safe) usernames, posting with optional images, comments, likes, reporting/moderation, notifications, and weekly polls—using a consistent Kelly-green/white/black design.

**Planned changes:**
- Create a responsive UI with a consistent Kelly-green/white/black design system across all screens and navigation.
- Add Internet Identity authentication and require first-time users to set a unique username before they can post/comment/like/report.
- Implement deterministic username validation to block profanity/disallowed terms on both frontend and backend.
- Build a global feed for text posts and optional image posts; store author username/principal and timestamps; show newest-first.
- Add comments on posts with timestamps and author identity; add like/unlike on posts and comments (no dislike).
- Enforce deterministic text moderation for posts/comments (frontend pre-check + backend enforcement with clear errors).
- Implement image upload gating (type/size limits) and an image moderation state that can hide/restrict images (default to “requires review” if automated analysis isn’t possible).
- Add post reporting (text and image): reported content is removed from public view and the author receives an anonymous notification.
- Add account reporting with distinct reporter counting; at 5 distinct reports, notify the user and apply an automatic 7-day suspension blocking posting/commenting until expiry.
- Implement an in-app notifications center (reverse chronological) for reporting/moderation events and poll availability.
- Implement weekly polls: generate 10 options from weekly discussion content; voting open Friday only; results visible starting Saturday morning; delete prior poll each Monday.
- Provide core screens: Feed, Create Post, Notifications, Polls (vote/results), Profile (set/view username, view suspension status).

**User-visible outcome:** Students can sign in with Internet Identity, set a school-appropriate username, participate in a global feed (posts, images subject to moderation, comments, likes), report posts/accounts with anonymous notifications and suspensions, view notifications, and vote in/see results for weekly polls on the specified schedule.
