# PARITY LEDGER — X1 Apex Factory

Mission A: operational parity with manus.im. Mission B: autonomous loop. Mission C: extension protocol.
Read first, write last, every turn. A turn without a ledger update did not happen.

Legend: open · doing · closed · blocked

## Batch log

### Batch 1 — task model unified (G-01, G-05, G-11)

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-01 | closed | base44/entities/StudioTask.jsonc, base44/entities/Project.jsonc, base44/shared/projects.ts, base44/shared/native.ts, base44/functions/nativeTask/entry.ts, base44/functions/manusAgent/entry.ts, src/lib/taskEngine.js, src/components/SessionList.jsx, src/components/AppShell.jsx, src/components/shell/SidebarBody.jsx, src/components/shell/ProjectList.jsx, src/pages/Dashboard.jsx, src/pages/Studio.jsx | Sidebar sessions, Dashboard "Recent tasks" and Library all read StudioTask and link to /task/:id. Projects get their own sidebar section linking to /studio/:id, so the canvas stays reachable. Production build green. | StudioTask gained `project_id`; engine passes it through (native + manus). |
| G-05 | closed | base44/entities/Project.jsonc, base44/shared/projects.ts, base44/shared/native.ts, base44/functions/manusAgent/entry.ts, src/components/NewProjectDialog.jsx, src/components/studio/ProjectSettingsDialog.jsx, src/pages/Studio.jsx, src/pages/NewTask.jsx, src/components/shell/ProjectList.jsx | Master instruction captured at creation, editable from the project header, injected into native prompts (create + follow-up) and prepended to Manus task content. Pin and sort_order live and order the sidebar Projects list. | Knowledge-base files per project still open (needs StudioFile.project_id) — carried as G-05b. |
| G-11 | closed | src/pages/TaskDetail.jsx, src/pages/Library.jsx | `task.type` guarded in both places; native tasks carry type 'native' from the engine shape. | — |

## Register state

| id | sev | state |
|---|---|---|
| G-01 | BLOCKER | closed |
| G-02 | BLOCKER | open — composer still has fake model pill, hardcoded 0 credits, dead `+` |
| G-03 | BLOCKER | open |
| G-04 | BLOCKER | open |
| G-05 | BLOCKER | closed (G-05b project files open) |
| G-06 | BLOCKER | open |
| G-07 | BLOCKER | extension protocol, not a gap |
| G-08 | HIGH | open |
| G-09 | HIGH | open |
| G-10 | HIGH | open |
| G-11 | HIGH | closed |
| G-12 | HIGH | open — sidebar still 12 flat items; Projects section shipped early (needed by G-01) |
| G-13 | HIGH | open |
| G-14 | HIGH | open |
| G-15 | HIGH | open |
| G-16 | HIGH | open |
| G-17 | HIGH | open — "Library" nav vs page title still mismatched |
| G-18..G-25 | MEDIUM | open |
| G-26..G-29 | LOW / EXTRAS | open |

## Next batch (Batch 2)

G-04 connectors reach the engine · G-06 event-triggered automations.

## Blockers needing the operator

None.