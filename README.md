# RO-DBT Diary Beta 0.6.0 — Unified Daily Check-In

This is a **local-first, encrypted** RO-DBT diary PWA. It is an incremental update to the previously released **0.5.14** app, not a new database or a replacement for existing local records.

## What changed

- **Today:** All configured private and social targets stay visible with tighter spacing. Meditation is a single Yes/No with optional minutes; missing remains unanswered. No separate daily skills or self-enquiry fields, and no required Save/Complete Day step.
- **Events:** Growth Practice-style inline editing: title and what happened, plus optional expandable type, feelings, body sensations, thoughts, urges, social signals, results, skills, and therapy/review flags. Existing simple context/note events display in the new editor without deleting their legacy fields.
- **Home:** A compact Learning & Practice section shows the active therapist-directed learning focus, plus two copyable ChatGPT prompt shortcuts. No manual learning log.
- **Week Setup:** Enter or change the therapist-directed learning focus. A dated history is retained in the encrypted profile and the focus carries forward when copying the previous week. Existing RO targets, yes/no and 0–5 types, weekly setup, and therapy-week dates remain as before.
- **Weekly Review:** Preserve the existing review content, add meditation results and complete inline event detail, and replace the visible PDF action with **Export for ChatGPT**. The single JSON download contains the complete seven-day reportable app data, including instructions for retrieving the two relevant ChatGPT Library continuity logs and producing a therapist PDF.
- **Privacy:** Saved, favorite, and personal Self-Enquiry Question Finder questions are not exported. The weekly JSON is **plaintext** and should be handled as sensitive health information; the original encrypted backup remains separate.

## Protected functionality

Question Finder, saved/favorite/personal questions, Guided Practices and imported audio, PIN unlock, local encrypted storage, encrypted backup/restore, archive/history, existing weekly setup and therapy-process settings remain. The old PDF implementation file is retained in source history as rollback but its main workflow is replaced.

## Important

GitHub deployment has not yet been performed through this ChatGPT connection (GitHub write operations returned 403). The new implementation has passed JavaScript syntax checks and data-model regression tests, but **has not been verified on the actual iPhone**. Read `UPGRADE-AND-TEST.md` before replacing any published files.
