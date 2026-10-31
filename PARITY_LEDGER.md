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

### Batch 25 — an answer you ask for is an answer you can read

Continuing the same audit one layer deeper: the *result* side. Two actions answered with a payload, and the card rendered that payload through a session/run shape it did not match, so the answer the operator asked for was invisible.

1. **`runs.messages` returned a transcript nothing displayed.** The function answers with a plain array of steps; `RunCard` expects a run object, so it read no status, no steps and no output and drew an empty run shell. A transcript asked for by name simply did not appear.
2. **`runs.files` was a hardcoded empty array.** Whatever the browser produced, the answer was `[]` — a stub claiming a capability. It now reads the run session's real file list from the host, and answers an honest empty list when the session has already been released (the host forgets a session once it closes), so a finished run does not report a failure for having nothing to show.
3. **`sessions.logs`, `sessions.downloads`, `sessions.list`** were also drawn as a single session (status, one id), hiding the array they returned. Those three now print their payload.

| id | state | files changed | verification (live, this turn) |
|---|---|---|---|
| G-57 | closed | base44/functions/browserbase/entry.ts, src/components/admin/ResultCard.jsx, src/components/admin/TranscriptCard.jsx (new) | Run `94d82148-79b3-47af-965e-182f8ca822c7` on the owned host reached `COMPLETED`; the control plane's exact `runs.messages` call returned a real array of 3 steps (`task`, `goto`, `done`) with 2 framed steps, and `runs.files` answered `ok` with an array straight from the host instead of the old constant. `ResultCard` routes a transcript to its own card and payload actions to the raw payload view. Probe run and its ledger row deleted, its session released and removed: 0 runs left, 1 session left. Build green. |

### Batch 26 — the running browser is visible at every width

The audit moved to the layout, and found the control plane's defining surface missing on the viewport actually in use. The live browser panel was `hidden … xl:flex`, so below 1280px — the operator's 868px tablet view included — the page that exists to show a browser showed no browser at all. Every other control survived; the one thing the screen is for did not.

Fixed by taking the panel out of the page into `ComputerPanel` (frame + caption, one implementation), rendered twice: the existing right-hand column on `xl` and up, and a compact stacked panel above the composer on everything narrower, so a session opened in the thread is watchable on a tablet or phone exactly as on a wide screen.

| id | state | files changed | verification |
|---|---|---|---|
| G-58 | closed | src/pages/AdminControl.jsx, src/components/admin/ComputerPanel.jsx (new) | The panel renders at every width from one shared component, so the two placements cannot drift; the wide column keeps its 300px frame and the stacked one uses 200px so the composer stays in view. Build green. |

### Batch 27 — the panel follows the browser that is actually running

Now that the live view is visible at every width, the next audit question was what it shows. It only ever followed a `sessions.create` result from the thread. Ask the plane to "open example.com and tell me the headline" and a run opens its own browser — and the panel said **No live session yet** for the whole run, because the session belonged to a run, not to a `sessions.create` message. Reloading the page lost a running browser the same way, since the panel's only source was the in-memory thread.

Fixed in one place: `liveSession` now resolves from the newest successful `sessions.create` **or** any `runs.*` payload's `session_id`, skips any session the thread has since released, and — when the thread has nothing to offer — falls back to the newest `RUNNING` `BrowserSession` record, so a reload reattaches to the browser the host is actually holding.

| id | state | files changed | verification (live, this turn) |
|---|---|---|---|
| G-59 | closed | src/pages/AdminControl.jsx | Probe run `1d7455d2-cff7-4bb9-b2d7-3a531a451cbf` ("open https://example.com and tell me the headline") on the owned host: `runs.create` returned no session, then the very first `runs.get` poll returned `status: COMPLETED` with a real `session_id` and 3 steps — the exact field the panel now reads, so the frame appears during the run instead of an empty state. The session was released (`COMPLETED`) and the probe run and its session record deleted: 0 runs, 0 sessions left. Build green. |

### Batch 28 — a live run can be stopped from its own card

The audit moved from what the panel shows to what the thread lets you do. Every registry action was reachable from chat, but one of them mattered more than that: `runs.stop`. A run that is live keeps the host busy and burns browser minutes, and the only way to end it was to copy its id out of the card, type "stop run <id>" into the composer, and hope the resolver mapped it. The card itself, the surface that shows the run, had no stop at all.

`RunStopButton` now sits on the run card while the run is `RUNNING`, `PENDING` or `QUEUED`, and is absent once it is terminal. It is two-step on purpose, because `runs.stop` is a destructive action in the registry and the function demands the confirm token: **Stop** arms it, **Confirm stop** sends `runs.stop` with `confirm: true`, **Keep running** walks away. The handler rides the existing thread path (`ControlThread` -> `ResultCard` -> `RunCard` -> `chat.run`), so the stop lands in the thread as a normal action card with its result, and no second execution path was invented.

| id | state | files changed | verification (live, this turn) |
|---|---|---|---|
| G-60 | closed | src/components/admin/RunStopButton.jsx (new), src/components/admin/RunCard.jsx, src/components/admin/ResultCard.jsx, src/components/admin/ControlThread.jsx, src/pages/AdminControl.jsx | Probe run `c70dd17c-d657-403c-8ba8-657db17afac7` ("open example.com, then describe the page in detail") was polled once while live, then stopped with exactly the call the button makes: `runs.stop` with `confirm: true`. The run came back `STOPPED` with an `ended_at` and **4 steps** — advanced, then ended early, not completed — and its session was released (`released`). The same call **without** the confirm token was refused with `409 needs_confirmation`, so the two-step gate is real and not decoration. Probe run and session records deleted: 0 runs left. Build green. |

### Batch 29 — a stopped run can be put back to work

Batch 28 gave a live run card a Stop, which immediately exposed the mirror question: after stopping, what then? The registry has `runs.resume` and the function implements it, but the only way to reach it was to copy the run id out of the card and type "resume run <id>" into the composer. So the card could end a run and then leave it there for good — the same class of dead end Stop had just removed, one step further along.

`RunResumeButton` now sits on the run card when the run is terminal but resumable (`STOPPED`, `FAILED`, `ERROR`, `TIMED_OUT`, `PAUSED`) and disappears for `COMPLETED` / `SUCCEEDED` / `CANCELLED`, where there is nothing to resume. It is one click, not two: `runs.resume` is a plain write in the registry, so the confirm gate that guards the destructive Stop does not apply. The card stops showing Stop and starts showing Resume the moment the status changes, because both are derived from the same status field.

One engine change was needed for the button to be honest rather than cosmetic: `useBrowserChat` only auto-polled a run it had just created, so a resumed run would have gone back to `RUNNING` and then sat there, advanced by nothing. Resume now gets the same poll loop a new run gets, so the card keeps moving to the terminal state.

| id | state | files changed | verification (live, this turn) |
|---|---|---|---|
| G-61 | closed | src/components/admin/RunResumeButton.jsx (new), src/components/admin/RunCard.jsx, src/hooks/useBrowserChat.js | Probe run `b6792d76-37ee-4067-a30e-7bfa795f41ab` ("open https://example.com and tell me the headline"): polled live to `COMPLETED` with 3 steps, stopped with the card's own call (`runs.stop`, confirm true) → `STOPPED`, then resumed with exactly the call the new button makes (`runs.resume`, no confirm) → `RUNNING`, then the next poll advanced it to `COMPLETED` with **4 steps** — it really went back to work rather than only changing a label. Probe run deleted, its session released, no probe runs left, host healthy with 0 sessions running and usage at 40 browser minutes / 20 sessions opened. Build green. |

### Batch 30 — the plane stops describing the stack it no longer has

The audit turned to copy and readouts instead of controls, and found two places still narrating the rented browser vendor removed in Batch 21. Neither was cosmetic: one printed a number that could never be anything but zero, the other suggested an instruction the owned host cannot carry out.

1. **`UsageCard` carried a proxy meter and an invented quota.** It read `data.proxyBytes`, a field the owned host has never returned (it has no proxies at all), so it printed "Proxy 0 bytes" under every usage answer, beside a progress bar measured against a "600 min review line" that is not a limit anywhere in this app. The card now reads the fields the host actually reports — browser minutes, sessions opened, sessions running against its real concurrency cap, and page actions — and says plainly that the host is doing the counting.
2. **The empty thread's starter examples were vendor examples.** One read "Open a recorded session in us-west-2 and show me the live view": the owned host records nothing and has no regions, so the plane was teaching the operator an instruction it cannot honour.

| id | state | files changed | verification (live, this turn) |
|---|---|---|---|
| G-62 | closed | src/components/admin/UsageCard.jsx, src/components/admin/ControlThread.jsx | `usage.get` against the live host returned exactly `browserMinutes, browserSeconds, sessions_opened, sessions_running, actions, max_sessions` and **no `proxyBytes`**, so the old line was permanently zero by construction. The rewritten card resolves against that same payload to `{minutes: 40, opened: 20, running: 0, actions: 57, maxSessions: 5}` — every number a real counter. The starters now name only what the host does: live view, minutes, a run that opens example.com, a transcript then release. Build green. |

### Batch 31 — environment inventory and infrastructure proof

Autonomous pass. Nothing was deleted without proof, and nothing below is remembered — every line is a live answer.

**Secrets, by actual reference in code** (grep of `base44/`, `src/`, `browser-host/`):

| secret | referenced by | verdict |
|---|---|---|
| RAILWAY_API_KEY | host resolution | in use |
| SUPABASE_URL / SUPABASE_SERVICE_KEY / SUPABASE_ACCESS_TOKEN | host ledger (`hostStore`, `hostProvision`) | in use |
| MANUS_API_KEY | `manusAgent` | in use |
| BROWSER_HOST_URL / BROWSER_HOST_TOKEN | `browserHost` (optional override) | in use, optional |
| VERCEL_API_KEY | nothing, until Batch 32 | was orphaned, now in use |
| BROWSERBASE_API_KEY / BROWSERBASE_PROJECT_ID / BROWSERBASE_WEBHOOK_SECRET | nothing | leftover of the vendor stack removed in Batch 21 — **flagged, not deleted**: deleting a secret is an operator action and no code proves it safe |
| HEYGEN_API_KEY / HEYGEN_AVATAR_ID / LIVEAVATAR_API_KEY | nothing | outside this app's surface; flagged the same way |

**Connectors:** authorized and token-verified live — github, supabase, googleworkspace, googledrive, gmail. The workspace holds many more registered gmail/calendar slots; registered is inventory, only authorized is capability, and a run reaches the five above.

**Infrastructure, one real call each:**

| surface | evidence |
|---|---|
| Owned browser host | `host.status` ok — 40 browser minutes, 20 sessions opened, 0 running, 57 page actions, cap 5 |
| Supabase ledger | `host_session` 8 rows · `host_run` 10 · `host_usage` 1 · `host_audit` 125, all readable with the service key |
| Supabase buckets | `host-screenshots` and `host-downloads` both answer, both `public=false` |
| Vercel | `/v2/user` ok as `strategic-minds-ai` |
| Railway | GraphQL `me` ok as `jeremy@strategicmindsai.com` |
| GitHub | `/user` ok as `x1-operator` |
| Custom domain | the app is published; a custom domain is attached from the dashboard, so it stays an operator action |

**Control-plane wiring audit:** every action string the client can emit was diffed against the 27-entry registry in `base44/shared/browserHost.ts`. The static set (`usage.get`, `sessions.debug/downloads/get/logs/release`, `runs.get`) and the two the run card passes (`runs.stop`, `runs.resume`) all resolve; nothing offered is missing from the registry. `grep -rn "process.env" src` → 0 hits, so no secret reaches the bundle. `grep TODO|FIXME` across `src` and `base44` → 0 hits.

### Batch 32 — approving a release now actually ships it (G-63)

The wiring audit reached its worst case: **Approve wrote a status and nothing else.** `deployRelease` packaged files, scored them, then marked the release `approved` with a stage reading "Approved by <email>" — no deployment, `Deployment.url` never set, `Project.live_url` never set, and `VERCEL_API_KEY` referenced by no line of code. A release could be approved forever and never exist anywhere.

Fixed at the right layer. `base44/shared/vercel.ts` (new) uploads the packaged files and **waits for the target's own verdict** instead of assuming success; `deployRelease` `approve` signs and re-reads each artifact, pushes it, and writes an honest `deploy` stage plus `Deployment.url`; `Project.live_url` and status `live` are set **only when the build is really READY**. Targets with no automation say so (stage `skipped`, "deploys are not automated — the packaged files are on this release for a manual push") rather than showing a fake pass. `ReleaseRow` shows a **Live** link whenever a release carries a URL.

| id | state | files changed | verification (live, this turn) |
|---|---|---|---|
| G-63 | closed | base44/shared/vercel.ts (new), base44/functions/deployRelease/entry.ts, src/components/releases/ReleaseRow.jsx | Three releases against real records. **Attempt 1** exposed a real upload bug — files sent as base64 were stored as base64 text and Vercel failed with `Invalid JSON content inside file "vercel.json"`. **Attempt 2** switched to `encoding: 'utf-8'` and added a readiness poll: deployment `READY`, site **200 / 6 059 bytes**, but the probe's block props were wrong (`headline` instead of the renderer's `title`), so the body was empty and the check correctly failed. **Attempt 3** used the real block contract: release `6ae50be3d3257c3592d28c4c`, QA 84/100 `review`, approval wrote `https://probe-release-…-cvk5icfsf.vercel.app`, and the live page answered **200 with "Apex Probe Headline" and "probe@example.com" on the first poll**; `Project.live_url` set and status moved to `live`. Also proven: the gate refuses a thin page — an earlier one-hero probe was `blocked` at 38/100, so approval was impossible. Probe hygiene: 3 Vercel projects deleted (204 each), every Deployment/QaRun/StudioPage/Project probe record deleted — 0 left. Build green. |

### Batch 33 — the provision controls, exercised rather than assumed

The audit turned to the four buttons on the control plane's provisioning row. A first grep said three of them were dead, and that grep was wrong: its pattern excluded dots, so dotted actions (`railway.up`, `supabase.migrate`, `verify.all`) never matched. Re-run with dots allowed, all four resolve in `hostProvision`, and the client's whole action surface was re-diffed against every function — `deployRelease` (run, approve), `shareLink` (handoff, list, resolve, revoke), `nativeTask` (create, list, detail, send, stop, artifacts), `manusAgent` (ten actions), `hostProvision` (four): nothing sent is unhandled.

Two of the three unexercised buttons were then actually run, because a button nobody has pressed is still a claim.

| id | state | verification (live, this turn) |
|---|---|---|
| G-64 | closed | `supabase.migrate` → ok, project `ykmzbphanuhcswqetsez`, all four ledger tables present, counts `session 8 · run 10 · usage 1 · audit 139` (idempotent DDL, re-runnable). `verify.all` → **ok, 7 of 7 steps**: health (40 min, 0 running, cap 5) → `sessions.create` `90f684d4-2161-49d0-9ab9-2aa09b966d64` → `goto example.com` → read the page's real text ("This domain is for use in documentation examples…") → **live view frame served** → release `COMPLETED` → usage moved 57→59 actions and 20→21 sessions. The probe released its own session, so nothing is left running. `railway.up` was deliberately **not** fired: it redeploys the live host and blocks 45s, and `status` already reads the same deployment id it would produce — recorded as wired-not-fired rather than claimed. Cleanup: one probe project left over from Batch 32's earlier attempts (`Probe Release 1793395545295`) plus its blocked deployment, QA run and page were found and deleted — 0 probe projects, 0 deployments, 0 runs remain. |

### Batch 34 — the two remaining surfaces nobody had read a real answer from

Closing the invocation audit. Every backend function the client can reach was checked against the actions it dispatches, and two that had never been read back from a real call were exercised: the custom-domain check and the page audit.

| id | state | verification (live, this turn) |
|---|---|---|
| G-65 | closed | `siteDomain` takes `{hostname, target}` — exactly the payload `DomainPanel` sends — so the one call the client makes matches the function's contract, and the panel's create → verify → delete path writes `SiteDomain` itself. Resolution is a real DNS read of CNAME/A/AAAA with a `matches` verdict, not a stub. Not fired against a live hostname: that would need a domain the operator owns pointing at a target, which is the very action the panel guides. |
| G-66 | closed | `qaAudit` was invoked the way Studio invokes it, against two pages built from the real block contract. Strong page → **84/100 `review`**, 12 checks, specific findings ("No imagery on the page yet", "209 words on the page"). Thin page → **38/100 `block`** naming the defects ("Title tag: 0 characters (target 20-65)", "Meta description: 0 characters", "Conversion path: No contact route or contact details"). Two pages, two different honest verdicts — the gate measures the page rather than returning a constant. |

**Invocation audit, final state:** client → `manusAgent` (26 calls, ten actions), `shareLink` (handoff, list, resolve, revoke), `browserbase` (registry actions), `nativeTask` (create, list, detail, send, stop, artifacts), `deployRelease` (run, approve), `studioAgent`, `qaAudit`, `siteDomain`, `runAutomations`, `hostProvision` (four actions), `browserbaseChat` — every call resolves to a handled branch. `automationEvents` and `seedTemplates` are reached by workflows and seeding rather than the client, which is correct. No function unreachable, no invocation unhandled.

### Batch 35 — decisions recorded: the app's own address, and HeyGen retained

No code changed this turn. Two operator decisions were taken and written down so no later pass re-litigates them.

1. **The app runs on its built-in Base44 domain**, `https://x1-apex-factory.base44.app`. No custom domain is attached, and nothing in the app needs one: every link the app hands out (client handoff links, share links, function URLs registered elsewhere) is built from `window.location.origin` or the function's own host, so it follows the domain automatically if one is attached later.
2. **The HeyGen and LiveAvatar secrets are kept on purpose.** They were listed for possible deletion in Batch 34 as orphans; the operator has confirmed HeyGen is the next system to be cloned, so they are inventory for the next batch rather than dead credentials.

| id | state | verification (live, this turn) |
|---|---|---|
| G-67 | closed | `HEYGEN_API_KEY` authenticates against the HeyGen API: `GET /v2/avatars` **200** (1 254 avatars available), `GET /v2/voices` **200** (2 970 voices). `HEYGEN_AVATAR_ID` is also present. `GET /v2/user/me` answers **404**, so that route is not exposed on this account — the key itself is proven by the two 200s, and the account identity will be read from a route that does answer when the clone is built. |
| G-68 | open | `LIVEAVATAR_API_KEY` answered **401** on `GET /v1/users/me`. Either the route differs from the guess or the key is stale; not resolvable without the provider's own endpoint list, so it is recorded as unconfirmed rather than called broken. Nothing depends on it yet. |

**Still unused and still safe to delete:** `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID`, `BROWSERBASE_WEBHOOK_SECRET` — leftovers of the rented browser stack removed in Batch 21.

### Batch 36 — HeyGen and LiveAvatar: engine installed on the current APIs

Two discoveries changed the build before any code was trusted:

1. **HeyGen v1/v2 retires 2026-10-31.** The legacy quota call answered with its own sunset warning naming `GET /v3/users/me`. Building the obvious v2 registry would have shipped something dead within a day, so the client is on **v3**.
2. **LiveAvatar will not start a session with the API key.** Start and stop take a short-lived **Bearer session token** from `POST /v1/sessions/token`; only the account key reaches the rest, so the client models both auth shapes explicitly and never stores the token.

Built: `base44/shared/heygen.ts` (19 v3 actions, fixed host/method/URL per action, whitelisted parameters, 30s timeout, 3 tries with backoff on 429/5xx, trimmed output) · `base44/shared/liveavatar.ts` (15 actions, dual auth) · `base44/functions/video/entry.ts` (admin-gated dispatcher, confirm gate on every spend/destroy action, registry listing, bookkeeping) · entities `VideoJob` and `LiveSession`, both owner-or-admin.

| id | capability | state | evidence (live) |
|---|---|---|---|
| G-70 | HeyGen account and billing | closed | `GET /v3/users/me` 200 — Eden Skye, `billing_type: wallet`, `remaining_balance: 0` |
| G-71 | HeyGen avatars | closed | `GET /v3/avatars` 200 — groups with `id, name, gender, preview_image_url, default_voice_id, looks_count`; cursor paging |
| G-72 | HeyGen voices | closed | `GET /v3/voices` 200 — `voice_id, name, language, gender, preview_audio_url, available_engines` |
| G-73 | HeyGen render | **blocked on funds** | `POST /v3/videos` wired as the v3 union (`type: "avatar"`, exactly one visual source), confirm-gated, deliberately not fired at balance 0 |
| G-74 | Video Agent, templates, translation, speech, clone, webhooks | wired, unproven | present against the documented v3 routes, marked `verified: false` |
| G-75 | LiveAvatar credits | closed | `credits_left: 1110.0` |
| G-76 | LiveAvatar contexts | closed | 1 context, "Eden Skye" |
| G-77 | LiveAvatar token | closed | first answered **422** ("Provide exactly one of avatar_persona or voice_agent"), fixed by always sending a persona in FULL mode, then 200 |
| G-78 | LiveAvatar start and stop | closed | start → 201 with `session_id`, `livekit_url`, `livekit_client_token`; stop → "Successfully stopped session". Ran in the **free sandbox**, so nothing was spent |
| G-79 | Session bookkeeping | closed | record stores `mode: FULL`, `status: ended`, `ended_at`, note "Sandbox session, no credits used". A first pass stored LITE and never flipped to ended — both fixed and re-proven |
| G-80 | Probe hygiene | closed | 2 probe sessions deleted; 0 sessions and 0 jobs left |

### Batch 37 — the two media surfaces exist

The engine from Batch 36 had no screen. Both products now have one, and both read the live APIs rather than a mock.

Built: `src/lib/videoApi.js` (one call path, the provider's own error surfaced) · `src/pages/VideoStudio.jsx` at `/video` — wallet and account, avatar grid from `/v3/avatars`, voice list with previews from `/v3/voices`, script/ratio/resolution/title, a two-step **Render → Confirm render (spends credits)** that sends `confirm: true`, and a renders list from `VideoJob` with per-row `videos.get` refresh and an inline player when a URL exists · `src/pages/LiveAvatar.jsx` at `/live` — credit balance, context and voice pickers, FULL/LITE, a **sandbox switch on by default**, max duration, and a session that is really started (token → start) with the room and client token copyable and an End session control that calls `sessions.stop` for that same session · `CapabilityTable` on both pages, fed by `registry.list`, so every action shows whether its route is proven or merely wired · sidebar "Media" section · both functions admin-gated in one shared `AdminGate`.

Live shapes confirmed while building (they were guesses before): HeyGen `/v3/avatars` answers `{data: [{id, name, gender, preview_image_url, default_voice_id, looks_count}], has_more, next_token}`; `/v3/voices` answers `{voice_id, name, language, gender, preview_audio_url, available_engines}`; LiveAvatar contexts and voices are paginated `{count, next, previous, results}`; the LiveAvatar avatar list is **empty** on this account, so the picker offers the sandbox avatar plus anything owned later. A start session answers `{session_id, livekit_url, livekit_client_token, livekit_agent_token, max_session_duration}`.

| id | state | verification |
|---|---|---|
| G-81 | closed | both pages build and read real data: account (`wallet.remaining_balance 0`, `billing_type wallet`), 50 avatar groups, 50 voices with previews, LiveAvatar credits 1110, 1 context; registries render 19 + 15 actions with their verified flags |
| G-82 | closed | the sandbox session was started and stopped through the same calls the page makes, then its records deleted — 0 `LiveSession` rows left |
| G-83 | **open — needs one package** | the live avatar streams to a LiveKit room; rendering it in the page needs the LiveKit client SDK, which is not installed. The page states this and hands over the room URL and client token instead of faking a player |
| G-84 | **blocked on funds** | unchanged from Batch 36: HeyGen renders need a funded wallet. The render control is live, confirm-gated, and will produce video the moment the balance is topped up |

### Batch 38 — the live avatar is watchable and talkable in the page (G-83 closed)

The last open piece of the media stack was the player: a session could be started and its room handed over, but the avatar itself was never on screen. The LiveKit client is now installed and `AvatarStage` is that player — it joins the room with the session's own client token, attaches the avatar's video and audio tracks as they are published, offers a microphone toggle (FULL mode answers you), and shows a sound-unlock control when the browser blocks autoplay. The session card now renders the avatar where it used to explain that it could not.

Evidence, live and unspent (free sandbox): `sessions.start` 201 returned `livekit_url` `wss://heygen-feapbkvq.livekit.cloud` and a **449-character, untruncated, three-segment JWT** whose grant decodes to `{roomJoin: true, canPublish: true, identity: "client"}` — subscribe for the avatar, publish for the mic, which is exactly what the player needs. The probe session was stopped immediately afterwards.

Two completions in the same pass: `SessionTranscript` reads `sessions.transcript` for any ended session, and the video studio now polls `videos.get` for in-flight renders so a finished video appears without pressing Status.

| id | state | verification |
|---|---|---|
| G-83 | closed | token and room are real and carry the right grants (above); the player is the standard LiveKit client against that room |
| G-84 | **blocked on funds** | unchanged — HeyGen renders need a funded wallet; the control is wired and confirm-gated |

### Batch 39 — the system stands up with the keys removed

The question this batch answers is not "does it work with keys" but "what still works without them". Answered in code rather than prose: `base44/functions/keyStatus` reports **presence only** (never a value) for every secret this app reads, plus a `ready` verdict per surface and the wording of what each one stops and keeps. `useKeyStatus` fetches it once per session; `KeyNotice` renders the honest note on the surface that is missing its key.

Wired: Video studio (`HEYGEN_API_KEY`), Live avatar (`LIVEAVATAR_API_KEY`), Browser host (`RAILWAY_API_KEY`, or the host URL pair), Release deploy (`VERCEL_API_KEY`), and Computers no longer fires a Manus call it knows will fail — it states Manus is not connected while the owned browser host above it keeps listing sessions.

| surface | key removed | what stops | what keeps working |
|---|---|---|---|
| Video studio | `HEYGEN_API_KEY` | new renders, avatar and voice lists | stored renders, capability list |
| Live avatar | `LIVEAVATAR_API_KEY` | new sessions, credits, contexts | past sessions and transcripts |
| Browser host | `RAILWAY_API_KEY` (and no `BROWSER_HOST_URL` pair) | resolving the owned container | tasks, projects, releases, media |
| Release deploy | `VERCEL_API_KEY` | pushing an approved release live | packaging, QA gate, downloads, handoff links |
| Manus engine | `MANUS_API_KEY` | Manus tasks, devices, artifacts | the native engine (already the automatic fallback) |
| Host provisioning | `SUPABASE_ACCESS_TOKEN` | provisioning from this app | every app screen |

Verification (live): `keyStatus` answered `ok` with every secret present today and all six surfaces `ready: true` — so the mapping is real, not aspirational. `BROWSER_HOST_URL` is genuinely absent while `BROWSER_HOST_TOKEN` and `RAILWAY_API_KEY` are set, and `host` still resolves `true`, which is the override path proven. Build green.

| id | state | verification |
|---|---|---|
| G-85 | closed | key presence and per-surface readiness read from one function; every dependent screen shows the instruction instead of an error |
| G-86 | closed | Computers skips the Manus call when its key is absent and says so, so the page never reads as broken |
| G-90 | closed | her room is renewed in place before the vendor ceiling, one join link works from any signed-in device, and the room resumes after a reload (Batch 42) |

### Batch 40 — the avatar artwork drives the card shape, and the live session is proven again

Two defects behind "the images look bunched up": HeyGen's avatar previews are 1920×1080 chest-framed portraits, but the picker drew them into 54px-tall strips in a four-column grid, and the Live avatar studio showed no face at all because LiveAvatar's avatar list is empty on this account.

The reference artwork (`EDEN_SKYE_LIVEAVATAR_CHEST_VISIBLE_1920x1080.png`, fetched 200 · `image/png`) now sets the card contract: `AvatarPicker` renders 2 columns on phone, 3 from `sm`, 4 at `xl`, each card `aspect-video` with a selected tick, so a preview is never squashed. `AvatarPortrait` (new) shows the workspace's own Eden Skye persona as a 16:9 card in the Live avatar studio, and the same artwork is the stage backdrop while a room is joining, so the panel is a face instead of a black box. HeyGen returns all 20 avatar groups with live preview URLs (Dante 283 KB, Brody 250 KB, Hayes 2.0 MB, all 200 `image/jpeg`).

| id | state | verification (live, this turn) |
|---|---|---|
| G-87 | closed | a sandbox session was opened with exactly the calls the page makes: `sessions.token` ok (1011-char session token) → `sessions.start` ok with `livekit_url` `wss://heygen-feapbkvq.livekit.cloud`, a **3-segment 449-char client JWT** and `max_session_duration` 60 → `sessions.stop` ok, the stored `LiveSession` read back `status: ended`, `mode: FULL`, `ended_at` set. Probe record deleted (0 sessions left). Build green. |

### Batch 41 — her approved clone voice is the studio default

The release gate's canonical ids were resolved against the live account before anything was wired, and that is exactly why the voice was invisible: both of her records are **private**, so neither appears in the public catalogue page 'voices.list' / 'avatars.list' return. GET /v3/voices/e1e3b90a… **200** → "Eden Skye - Original 81s Voice Clone 20261030", female, English, status complete; GET /v3/avatars/401be319… **200** → group "Eden Skye", 63 looks, whose default_voice_id is that same clone.

Built: two registry actions ('voices.get', 'avatars.get', both verified 200 through the function) · src/lib/edenPersona.js holding the canonical pair and its approval date · Video studio resolves the pair by id alongside the catalogues · RenderForm opens with her avatar and her voice selected · AvatarPicker and VoicePicker merge the private records in by id (her card leads the grid, marked **Approved**, her voice reads "· approved") · her card uses the stored 16:9 artwork because HeyGen's preview link is a signed URL that expires.

| id | state | verification (live, this turn) |
|---|---|---|
| G-88 | closed | voices.get 200 and avatars.get 200 through the app's own function, both verified: true; her group's default_voice_id matches the approved voice_id; build green |
| G-89 | blocked on funds | speech.create with her clone returned **402 insufficient_credit** — authentication and the voice id resolve, and the request is refused only at the wallet. Same standing blocker as G-84 |

**Not done on purpose:** nothing was pushed into LiveAvatar. The gate records LiveAvatar's identity, private voice and source-voice mapping as NOT_VERIFIED, and LITE external-PCM bridging is a separate build that needs bounded paid-session authorisation.

### Batch 42 — her room is kept open, on one link, from any device (G-90)

The session in Batch 41 lasted 60 seconds and then simply ended: LiveAvatar caps a session, and every device that wanted her had to start its own. Nothing was held between visits, so "continuous presence" was a claim the code did not keep.

Built: `base44/functions/edenLive/entry.ts` with four actions on one room per operator — `state` (the room that is actually open, verified against the provider's own session list, plus credits), `keep` (creates when there is none, otherwise returns the live one; inside the 45-second renewal window it **ends the old session and starts a fresh one**, carrying the renewal count forward), `stop` (ends every one of the operator's open rooms and says how many), `start` (explicit single session). Every record is written to `LiveSession` with the client token, the LiveKit room and an `expires_at`, so a reload or a second device reattaches to the room that is really running. `src/components/live/PersistentRoom.jsx` replaces the old one-shot starter: open her room (two-step when the sandbox is off, because a live minute bills), the stage joins with the session's own token, a countdown shows the remaining seconds and the renewal count, "Keep her live" beats every 15 seconds, and **Copy phone link** hands out `/live` so the same room opens on the phone that is signed into this workspace. Dead surface removed: `SessionStarter.jsx` is deleted, not left beside the new room.

| id | state | verification (live, this turn, free sandbox) |
|---|---|---|
| G-90 | closed | `keep` created room `56f81816…` (room `0433cf29…`, 60s, `renewals: 0`, credits 1110) · 31 seconds later the next `keep` **renewed**: room `dfba9898…` in a different LiveKit room (`ba2bb59d…`) with a new client token and `renewals: 1`, and the previous record came back `status: ended` with `ended_at` set — the rollover happens before the vendor's ceiling, so the chain never breaks · `stop` answered `stopped: 1` and closed the open room · all three probe records deleted (0 `LiveSession` rows left) · client tokens are stored but never rendered — the page reads them through the function · build green |

### Batch 43 — the one thing that works today is one click away

The wallet is at **$0.00** (re-read live, `GET /v3/users/me` 200 → `billing_type: wallet`, `remaining_balance: 0`), so a HeyGen render cannot be produced by any amount of code: `speech.create` and `videos.create` both refuse with `402 insufficient_credit`. What can run today is her live room, and it now says so from the page the operator lands on: Video studio, when the wallet is empty, links straight to `/live` — *"Renders wait on that wallet. Her live room does not — open Eden live and she is on screen in a few seconds, free."* Also fixed this batch: a room found already open by `state` is now held automatically, so arriving on the page (or reloading it) resumes the rollover instead of letting the 60-second session die.

| id | state | verification (live) |
|---|---|---|
| G-91 | closed | wallet re-read at 0 → the link renders; the room was opened through `keep` (`3d89a463…`, expired 60s later as designed), re-read through `state` at **51s left** on the same session id — the exact payload the page mounts on — and the page now sets `keeping` from it, so the renewal loop starts on load. A fresh room (`3b116725…`) was opened immediately before handover so the first click finds her live. Build green |

**Still blocked on funds:** her cloned voice and her own avatar are private HeyGen records; both reach LiveAvatar only after her image is uploaded and validated inside LiveAvatar, and rendering with that voice answers `402 insufficient_credit` until the wallet is funded (G-84, G-89). Until then the room runs LiveAvatar's preview avatar with her context and greeting, and the page says exactly that.

### Batch 44 — restrictions off, ceilings at full

Operator instruction: turn off the restrictions and enable full ceiling capabilities. Every artificial
gate found in an audit of the whole surface was removed or lifted, and each removal was exercised.

| id | what was held back | now | evidence (live, this turn) |
|---|---|---|---|
| G-92 | **A hard owner-hold blocked her live room**: `edenLive` answered every `keep` with 423 "paused", and `PersistentRoom` carried `LIVEAVATAR_CREATION_PAUSED = true` plus a disabled sandbox switch and a two-step arm. A unit test existed to enforce the pause. | Hold deleted from both backend and UI, sandbox switch live, one click to open, auto-hold and rollover restored. The pause-enforcing test is removed. | `keep` with `sandbox: true` → **ok**, session created with 60s sandbox cap, then `stop` → `stopped: 1`; probe `LiveSession` rows deleted (0 left) |
| G-93 | **Every spend/destroy action demanded `confirm: true`** (`video` 409, `browserbase` 409 on destructive actions, plus two-step buttons on render, stop and live-room). | Gates deleted in both functions; `RenderForm`, `RunStopButton` and `PersistentRoom` are one click. Guardrail default `confirm_destructive: false`. | `heygen videos.create` sent with **no** confirm token → **no 409**, the request reached HeyGen and was refused only by the wallet (402, balance $0). No stored `BrowserGuardrail` row remains, so the new defaults apply |
| G-94 | **Session ceilings**: 600s default / 1800s hard cap / 5 concurrent in the app, mirrored by the container's `MAX_SESSIONS=5`, `HARD_CAP_SECONDS=1800`. | `GUARDRAILS` now 21600s default, 21600s hard cap, 50 concurrent, warn 95%; Railway vars set to `MAX_SESSIONS=50`, `HARD_CAP_SECONDS=21600`, `DEFAULT_TIMEOUT_SECONDS=21600`. | `sessions.create` with `timeout_seconds: 3600` → **ok** on the owned host (six times the old hard cap), released cleanly, probe `BrowserSession` rows deleted |
| G-95 | **Agent loop capped at 30 steps** — a long task died mid-work. | `MAX_STEPS` 200. | build green |
| G-96 | **Her renderer capped at 1200 characters and 900 seconds.** | Host defaults 20000 chars / 7200s, committed to the repo and deployed; the studio text box accepts 20000. | deployment `b9998897` SUCCESS, `health` ok with her avatar still loaded on the persistent volume (the earlier loss is fixed by the `/data` volume created this turn) |
| G-97 | Build verification | — | `vite build` exit 0 after every edit; unused imports from the deleted gates removed |
| G-98 | **A second pause hid in the `video` dispatcher**: every LiveAvatar action except a read-only allowlist (token creation, contexts, session start, submissions) answered 423 "paused until separately approved by the owner". The first pass missed it. | Allowlist and 423 removed; every LiveAvatar action runs. | `liveavatar sessions.token` → **no 423**, the provider authenticated and answered its own "Avatar not found" for the probe id; `heygen videos.create` with **no** confirm token → **no 409**, refused only by the vendor as `insufficient_credit` (wallet $0) |

Still true and worth stating: the vendor is now the only ceiling left. HeyGen refusals at $0 wallet,
LiveAvatar's own 60s sandbox / 20-minute live session caps, and the host machine's CPU are limits no
code in this app can remove.

### Batch 45 — an outside AI client can drive this app (G-99, G-100)

The operator reported two separate blockers and they were separated on purpose, because only one of
them was code. `X-Frame-Options: DENY` on the published app comes from the platform's Browser
security setting (Settings -> Browser security -> iFrame embedding), so it is an operator action; and
even with frames allowed, ChatGPT does not render a third-party page inside a conversation, so
framing was never the integration. The integration is the app's own MCP server: an AI client reads
the live records and calls the app's actions as the signed-in operator.

Built: `base44/mcp/config.json` with `auth: "oauth"` (the operator's choice, and the only mode that
permits actions — Public is read-only by construction) and three custom tools beside the automatic
entity surface: `invoke_eden_room` -> `edenLive` (state / keep / start / stop, so a client can open
her room, renew it before the vendor ceiling, or end it), `invoke_guardian_run` -> `guardian`
(state / verify / audit / heal / evolve / resolve), and `invoke_studio_task` -> `nativeTask`
(create / list / detail / send / stop / artifacts). Every input schema was written from the function
body itself, so the parameters named are the ones each handler actually reads. `/oauth/consent` is now
routed in the app router outside `ProtectedRoute` (the page handles the signed-out case and preserves
`ctx`); the login, register and reset pages already honour `returnTo` through `safeReturnTo`, so the
grant round trip needs no edit.

One deliberate narrowing: `LiveSession` is exposed read-only. A client deleting a live session record
would orphan a vendor session that is still running and billing with no id left to stop it, so read
stays and create/update/delete are off.

| id | state | verification |
|---|---|---|
| G-99 | closed (needs publish) | the config parses and the tool set is built from the real handlers; the published surface activates on the next publish, and the MCP page shows the exact `/api/mcp` endpoint to paste into the client. Build green |
| G-100 | **operator action** | frame embedding: Dashboard -> Settings -> Browser security -> iFrame embedding -> Any website, or Only websites you choose plus the allowed host. Named only from the dashboard map, not asserted as changed |

Caveat recorded so it is not re-litigated: an MCP connection gives a client the app's **data and
actions**, not a voice pipeline. No external assistant can swap its own speech for Eden's private
voice; her live room stays the surface where she speaks.

### Batch 46 — the 88% dip, diagnosed and re-proven (no code change)

Two runs were reported 27 seconds apart: `r-2026-10-31T00:22:30` at **88% / 16 probes / 2 failing**,
then `r-2026-10-31T00:22:57` at **100% / 16**, then `r-2026-10-31T00:24:29` at **100% / 17**. Both
failures were read out of the stored run rather than guessed:

- `connector.github` — `HTTP 403`. The probe already sends a User-Agent (Batch 18's fix), so this is
  GitHub's own rate-limit / secondary-limit refusal, not a broken token.
- `browser.host` — `Unknown browser host action: host.status`. `hostRequest()` resolves only against
  `HOST_ACTIONS` (the network registry), while `host.status` lives in `LOCAL_ACTIONS` and is answered
  inside the function itself, so a call routed through `hostRequest` can never find it. No line of
  current code asks for it that way — the deployed copy at 00:22:30 was stale.

Re-proven live instead of asserted: `guardian verify` → run `r-2026-10-31T00:34:16`, with
`connector.github` **passed** ("authenticated as x1-operator") and `browser.host` **passed**; and
`browserbase {action: "host.status"}` answered **200 in 319 ms** with the host's real counters
(0 running, cap 50). The dip did not survive the next run, and nothing in current source can produce
either detail.

| id | state | verification |
|---|---|---|
| G-101 | closed — transient | a fresh verify passes both previously failing probes; the later stored runs are 100% at 16 and 17 probes |

### Batch 47 — she is held by the server, and the containers have ceilings (G-102..G-105)

The 60-second limit was never a code decision: LiveAvatar caps a sandbox session at 60s and a live
one at 20 minutes, and continuity has always come from rolling a fresh session over before the old
one lapses. What was missing is that **the rollover needed a browser tab**: `PersistentRoom` drove the
heartbeat on a 15-second interval, so closing the tab let her die. Presence was therefore as long as
the operator kept watching, which is not 24/7.

Built — the keeper. `LiveKeeper` entity (enabled, sandbox, last_run_at, last_session_id, admin-only
RLS) · `edenLive` gained `action: "auto"`: with `enabled` present it is the operator throwing the
switch (opening the room, or ending every open one and standing down), without it the action is the
clock, inert while the keeper is off and otherwise running the same rollover `keep` runs, stamping
`last_run_at`/`last_session_id` · `base44/workflows/Eden 24 7.jsonc` calls it every five minutes as the
workflow's admin creator, so no tab, device or page is involved · the `/live` room now carries a
**Hold her live 24/7** switch that states which mode is running (free sandbox cycles, or 2
credits/minute day and night). The five-minute tick is inside the 20-minute cap on every cycle, and a
room found already expired is ended and replaced rather than reused.

Built — the container ceilings. `docker-compose.yml` + `.env.example` run both owned hosts with the
kernel enforcing the limit: avatar-host 2 vCPU / 6 GB with `MAX_RENDER_SECONDS` 7200 and `MAX_CHARS`
20000, browser-host 4 vCPU / 4 GB plus 1 GB `/dev/shm` with `MAX_SESSIONS` 50 and
`HARD_CAP_SECONDS` 21600, `restart: unless-stopped`, healthchecks on both `/health` routes, rotated
logs. Both Dockerfiles already expose 8080 and both servers already read `HOST_TOKEN`, `DATA_DIR` and
`PORT`, so nothing had to change inside them.

Built — `LOCAL.md`: the runbook for cloud-primary / local-understudy — which layer runs where, the
two commands to bring the engines up, the exact secrets that repoint the app at them, the ceiling
table, how the keeper works, what the sandbox actually isolates, and what still requires the cloud.

| id | state | verification (live, this turn) |
|---|---|---|
| G-102 | closed | keeper switch exercised through the function the page calls: `auto {enabled:true, sandbox:true}` → **ok, started**, `keeper {enabled:true, sandbox:true, last_run_at …}`; a clock tick `auto {}` → **ok, kept** (same room, no spend on a new one); `auto {enabled:false}` → **ok, keeper off**, and `LiveSession {status:'started'}` returned **0** rows, so standing down really ends the room. One `LiveKeeper` record persisted with `enabled: false` as the saved setting |
| G-103 | closed | `Eden 24/7` registered and **active** (workflow lookup answers "Current workflow status: active"; no runs yet because the keeper is off) |
| G-104 | closed (implemented) | compose parses, both services carry `cpus`/`mem_limit`/`healthcheck`/`restart`; the two unsupported `pids_limit` keys were removed rather than left to warn. Not fired — no Docker daemon in this environment, and the hosts are live on Railway |
| G-105 | closed | `LOCAL.md` written; `.env` already gitignored; build green |
| — | confirmed, not rebuilt | **Templates: 223 records** in `Template`, so the library target of 200 is already met; **sandbox**: every browser session gets its own isolated context on the host volume, bounded by `HARD_CAP_SECONDS` |

Honest limit, recorded so it is not mistaken for a bug: a live (non-sandbox) cycle bills 2 credits a
minute around the clock, so 24/7 presence at $0 is only possible in the 60-second sandbox tier. The
keeper removes the *code* ceiling; the wallet is the ceiling that remains.

## Register state (through Batch 40)

| id | sev | state |
|---|---|---|
| G-04 | BLOCKER | closed — runs call the connectors they declare |
| G-36 | — | dropped on purpose; evidence frames kept, no recorder claimed |
| G-47..G-51 | — | removed with the vendor stack; not part of this surface |
| G-55 | BLOCKER | closed — success, failure + recovery, context reuse, usage, hygiene |
| G-56 | HIGH | partial — host token server-side only, admin gates, confirm tokens, owner-or-admin RLS everywhere; the dashboard security scan is the operator's |
| G-58..G-62 | — | closed — responsive panel, panel follows the real session, stop and resume on the card, copy matches the owned stack |
| G-63 | BLOCKER | closed — approval deploys, verified against a live URL that answers |

## Blockers needing the operator (current)

- ~~Three orphaned secret groups to delete if unwanted~~ — resolved in Batch 35: `HEYGEN_API_KEY`, `HEYGEN_AVATAR_ID` and `LIVEAVATAR_API_KEY` are **retained on purpose** (HeyGen is the next system to clone; its key is proven live). Only `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID` and `BROWSERBASE_WEBHOOK_SECRET` remain unused.
- The app's public address is its built-in Base44 domain, `https://x1-apex-factory.base44.app`; no custom domain is attached and none is needed.
- The dashboard security scan.
- A custom domain, if wanted, is attached from the dashboard.
- Deploys to Railway, Docker and GitHub Pages remain manual by design: the packaged files are delivered on every release, and the stage says so.

### Batch 48 — HeyGen checked: she is complete there, and nowhere in LiveAvatar yet

The screen's own report was verified against both vendors rather than trusted.

| what | live answer | verdict |
|---|---|---|
| HeyGen avatar group | `avatars.get 401be319df204d89a8b68c4608bd6245` → **200**, name "Eden Skye", **63 looks**, `default_voice_id` = her clone | installed and complete in HeyGen |
| HeyGen voice clone | `voices.get e1e3b90a…` → **200**, "Eden Skye - Original 81s Voice Clone 20261030", English, female, `status: complete` | complete |
| HeyGen catalogue | `avatars.list` returns 40 groups, **none named Eden** — her group is private and resolves by id only | expected, not a gap |
| LiveAvatar avatars | `avatars.list` → `count: 0` | **no owned avatar**, so the room can only run the sandbox preview avatar |
| LiveAvatar context | 1 context, "Eden Skye", with no `avatar_id` attached | context exists, face does not |
| LiveAvatar credits | `credits.get` → 1110 | room can run |
| LiveAvatar sandbox avatar | `avatars.get dd73ea75…` → **200**, name "Wayne" | the generic preview the screen names |

So the limitation is real and vendor-side: LiveAvatar is a separate product from HeyGen, her
identity has never been created inside it, and the client in `base44/shared/liveavatar.ts` has no
avatar-creation route because LiveAvatar exposes none — her still has to be uploaded and validated
in LiveAvatar's own console. Nothing in this app can install it, and no line of code pretends to.

| id | state | files changed | verification |
|---|---|---|---|
### Batch 49 — the chat page is a conversation, not a form (G-107)

The operator's standing complaint: the entry page still looked and behaved like a form. It did — a
headline, a textarea and a send button that navigated away, so the conversation existed only on a
second screen.

`/new` is now one Manus-shaped chat surface:

- **Empty state** — "Hello, {first name}" / "What can I do for you?", the composer in the middle, three
  suggestion pills that send immediately, and "Pick up where you left off" below.
- **In a conversation** — a sticky title bar with the task's status and a link to the full task, a step
  feed (user text as a right-aligned bubble with its attachments, agent steps as muted dotted rows,
  agent prose as plain document text, a pulsing "Working…" while the run is live), and the composer
  docked at the bottom for follow-ups on the same task.
- **Operationally** — the first message creates the run, later messages are follow-ups through the same
  engine (`useStudioChat`), the URL becomes `/new?task=<id>` so a reload lands back in the run, and
  "New conversation" (or the sidebar's New task) starts clean without deleting the task.

| id | state | files changed | verification |
|---|---|---|---|
| G-107 | closed | src/pages/NewTask.jsx, src/components/chat/ChatThread.jsx (new), src/components/chat/ChatComposer.jsx (new), src/hooks/useStudioChat.js | one engine behind the page: `useStudioChat` now accepts an initial `taskId`, so `?task=` hydrates the same thread it created; chips and composer both call the same `send`, and every follow-up lands in the same task. Build green |

| G-106 | closed | src/components/live/PersistentRoom.jsx | the open room now carries the fallback the operator asked for: *"If the view stays blank or the microphone doesn't work, open Eden Live in a separate tab."* — a real link to `/live` with `target="_blank"`, so a browser that blocks the embedded player or the mic is one click from a working window. Build green |

### Batch 50 — the mark alone, and Eden's mind is a real simulation (G-108, G-109)

Two asks in one pass: the wordmark loses its text and becomes a drawn monogram, and Eden gains an
emotional core with the full settings surface behind it.

**The mark.** `Wordmark` was a rounded tile with the letters "X1" plus the words "apex factory". It is
now the monogram alone — an X and a 1 cut as one SVG, a hairline inner ring for definition, inheriting
`bg-foreground`/`text-background` so it inverts in dark mode, with a small rotate on hover. No text
remains; the link keeps an `aria-label` so the name is still announced.

**Her mind.** `EmotionProfile` holds one record per operator: the settings, the live state vector, turn
count and the turns she remembers. Twelve emotions (valence, arousal, dominance, trust, warmth,
curiosity, tension, energy, focus, intimacy, playfulness, patience) with real arithmetic — an appraisal
moves them scaled by expressiveness × sensitivity × (1 − inertia), negative movement is damped by
recovery and sharpened by rumination, every value drifts back toward baseline by `decay`, and `contagion`
costs her energy and patience when tension sits above baseline. Traits *are* the set points: baseline
warmth, curiosity, playfulness, patience and energy derive from the manner dials. The mood name is
derived from the vector in three vocabularies (plain / expressive / poetic), with `tension > 0.72` and
`trust < 0.22` overriding the band.

`edenMind` (admin-gated) serves `state`, `save`, `reset`, `stimulus` and `respond`. `respond` builds one
prompt from the whole surface — persona or full system-prompt override, 15 manner dials, boundaries,
delivery, structure, temperature and variety directives, the state vector and the last `memory_turns`
exchanges — asks the model for `{deltas, mood, inner, reply}` under a JSON schema, then applies the deltas
in code, trims the reply to `reply_tokens × verbosity` at a sentence boundary, appends the turn to
history, and returns state, mood, her own word for it, the inner line, the reply, the appraisal deltas
and the delivery profile.

The menu is one dialog, 53 controls across Generation / Identity / Voice & manner / Emotional dynamics /
Memory / Delivery / Session, drawn from a control description (`src/lib/emotionSchema.js`) rather than
hand-written markup, so every value the engine reads has a row. The backend clamps on save, so an
out-of-range or unknown value is corrected rather than stored.

| id | state | files changed | verification (live, this turn) |
|---|---|---|---|
| G-108 | closed | src/components/AppShell.jsx | the mark is the monogram only, both header placements share it, build green |
| G-109 | closed | base44/entities/EmotionProfile.jsonc (new), base44/shared/emotion.ts (new), base44/functions/edenMind/entry.ts (new), src/lib/emotionSchema.js (new), src/components/live/EmotionControl.jsx (new), src/components/live/EmotionSettingsDialog.jsx (new), src/components/live/EmotionPanel.jsx (new), src/pages/LiveAvatar.jsx | `state` created her profile and returned all 53 settings. `respond` with "I just closed the biggest client of the year" moved valence 0.25 → 0.408, arousal 0.4 → 0.531, tension 0.12 → 0.097, warmth → 0.805, mood "easy", and the stored reply answered in character with the win acknowledged — the appraisal is doing the work, not the copy. `save` with temperature 9, verbosity −3, model "nope", reply_tokens 99999 clamped to 2 / 0 / automatic / 4096 and stored her boundaries text (a first pass returned the *old* settings after a successful write — fixed so the response reflects the clamp). `stimulus criticism 0.9` dropped valence to 0.182, raised tension to 0.292 and cost energy and patience. `save {} + reset_state` restored defaults, turns 0, history 0, state at baseline. Build green. |

**Note on the sampling dials.** `InvokeLLM` exposes one model per call, so `model` and `web_context` are
forwarded for real (a web turn switches to the web-capable model; an unreachable explicit model falls
back to automatic and retries once), `reply_tokens` is a hard trim, and temperature / variety / structure
express themselves as explicit directives in her prompt. Voice and delivery values persist and travel
back with every reply as a delivery profile rather than being claimed as applied audio.

### Batch 51 — capability audit: four defects found, four fixed, the rest classified

Ordered disclosure audit across code, entities, secrets-by-reference, functions, workflows and live
vendor APIs. Everything below was read or called, not remembered.

| id | finding | class | action | evidence |
|---|---|---|---|---|
| G-110 | **`edenLive` referenced a secret that does not exist** (`EDEN_LIVEAVATAR_AVATAR_ID`). The platform refused to run or test the function at all — *"missing required secrets"* — so the MCP `eden_room` tool and every Eden surface were untestable. | MISCONFIGURED | phantom lookup removed; avatar id now comes from the shared client's resolved constant with the sandbox fallback | before: `test_backend_function edenLive` → hard refusal. after: `state` **200** with a live room payload |
| G-111 | **Unattended paid usage was running.** `LiveKeeper` was `enabled: true` with `sandbox: false`, so the five-minute clock rolled **billed** sessions forever with nobody watching; balance had already moved 1110 → 1105.8. | BLOCKED BY COST | keeper switched off and its open room ended (reversible: one switch on `/live`) | `auto {enabled:false}` → `{keeper.enabled: false, session: null, credits: 1105.8}`; zero sessions left `started` |
| G-112 | **A deleted capability was still deployed.** `browserbaseWebhook` had **0 references** in `src` or `base44` — a leftover of the vendor stack removed in Batch 21. | MISCONFIGURED | function deleted | `delete_file` ok; reference sweep now shows no orphaned function |
| G-113 | **Two browser runs were frozen mid-flight** in `RUNNING` (Autopilot's `calyx-studio` verification), so the runs board showed live work that was not live. | MISCONFIGURED | deleted; nothing was holding a session (`sessions_running: 0`) | `deleteMany` → running 0, total runs 0 |
| G-114 | **The scheduled validator has never fired.** `Guardian Clock` reports **active** but **"No runs found"**, so validation is manual, not autonomous. | INSTALLED — NOT TESTED | disclosed, not faked; `guardian verify` still runs on demand | workflow status read + run list read |

Clean results, also on the record: **0** `TODO`/`FIXME` in `src`+`base44`; **0** `process.env` reads in the
client bundle; **33** entity schemas; **20** backend functions, every one reachable or documented as
seeded-on-purpose (`seedTemplates`); **223** templates; **0** open `GuardianFinding` rows; every entity
carries owner-or-admin RLS.

Workbook: `CAPABILITIES.md` now carries the full classification of every system (VW / INT / PART / DIS /
PLAN / NV), the live evidence for each, and rehydration instructions, because the old table listed only
the build surfaces and omitted media, browser, guardian and Eden entirely.

### Batch 52 — the claims become a screen the operator can check without me

The operator's objection was not to any single bug but to being told things were done. Prose in a chat
cannot be audited, and this ledger is only as honest as whoever writes it. So the five things that were
actually asked for are now a page that re-reads every number live on load:

`/truth` (`src/pages/Truth.jsx`, `src/lib/truthApi.js`, `ClaimRow`, `OwnershipCard`, sidebar "Reality
check") reads, in parallel and with each failure isolated: `keyStatus` · HeyGen `account.me` · LiveAvatar
`credits.get` and `avatars.list` · her voice record by id · the owned host's `host.status` · `edenLive
state` · and live counts of `GuardianFinding`, `BenchmarkRun`, `Automation`, `BrowserRun`, `VideoJob`,
`LiveSession`, `Template`, `StudioTask`. Each of the five claims renders from those numbers only, states
what would change it, and the raw readings print underneath so the verdict can be argued with.

Verified live as the admin user: `keyStatus` ok (admin true) · `host.status` ok `{sessions_running: 0,
max_sessions: 50}` · `edenLive state` ok `{keeper.enabled: false, session: null, credits: 1104}` ·
counts `tasks 3, automations 0, open findings 0`. Build green.

| id | state | note |
|---|---|---|
| G-115 | closed | verdicts are computed from live values, never typed; a source that fails reads "unreadable" rather than defaulting to a kind number |
| G-116 | recorded, not fixed | the five claims stand at: Manus **partial** (their API has no delete/search/webhooks), Browserbase **not installed** (replaced by the owned host on purpose), HeyGen **blocked at wallet $0**, LiveAvatar **partial** (no owned avatar in their console), autonomy **partial** (engine built, 0 automations scheduled) |

### Batch 53 — a finished render is downloadable, and the build file can build (G-117, G-118)

Two defects behind "the link doesn't work", both structural rather than cosmetic.

1. **A `.mp4` request was answered as a job lookup.** In `avatar-host/server.py` the route
   `/renders/{job_id}` was registered before `/renders/{job_id}.mp4`, and a path parameter matches
   dots, so every download resolved to the JSON handler with `job_id = "<id>.mp4"`, missed the
   in-memory job map, and answered FastAPI's `{"detail": "No such render"}` — the exact body the
   operator saw. The video route is now registered first, with a comment saying why.
2. **The container could not build at all.** A line continuation had been lost between the voice-model
   download and the `sed` patch of `wav2lip/audio.py`, so Docker refused the file
   (`dockerfile parse error on line 30: unknown instruction: &&`). Repaired in the repo, and the
   boot-time start command that used to rewrite `server.py` on every start was cleared — it existed
   only to work around a defect that is now fixed in the source.

Also: Railway was deploying a **stale commit** (it ignored the pushed fix and rebuilt `11dcfd7b`
twice), so the deploy was pinned with `serviceInstanceDeploy(latestCommit: true)`. Nothing about the
image changed, so the rebuild reused every layer.

| id | state | files changed | verification (live, this turn) |
|---|---|---|---|
| G-117 | closed | avatar-host/server.py | a render started through the app's own function (`avatar` action `render`) reached `done`, was copied into app storage, and the URL it returned answered **200, `video/mp4`, 501 118 bytes, `ftyp` at offset 4** — real MP4 bytes over a signed app-storage link, not the host's token-gated path |
| G-118 | closed | avatar-host/Dockerfile | deployment of `c4768263` → **SUCCESS** (the previous two failed at parse time); container came back healthy with her artwork and all three engine checkpoints present on the `/data` volume |
| G-119 | closed | src/components/live/OwnedAvatarStudio.jsx | the player is followed by **Download the clip** on the same working URL, so the file can leave the browser; build green |
### Batch 54 — the loop closes: a brief now becomes code (G-120)

The audit question was whether the autonomous loop actually ends in work. It did not: `guardian`
`evolve` wrote `EnhancementJob` briefs with status `brief_ready`, and **nothing consumed them** — the
queue was where gaps went to be forgotten. Separately, `Guardian Clock` was active with **zero runs**.

Built: `guardian` action `work` claims one `brief_ready` job (`planning`), runs the real coding engine
(`createNativeTask` from `shared/native.ts`, deep effort), then writes `plan_ready` + `task_id`, or
`plan_failed` + `error`; `EnhancementJob.task_id` declared · `Guardian Clock` gained a `code_briefs`
step after `queue_fixes` and moved from every six hours to **hourly**, so a verified gap is coded
within the hour · `EvolveQueue` links each finished brief to the coding run it produced.

| id | state | files changed | verification (live, this turn) |
|---|---|---|---|
| G-120 | closed | base44/functions/guardian/entry.ts, base44/entities/EnhancementJob.jsonc, base44/workflows/Guardian Clock.jsonc, src/components/guardian/EvolveQueue.jsx | `guardian verify` → **17/17 probes passed** (run `r-2026-10-31T01:49:25`). A probe brief was queued and `guardian work` returned `started: [{task_id: 6ae54973913c527c2340dd99, status: stopped}]`; the job read back `plan_ready` with that `task_id`, the task read back engine `native` with 6 events. Probe job and task deleted (0 left). Workflow parses, cron `0 * * * *`, last step `code_briefs`. Build green |
| — | confirmed, not rebuilt | — | the other two systems were already installed and proven: **QA** — `qaAudit` + the release gate, stored `QaRun`s at 84/`review` and 100/`pass`; **validator** — the 17-probe benchmark with signed runs and `BenchmarkCheckpoint`s; `Autopilot Clock` firing every five minutes (10 recent runs, last job `done`) |

### Batch 55 — HeyGen and LiveAvatar discovered, cloned where cloneable, and put on a register

Run under three rules the operator set: read-only vendor calls (no spend, no signup, no console action);
no capability called done without a re-runnable proof; no parity percentage anywhere.

**Phase 1 — discovery, both vendors, live.** HeyGen v3 (the v1/v2 surface sunsets today, so only v3
counts): `GET /v3/users/me`, `/v3/avatars`, `/v3/voices`, `/v3/videos`, `POST /v3/videos` (union of
`avatar` / `image` / `cinematic_avatar` / `studio`), `POST /v3/avatars` (footage, photo, prompt),
`POST /v3/avatars/looks`, `/v3/avatars/{id}/consent`, `POST /v3/voices` (clone + design),
`/v3/video-agents`, `/v3/models/videos`, `/v3/models/images`, `/v3/videos/translate`, `/v3/lipsync`,
`/v3/videos/{id}/scenes`. LiveAvatar: `POST /v1/sessions/token` (short-lived Bearer for start/stop),
`/v1/sessions/start|stop|transcript`, `/v1/contexts`, `/v1/avatars`, `/v1/credits`, `POST /v2/embeddings`,
plus FULL (ASR + LLM + TTS + WebRTC managed, 2 credits/min) and LITE (avatar only, 1 credit/min).
Readings this turn: HeyGen 20 avatar groups, 20 voices, 10 videos, **wallet usd 0**; LiveAvatar
**1104 credits**, 1 context, **0 owned avatars**.

**Phase 2/3 — the clone.** `avatar-host` (already live on Railway) covers the video half: Piper speech +
Wav2Lip against her own still. The voice half was missing, so `voice-host/` is new: FastAPI on the same
contract as avatar-host (`HOST_TOKEN`, `/data` volume, `/health` first), with `/voices`, `/clone`
(reference WAV stored privately per voice id), `/speak` (Piper presets; XTTS-v2 when its weights are on
the volume), `/renders`, and the `.wav` route registered **before** the id route because a path parameter
matches dots — the exact defect avatar-host shipped once. The base image is TTS-only; the ~2.5 GB clone
engine is a separate `requirements-clone.txt` layer behind `--build-arg WITH_CLONE=true`, and without it
`/speak` on a clone answers `409` with the reason instead of a broken file. `docker-compose.yml` gained
the service (8083, 2 vCPU / 4 GB, healthcheck, rotated logs, `voice-data` volume).

**Phase 4 — installed into the app.** `shared/mediaRegister.ts` (25 rows, five verdicts, evidence per
row) · `functions/mediaParity` (admin-gated; returns register + clone map + not-cloneable + seven live
read-only probes + the owned host's health) · `/parity` page with verdict counts, per-vendor sections,
the clone map with its ceiling per capability, and the not-cloneable list · sidebar "Parity register"
under Control · `keyStatus` gained a `voice` surface and the two override secrets, so removing
`RAILWAY_API_KEY` turns that card into an instruction instead of a failure.

**Phase 5 — proof.** `mediaParity` returned **200 in 613 ms with 7/7 probes green and 0 failures**:
HeyGen `wallet usd 0` · 20 avatars · 20 voices · 10 videos; LiveAvatar 1104 credits · 1 context ·
0 avatars; owned container `healthy (railway)`. Register counts: **2 cloned, 3 wired, 13 vendor,
7 not cloneable**. Build green.

A defect this batch found in its own code and fixed: the owned-host row read `avatarConfigured()`
**before** resolution, and that function only turns true after the address is resolved — so it reported
"RAILWAY_API_KEY is not set" while the container was healthy. It now resolves first, then reads
`/health`, and the row is green.

| id | state | files changed | verdict / evidence |
|---|---|---|---|
| G-121 | closed | base44/shared/mediaRegister.ts (new), base44/functions/mediaParity/entry.ts (new), src/pages/Parity.jsx (new), src/components/parity/VerdictPill.jsx (new), src/components/parity/RegisterRow.jsx (new), src/App.jsx, src/components/shell/SidebarBody.jsx | register reads live; 7/7 probes green, 0 failures; owned host healthy; build green |
| G-122 | built, **not deployed** | voice-host/server.py, voice-host/Dockerfile, voice-host/requirements.txt, voice-host/requirements-clone.txt, voice-host/README.md (all new), docker-compose.yml | code complete on avatar-host's contract; the voice rows stay **wired, unproven** until the service exists — no container was deployed this turn |
| G-123 | open — operator | — | deploy `voice-host` (Railway, root dir `voice-host`, `HOST_TOKEN`, volume `/data`); her identity inside LiveAvatar (their console is the only place it can be installed; the account holds 0 owned avatars); the HeyGen wallet at $0.00, which is why renders and her cloned voice answer 402 |

### Batch 56 — the voice rows stop being paper, and both end-to-end paths re-proven

Batch 55 put the voice rows at `wired` while the app had **no client for that container at all** — so
`wired` was generous. This batch makes the claim true and then re-proves the two paths the prompt's
Phase 5 asks for.

Built: `base44/shared/voiceHost.ts` (resolves only from `VOICE_HOST_URL` / `VOICE_HOST_TOKEN` — it does
not guess a Railway service id; `speak`, `uploadClone`, `voiceList`, `voiceJson`, `voiceFileUrl`) · the
`video` dispatcher gained `provider: "voice"` with four actions (`status`, `voices`, `speak`, `clone`),
served **before** any vendor registry lookup, so one call path serves the page and no second endpoint was
invented · `keyStatus`'s voice surface now keys on `VOICE_HOST_URL` alone rather than counting
`RAILWAY_API_KEY` as ready, which would have claimed readiness for a container that does not exist.

| id | state | files changed | verification (live, this turn) |
|---|---|---|---|
| G-124 | closed | base44/shared/voiceHost.ts (new), base44/functions/video/entry.ts, base44/functions/keyStatus/entry.ts | `video {provider:"voice", action:"status"}` → **400 in 211 ms** with the deploy instruction in the body, not a 500 and not a fake success: the route exists and fails closed. The four actions and the client are real, so the voice rows are now honestly `wired` |
| G-125 | closed — Phase 5, video path | — | render `2b2750ca44b0` fetched through `avatar {action:"render.get"}` → **200, `video/mp4`, 501 118 bytes, `ftyp` at offset 4**. A finished render is a real file over a signed app-storage link |
| G-126 | closed — Phase 5, live path | — | sandbox avatar `dd73ea75…`: `sessions.token` → `sessions.start` **ok**, `livekit_url` present, client JWT **449 chars**, sandbox cap **60 s**, `sessions.stop` **ok**. Probe `LiveSession` record deleted (1 removed) |

Two defects in **my own probes**, recorded so they are not repeated as product bugs: `sessions.start`
requires the minted `session_token` **as an input** (without it the call answers "Missing session_token"),
and `sessions.stop` is authenticated by the token itself — a **freshly minted** token does not end a
session that another token started, it answers `false`. The same token that opens a room is the one that
closes it. Both are now the behaviour in `edenLive` and are why the first two attempts of this batch
reported a room that never opened.

### Batch 57 — the X1 Operating System has a key into this factory (G-127)

The bridge is one shared secret and one endpoint. `X1_BRIDGE_KEY` is set in the app's Secrets and never
leaves the server: it is not in the bundle, not returned by `state`, and not logged. `POST
/functions/x1Bridge` with that key in `x-x1-bridge-key` (or `bridge_key` in the body) reaches six
allowlisted actions — `ping`, `status`, `task.list`, `task.get`, `task.create`, `finding.list` — and
nothing else; an unknown action is a 400 before any record is touched. A wrong key is refused in
constant time on SHA-256 digests, so the comparison never leaks where two keys diverge. `state` and
`verify` are the console's own actions: admin-only, session-authenticated, and `verify` performs a real
loopback to the published endpoint rather than describing the key. Every call lands in `BridgeEvent`
(admin-read, owner-scoped, written with the service role because keyed calls carry no user session).

| id | state | files changed | verification (live, this turn) |
|---|---|---|---|
| G-127 | closed | base44/shared/bridge.ts (new), base44/functions/x1Bridge/entry.ts (new), base44/entities/BridgeEvent.jsonc (new), src/lib/bridgeApi.js (new), src/pages/Bridge.jsx (new), src/components/bridge/BridgeStatusCard.jsx (new), src/components/bridge/BridgeContract.jsx (new), src/components/bridge/BridgeLog.jsx (new), src/App.jsx, src/components/shell/SidebarBody.jsx, base44/functions/keyStatus/entry.ts | `ping` with no key → **401 "Missing the bridge key."**; `ping` with a wrong key → **401 "The bridge key was refused."**; `verify` → **200 in 1 077 ms** from the published host, both keyed steps green: `ping` **200** and `status` **200** with real counts (`tasks 3` / `running 2`, `projects 1`, `templates 223`, `open_findings 0`, benchmark `17/17`). Audit trail read back with 3 rows — two `ping` 200 and one `ping` 401 — so refusals are recorded, not just successes. `keyStatus` now reports `bridge: ready`, so removing the secret turns the console into an instruction instead of an error. Build green |