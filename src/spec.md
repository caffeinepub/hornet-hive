# Specification

## Summary
**Goal:** Surface backend actor initialization failures during app bootstrap, avoid generic connection errors when a real init error exists, and make Retry reliably re-initialize and recover without a page reload.

**Planned changes:**
- Add a new/adjacent actor-initialization hook or wrapper that exposes loading and error state (including the underlying Error) when backend actor creation fails, rather than leaving only a null actor.
- Update the bootstrap/profile-loading flow to wait for actor initialization (with a defined timeout) and to prefer displaying the real initialization/timeout error in the existing BootstrapErrorScreen instead of a generic “Unable to connect…” message when actor is null.
- Improve the BootstrapErrorScreen “Try Again” behavior to force a fresh actor initialization attempt and then re-run the caller profile fetch, ensuring technical details reflect the latest failure on repeated retries.

**User-visible outcome:** When the app can’t initialize the backend actor, users see an accurate error (with technical details) instead of a generic connection message; while initialization is in progress the app keeps loading (until timeout); and “Try Again” can recover from transient connectivity issues without refreshing the page.
