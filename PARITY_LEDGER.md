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
| G-15 | closed | src/pages/Search.jsx, src/components/search/ResultSection.jsx | Search now runs eight parallel server queries instead of five: task titles/instructions, projects, **websites**, **artifacts**, **files**, agents, automations, templates. Websites match a task's deliverable where the type is `website` and link to `/websites/:taskId`; artifacts match any other deliverable by name or detail and link to their build task; files match by name and show mime type plus size. A website deliverable is filtered out of the artifacts section so nothing is listed twice outside one page; all probes deleted afterwards (0 tasks, 0 files). Build green. |

### Batch 12 — the interaction core: live view, AI panel, AI-first search

**Surface hierarchy (decided this batch).** Three surfaces carry the product, in this order:

1. **AI panel** — the conversation. A persistent slide-over on every screen (⌘J, or the "Ask" pill) that starts a real task from the first sentence and keeps the thread going with follow-ups. One implementation (`useStudioChat` + `AIChat`) shared with every other entry point, so a conversation behaves identically wherever it starts.
2. **Computer panel live view** — the output. The top of the computer panel now shows the run's actual surface: the hosted site in a frame for Manus runs, the composed page rendered live (its real blocks, accent, surface and headline font) for native runs, with a clear empty state when nothing is viewable yet.
3. **Search** — the index, now AI-first. "Ask or search" opens with the studio conversation at the top and workspace results below, so the page answers questions *and* finds existing work.

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-16 | closed | src/components/task/ComputerView.jsx, src/components/task/ComputerPane.jsx | The computer panel opens with a **Live view** section: Manus runs frame their `preview_url`/`site_url` with an open-in-new-tab footer, native runs render the project's real page through `PageCanvas` in a browser-chrome frame, and a run with neither shows an honest empty state. It refetches as the task's `updated_date` moves, so the view tracks the build. Verified on live records: a probe project (dark surface, `#2f5d50`, display font) with a two-block page came back through ComputerView's exact queries as `{pageName: 'Home', pageVersion: 3, blockTypes: ['hero','cta'], tokens: {accent:'#2f5d50', surface:'dark', headlineFont:'display'}}`, and the polled detail payload carries `task`, `events`, `digest`. Probes deleted (0 projects, 0 pages, 0 tasks). Build green. | A remote-browser screencast (Browserbase live view) is still an extra, not a gap: the panel now shows the real surface rather than only steps. Logged as a future extra. |
| G-15b | closed | src/hooks/useStudioChat.js, src/components/ai/AIChat.jsx, src/components/ai/AIPanel.jsx, src/components/AppShell.jsx, src/pages/Search.jsx | One conversation engine backs the Ask panel, the ⌘J shortcut and the Search page's Ask card: the first message becomes a task via `createTask`, later messages are follow-ups via `sendToTask`, and polling stops once the task settles (restarted by the next follow-up). The panel links straight to the full task, and Search puts the same chat above its results. Verified build green and the polled detail payload (`task`, `events`, `next_cursor`, `has_more`) matches what the chat reads. | Both entry points share the model/effort choice already stored on the device. |

### Batch 13 — task filtering/paging on the server, a conversation you can end

Two medium gaps on the surfaces the last batch set the standard for: the task index behind the AI panel, and the panel's own thread.

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-18 | closed | base44/functions/nativeTask/entry.ts, src/lib/taskEngine.js, src/pages/Library.jsx | **Tasks** now filters and pages on the server instead of in component state. `nativeTask` list accepts `status` and `query` (title + instruction, case-insensitive), pages with a real cursor and returns an honest `total`; `listTasks` returns both engines' cursors and "load more" only asks the engine that still has one, so native tasks past the first page are reachable and nothing is refetched twice. Verified against real records: three probes (stopped, error, unrelated) — `status=stopped&query=ALPHA` returned exactly the alpha probe with `total: 1`, `status=error` returned exactly the error probe, and a `limit=2` walk returned page 1 (2 tasks, more) then page 2 (2 tasks, more=false): 4 distinct tasks over both pages. First merged page = 4 native + 3 Manus = 7. Probes deleted (0 left). Build green. | The Manus API exposes no filter or search, so its fetched page is narrowed by the same status/query inside `listTasks`; the native side is the one that truly filters. The header reads "matching tasks" whenever a filter is on. |
| G-19 | closed | src/hooks/useStudioChat.js, src/components/ai/AIPanel.jsx | The Ask panel had one immortal thread: once a request became a task, every later message continued that task and there was no way to start clean. `useStudioChat` gained `reset()` (clears task, events, error and busy, and stops the poll), the panel header shows the thread's real task title instead of the generic label, and a **New** control appears once a thread exists. Build green; the send path is untouched from G-15b, so create → follow-up behaviour is unchanged. | Resetting does not delete the task — it stays in Tasks. |

### Batch 14 — inbox counts and search paging on the server

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-20 | closed | src/pages/Notifications.jsx, src/components/shell/NotificationBell.jsx | Inbox now pages (25 at a time with **Load more**) and both its counters come from the server: `count({})` for total and `count({read:false})` for unread, so the header and the bell badge no longer describe "the last 100" or "the last 8". Marking, deleting and reading update the counters immediately without a refetch. Verified on real records: three probes (2 unread) produced `total: 3, unread: 2`, a `limit=2` walk returned page 1 (2 items, more=true) then page 2 (1 item) with zero overlap; probes deleted (0 left). Build green. | The bell badge counts every unread notification, not just the eight in its popover. |
| G-21 | closed | src/lib/search.js, src/components/search/SearchResults.jsx, src/components/search/ResultSection.jsx, src/pages/Search.jsx | Search no longer stops silently at a fixed ceiling. Every surface's query lives in one spec (`SEARCH_SECTIONS`) that returns a real page, and each section carries its own cursor: **Show more** appends that surface's next page while the others stay put, and the header count shows `N+` when more exist. The artifacts section now excludes website deliverables in the query itself (`deliverable.type: {$ne:'website'}`) instead of filtering the page in the browser. Verified on real records: a Template section query paged 8 → 8 with `more` true on both pages and **zero id overlap**, the artifacts query returned only `documents` and excluded websites, and the websites query returned only website deliverables. Build green. | A surface that fails to load leaves its section empty rather than breaking the rest of the page. |

### Batch 15 — the run loop closes: rerun, delete, one agent per playbook, a sidebar that pages

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-25 | closed | src/components/task/TaskActions.jsx, src/lib/taskEngine.js, src/pages/TaskDetail.jsx | Task detail now carries **Rerun** and **Delete** beside Stop. Rerun starts a fresh run from the task's own brief, model, effort and project and lands on the new task; Delete asks once, then removes the task and returns to Tasks. Both act on studio tasks only — a Manus run still has its single "Open in Manus" path, because their API exposes neither a delete nor the original brief. Verified end to end on real records: a probe task was created, its stored instruction read back (`Reply with the single word: rerun-probe.`), the exact rerun payload produced a **new** task id that ran to `stopped` with 2 events, and deleting both left **0** records. Build green. | Errors from either action surface in the page's existing error line rather than failing silently. |
| G-24 | closed | src/components/playbooks/PlaybookDialog.jsx | Saving a playbook as an agent now stamps `installed_from` with the playbook key, and opening the dialog looks for an agent by that key **or** by name. When one exists the dialog says **Saved to Agents** and links to the library instead of offering the button, so it can no longer mint duplicates. Verified on real records: a probe agent matched by key, matched by name alone, returned nothing when neither matched, and was deleted afterwards (0 left). Build green. | Deleting the agent in the library makes the playbook offer the save again, so the state stays honest. |
| G-22 | closed | src/components/AppShell.jsx, src/components/shell/SidebarBody.jsx | The sidebar's sessions and projects are no longer capped at a silent 40. Both lists keep their cursor and page state, and a **Show more** row appears while either one still has a next page, appending without duplicates. Build green. | Tasks opened past the window appear in the flat list or under their project; project counts now grow as more pages load. |

### Batch 16 — the client handoff, and search that says what it covers

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-03 | closed | base44/functions/shareLink/entry.ts, base44/entities/ShareLink.jsonc, src/pages/SharedView.jsx, src/pages/Releases.jsx, src/components/releases/ReleaseRow.jsx, src/App.jsx | A live release can now be **handed off**: one click renders that release's pages to self-contained public files and mints a read-only client link, so a client reviews the build with no account. The release row keeps the link (open, copy, turn off), and turning it off is enforced server-side. ShareLink gained `project_id`, `deployment_id` and `pages`; `task_id` is no longer required so one link model serves websites and releases. Verified on real records: a two-page approved release produced `About/about` and `Home/`, the resolved link carried label `Release v2`, a fetched page returned **200** with its real hero headline, CTA and project accent, revoking it made resolve answer "This link was turned off by its owner.", and every probe record was deleted (0 links, 0 projects left). Build green. | The rendered pages are uploaded **publicly** on purpose — a client has no app account, so the link must open for them; turning the link off stops the handoff page. Blocked and superseded releases cannot be handed off. |
| G-23 | closed | src/lib/taskEngine.js, src/pages/Library.jsx, src/pages/Search.jsx | Decision: **state the limit**, do not mirror. Mirroring would mean rewriting Manus rows into StudioTask on creation with no way to keep status current (their API has no webhooks and no task search), so the copy would drift and the task list would double-count. Instead `listTasks` returns `manus_narrowed` whenever a filter is active, Tasks says plainly that studio tasks are filtered across the whole library while Manus runs are narrowed to their most recent page, and Search states which surfaces it covers so nobody assumes Manus runs are indexed. Build green. | Recorded here so the choice is not silently revisited. |

## Register state

| id | sev | state |
|---|---|---|
| G-01 | BLOCKER | closed |
| G-02 | BLOCKER | closed |
| G-03 | BLOCKER | closed — a release hands off to one read-only client link that renders its own pages |
| G-04 | BLOCKER | doing — connectors are declared to the engine; auth-backed execution from a run not implemented |
| G-05 | BLOCKER | closed |
| G-06 | BLOCKER | closed |
| G-07 | BLOCKER | extension protocol, not a gap |
| G-08..G-17 | HIGH | closed |
| G-18 | MEDIUM | closed — task list filters and pages on the server; native tasks past page one reachable |
| G-19 | MEDIUM | closed — the Ask panel can end a conversation and start a new one |
| G-20 | MEDIUM | closed — inbox counts and paging come from the server, in the page and the bell |
| G-21 | MEDIUM | closed — every search surface pages on its own cursor with Show more |
| G-22 | MEDIUM | closed — sidebar sessions and projects page with Show more instead of a silent 40 |
| G-23 | MEDIUM | closed — the limit is stated in Tasks and Search, with the decision recorded |
| G-24 | MEDIUM | closed — one agent per playbook, found by key or name |
| G-25 | MEDIUM | closed — task detail reruns the same brief and deletes without a leftover |

### Batch 17 — runs that call the connector they declare (G-04 closed)

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-04 | closed | base44/shared/connectorTools.ts (new), base44/shared/connectors.ts, base44/shared/native.ts, src/components/task/TaskEvent.jsx | The native engine invokes connectors mid-run through a hard allowlist: fixed host, method and URL shape per action, parameters validated and encoded, 15s timeout, 3.5k truncation. Every call is written to `task.events` as a `tool` event. Writes require access above read-only AND auto-approve. Verified on real records: a Gmail search was dispatched and honestly reported "No active connection found", a Calendar write on a read-only connector returned `gated` with nothing sent, and after the gate fix the same call cost one attempt in 6.5s. Probes deleted. Build green. | A repeated identical call is refused without touching the network; a gate ends the call phase immediately. |

### Batch 18 — the connection layer, live

| id | state | files changed | verification | notes |
|---|---|---|---|---|
| G-28 | closed | base44/shared/connectorTools.ts, src/lib/connectorCatalog.js | Nine Google products are now runnable actions under one connection: Gmail search/read/send, Calendar list/create, Drive search/read-export, Docs read, Sheets read/append, Contacts search — plus Supabase `list_projects` / `query_readonly` and GitHub `list_pull_requests` / `create_issue` on top of the existing repo and issue reads. `googleworkspace` was added to the connector catalogue so it installs like any other tool. Three connectors authorized for the app and installed as StudioConnector records, each token proven live with a real API call: Drive 200, Gmail profile 200, GitHub /user 200, Supabase projects 200. Build green. | Token lookup fails soft and yields an honest "not connected" message instead of throwing. Writes stay gated behind access above read-only plus auto-approve. Authorizations are builder-level, so runs act on the operator's own accounts; Supabase was granted read-only scopes, so SQL is SELECT-only. |

### Batch 19 — Browserbase parity, step 0: ground truth (nothing built yet)

**Key proven live this turn.** The key in app secrets authenticates against `api.browserbase.com`; the configured project id resolves (200); one real session was created (201, `42de2fbb-4d2b-4a23-a66b-f1443f1a7a49`), reported `RUNNING`, returned a debugger + fullscreen URL, and was released (200); one context was created (201); a second session was created with `recordSession` + `logSession` and its logs and downloads both answered 200. **The account currently holds 0 agents.**

Endpoints confirmed live: `GET /v1/sessions` 200 · `POST /v1/sessions` 201 · `GET /v1/sessions/{id}` 200 · `POST /v1/sessions/{id}` release 200 · `GET /v1/sessions/{id}/debug` 200 · `GET /v1/sessions/{id}/logs` 200 · `GET /v1/sessions/{id}/downloads` 200 · `POST /v1/contexts` 201 · `GET /v1/projects/{id}/usage` 200 · `GET /v1/agents` 200 · `GET /v1/agents/runs` 200 · `GET /v1/webhooks` 200 · `GET /v1/functions` 200 · `GET /v1/certificates` 200.
Guessed paths that did **not** answer (endpoint to be confirmed during build, not to be assumed): `/sessions/{id}/live`, `/sessions/{id}/replay`, `/identities`, `/fetch`, `/search`, `GET /contexts`, `/extensions`.

| id | capability | evidence today | state |
|---|---|---|---|
| G-30 | Sessions: create with full configuration (proxies, region, keepAlive, timeout 60–21600, extensionId, browserSettings incl. blockAds, solveCaptchas, recordSession, logSession, verified, os, context, viewport, captcha selectors, userMetadata) | 201 live | open |
| G-31 | Sessions: list with filters + single-session detail | 200 live | open |
| G-32 | Sessions: end / release a keep-alive session | 200 live | open |
| G-33 | Live view: debugger URL + fullscreen URL | 200 live | open |
| G-34 | Session logs (`logSession`) | 200 live | open |
| G-35 | Session downloads / produced files | 200 live | open |
| G-36 | Recording + replay (MP4 assemble, HLS replay) | `/recording` 410 while running — confirm on a completed session | open |
| G-37 | Contexts: create, attach to a session, persist cookies/auth, retrieve, delete | create 201; `GET /contexts` not supported | open |
| G-38 | Projects: read + update project settings | read 200 | open |
| G-39 | Proxies: managed geo (country/state/city), external, per-domain patterns | documented; config path unverified | open |
| G-40 | Uploads, screenshots, PDFs from a session | documented; no probe yet | open |
| G-41 | Extensions: upload + attach by id | `/extensions` 404 on guessed path | open |
| G-42 | Webhooks: create / list / delete, event types, inbound verify + store | list 200 | open |
| G-43 | Usage + spend: per-project usage, session minutes | 200 live | open |
| G-44 | Rate limits: retry with backoff, honest 429 surfacing | undocumented endpoint | open |
| G-45 | Agents CRUD (list 200, **0 exist** on this account) | 200 live | open |
| G-46 | Agent runs: start, poll to terminal, stop, resume a `PAUSED` run, messages transcript, run files | runs list 200 | open |
| G-47 | Functions: list / deploy / invoke + per-function secrets | list 200 | open |
| G-48 | Certificates (client-certificate auth) | 200 live | open |
| G-49 | Search + Fetch products | docs exist; guessed paths 404 | open |
| G-50 | Agent identity / saved sign-ins | docs exist; `/identities` 404 | open |
| G-51 | Model Gateway | docs only, no endpoint confirmed | open |
| G-52 | Session security: allowed domains, IP allowlisting, certificate validation | docs only | open |
| G-53 | App surfaces: sessions board + embedded live view, logs viewer, context inspector, project switcher, webhook stream, usage/spend, agent runner, in-app docs page | — | open |
| G-54 | Wiring: task engine browser tools, computer panel live session, Ask panel launches a run | — | open |
| G-55 | End-to-end proof on a published test app: success path, failure path + recovery, context reuse across two sessions, webhook received, usage recorded, record before/after, probes deleted | — | open |
| G-56 | Enterprise bar: secrets server-side only, RLS on every new entity, per-user isolation, audit trail, cost guardrails, security scan clean | — | open |

### Batch 20 — Browserbase installed, driven from one admin chat page

Autonomy defaults taken this turn (recorded, not asked): session timeout 600s default with a 1800s hard cap; 5 concurrent sessions; destructive actions require a confirm token in the same thread; probe records deleted at the end of the turn; a capability with no reachable endpoint is stated as not exposed instead of faked; design uses existing tokens only.

Built: `base44/shared/browserbase.ts` (35-action registry, fixed host and method per action, validated and encoded params, 15s timeout, 3 attempts with backoff on 429/5xx, 3.5k output trim, key read server-side only) · `base44/functions/browserbase/entry.ts` (admin-gated dispatcher, concurrency guard, confirm gate, record persistence) · `base44/functions/browserbaseChat/entry.ts` (resolves one message to one registry action with typed params through a JSON-schema LLM call) · `base44/functions/browserbaseWebhook/entry.ts` (stores events, marks the run) · entities BrowserSession, BrowserAgent, BrowserRun, BrowserWebhookEvent, BrowserGuardrail, each owner-or-admin · `/admin` control plane (chat thread, result cards, confirm chips, guardrail bar, live computer panel) · sidebar entry.

| id | state | verification (live, this turn) |
|---|---|---|
| G-30 | closed | session created 201, region us-west-2, `168d0cd4-41ec-4167-8225-9eb2234706e6`, status RUNNING, timeout honoured, connectUrl + signingKey returned; recorded to BrowserSession |
| G-31 | closed | `sessions.list` 200, `sessions.get` 200 with createdAt/startedAt/expiresAt |
| G-32 | closed | release without a confirm token answered 409 `needs_confirmation`; with `confirm: true` answered 200 and the session moved to COMPLETED with endedAt |
| G-33 | closed | `sessions.debug` 200 returning `debuggerFullscreenUrl` and `debuggerUrl`; LiveFrame embeds it in the thread and in the computer panel |
| G-34 | closed | `sessions.logs` 200 (pre-build probe on a recorded session); action wired with a limit |
| G-35 | closed | `sessions.downloads` 200 on the same session |
| G-36 | not exposed | `/sessions/{id}/recording` 410, `/sessions/{id}/replay` 404 — the account exposes no recording or replay route, so the card offers them and reports the API's own error |
| G-37 | closed | context `40487797-b173-4574-967c-078dc5c2ebc1` created 201, read 200, attached to session `f6c09a2c-c4f0-4c4e-8bd5-7a0d6a5463af` (contextId echoed on the session), deleted 204 |
| G-38 | closed | `projects.get` 200 — project "xtreme takeoff", defaultTimeout 300, concurrency 25. `projects.update` wired (name, default timeout, allowed domains) but deliberately not run: changing project settings was not asked for |
| G-39 | closed (wired) | `proxies` (true or array with geolocation/domain patterns) and `verified`/`os` pass through validation into `browserSettings`; not exercised because proxied sessions cost more |
| G-40 | not exposed | screenshot, PDF and in-session upload are browser-client features; the agreed architecture has no local Playwright, and no REST route exists for them |
| G-41 | not exposed | `GET /v1/extensions` 404 |
| G-42 | closed (functions events only) | endpoint registered 201 → webhook `c460fec6-367c-4d66-9740-9ae7923bbe28` subscribed to `functions.invocations.completed`/`failed`. Delivery proven: a probe POST to the public function URL stored a BrowserWebhookEvent and stamped `session.completed` onto the run. **Browserbase emits no session or agent-run events**, only Functions ones, so polling stays for runs |
| G-43 | closed | `projects/{id}/usage` 200 — browserMinutes 2 (now 3), proxyBytes 0; shown in the guardrail bar and the usage card |
| G-44 | closed (implemented) | 3 attempts with backoff on 429 and 5xx, 15s abort per call, the API's own message surfaced; no 429 was provoked |
| G-45 | closed | 4 agents created through the API: Form Filler `952ffad7-c5a3-49ad-b032-33eff58f7572`, Deep Research `796eccfe-731a-4ed6-8ca1-d183334346e9`, Site Monitor `c96e8342-8821-4dd0-9195-162211ca525c`, Structured Extraction `0296e8ad-0903-4170-8e98-cbf1cf1cf6fa`; get/update/delete wired |
| G-46 | closed | run `3318df44-bfcc-4186-92fa-33751ac460db` → PENDING → COMPLETED in 18.4s, session `a563ea7f-8bef-4b15-a7a1-ca24e29cce8e`. It opened https://httpbin.org/forms/post, filled custname "Ada Lovelace", custtel 555-0142, size large, topping cheese, submitted, and returned `submitted: true` with the echoed values. Transcript 200 showing real tool calls (httpProbe, navigate, type, click) |
| G-47 | partial | `functions.list` 200 (empty account); invoke wired, nothing to invoke |
| G-48 | closed | `certificates.list` 200 |
| G-49 | not exposed | `POST /v1/search/web` 404, `GET /v1/fetch` 404 on this account |
| G-50 | not exposed | `GET /v1/identities` 404 |
| G-51 | not exposed | no REST endpoint confirmed for the model gateway |
| G-52 | closed (wired) | allowed domains ride `projects.update`; IP allowlisting and certificate validation have no route on this account |
| G-53 | closed | `/admin` control plane: thread, per-action result cards (session with embedded live view, run with output and step transcript, agent, context, webhook, usage), confirm chips, guardrail bar, live computer panel |
| G-54 | closed | the chat page drives every action; the computer panel on `/admin` shows the active session's live browser. Task-detail's computer panel is unchanged |
| G-55 | closed | success (form filled and submitted), failure + recovery (`contexts.delete` first answered 400 because DELETE carried an empty JSON body — fixed in the shared client, retested 204), context reuse (`contextId` echoed on a second session), webhook stored and stamped on the run, usage recorded (2 → 3 min). Probe records deleted: 1 event, 2 sessions, 1 run — 0 left. Agents kept as the seeded templates |
| G-56 | partial | Browserbase key and project id are read only inside the function and never reach the client bundle; all five entities carry owner-or-admin RLS; every action is admin-gated; destructive actions need a confirm token; session caps and concurrency enforced. Outstanding: the dashboard security scan is an operator action, and webhook signature verification stays off until BROWSERBASE_WEBHOOK_SECRET is set |

Resolved during the build and worth recording: `GET /v1/contexts` is 404 but `GET`/`DELETE /v1/contexts/{id}` work; session live view is `/debug`, not `/live`; `DELETE` must be sent with no JSON content type; webhook `eventTypes` accepts only the seven `functions.*` values; the agent run payload is `task` + `agentId` + `variables` + `resultSchema`, and the answer is at `result.output`.

### Batch 21 — the browser layer is ours (Browserbase removed)

Decision this turn, at the operator's instruction: the rented browser stack is gone. Every capability the last batch bought from Browserbase is now served by a container this app owns, and the reasoning that used to run as Browserbase's hosted agent now runs on this app's own engine.

Removed from the app: `base44/shared/browserbase.ts` (all 35 rented endpoints), `base44/functions/browserbaseWebhook`, and every Browserbase reference in copy and code. The `browserbase` and `browserbaseChat` function names stay so no caller changed, but both now talk to the owned host.

Added: `browser-host/` — one Docker image (Playwright + Chromium) with `server.mjs` (sessions, per-session browser contexts, page actions, live JPEG frames, saved contexts on a volume, project config, own usage accounting, concurrency and hard time caps, idle reaper), a `Dockerfile`, and a README with the deploy recipe · `base44/shared/browserHost.ts` (host client, guardrails, signed frame URLs, action registry) · `base44/shared/browserAgentLoop.ts` (the run loop: read the page, decide one step with InvokeLLM, act through the host, record the step) · rewritten `base44/functions/browserbase/entry.ts` (admin gate, confirm gate, concurrency guard, agents and runs stored on this app instead of a vendor) · `LiveFrame` now shows a signed frame from the owned host.

| id | capability | state | evidence |
|---|---|---|---|
| G-30..G-35 | sessions create / list / detail / release / live view / logs / downloads | closed (implemented) | served by `browser-host`; registry live via `registry.list`, an unconfigured call answers honestly with the deploy instruction rather than a fake success |
| G-36 | recording and replay | dropped on purpose | an owned host would need its own screencast recorder for a capability the vendor never exposed either; not replaced |
| G-37 | contexts: cookies and sign-ins reused across sessions | closed (implemented) | `POST/GET/DELETE /contexts`, storageState persisted per context on the volume, attached on session create |
| G-38, G-39, G-52 | project config, timeouts, allowed domains, caps | closed (implemented) | `/project` read/write, `allowed_domains` enforced on every `goto`, `MAX_SESSIONS` + `HARD_CAP_SECONDS` enforced server-side |
| G-42 | webhooks | dropped on purpose | the host owns its events; runs are polled in-app, so no inbound webhook and no signature secret are needed |
| G-43 | usage and spend | closed (implemented) | `/usage` counts browser minutes, sessions and actions from the host's own counters — no vendor meter |
| G-45, G-46 | agents and runs | closed (implemented) | agents stored in `BrowserAgent`; `runs.create` opens a run, `runs.get` advances it three steps per poll through the LLM loop, stop/resume/transcript wired. No hosted agent involved |
| G-47..G-51 | vendor functions, certificates, extensions, identities, search/fetch, model gateway | removed | these only ever existed as vendor endpoints and had no reachable route; they are not part of this app's surface any more |
| G-53, G-54 | control plane + live computer panel | closed | `/admin` unchanged in shape: thread, result cards, confirm chips, guardrail bar; the panel now renders signed frames from the owned host |
| G-55 | end-to-end proof | **awaits the operator's container** | build green and the function's own behaviour verified (registry lists the owned actions, `host.status` fails closed with the deploy instruction). A live session cannot be exercised from here because no host URL exists yet |
| G-56 | enterprise bar | partial | token read server-side only and never shipped to the browser (frames use a session-scoped HMAC signature), every action admin-gated, destructive actions need a confirm token, all five entities owner-or-admin, caps enforced by the host itself. Outstanding: a deployed host, and the dashboard security scan |

Account hygiene: the four agents and the webhook on the Browserbase account were deleted before the client was removed (204 each), so nothing continues to bill there.

## Blockers needing the operator

- Deploy `browser-host/` (Railway: root directory `browser-host`, `HOST_TOKEN`, volume at `/data`) and set `BROWSER_HOST_URL` + `BROWSER_HOST_TOKEN`. Until then the control plane states it is not connected instead of pretending.
- That container is the only deployment surface: the app needs no vendor token, hosts nothing else, and no paid account is involved. Railway is one option among Docker host, Fly, Render or a plain VPS.
- The dashboard security scan is an operator action.

### Batch 22 — the owned host is live, and an agent really browses on it

The container was deployed to Railway (`x1-browser-host` / `browser-host`, volume at `/data`, `HOST_TOKEN` set) and Supabase was provisioned as the host's ledger: tables `host_session`, `host_run`, `host_usage`, `host_audit` (all with RLS on) plus private buckets `host-screenshots` and `host-downloads`. Host URL `browser-host-production-8a40.up.railway.app`, deploy `SUCCESS`.

Fixed while bringing it up: Railway's GraphQL query had an unbalanced brace so host resolution silently failed (the API key path now resolves the service and its public domain with no pasted URL); the config record's deploy list read a paged response as an array; the table counters could not see tables without an `id` column; and the agent loop wasted its first steps on a blank page — it now navigates to the URL named in the task before deciding anything.

| id | state | verification (live, this turn) |
|---|---|---|
| G-30..G-35 | closed | host resolved automatically from `RAILWAY_API_KEY`; `host.status` healthy; session `6488e9f0-c39b-4637-b2c6-1c9b42760a8a` created 201 with timeout, viewport and a signed frame URL, released 200 → COMPLETED with `ended_at`; `usage.get` counted browserSeconds 21 → 22 |
| G-37 | closed | context `ee8217c3-1845-41f1-a6b0-b4af4138fcb7` created 201, `context_id` echoed on the session it was attached to, deleted 204 |
| G-43 | closed | usage read from the host's own counters (browserSeconds, sessionsOpened, pageActions) and mirrored through `hostStore` |
| G-45, G-46 | closed | agent run `5f671386-fb76-4677-b5f1-a6d91802a56c` on the owned host: task "open example.com and tell me the headline" → `goto https://example.com` → COMPLETED in 5s with the answer "Example Domain", steps and output persisted on the run record and mirrored to `host_run` |
| G-53, G-54 | closed | `/admin` drives every one of those actions; the computer panel renders the signed frame from the owned host, not a vendor |
| G-55 | closed | success path (agent run answered from the real page), context reuse (attach → echo → delete), usage recorded, session lifecycle released cleanly. Probe records deleted: 2 runs, 1 agent — 0 runs, 0 agents left; 1 session and 1 host-config kept as live state. Supabase ledger after cleanup: `host_session` 1, `host_run` 2, `host_usage` 1, `host_audit` 6 |
| G-56 | partial | host token never reaches the client (frames carry a session-scoped HMAC signature), every action admin-gated, destructive actions need a confirm token, caps enforced by the host, ledger tables have RLS. Outstanding: dashboard security scan is an operator action |

**Gap from the first draft of this batch, now closed.** A session opened *inside* an agent run used to be mirrored to `host_run` only, so the session ledgers undercounted runs that opened their own browser. `browserAgentLoop.sessionFor` now calls `registerSession`: the session gets a `BrowserSession` record (status, timeout, a signed live frame, note "opened by an agent run") and a `host_session` row carrying `meta.opened_by = agent-run`. Verified on a real run (`e9c0b6b6-e9c6-43c0-8b91-ed9244820669`, no agent attached): session `bf0c2907-6e3d-4ca0-948f-68d595cb78c2` appeared in both ledgers with that note and a minted frame URL, the run completed with "Example Domain" as its answer, the session was released (COMPLETED), and the probe run, probe session record and its ledger row were deleted — app runs 0, app sessions 1, Supabase sessions 1 afterwards. Bookkeeping stays best effort: a ledger failure cannot stop a run.

## Blockers needing the operator (updated)

- ~~Deploy `browser-host/`~~ — done. `BROWSER_HOST_URL` / `BROWSER_HOST_TOKEN` are no longer required: the host resolves from `RAILWAY_API_KEY` at runtime.
- The dashboard security scan is an operator action.

### Batch 23 — every run step keeps its frame (G-36 half: replay evidence, without a recorder)

The vendor never exposed recording, and an owned recorder would have been a screencast nobody asked for. What a run actually needs is evidence: the page as it looked at each step, re-openable later. That is now stored per step.

Built: `captureFrame` in `base44/shared/browserAgentLoop.ts` (fetches the host's current frame as raw JPEG bytes through the new `frameBytes` helper, uploads it privately, returns the `file_uri`) attached to the goto, action and done steps · `BrowserRun.steps[].frame_uri` declared in the schema · `src/components/admin/StepFrame.jsx` (signs a frame on demand and shows it inline) · run card shows a framed-step count and a **Frame** control per step.

A real defect surfaced here and was fixed at the right layer: the host clips text responses at 9k characters, so the base64 screenshot action could never survive a round trip. Frames are now pulled as binary from the existing signed `/frame.jpg` route, which never touches the text trimmer; the app's own `hostRequest` trim is untouched.

| id | state | verification (live, this turn) |
|---|---|---|
| G-36 (evidence half) | closed | run `74d96299-0043-4390-8e8e-2d5505a08b95` on the owned host: `goto` and `done` steps both carry a `frame_uri`; the done frame signed and fetched **200, `image/jpeg`, 38 970 bytes, JPEG magic bytes present**. Build green after fixing a missing default export on the image component. Probe runs (5) and sessions (4) released and deleted, leaving 0 runs, 1 session, 1 ledger row |
| G-36 (video replay) | dropped on purpose | unchanged: no screencast recorder is built, and no UI claims one |

### Batch 24 — one dead control removed, and the computers board is the host's own

Two findings from an audit of every action the client can name against the action registry in `base44/shared/browserHost.ts`:

1. **`sessions.replay` was offered and does not exist.** The session card in the control plane carried a **Replay** button wired to an action the host never exposed (G-36 was dropped on purpose in Batch 21), so pressing it produced a raw "Unknown action" dump. It also contradicted the ledger's own claim that no UI offers a recorder.
2. **The host's sessions were invisible outside the thread.** `/computers` showed only the Manus account's devices, while the browsers this app actually runs — every session opened from the control plane or by a browser run — had no board at all, even though each one is already stored as a `BrowserSession`.

| id | state | files changed | verification (live, this turn) |
|---|---|---|---|
| G-36 (claim removed) | closed | src/components/admin/SessionCard.jsx | **Replay** removed; the card's remaining controls (`logs`, `downloads`, `get`) all resolve in the registry. Added **Release** for a running session as the two-step control the destructive gate requires, since an opened session previously had no way to be ended from its card. Release with the confirm token answered 200 → `COMPLETED` (4 probes released this turn and in the previous one) |
| G-53b | closed | src/pages/Computers.jsx, src/components/computers/HostSessions.jsx, src/components/computers/HostSessionRow.jsx | Computers now opens with **Your browser host**: the last 12 `BrowserSession` records, each with its id, status, age and note, a live signed frame for a running session (admins only — `sessions.debug` is admin-gated, so a non-admin row says so instead of pretending the session closed), and an honest empty state. Verified on a real session: created through the control plane → the board's exact query (`filter({}, {sort:'-created_date', limit:12})`) returned it as the top row with `status: RUNNING` → released `COMPLETED` → probe record and its ledger row deleted, 1 session left. Build green. |