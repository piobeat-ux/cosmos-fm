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

1. Finish the migration release review against hosted PostgreSQL and the real service boundaries. Local review findings below are addressed.
2. Restore GitHub connector write access. Latest installation listing still returns no installations; original branch creation returned 403.
3. Publish through the GitHub connector and verify preview against an isolated hosted Supabase environment, including Auth/Storage/TUS and real audio.
4. Apply reviewed production migrations, provision the verified administrator, deploy and verify production using XHigh.
5. Restore temporary Supabase/Vercel permissions and disable the continuation heartbeat after completion.

The active goal and hourly continuation heartbeat are attached to the Codex task. A scheduler wakeup is not a guarantee that account limits or missing connector access will have recovered.

## Local implementation checkpoint (2026-09-14)

Implemented: typed player/controller and playback regression tests; server-authorized admin gate; data loading/error handling and atomic settings upsert; two incremental migrations; private audio assets; calendar month/week/day and drag-to-reschedule; optional weekly repeat and repeat end; shared recording form with MP3/size/duration validation and TUS upload; atomic recording + initial airing RPC; public schedule and recording library; server-clock station bridge; guarded external links/FAQ; dependency update/pinning and CI.

Checks as of 2026-09-14: app TypeScript, zero-warning ESLint, 43 tests and Vite 8 production build passed together after the latest fixes. Migrations ran against PGlite with a disposable legacy schema. Dependency audit returned zero advisories (recheck at release). The migrations have NOT been applied to production.

Browser evidence from the isolated UI/PGlite harness: published weekly show saved for Wednesday 10:00–10:10; overlapping podcast at 10:05 rejected with database error; adjacent podcast at 10:10–10:20 accepted; following week contains only the recurring show. Adding another airing to an existing public recording preserves its catalog visibility and saves the requested date/time. Month view renders the repeats. Desktop viewport 1280px has no horizontal document overflow. This does not verify mobile audio or hosted Auth/Storage.

Browser testing caught datetime-local input changes not persisting through the change handler in this environment; explicit input handling now persists the chosen time in both calendar and media forms. Additional fixes cover upload-busy save guards, stale image callbacks, administrative deletion errors, settings edits during saving, dashboard links, paginated calendar loading, and player deadlines while waiting for a signed URL or station refresh.

Removed obsolete repair/reset scripts and tracked backup source copies (recoverable from earlier Git commits). Replaced conflicting deployment/storage/reset instructions with README.md, DEPLOYMENT.md and TESTING.md. No database content or stored media was deleted.

Important remaining work before release:

- Verify actual TUS/Auth/Storage and new-record upload-to-airing publication flow against isolated hosted Supabase, not only PGlite. The fixture harness deliberately does not simulate storage.
- Check drag rescheduling, responsive/mobile interaction and real mobile audio playback including background/resume. New calendar/media dialog keyboard focus is verified below. Physical iOS/Android media policies are not proven by desktop tests.
- Review exact synchronization during metadata loading, first-click readiness and unavailable-source fallback against real audio.
- Review migration concurrency and security-definer boundaries on hosted PostgreSQL; PGlite tests are not a multi-connection concurrency proof.
- TypeScript checks run, but the legacy project still has strict=false; do not describe it as fully strict-typed.
- Final production review must use the user-requested XHigh setting. The same-thread follow-up with model gpt-6-astra and thinking xhigh was accepted by the app before the additional migration review below.
- GitHub connector write access is still unverified after the earlier 403. No remote commit, deployment or production mutation has occurred.

## Additional migration review (2026-09-15)

Read-only production checks confirmed no migrations applied and direct default EXECUTE grants to anon/authenticated in public. The disposable fixture now models those default grants. Public read RPCs are SECURITY INVOKER wrappers around narrowly filtered private helpers; raw internal schedule access is explicitly denied to browser roles.

Fixed catalog-mode changes failing to recalculate the already scheduled release date, and replacement audio inheriting a prior recording's after-airing release. Added regression tests for both plus raw-function access and invoker RPC boundaries. All 47 tests pass after these migration-only changes; the preceding full typecheck/lint/build was green, and dependency audit had zero advisories. Hosted Auth/Storage/TUS, migration concurrency and production verification remain unproven.

No remote write or deployment has occurred. Local checkpoints: 5cabed3 (foundation), 3b185a3 (UI verification, hardening and legacy cleanup), followed by the migration-review checkpoint. Preserve all local commits when publishing; origin currently points at a local audit mirror, not GitHub.

## MP3 and dialog review (2026-09-15)

The previous goal turn made concrete progress (commits through 9518b0c), not merely a wait. This continuation rechecked the clean checkout and GitHub installation list; the latter is still empty. No new remote write attempt or production mutation was made.

Extracted pure audio validation from the Supabase adapter and added eight tests against the real music-metadata parser: decimal size boundary, valid MPEG frames, just-under-hour acceptance, over-hour rejection below 50 MB, empty files, renamed text, WAV disguised as MP3, and uppercase MP3 extension. Synthetic MPEG data tests the parser rather than a mocked metadata response; real listening/hosted upload remain separate release gates.

Calendar/media editors now use a native modal with explicit keyboard-cycle and focus-return guards. Browser evidence: initial focus on the first field; Shift+Tab wraps to Cancel inside the modal; Escape closes the calendar and restores Add airing; Cancel restores Add recording in the media editor. Inputs cannot change during database saving. Host image upload now blocks Save and uses a functional state update to avoid overwriting concurrent edits.

Combined typecheck, zero-warning lint, 55 tests and production build passed. Dependencies did not change. GitHub access and the hosted preview/production checks remain required; no claim of completed deployment.
