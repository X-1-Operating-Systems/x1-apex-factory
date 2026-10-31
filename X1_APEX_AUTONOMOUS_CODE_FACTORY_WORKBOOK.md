# X1 APEX — Autonomous Code Factory Living Workbook
Version: 2026-10-31.1 | Mission: X1-AUTONOMOUS-CODE-FACTORY-20261030 | Owner: Strategic Minds AI
Operating mode: CONTINUE (bounded, user approval for production/spend/permissions/secrets)
Status: PREVIEW BRANCH HARDENED / NO PRODUCTION RELEASE / END-TO-END NOT VERIFIED

## 1. Mission and acceptance
Goal: A verified autonomous coding pipeline using existing Supabase X1 canonical queue, branch-first code writes, real CI, independent Guardian, rollback, low-cost model choice, and an owner-approved production release.
- [PASS] Read and pin existing Base44 preview branch; preserve rollback
- [PASS] Implement Code Factory UI/backend for human-initiated proposals and draft PR staging
- [PASS] Add no-cost GitHub source connectivity probe to branch; mock negative case
- [PASS] Remove automatic website production approval from preview and update schema/UI
- [PASS] Block member release, shared Manus key consumption and public share publication in preview
- [PASS] Branch deterministic negative tests, ESLint, Vite build
- [FAIL] Repository-wide typecheck: 407 diagnostics (not waived)
- [BLOCKED] Live CodeJob schema and backend integration in main (not deployed)
- [NOT_RUN] Live read-only Base44 function call in authenticated preview session
- [NOT_RUN] Real test GitHub draft PR and required CI status, independent exact-SHA Guardian
- [NOT_RUN] End-to-end persistent queue-worker-lease-execution-receipt coding loop
- [NOT_RUN] Production release; separate exact target approval needed

## 2. Sources and verified access
Base44 app: 6ae48ede6fd67187c24e94cd
Branch: x1-autonomous-code-factory-20261030 | branch ID: 6ae5487759e1efaa63152675
Editor/preview: https://app.base44.com/apps/6ae48ede6fd67187c24e94cd/editor/preview?branch=x1-autonomous-code-factory-20261030
Pre-change rollback checkpoint 2026-10-31: 6ae57555013edb1007c3b2a3; source SHA e6a487f3b2de73f36387d8929e8dcc9cb5517a43
Previous preview handoff/checkpoint: 6ae54aa370b03f7ac3d6a91b
Final 2026-10-31 checkpoint/SHA: SEE FINAL SESSION RECEIPT (written after this workbook)
GitHub: Strategic-Minds-AI/x1-infinity-agent-runtime | private | main | push permission verified using connector
GitHub OAuth inside Base44: connected to x1-operator, scope repo; backend action untested live
Supabase: X1 AI Hub Staging uvdkzsbjackpjvpoxtyk (canonical task queue / lease / receipt DB)
Local: JARVIS-COMMAND device 68702b78-725a-4b76-878f-f1693f485414 ONLINE, hardware recovery hold ACTIVE
Canonical local handoffs: C:\\_Strategic_Minds_AI_OS\\70_X1_GPT_INFINITY_SYSTEM\\10_HANDOFFS
Main Base44 production source remained untouched. Existing schedules retained; no duplicate created.

## 3. Actual preview branch code changes (2026-10-31)
- base44/shared/autopilot.ts: remove deployRelease run/approve calls in ship stage; hold status awaiting_approval; repeated scheduler calls cannot convert hold to success.
- base44/entities/AutopilotJob.jsonc: allow awaiting_approval.
- src/pages/Autopilot.jsx + src/components/autopilot/JobCard.jsx: truthful release-gated UX.
- base44/functions/deployRelease/entry.ts: deny non-admin callers before preparing/approving deployment.
- base44/functions/manusAgent/entry.ts: member access requires personal Manus key; member cannot sign arbitrary private file attachments; detail uses scoped call not global fallback.
- base44/functions/shareLink/entry.ts: restrict publication / handoff and link creation to admin, preserve public token resolution and existing owner list/revoke.
- base44/functions/codeFactory/entry.ts + src/pages/CodeFactory.jsx: add no-cost read-only GitHub SHA probe, no paid model invocation or writes.
- tests/autopilotReleaseGate.test.cjs: 4 negative regression tests
- tests/securityAuthorization.test.cjs: 4 negative authorization regression tests
- tests/codeFactory.test.cjs: added 1 GitHub probe test to existing 4
All modifications in isolated Base44 branch only. Security fixes are NOT yet active in main.

## 4. Test and QA matrix (2026-10-31)
Command: node --test tests/codeFactory.test.cjs tests/autopilotReleaseGate.test.cjs tests/securityAuthorization.test.cjs
PASS: 13/13 tests; all mocked Base44 and GitHub providers, no live external operations.
PASS: npm run lint
PASS: npm run build
FAIL: npm run typecheck, exit 2; 407 TS diagnostics (first in src/components/NewProjectDialog.jsx); baseline from prior iteration also 407.
NOT_RUN: Deno/npm backend deployed runtime test, browser auth/tenant integration, live GitHub write, PR/CI, security exploit tests, independent Guardian signed exact-SHA receipt.
The current APEX Guardian 17/17 check is generic capability-probe evidence, NOT Code Factory release approval.

## 5. Security scan and unresolved risks
Base44 security scan initiated 2026-10-31 on MAIN, latest observed status SCANNING; provisional: 1 secret-registration warning, 3 high backend access-control issues and 7 npm dependency advisories (vite/zod). Source-confirmed release, Manus, shareLink risks repaired in preview only.
DO NOT call provisional scanner counts final until status up_to_date.
Supabase security: public.x1_mirror RLS enabled true with zero policies, not evidence of public data access; public.x1_work_queue has 2 RLS policies with FORCE RLS, x1_task_leases 1 with FORCE RLS. Do not alter grants/policies without reviewed migration and approval.
Source queue: public.x1_work_queue 98 records at read (60 COMPLETED,17 BLOCKED,20 DEAD_LETTER,1 PENDING); leases 149 (56 COMPLETED,87 FAILED,6 RELEASED). Do NOT bulk requeue.
Worker heartbeat public.x1_worker_heartbeats newest observed 2026-10-24 (jarvis-local-power-grid-1), no fresh record in 40m query. Different Railway worker probes existed historically; verify its provider/lease identity separately before claiming any live continuously operating worker.
JARVIS hardware recovery hold (NVMe warnings, unexpected reboot) remains ACTIVE; no local stress, restart, Docker/Ollama inference.

## 6. Cost and authorization
This iteration used no Core.InvokeLLM calls, paid Manus invocations, live HeyGen renders, GitHub writes, production deploys or credential changes. Platform scan and connected read/write operations may have provider billing not assessed; do not assert total charges.
Approve separately: paid model inference, any production merge/deploy, secrets/permissions/RLS/DNS, public avatar changes, or destructive work.
Autonomous continuous progress outside chat requires provider-verified running worker/queue, not a prompt alone.

## 7. Architecture decisions
ADR-1: Keep existing Supabase queue, leases, receipts and scheduler as authority; CodeJob is only Base44 preview audit ledger.
ADR-2: Branch-first development; owner final gate; separate Guardian signed source SHA.
ADR-3: Stop automated website publication entirely until ownership, release approval and Guardian checks are verifiable.
ADR-4: Admin-only shared-key/release/share issuance in preview until per-tenant fine-grained ownership and billing are implemented.
ADR-5: Use a read-only GitHub probe before paid planning; no new credentials or second schedulers.
ADR-6: Keep local machine on hardware hold; favor existing Railway preview worker after heartbeat and resource verification.

## 8. Prompt library — continue contracts (v1)
P00 INTAKE: Resolve goal, exact tenant/project/repo, authorized action class, cost ceiling, acceptance.
P01 DISCOVERY: Read local handoff, Base44 branch SHA, Supabase queue/leases, GitHub, worker, existing receipts; verify freshness.
P02 ARCHITECT: Pick smallest reversible fix, no duplicate systems, record alternatives and tradeoffs.
P03 BUILD: Only isolated branch/sandbox; source pin, explicit bounds, preserve originals, no secret export.
P04 REPAIR: Reproduce, patch one failure family, max 3 loops, stop on repeated fingerprint, retest.
P05 QA INDEPENDENT: New reviewer validates exact SHA, test suite/CI, tenant isolation, auth, exploit negatives and live environment.
P06 HARDEN: Least privilege, cost limits, retry/lease idempotency, scanners, no automatic publish.
P07 RELEASE: Source SHA + Guardian + rollback receipt + explicit target-specific owner approval before deploying.
P08 VAULT: Save versioned artifact, hash, read back exact approved destination, flag pending cloud sync.
P09 DEHYDRATE: Append revision, receipts, tests, warnings, current source SHA, next action, never invent evidence.
P10 UI REVIEW: Browser check owner login, mobile/desktop behavior, Code Factory list/probe/plan/approve flows.
Prompt invocation: CONTINUE = rehydrate this workbook, execute highest-priority safe step without new spend or protected action, test, verify read-back and save next checkpoint.

## 9. Next actions (highest priority first)
1. Finish Base44 main security scan; inspect final findings and confirm branch patches address applicable issues, including secret registration and dependency vulnerabilities (no sensitive values).
2. Obtain independent Guardian exact-SHA code/security review of the preview candidate; do not substitute 17 capability probes.
3. Perform authenticated CodeFactory read-only probe live in preview (no credits); verify backend function auth and GitHub response. Fix backend service-role tick if blocked.
4. Verify canonical Railway worker is currently alive and queue/leases are mapped; do not add new scheduler.
5. Reconcile typecheck baseline, backend/runtime/RLS tests; run bounded repair.
6. With a designated safe test repository and authorized GitHub draft-PR action, run one real synthetic full job/CI; never publish.
7. Prepare explicit scoped protected release approval with exact source SHA, Guardian receipt, rollback and cost impact.

## 10. Handoff and sync
Canonical storage this iteration: Base44 isolated branch + local JARVIS 10_HANDOFFS file. Drive content/hash verification PENDING until an actual Drive upload/readback receipt exists.
On next CONTINUE: read this workbook, latest Base44 checkpoint/source SHA and security scan, then advance first unfinished authorized action. DO NOT rely on 17/17 generic probe score as code factory parity.
