# X1 avatar host — her face, on our own metal

One container. It stores her image **exactly as uploaded** (no vendor moderation, no re-encode),
turns text into speech with a local voice model, and re-syncs her mouth to that audio with
Wav2Lip. You own the weights, the CPU and the bytes.

## What it exposes

| Route | Purpose |
| --- | --- |
| `GET /health` | Liveness, whether an image and the model weights are present |
| `POST /avatar` | Upload the still to animate (multipart `file`) — stored byte-for-byte |
| `GET /avatar` | Read back the stored still |
| `POST /render` | `{ text }` → starts a render; returns a job id |
| `GET /renders` | Recent jobs plus usage counters |
| `GET /renders/:id` | One job: `queued` → `speaking` → `animating` → `done` / `failed` |
| `GET /renders/:id.mp4` | The finished video |

Everything except `/health` needs `Authorization: Bearer $HOST_TOKEN`.

## Environment

| Variable | Required | Meaning |
| --- | --- | --- |
| `HOST_TOKEN` | yes | Long random string (`openssl rand -hex 32`) |
| `PORT` | no | Default `8080` |
| `DATA_DIR` | no | Default `/data` — mount a volume here to keep the image and renders |
| `MAX_RENDER_SECONDS` | no | Default `900`. Hard cap per render |
| `MAX_CHARS` | no | Default `1200`. Script length cap per render |

## Deploy (Railway)

1. Root directory `avatar-host` (it picks up the `Dockerfile`).
2. Add `HOST_TOKEN`.
3. Add a volume at `/data`.
4. Deploy. The image is ~3 GB (torch CPU + weights) and the first build takes 10–15 minutes.

CPU inference, so it renders a short clip in minutes rather than streaming live. For real-time
presence you need a GPU host; the same container runs there unchanged.

## Connect it to the app

Set `AVATAR_HOST_URL` and `AVATAR_HOST_TOKEN` in the app's secrets, then open **Live avatar**.