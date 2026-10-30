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

## Register state

| id | sev | state |
|---|---|---|
| G-01 | BLOCKER | closed |
| G-02 | BLOCKER | open — composer fake model pill, hardcoded 0 credits, dead `+` |
| G-03 | BLOCKER | open |
| G-04 | BLOCKER | doing — connector context live; execution blocked on connector authorization |
| G-05 | BLOCKER | closed (G-05b open) |
| G-06 | BLOCKER | closed — scheduled + after-a-task triggers both live |
| G-07 | BLOCKER | extension protocol, not a gap |
| G-08 | HIGH | open |
| G-09 | HIGH | open |
| G-10 | HIGH | open |
| G-11 | HIGH | closed |
| G-12 | HIGH | open — Projects section shipped; sidebar still 12 flat items |
| G-13 | HIGH | open |
| G-14 | HIGH | open |
| G-15 | HIGH | open |
| G-16 | HIGH | open |
| G-17 | HIGH | open — "Library" nav vs page title mismatched |
| G-18..G-25 | MEDIUM | open |
| G-26..G-29 | LOW / EXTRAS | open |

## Next batch (Batch 3)

G-02 composer truth (model pill, credits, attachment control) and G-03.

## Blockers needing the operator

G-04 execution: authorize at least one app connector (Gmail, Calendar, Sheets) before connector calls can be wired end to end.