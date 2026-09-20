# Cosmos FM implementation checkpoint

Work branch: `codex/admin-schedule-security`, based on `cac0c0d6d0157edab81101199f9e9c8b837db87e`.

## Current checkpoint (2026-09-19)

This section supersedes older blockers and unverified-test statements below.

- The user explicitly authorized the separate test project `cosmos-fm-new` (`tbgcugeufzlepmixoyoi`). It was restored and verified separate from production `ozchhkjsrstdnowutsow`. Existing test demo content was preserved.
- Test migration history: `20260915082439 hosted_test_legacy_preparation`, `20260915082503 secure_admin_and_storage`, `20260915082526 broadcast_schedule`. The preparation fixture only aligns missing legacy tables with production; do not apply it to production.
- `tests/hosted-smoke.mjs` passed ten real-service checks: Auth roles, metadata/profile escalation rejection, private Storage and multi-chunk TUS, MIME/unauthorized-upload rejection, unreleased asset protection, scheduled catalog visibility, atomic conflict rollback, current-airing access, post-airing release, and simultaneous conflicting writes (exactly one succeeds). Test credentials and downloaded audio are ignored under `.release-local/`.
- Combined TypeScript, zero-warning lint, 55 tests and production build passed on September 19, including the new read-only recording progress display.
- Browser against the hosted test backend: a real 6.5 MiB MP3 uploaded through the file picker, measured 342 seconds, and saved as a scheduled podcast. No autoplay occurred; after Play the listener joined at 3:17 elapsed for the 19:10 UTC airing at approximately 19:13:17 UTC.
- At the end of that real recording (19:15:42 UTC), without another click, the player changed from the recording title/progress to Cosmos FM LIVE with Pause available. Real-browser return to the configured radio stream is verified.
- Opening the public podcast catalog immediately afterward showed the uploaded recording, while radio playback continued.
- Dragging the identified test event `hosted-check-e59fbec1` from September 19 to September 20 persisted after opening another calendar tab. Both public page and admin calendar had document width 382px within a 390px viewport. This does not prove physical iOS/Android audio behavior.
- Production migrations remain unapplied. The deployed preview still uses the old production backend and must be switched to the test project before further preview administration. Vercel settings require the user to sign in; the available connector has no environment-variable mutation capability. Do not bypass this with source-code environment overrides.
- On September 20, Vercel preview-branch overrides for `codex/admin-schedule-security` were added for `VITE_SUPABASE_URL` and the public Supabase key. Both are limited to that preview branch; the existing Production and general Preview values were left unchanged. A new Git revision is required to build with these overrides.
- Remaining release gates: hosted preview environment and checks, verified production recovery plan, production migrations/admin provisioning/deploy with XHigh review, then restore temporary connector permissions. The continuation automation was found PAUSED and that status was preserved; its stale test-permission prompt was corrected.

## Earlier release status (2026-09-15, after GitHub access restored)

This section supersedes the historical GitHub-access blocker below.

- GitHub App installation 161850953 is now available. The user-created branch matched the original baseline.
- Published all four local checkpoints through the GitHub connector, preserving their order and checking every resulting tree against local Git. Local-to-remote commit mapping: 5cabed3 → 6507c5934f3cc1e9797dc02af6effc928e4a7dfd; 3b185a3 → ee510da56a3a86246e101dfff7aa77cdff294921; 9518b0c → 50afec6119a2a29defc671084f605d0be8359057; 22e38b3 → 776564b665a0079546c22feee8abe77d03c86c93.
- Draft PR: https://github.com/piobeat-ux/cosmos-fm/pull/1. Main is unchanged. Both push and PR verification checks passed, including the dependency audit.
- Vercel preview dpl_AVaKfVDDH29rtrHF1qeFBai2FB9f is READY at https://cosmos-qf4arrn44-piobeat-uxs-projects.vercel.app for remote commit 776564b. Browser verified the homepage and four legacy podcast cards. This preview currently reads the existing production backend; no administrative tests were performed there.
- The first oversized Git tree request was rejected by automatic approval review (200,000-byte review limit). Smaller independently reviewed requests succeeded; each completed tree matched the local checkpoint.
- Production migrations remain empty. Read-only counts reconfirmed shows 3, podcasts 4, site_settings 28, profiles 2, storage objects 17. No production schema, content or storage mutations were made.
- Supabase lists only its default main branch; the organization is Free. A separate existing project, cosmos-fm-new (tbgcugeufzlepmixoyoi), is INACTIVE and outside the previously authorized working-project scope. Ask the user whether it may be restored and used for testing; inspect its existing data before making any changes. Do not assume it is empty or disposable.
- Awaiting this test-environment decision before hosted Auth/Storage/TUS tests and production migration/deployment. A verified database recovery plan and the remaining release checks still need completion. Temporary Supabase/Vercel permissions remain as previously configured and must be restored at completion. Do not mark the goal complete.

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
