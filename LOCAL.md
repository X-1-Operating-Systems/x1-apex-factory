# X1 Apex Factory — cloud primary, local understudy

The app runs on Base44 (`https://x1-apex-factory.base44.app`). Two of its engines run in containers
this repo owns, and they can live anywhere: Railway today, or your own machine with
`docker compose up`. Nothing else about the app changes when you move them — one secret pair points
at whichever host is live.

| layer | where it runs | how it is reached |
|---|---|---|
| App, entities, functions, workflows | Base44 (cloud primary) | always cloud |
| Browser engine (`browser-host/`) | any Docker host | `BROWSER_HOST_URL` + `BROWSER_HOST_TOKEN`, or the Railway service |
| Avatar renderer (`avatar-host/`) | any Docker host | `AVATAR_HOST_URL` + `AVATAR_HOST_TOKEN`, or the Railway service |
| Eden's live room | LiveAvatar (rented) | `LIVEAVATAR_API_KEY` |
| HeyGen renders | HeyGen (rented) | `HEYGEN_API_KEY` |

## Run the containers locally

```bash
cp .env.example .env                    # then: openssl rand -hex 32 for each token
docker compose up -d --build
curl -s localhost:8081/health           # avatar-host
curl -s localhost:8082/health           # browser-host
```

Point the app at them (Dashboard → Secrets, or `set_secrets`), replacing the Railway values:

```
AVATAR_HOST_URL=http://localhost:8081     AVATAR_HOST_TOKEN=<the token you generated>
BROWSER_HOST_URL=http://localhost:8082    BROWSER_HOST_TOKEN=<the token you generated>
```

Clear those two pairs to fall back to the Railway services, which resolve from `RAILWAY_API_KEY`.

Note: `localhost` only works if the app can reach your machine. For a browser on another device, or
if the cloud app must reach it, expose the container (Cloudflare Tunnel, Tailscale, or a public
Docker host) and use that URL instead.

## The ceilings

These are enforced by the container runtime, not by app code — the kernel stops a runaway job, not a
promise in TypeScript. Tune them in `docker-compose.yml`:

| ceiling | avatar-host | browser-host |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| Memory | 6 GB, no swap beyond it | 4 GB, plus 1 GB `/dev/shm` for Chromium |
| Processes | 512 | 2048 |
| Work cap | `MAX_RENDER_SECONDS` (7200) / `MAX_CHARS` (20000) | `MAX_SESSIONS` (50) / `HARD_CAP_SECONDS` (21600) |
| Restart | `unless-stopped` — survives reboots and crashes | same |
| Logs | 10 MB × 3 files, then rotated | same |

Inside the app, `Guardian` reports what each engine actually did (browser minutes, sessions, renders)
and the guardrail bar on `/admin` reads the host's own counters, so the ceiling that binds is visible
rather than inferred.

## 24/7 presence

Eden's live room is capped per session by LiveAvatar: 60 seconds in its free sandbox, 20 minutes
live. Continuity comes from rollover, not from a longer session.

- **With a tab open** the page asks the server to keep the room, every 15 seconds.
- **With nothing open** the `Eden 24/7` workflow calls `edenLive` with `action: "auto"` every five
  minutes, and the room rolls over just before it lapses. It is inert while the keeper switch on
  `/live` is off.
- Sandbox cycles are free and 60 seconds. Live cycles bill 2 credits per minute around the clock:
  the credit balance is on the same page, and it is the only real limit on how long she can stay.

## Sandbox and templates

- **Sandbox** is the browser engine's own isolation: every session gets its own Chromium context on
  the host's volume, no session can see another, and `HARD_CAP_SECONDS` closes an abandoned one. Use
  a session for anything speculative — the control plane, an agent run, or a QA pass — and release it
  when the answer arrives.
- **Templates** live in the `Template` entity, seeded from `base44/shared/catalog/pack1..6` through
  the catalog registry. The library, the dashboard row and the Autopilot all read the same records,
  so a template added once is available everywhere.

## What still needs the cloud

Login, entity storage, workflows, the MCP server, and the app itself. A local-only install of this
repo gives you the two engines, not the studio: the studio's data lives in Base44, and that is by
design (cloud primary, local understudy).