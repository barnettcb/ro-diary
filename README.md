# RO-DBT Diary Beta 0.5.8

Private, local-first RO-DBT diary card beta.

## Changes in 0.5.8
- Audited the app for iPhone scroll-to-top jumps caused by full-screen re-renders after same-screen interactions.
- Added app-wide state-aware scroll preservation: re-renders on the same logical screen keep the current vertical position automatically.
- Navigation to a different screen or a different diary day still opens at the top as intended.
- Fixed known jump paths in Week Setup, including focus-skill changes, Add Target, Delete Target, and other controls that re-render the setup screen.
- Fixed known jump paths in the SE Question Finder, including cue changes, Another Starter, Go One Step Further, Use This Question outcomes, Favorite, and Not Useful.
- Preserved scroll position when opening/closing or updating same-screen modals, including Saved Questions and settings/backup dialogs.
- Preserved horizontal position in Weekly Review rating tables during same-screen re-renders.
- Added scroll stabilization to the main content and modal scroll containers to reduce browser scroll anchoring interference.
- No diary data structure, backup format, target scoring, PDF, Question Finder bank, or guided-audio changes.

## Important
- This update preserves the existing encrypted vault, diary weeks, backups, and locally imported Loving Kindness audio.
- Do not delete/reinstall the Home Screen app for this update.
- Create a current encrypted backup before updating.
- RO-DBT Diary is not monitored and does not alert a therapist or emergency service.
