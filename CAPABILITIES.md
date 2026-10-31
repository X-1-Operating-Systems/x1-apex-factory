# CAPABILITIES — installed systems

One entry per capability the app actually ships. Extension Protocol writes here before building.

| capability | surface | data | functions / shared | verification |
|---|---|---|---|---|
| Tasks (agent runs) | /new, /task/:id, Library, sidebar sessions, home composer | StudioTask | nativeTask, manusAgent, shared/native.ts | start a task from home, it opens at /task/:id and appears in sidebar + Library |
| Projects (folders + canvas) | /studio/:id, sidebar Projects | Project, StudioPage, StudioMessage | studioAgent, qaAudit, deployRelease | project master instruction appears in the new-task screen and in the run context |
| Templates | /templates, home gallery | Template (223) | seedTemplates | pick a template, a project opens composed |
| Automations | /automations | Automation | runAutomations, automationEvents, Automation Clock + Task Finished Automations workflows | scheduled and after-a-task automations both start real runs with history |
| Connectors | /plugins | StudioConnector | shared/connectors.ts | installed connectors are declared to the engine every run; live connector calls await an authorized connector |
| Skills | /skills | StudioSkill | shared/personalization.ts | enabled skills appear in the native prompt context |
| Agents | /agents | StudioAgent | studioAgent | install/run an agent, a task starts |
| Websites | /websites, /websites/:taskId | Deployment, QaRun, SiteDomain, ShareLink | deployRelease, siteDomain, shareLink | prepare a release, then verify a domain |
| Files & artifacts | /files, /artifacts, /library | StudioFile, task deliverables | nativeTask, manusAgent | upload lands in Files and in the task thread |
| Settings | /settings/* | StudioPreference, User | — | preferences persist per user |

## Capability audit — 2026-10-31 (evidence-backed)

Legend: **VW** verified working · **INT** installed, not tested · **PART** partially implemented · **DIS** disabled · **MIS** misconfigured · **PLAN** blocked by plan or cost · **PLAT** platform limitation · **NV** not verified.

| system | class | evidence of record |
|---|---|---|
| Guardian validator | VW | run `r-2026-10-31T01:09:06` — **17/17 probes passed**, 0 failures, 0 open findings |
| Secret/surface readiness | VW | `keyStatus` — 6/6 surfaces ready; `BROWSER_HOST_URL`/`_TOKEN` absent and not needed, the host resolves from `RAILWAY_API_KEY` |
| Owned browser host | VW | `host.status` 200 on the Railway container; `max_sessions` 50, sessions_running 0 |
| Control plane (`/admin`) | VW | sessions, runs, agents, contexts, live frames driven from one thread (Batches 20–31) |
| Live avatar room | VW | `edenLive state` returned a real room: 807s left, LiveKit `wss://heygen-feapbkvq.livekit.cloud`, client token |
| Eden's mind | VW | `edenMind state` 53 settings; `respond` moved valence 0.25→0.408 and returned an in-character reply; `stimulus` moved tension 0.12→0.292 |
| Tasks (native + Manus) | VW | `nativeTask` create/detail/list/stop exercised; Manus falls back to native when unkeyed |
| Templates | VW | 223 `Template` records |
| Releases + deploy | VW | approved release published to Vercel and fetched 200 with its real headline (Batch 32) |
| Share / client handoff | VW | two-page release rendered to public files; revoke enforced server-side (Batch 16) |
| Connectors | VW | probes: GitHub `x1-operator`, Supabase 5 projects, Gmail `x1operatornow@gmail.com` |
| Video studio (HeyGen) | PART · **PLAN** | account and catalog read fine; renders refused at **wallet $0** (`402 insufficient_credit`) |
| Live avatar (LiveAvatar) | PART | room runs; **no owned avatar** exists in LiveAvatar (`avatars.count = 0`), so it runs the vendor preview avatar |
| 24/7 keeper | DIS (by choice) | workflow active, keeper switched **off** by this audit to stop unattended credit spend |
| Scheduled workflows | INT | `Guardian Clock` reports **active but 0 runs**; `Automation Clock` and `Task Finished Automations` have **0 Automation records** to fire on |
| MCP server | INT | `base44/mcp/config.json` (oauth, 3 function tools) — activates on the next publish |
| Autopilot | INT | engine + clock exist; its browser verification has never completed end-to-end |
| Local compute (Ollama/WSL2/JARVIS-COMMAND) | NV | no line of this app reaches local hardware; nothing to verify from here |
| Docker ceilings (`docker-compose.yml`) | INT | file parses; no Docker daemon in this environment |

### Rehydration instructions

1. Read `PARITY_LEDGER.md` (last batch first) — it is the only claim register; a claim absent there is unproven.
2. Call `keyStatus` before trusting any external surface; it reports presence only, never values.
3. Call `guardian verify` for the current probe verdict; do not quote an older run as current.
4. Invariants: one Eden room per operator; every entity carries owner-or-admin RLS; no secret is read in the client bundle (0 `process.env` hits in `src`); the browser host and the avatar host are the app's own containers.
5. Known ceilings that no code here can lift: HeyGen renders need a funded wallet, LiveAvatar needs her avatar uploaded in its console, and the vendor caps a live session at 20 minutes (60s sandbox).