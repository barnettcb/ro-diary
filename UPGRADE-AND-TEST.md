# RO Diary v0.6.0 beta — Safe update and acceptance checklist

## Before changing the published site

1. On the **existing** RO Diary app, use **More → Create Encrypted Backup**. Save the `.rodbt` file somewhere you control; securely retain the separate backup password. Do not send it to GitHub or this chat.
2. Confirm the downloaded backup exists and has nonzero size. Note that the **imported Loving Kindness audio is stored separately** and is not included in the backup; keep its original audio file.
3. Confirm the repository is `barnettcb/ro-diary`. Its old working `0.5.14` source is already retained in Git history; if practical, save the current release ZIP separately as an additional rollback reference.
4. Keep the **same GitHub Pages URL**, browser, and installed iPhone home-screen shortcut. **Do not uninstall the app, clear site storage, reset the data, or restore a backup just to upgrade.**

## Publish — only four source assets need replacing

1. Extract this ZIP on your computer.
2. On GitHub, open `https://github.com/barnettcb/ro-diary` → root of the default `main` branch. If an approved staging branch is available, use it first.
3. Upload the updated files `app.js`, `styles.css`, `index.html`, and `sw.js` **into the repository root**, replacing their previous versions. Optionally also upload `README.md` and `UPGRADE-AND-TEST.md` there as documentation. Do not move the icon files, `pdf-export.js`, or the manifest; those are unchanged.
4. Commit normally. If GitHub rejects an overwrite in the Upload Files interface, stop and use the corresponding file's Edit control or another standard GitHub file replacement workflow. Do not delete the repository or start a new site.
5. Wait for GitHub Pages to reflect the update. On the live site, reopen or refresh the app until **More** reports `0.6.0-beta` and the new Today screen appears. Don't assume that upload success equals deployed success.

## Acceptance test on the actual device

- [ ] Existing four-digit passcode unlocks; all existing therapy weeks and targets are present.
- [ ] Existing Self-Enquiry Question Finder, favorites, saved personal questions and the Guided Practices audio still work.
- [ ] Today shows all configured private and social targets in a compact layout, with 0–5 or Yes/No controls unchanged.
- [ ] Enter a previously blank target as **0**, and another as **No**. Reopen Today and verify they persist; other unanswered values remain blank.
- [ ] Enter **Meditation Yes** with optional minutes, navigate away/back, reopen the app, and verify persistence. Enter **No** on an appropriate test date and verify it is distinct from no answer.
- [ ] Add an event with a title, what happened, type, two optional details, and a Discuss in Therapy flag. Reopen the day and verify every value persisted; edit and verify it again. Confirm existing older note/events are still readable.
- [ ] In Week Setup, enter the agreed therapist-directed focus. Return Home; verify the focus and copyable training/rehearsal prompts.
- [ ] In Weekly Review, check that meditation, all targets, complete event details, and existing therapy-process/weekly context remain available.
- [ ] Tap **Export for ChatGPT** and confirm the JSON downloads. Before uploading, inspect the file: correct therapy-week dates, all seven days, all target definitions and entered ratings, meditation values, event details, and learning focus. Check that saved or favorite Question Finder questions are **not** present.
- [ ] Test an earlier therapy week (if available): navigation, reading and editing allowed daily information, and export for that exact date range.
- [ ] Verify the app continues working offline after the update has fully loaded, if offline use is important to you.

## Privacy and reporting

The weekly `.json` export is **not encrypted**, unlike your `.rodbt` backup. It contains sensitive diary information. Upload it only to the ChatGPT conversation where you want the therapist report, then review the generated PDF before forwarding. The app cannot automatically fetch ChatGPT continuity logs; the included instructions ask ChatGPT to retrieve them from the Library when accessible. A missing or unclosed entry must be flagged, never invented.

## Rollback / stop conditions

If the app fails to unlock, existing records are missing, autosave fails, events are corrupt, questions or guided audio disappear, or the export omits data: **stop using this update**, do not reset the app, and do not attempt repeated imports/restores. Restore the prior four deployed source files from the previous Git commit (not by clearing local site data). Confirm the `0.5.14-beta` interface returns and the vault unlocks. If local data appears damaged, preserve the `.rodbt` backup and contact the developer/chat before attempting a restore, because restores can replace the vault.

## What has and hasn't been verified

Verified offline: exact main-file SHA agreement between the archived 0.5.14 package and the live GitHub repository; new JS parses; data model smoke tests passed for legacy records, 0/No/missing values, week dates, new export privacy, meditation, learning focus and render functions; backup schema remains backward compatible. Not verified: iPhone Safari interactions and actual persist/reload flow, GitHub Pages deployment, on-device downloads, encryption/restore on a real existing vault, and the resulting therapist PDF.
