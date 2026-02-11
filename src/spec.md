# Specification

## Summary
**Goal:** Ensure authenticated app startup always reaches a terminal state by eliminating remaining bootstrap deadlocks and replacing endless loading with a clear, recoverable error screen.

**Planned changes:**
- Update `frontend/src/hooks/useQueries.ts` so the actor-initialization timeout starts whenever `actor` is null (even if `useActor()` stays `isFetching`), and after the timeout the profile query proceeds and fails into the existing `BootstrapErrorScreen` instead of leaving the UI stuck loading.
- Add a defensive bootstrap watchdog in `frontend/src/App.tsx` that, for authenticated users, replaces a too-long startup spinner (`profileLoading || !isFetched` beyond a fixed duration) with `BootstrapErrorScreen` using English messaging and working "Try Again" / "Log Out" actions that reuse existing retry/logout behavior.

**User-visible outcome:** Authenticated users will no longer see an endless loading spinner during startup; if initialization takes too long, they’ll see an English error screen with "Try Again" to re-attempt bootstrapping (without refreshing) or "Log Out" to return to the login screen.
