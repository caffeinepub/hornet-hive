# Specification

## Summary
**Goal:** Let signed-in students share the Hornet Hive app with friends via the device/browser share sheet, with a reliable fallback when sharing isn’t supported.

**Planned changes:**
- Add a clearly labeled “Share Hornet Hive” action in the signed-in UI (recommended on the Profile page).
- Implement sharing via the Web Share API (navigator.share) when available, sharing: title “Hornet Hive”, a short English invite text, and the current app origin URL.
- Add a graceful fallback flow when Web Share is unavailable/fails: offer “Copy link” to copy the app URL using the clipboard API when available.
- Show success/error feedback for copy/share outcomes using the existing toast system (sonner) and ensure failures never crash or navigate away.

**User-visible outcome:** Signed-in students can tap “Share Hornet Hive” to open the system share sheet (when supported) or copy an invite link with clear toast feedback if sharing isn’t available.
