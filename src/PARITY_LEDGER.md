# PARITY LEDGER — X1 Apex Factory

Mission A: operational parity with manus.im. Mission B: autonomous loop. Mission C: extension protocol.
Read first, write last, every turn. A turn without a ledger update did not happen.

Legend: open · doing · closed · blocked

## Batch log

### Batch 1 — task model unified (G-01, G-05, G-11)

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-01 | closed | base44/entities/StudioTask.jsonc, base44/entities/Project.jsonc, base44/shared/projects.ts, base44/shared/native.ts, base44/functions/nativeTask/entry.ts, base44/functions/manusAgent/entry.ts, src/lib/taskEngine.js, src/components/SessionList.jsx, src/components/AppShell.jsx, src/components/shell/SidebarBody.jsx, src/components/shell/ProjectList.jsx, src/pages/Dashboard.jsx, src/pages/Studio.jsx | Sidebar sessions, Dashboard "Recent tasks" and Library all read StudioTask and link to /task/:id. Projects have their own sidebar section linking to /studio/:id. Build green. | StudioTask carries `project_id`; engine passes it through. |
| G-05 | closed | base44/entities/Project.jsonc, base44/shared/projects.ts, base44/shared/native.ts, base44/functions/manusAgent/entry.ts, src/components/NewProjectDialog.jsx, src/components/studio/ProjectSettingsDialog.jsx, src/pages/Studio.jsx, src/pages/NewTask.jsx, src/components/shell/ProjectList.jsx | Master instruction captured at creation, editable from the project header, injected into native create + follow-up prompts and prepended to Manus content. Pin and sort_order order the sidebar. | G-05b (per-project files) still open. |
| G-11 | closed | src/pages/TaskDetail.jsx, src/pages/Library.jsx | `task.type` guarded in both places. | — |

### Batch 2 — event automations + connectors declared to the engine (G-06, G-04)

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-06 | closed | base44/entities/Automation.jsonc, base44/entities/StudioTask.jsonc, base44/shared/automations.ts, base44/functions/runAutomations/entry.ts, base44/functions/automationEvents/entry.ts, base44/workflows/Task Finished Automations.jsonc, src/lib/automationSchedule.js, src/components/automations/AutomationDialog.jsx, src/components/automations/AutomationCard.jsx, src/components/automations/AutomationDetailDialog.jsx | Live probe: an event automation fired on a finished task, produced a real run, recorded run_count 1 and one history entry, and stamped `automation_id` on the spawned task. Scheduled mode still filters `trigger_mode: schedule` only. Build green. | Entity trigger on StudioTask update → workflow → `automationEvents` (admin-only). Self-trigger guard: a run the automation started never fires itself. |
| G-04 | doing | base44/shared/connectors.ts, base44/shared/native.ts | Every native run now receives the operator's installed connectors, their access level and their approval gate, plus an explicit no-claim rule so the engine plans the exact action instead of pretending it ran one. | Live connector execution needs an authorized app connector (none authorized yet) and a per-service call path. Not claimed as done. |

### Batch 3 — home composer tells the truth (G-02)

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-02 | closed | src/components/dashboard/Composer.jsx, src/pages/Dashboard.jsx, src/lib/taskEngine.js | The dead "apex 2.0 Lite" pill is now the real model + effort picker (choice persists and is sent to the run); the hardcoded `0` is the live task count for the studio; the dead `+` is the attachment control, uploading privately and registering in Files, with the files sent into the run on both engines. Send button shows the in-flight state and blocks a double submit. Build green. | `createTask` now forwards attachments to nativeTask and manusAgent, both of which already accept them. |

### Batch 4 — new-task inputs, honest usage and artifact filtering (G-03, G-08, G-09)

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-03 | closed | src/pages/NewTask.jsx | The new-task screen now takes files (uploaded privately, stored privately) and sends them with the run; the send control opens for a files-only run. Build green. | Same AttachmentPicker as the home composer and the task follow-up, so one behaviour across all three composer surfaces. |
| G-08 | closed | src/pages/settings/SettingsUsage.jsx | Sessions is a real server count, not a 100-row page length; the 14-day chart and the breakdowns read a bounded 14-day window (`created_date $gte`); recent sessions are a separate 8-row page. Live probe: count 1, window 1, dated records compare correctly. Build green. | Removed the "first 100 tasks" lie on the stats row and the histogram. |
| G-09 | closed | src/pages/Artifacts.jsx | The artifact type filter is now a server call (`listArtifacts({ type })` → nativeTask filters before slicing), the list reloads on filter change, and the header states loaded count with a `+` when more exist instead of claiming a total. Build green. | Search still narrows the loaded set; paging continues with the active filter. |

### Batch 5 — navigation truth (G-12, G-17)

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-12 | closed | src/components/shell/SidebarBody.jsx | The 12 flat rows are grouped into Workspace / Build / Agents / Connect with section labels, so the sidebar reads as structure instead of a list. Desktop and mobile share the same body. Build green. | Projects and sessions keep their own scroll region below. |
| G-17 | closed | src/components/shell/SidebarBody.jsx, src/pages/Library.jsx | Nav now says Tasks and Artifacts, and each page title matches its row; the Tasks header count carries a `+` when more than the loaded page exists. Build green. | — |

## Register state

| id | sev | state |
|---|---|---|
| G-01 | BLOCKER | closed |
| G-02 | BLOCKER | closed — model picker, live run count, working attachments |
| G-03 | BLOCKER | closed — new-task screen uploads files and sends them with the run |
| G-04 | BLOCKER | doing — connector context live; execution blocked on connector authorization |
| G-05 | BLOCKER | closed (G-05b open) |
| G-06 | BLOCKER | closed — scheduled + after-a-task triggers both live |
| G-07 | BLOCKER | extension protocol, not a gap |
| G-08 | HIGH | closed — usage reads server counts and a real 14-day window |
| G-09 | HIGH | closed — artifact type filter is a server call; no invented totals |
| G-10 | HIGH | open |
| G-11 | HIGH | closed |
| G-12 | HIGH | closed — sidebar grouped into Workspace / Build / Agents / Connect |
| G-13 | HIGH | open |
| G-14 | HIGH | open |
| G-15 | HIGH | open |
| G-16 | HIGH | open |
| G-17 | HIGH | closed — nav rows and page titles agree |
| G-18..G-25 | MEDIUM | open |
| G-26..G-29 | LOW / EXTRAS | open |

## Next batch (Batch 6)

G-05b project knowledge-base files, then G-10 and G-13..G-16 (scoped from the app at batch start, definitions written into the ledger before any code).

## Gap definitions

IDs G-03, G-08, G-09, G-12 and G-17 were re-derived from the running app at batch start (the original audit text for the remaining IDs is not carried in this ledger). Every closed row above states its definition in the batch log.

## Blockers needing the operator

G-04 execution: authorize at least one app connector (Gmail, Calendar, Sheets) before connector calls can be wired end to end.