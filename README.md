# RO-DBT Diary Beta 0.5.12

Private, local-first RO-DBT diary card beta.

## Changes in 0.5.12
- Added **Reset App Data** under More for users who want to erase local diary/testing data and run Initial Setup again without clearing browser history/site data or reinstalling the app.
- Reset requires an explicit destructive confirmation.
- Reset deletes diary weeks, ratings, notes/events, targets, weekly setup, app/profile settings, and saved Self-Enquiry data stored in the encrypted diary records.
- Reset preserves the existing 4-digit passcode and separately stored Loving Kindness audio.
- After reset, the app locks immediately. Entering the same passcode opens the blank Initial Setup flow.
- The record replacement is performed in one IndexedDB transaction so the encrypted profile and blank first week are replaced together.
- Preserved all 0.5.11 functionality, including Initial Setup, Weekly Review formatting, optional RO-DBT fields, Question Finder, therapist PDF export, encrypted backup/restore, and app-wide scroll-position protection.

## Important
- **Reset App Data is destructive.** Create an encrypted backup first if you may want the current diary later.
- Downloaded backup files and therapist PDFs are outside the app and are not deleted by Reset App Data.
- The imported Loving Kindness audio is intentionally stored separately and is not deleted by Reset App Data; use Remove Audio if you want to remove it.
- Updating from an earlier version does not reset existing data.
- Do not delete/reinstall the Home Screen app merely to update.
- RO-DBT Diary is not monitored and does not alert a therapist or emergency service.
