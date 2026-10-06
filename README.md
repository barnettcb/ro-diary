# RO-DBT Diary Beta 0.5.14

Local-first RO-DBT diary card PWA.

## Changes in 0.5.14

- Added full access to prior therapy weeks after they close.
- Archive now lets a user open any past week, continue unfinished daily entries, and export that week's therapist PDF.
- Added a clear Past Week mode with a persistent date banner and Return to Current Week control.
- In Past Week mode, Daily Entries and Weekly Review use the selected historical week's stored data; edits save back only to that week.
- Target definitions and Week Setup remain fixed for past weeks so historical card structure is not accidentally rewritten.
- Added direct Export Therapist PDF from the Archive week preview.
- Preserved 0.5.12 Reset App Data and all earlier functionality.

## Update notes

Upload the contents of this release folder over the existing GitHub Pages repository files. Existing encrypted local diary data is preserved.

## 0.5.14-beta
- Archive week rows now show the therapy-week date range instead of an internal random week ID.
- Each row also shows Current/Past status and completed-day count.
- Archive labels hydrate automatically on every Archive render, including returns/re-renders, so internal IDs are never used as the visible fallback.
