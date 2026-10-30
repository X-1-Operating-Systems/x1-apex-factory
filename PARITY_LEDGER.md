# PARITY LEDGER — X1 Apex Factory

Mission A: operational parity with manus.im. Mission B: autonomous loop. Mission C: extension protocol.
Read first, write last, every turn. A turn without a ledger update did not happen.

Legend: open · doing · closed · blocked
Verification rule: a gap is only `closed` when the production build is green AND the behaviour was exercised against real records (no mocks, no stubs, no dead controls).

## Batch log

### Batch 1 — task model unified (G-01, G-05, G-11)

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-01 | closed | base44/entities/StudioTask.jsonc, base44/entities/Project.jsonc, base44/shared/projects.ts, base44/shared/native.ts, base44/functions/nativeTask/entry.ts, base44/functions/manusAgent/entry.ts, src/lib/taskEngine.js, src/components/SessionList.jsx, src/components/AppShell.jsx, src/components/shell/SidebarBody.jsx, src/components/shell/ProjectList.jsx, src/pages/Dashboard.jsx, src/pages/Studio.jsx | Sidebar sessions, Dashboard "Recent tasks" and Tasks list all read StudioTask and link to /task/:id. Projects get their own sidebar section linking to /studio/:id. Build green. | StudioTask gained `project_id`; both engines pass it through. |
| G-05 | closed | base44/entities/Project.jsonc, base44/shared/projects.ts, base44/shared/native.ts, base44/functions/manusAgent/entry.ts, src/components/NewProjectDialog.jsx, src/components/studio/ProjectSettingsDialog.jsx, src/pages/Studio.jsx, src/pages/NewTask.jsx, src/components/shell/ProjectList.jsx | Master instruction captured at creation, editable from project settings, injected into native prompts (create + follow-up) and prepended to Manus task content. | Knowledge-base files were carried as G-05b (closed in Batch 6). |
| G-11 | closed | src/pages/TaskDetail.jsx, src/pages/Library.jsx | `task.type` guarded in both places; native tasks carry type 'native' from the engine shape. | — |

### Batch 2 — connectors declared, automations event-triggered (G-04 partial, G-06)

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-04 | doing | base44/shared/connectors.ts, base44/shared/native.ts, src/pages/Plugins.jsx, src/components/plugins/ConnectorDialog.jsx, src/components/plugins/ConnectorCard.jsx, base44/entities/StudioConnector.jsonc | Connectors installed in the app are declared to the reasoning engine on every run, with access level and approval gate, and the engine is explicitly forbidden from claiming a connector action it did not take. Probe run echoed the declared connector block. | **Engine-side execution is still missing**: a run cannot read from Gmail/Drive/etc. through the connector's auth. Carried as the remaining half of G-04. |
| G-06 | closed | base44/entities/Automation.jsonc, base44/functions/automationEvents/entry.ts, base44/functions/runAutomations/entry.ts, base44/shared/automations.ts, base44/workflows/Task Finished Automations.jsonc, base44/workflows/Automation Clock.jsonc, src/components/automations/AutomationDialog.jsx, src/components/automations/AutomationDetailDialog.jsx, src/components/automations/AutomationCard.jsx, src/pages/Automations.jsx | "After a task" automations fire from the completion event and create the follow-up run; schedule mode still fires from the clock workflow. Both paths verified against real tasks. | Automation gained `trigger_mode` / `event_when`; runs recorded on the automation record. |

### Batch 3 — composer honesty (G-02)

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-02 | closed | src/components/composer/ModelPicker.jsx, src/components/task/AttachmentPicker.jsx, src/pages/Dashboard.jsx, src/pages/NewTask.jsx, src/components/dashboard/Composer.jsx, src/lib/taskOptions.js, src/lib/taskEngine.js | Model pill writes a real `model` value that the engine receives; effort toggle real; attachments upload and reach both engines; usage line reads live counts. Build green. | Removed the fake pill, the hardcoded `0` credits and the dead `+`. |

### Batch 4 — artifacts, usage, navigation (G-12 partial, G-17)

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-12 | doing | src/components/shell/SidebarBody.jsx, src/components/shell/ProjectList.jsx, src/components/shell/UsageMeter.jsx, src/components/shell/NotificationBell.jsx | Sidebar split into Workspace / Build / Agents / Connect sections with projects and grouped sessions. | Remaining half: project grouping inside the session list and inbox parity. |
| G-17 | closed | src/components/shell/SidebarBody.jsx, src/pages/Library.jsx, src/pages/Plugins.jsx | Nav label and page title now agree everywhere (Tasks, Connectors, Files, Artifacts, Computers, Skills, Agents). | — |
| G-08 | closed | src/pages/Artifacts.jsx | Artifact list filters by type on the server and pages with "load more"; no client-side truncation. | — |
| G-09 | closed | src/pages/settings/SettingsUsage.jsx, src/components/usage/UsageBreakdowns.jsx, src/components/usage/CoverageCard.jsx | Usage screen reads real task counts and server-side date windows. | — |

### Batch 5 — project master instruction in context (G-05 remainder)

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-05 | closed | src/components/studio/ProjectSettingsDialog.jsx, src/pages/Studio.jsx, base44/shared/projects.ts | Master instruction edited in project settings persists and is injected into every run inside the project. | — |

### Batch 6 — project knowledge files + standalone uploads (G-05b, G-10)

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-05b | closed | base44/entities/StudioFile.jsonc, base44/shared/projects.ts, base44/shared/native.ts, src/lib/files.js, src/components/studio/ProjectFiles.jsx, src/components/studio/ProjectSettingsDialog.jsx | Files added to a project (stored privately) are attached to the create and follow-up runs of every task in that project and named in the project brief; Manus runs receive the names. Verified with a real run: a task created inside a project holding `brand-voice.txt` answered with exactly that file name. Round-trip of the `project_id` filter verified against real records (create → matched → delete → zero remaining). Build green. | Capped at 4 signed files per run to bound payload size; the brief always lists up to 12 names. |
| G-10 | closed | src/components/files/FileUploadButton.jsx, src/pages/Files.jsx, src/lib/files.js | Files screen can now upload directly (stored privately), the new record appears at the top of the list immediately and the counter increments; upload errors surface inline. Build green. | Uploads made outside a task carry `source: 'library'`; project uploads carry `source: 'studio'` plus `project_id`. |

### Batch 7 — multi-page projects (G-13)

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-13 | closed | src/pages/Studio.jsx, src/components/studio/PageSwitcher.jsx, src/components/studio/PageDialog.jsx, src/components/studio/PageCanvas.jsx, src/components/studio/Inspector.jsx, base44/functions/deployRelease/entry.ts, base44/shared/bundle.ts, base44/shared/qa.ts, base44/functions/studioAgent/entry.ts | Studio lists every page of a project, switches the canvas per page, and creates/renames/deletes pages with per-page SEO. Release ran against a real two-page project (`/` v2, `/about` v3): bundle produced `index.html`, `about/index.html`, `vercel.json`, `manifest.json`; manifest carried both pages with their own versions and section lists; page_version froze at the highest page version and the QA gate scored worst-of across pages. Probe records (deployment, QA run, pages, project) deleted afterwards. Build green. | A stale `audit` reference in the release response was found by this probe and removed. |

### Batch 8 — project-first dashboard (G-12 dashboard half)

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-12 (dashboard half) | closed | src/pages/Dashboard.jsx, src/components/dashboard/ProjectGrid.jsx, src/components/dashboard/TemplateRow.jsx, src/components/ProjectCard.jsx | Dashboard order is now composer → projects → recent tasks → templates, so the studio is the primary surface and task history sits below it. Project cards carry a live page count from one grouped aggregate; the grid loads from the server and has its own empty state with a working "New project" path. Verified against real records: a two-page project came back through the grid's exact queries as `{pages: 2, template: 'Atelier'}`, and deleting it left zero projects. Build green. | `ProjectCard` is now shared and takes an optional `pageCount`. |

### Batch 9 — file type filters (G-14)

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-14 | closed | src/lib/files.js, src/pages/Files.jsx, src/components/files/FileTypeFilter.jsx | Search now combines with a type filter (All / Images / Documents / Video / Audio) in one server query, and the header count reflects the active filters instead of the whole library. `fileFilter` is shared by list and count so the two can never disagree; paging carries both filters. Verified on real records: three probe uploads (png, txt, mp4) returned exactly one image, one document, and one video-with-term, term-only search matched by name, the filtered count came back 1, and all probes were deleted afterwards (0 left). Build green. | Files already had search; the missing half was type filtering and an honest filtered count. |

### Batch 10 — sessions grouped by project (G-12 closed)

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-12 (session half) | closed | src/components/shell/ProjectList.jsx, src/components/SessionList.jsx, src/components/shell/SessionRow.jsx, src/components/shell/SidebarBody.jsx | Every sidebar project row now expands into that project's tasks with a live count, and the flat list below keeps only tasks with no live project, still grouped by recency. Row markup is shared through one `SessionRow`, so status dots and active states cannot drift between the two lists. Verified on real records: a project with two tasks rendered both under it (`nestedTaskCount: 2`), a project-less task and a task pointing at a deleted project both fell back to the flat list, and all probes were deleted afterwards (0 tasks, 0 projects left). Build green. | Sidebar loads 40 tasks; a project's count reflects the loaded window. |

### Batch 11 — search across artifacts, files and websites (G-15 closed)

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-15 | closed | src/pages/Search.jsx, src/components/search/ResultSection.jsx | Search now runs eight parallel server queries instead of five: task titles/instructions, projects, **websites**, **artifacts**, **files**, agents, automations, templates. Websites match a task's deliverable where the type is `website` and link to `/websites/:taskId`; artifacts match any other deliverable by name or detail and link to their build task; files match by name and show mime type plus size. A website deliverable is filtered out of the artifacts section so nothing is listed twice. `ResultSection`/`ResultRow` moved into their own component so the page stays readable. Verified on real records: one site task, one deck task and one upload produced exactly `websites: ["zephyr site"]`, `artifacts: ["zephyr growth deck"]`, `files: ["zephyr brief.pdf (application/pdf)"]`, with the title query catching the site task and the unrelated deliverable excluded; all probes deleted afterwards (0 tasks, 0 files). Build green. |

## Register state

| id | sev | state |
|---|---|---|
| G-01 | BLOCKER | closed |
| G-02 | BLOCKER | closed |
| G-03 | BLOCKER | open — release pipeline ships the operator bundle only; no client handoff path |
| G-04 | BLOCKER | doing — connectors are declared to the engine; auth-backed execution from a run not implemented |
| G-05 | BLOCKER | closed |
| G-06 | BLOCKER | closed |
| G-07 | BLOCKER | extension protocol, not a gap |
| G-08 | HIGH | closed |
| G-09 | HIGH | closed |
| G-10 | HIGH | closed |
| G-11 | HIGH | closed |
| G-12 | HIGH | closed |
| G-13 | HIGH | closed |
| G-14 | HIGH | closed |
| G-15 | HIGH | closed |
| G-16 | HIGH | open — computer panel streams run steps but has no live browser view |
| G-17 | HIGH | closed |
| G-18..G-25 | MEDIUM | open |
| G-26..G-29 | LOW / EXTRAS | open |

## Next batch (Batch 12)

G-16 — re-scope the computer panel against what it renders today, then decide between a live browser view and closing it as "streamed steps are the view".
Medium gaps G-18..G-25 come after that.

## Blockers needing the operator

None.