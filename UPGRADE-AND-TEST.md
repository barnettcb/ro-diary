# RO Diary 0.6.1 Beta — Safe Rollout and Acceptance Checklist

## 1. Protect the existing live diary FIRST

1. Open the **current** RO Diary installation (expected `0.6.0-beta` in More).
2. Choose **More → Create Encrypted Backup**. Download the `.rodbt` backup and confirm the file exists, with a nonzero size. Keep the backup password safely and separately. **Do not upload the backup to GitHub.**
3. Retain your original Guided Practices audio file. It is stored on the device separately and **is not included** in the encrypted diary backup.
4. Keep the previous GitHub source/release for rollback. Do **not** uninstall your home-screen app, reset the diary, clear web storage, delete IndexedDB, or restore a backup merely to upgrade.

## 2. Deploy only the app files that changed

The connected GitHub integration can **read** `barnettcb/ro-diary`, but returned `403 Resource not accessible by integration` on write attempts in this conversation. **No live GitHub rollout was performed.**

1. Extract the v0.6.1 ZIP and open its `ro-diary-v0.6.1` folder.
2. On GitHub, open [barnettcb/ro-diary](https://github.com/barnettcb/ro-diary). For a staged rollout, use a normal temporary branch if your GitHub UI allows it; otherwise replace the four files in `main` with caution.
3. Replace **`app.js`**, **`index.html`**, **`sw.js`**, and optionally **`README.md` / `UPGRADE-AND-TEST.md`** at the repository root. `styles.css`, `pdf-export.js`, `manifest.webmanifest`, icons, and `.nojekyll` are **unchanged** from 0.6.0; do not delete or recreate them.
4. Commit normally, without deleting any existing files. If GitHub fails to replace a file, **stop** rather than deleting it from the repository first.
5. After GitHub Pages updates, open the **same site/shortcut** and confirm More shows **`0.6.1-beta`**. The home screen must not ask you to create a new vault or PIN. If it does, stop; do not start fresh.

## 3. Acceptance tests using your own existing records

- [ ] Existing four-digit passcode unlocks; previous weeks, RO targets and daily ratings remain unchanged.
- [ ] **Today → Events**: Existing events still show the note, optional fields, and **Discuss in Therapy**; there is **no** Flag for Weekly Review checkbox. Add/edit one harmless test event, navigate away and back, and verify it persisted. If you choose to delete the test event afterward, do so deliberately; do not delete historical events.
- [ ] All current RO targets are immediately visible with their original **0–5** or **Yes/No** rating controls. Confirm an entered 0 and No remain distinct from an unanswered target.
- [ ] Meditation Yes/No and optional minutes work as before; data survives leaving and reopening the app.
- [ ] **Week Setup:** Displays **Current therapist assignment** as a multiline field and preserves your targets, target types, valued goal, and optional clinical settings. The separate Weekly Focus Skills, Skills-Class Homework, and Weekly Self-Enquiry Focus fields do not appear.
- [ ] Existing therapist assignment still appears on **Home**; Skills Training and Guided Rehearsal prompt shortcuts remain functional. Edit the assignment if needed, then verify its dated history remains visible in Weekly Setup.
- [ ] **Self-Enquiry tab:** The Question Finder still finds questions and allows favorite, Save for This Week, discovered/personal questions. **Use This Question** now offers **Copy Question**; it no longer offers Set as Weekly Focus.
- [ ] **Guided Practices:** Existing Loving Kindness audio remains playable, or the import control remains available if you had not imported audio.
- [ ] **Weekly Review:** Existing ratings, meditation, therapy-process fields and other review features still work; old retired fields, if historically populated, are marked historical rather than active assignments. The obsolete event review flag is not displayed.
- [ ] **Export for ChatGPT:** A JSON file downloads for the intended **therapy-week start/end dates** and contains all 7 days, all configured targets and entered values, meditation, every event and its optional fields, plus the current therapist assignment. Existing legacy weekly skills/homework may appear clearly labeled `legacy...`. Saved/favorite/discovered Question Finder questions and the retired weekly SE focus must not be included.
- [ ] If you use offline mode, verify it only **after** a successful online load of the updated site.

## 4. Stop and rollback conditions

Stop if existing records are missing, the passcode fails, autosave fails, prior event content is altered, the Question Finder or audio disappears, or the export omits entered data. **Do not reset or restore a backup as a first reaction.** Preserve the `.rodbt` file and pause edits. Roll back the changed source files to the prior known-good 0.6.0 commit through GitHub's normal version history, refresh the same existing app, and confirm the stored vault still unlocks. Restore an encrypted backup only after investigating the problem and explicitly authorizing a replacement of local data.

## Verification already performed

- Verified the v0.6.0 source SHAs from the user's current GitHub repository before editing.
- `node --check` passed for v0.6.1 `app.js`.
- Isolated JavaScript regression tests passed for initial and weekly setup, active therapist focus, legacy storage, RO SE finder and privacy, events including historical flags, 0/No/unanswered values, weekly export and backup schema compatibility.
- **Not verified**: live browser/touch UI (automated local navigation blocked), real iPhone encrypted vault, deployed GitHub Pages site, on-device downloads, or weekly therapist PDF generation from a real export.
