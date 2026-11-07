# RO Diary 0.6.1 Beta — Weekly Focus and Event Cleanup

**Base:** RO Diary 0.6.0-beta, verified against the current `barnettcb/ro-diary` GitHub `main` source on November 6, 2026. This is a narrowly scoped interface/workflow update. It does **not** reset the encrypted vault or change the IndexedDB database name, database version, encryption, backup format, or therapy-week date conventions.

## What changed

- **Meaningful Events:** Removed the active **Flag for Weekly Review** checkbox and its corresponding review badge. **Discuss in Therapy** remains available. All events continue to appear in the weekly ChatGPT export regardless of flags. Older event `flag` values are retained in stored event objects, including the export, as historical information.
- **Weekly Setup:** The single **Current therapist assignment** textarea now holds the active RO-DBT lesson/skill and relevant homework. The separate weekly focus skills, skills-class homework, and weekly Self-Enquiry focus inputs are no longer displayed. The current assignment and dated history, targets, optional valued goal, and clinical settings remain.
- **Initial Setup and Setup Guide:** Aligned with the same single-assignment workflow. There is no longer a default list of skills or a mandatory Self-Enquiry focus during onboarding.
- **Self-Enquiry:** Question Finder, saved/favorite/discovered/personal questions, and cue-based questions remain. The old weekly focus panel and **Set as Weekly Focus** action are removed. **Use This Question** offers **Copy Question** and **Save for This Week** instead. Questions are not automatically treated as a therapist assignment.
- **Weekly Review and ChatGPT Export:** Displays current learning focus as before, but labels pre-existing obsolete skills/homework/SE entries as historical when present. The export labels old weekly skill selections and homework as legacy data, not current training. Its therapist instructions explicitly exclude saved/favorite/discovered Question Finder questions and the retired SE focus text.
- **New weeks:** Copy the current therapist assignment, RO targets, target rating types, valued goal, and relevant clinical settings; do **not** automatically copy the retired focus-skills/homework/SE focus fields. Prior weeks and their values remain unchanged.

## What did NOT change

- PIN and encrypted storage; encrypted backup/restore format; therapy-week boundaries and previous-week navigation; RO targets and ratings (including `0`, `No`, and unanswered); meditation and inline Growth Practice-style events; Home training/rehearsal prompts; Guided Practices and audio import/playback; saved Question Finder lists and the library; the weekly Export for ChatGPT file workflow.
- Historical values in existing weeks are **not deleted or rewritten**. A user may still view them in old weekly reviews when present, and encrypted backups preserve them.
- **No automatic ChatGPT synchronization**: weekly export is a JSON file the user intentionally uploads to ChatGPT. The weekly JSON is *plaintext sensitive diary data*, not an encrypted backup.

## Important limitation

The application package passes JavaScript parsing and offline data-model regression checks. An automated Chromium acceptance test could not navigate to the local test server (`ERR_BLOCKED_BY_ADMINISTRATOR`), so full browser/UI and on-device encrypted-vault verification remain outstanding. GitHub source was read/verified; GitHub write operations previously returned **403**, so this release **has not been deployed**. Follow `UPGRADE-AND-TEST.md` and preserve the existing app until acceptance passes.
