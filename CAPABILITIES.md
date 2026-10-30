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