# Cosmos FM implementation checkpoint

Work branch: `codex/admin-schedule-security`, based on `cac0c0d6d0157edab81101199f9e9c8b837db87e`.

## Accepted behavior

- Start only after the listener presses Play. Station playback joins the current broadcast at its elapsed position, using server time.
- A started program finishes before returning to the configured radio stream. Consecutive programs transition directly.
- Manual library playback is not interrupted by the schedule; completion returns to the station.
- Calendar placement by date/time, drafts/publication, optional weekly repeat.
- Scheduled media enters the public library after its first published broadcast finishes. Unscheduled media can be published immediately.
- MP3 upload or external HTTPS audio; maximum 50,000,000 bytes and 3,600 seconds. Explain format and size in the form.
- Preserve existing content and branding. Test migrations and preview before production.

## Verified baseline

Production contains 3 shows, 4 podcasts, 28 settings, 3 hosts, 5 navigation entries and 2 profiles. Storage contains 17 objects. Earlier estimated table row counts of zero were inaccurate. No production changes have been applied.

The authenticated GitHub integration rejected branch creation with HTTP 403 (`Resource not accessible by integration`). Reading a public repository or seeing the user's `push` permission does not prove that the integration can write. Publishing remains dependent on fixing connector access.

## Remaining release gates

1. Implement and test player, schedule model/API/calendar, upload validation and publication rules.
2. Harden authentication, database/storage permissions and existing content/settings flows.
3. Update/pin dependencies, typecheck, lint, regression tests and CI.
4. Review and test incremental migrations against a disposable database with representative existing content.
5. Publish through the GitHub connector, verify preview, apply reviewed migration, deploy and verify production.
6. Restore temporary Supabase/Vercel permissions and disable the continuation heartbeat after completion.

The active goal and hourly continuation heartbeat are attached to the Codex task. A scheduler wakeup is not a guarantee that account limits or missing connector access will have recovered.

## Local implementation checkpoint (2026-09-14)

Implemented: typed player/controller and playback regression tests; server-authorized admin gate; data loading/error handling and atomic settings upsert; two incremental migrations; private audio assets; calendar month/week/day and drag-to-reschedule; optional weekly repeat and repeat end; shared recording form with MP3/size/duration validation and TUS upload; atomic recording + initial airing RPC; public schedule and recording library; server-clock station bridge; guarded external links/FAQ; dependency update/pinning and CI.

Checks so far: app TypeScript passed, ESLint passed, Vite 8 production build passed before the last UI edits. Security migration test and schedule migration test passed against PGlite with a disposable legacy schema. Latest dependency audit: zero advisories. Browser verification and expanded edge-case tests are still pending. The migrations have NOT been applied to production.

Important remaining work before release:

- Exercise the full editor in an isolated UI harness, plus public/mobile browser checks; verify TUS against the actual storage service only once deployment is ready.
- Add regressions for async URL resolution/stop, station refresh at consecutive airing boundaries, atomic-save rollback, weekly boundary collisions, and input validation.
- Prevent unpublishing/replacing recordings that still have published schedule entries; verify publication changes do not release unheard drafts.
- Fix remaining legacy administrative delete promises, homepage image-load cleanup, settings heading remounts and inert dashboard actions.
- Review exact synchronization during metadata loading, first-click readiness, unavailable-source fallback and fresh radio return after recording end.
- Replace obsolete root reset/storage instructions and repair scripts with the reviewed migration/runbook workflow.
- Final migration/production review must use the user-requested XHigh setting; the current task cannot claim that switch without a verified model-setting operation.
- GitHub connector write access is still unverified after the earlier 403. No remote commit, deployment or production mutation has occurred.
