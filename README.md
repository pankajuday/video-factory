# Video Factory

Video Factory is a full-stack video processing and streaming platform.
It lets users register, log in, upload MP4 videos, and watch them with adaptive HLS playback.

The project is split into three apps:

- `api`: Express + Bun backend for auth, upload, metadata, and streaming endpoints
- `worker`: background transcoding worker using BullMQ + FFmpeg
- `web`: React + Vite frontend for upload and playback

---

## What this project does

- User authentication (`register` and `login`)
- Secure video upload (`.mp4`, up to 500MB)
- Background transcoding to HLS formats
- Adaptive streaming through `.m3u8` playlists and `.ts` segments
- Video listing and playback in browser with quality selection

---

## Tech stack

### Backend (`api`)
- Bun runtime
- Express 5 + TypeScript
- MongoDB (Mongoose)
- Redis + BullMQ queue
- Multer for file uploads
- JWT auth

### Worker (`worker`)
- Bun runtime
- BullMQ worker
- FFmpeg + ffprobe for transcoding and media inspection
- MongoDB + Redis

### Frontend (`web`)
- React 19 + TypeScript
- Vite
- Axios
- hls.js

### DevOps
- Docker + Docker Compose
- Shared Docker volume for media and generated HLS output

---

## High-level architecture

1. User uploads a video from the frontend.
2. API stores the original file in `media/uploads` and creates a DB record with `processing` status.
3. API pushes a job to Redis (BullMQ).
4. Worker consumes the job, runs FFmpeg, and creates HLS assets in `media/videos/<uniqueName>/`.
5. Worker saves transcoding metadata to MongoDB.
6. Frontend requests HLS playlist by `videoId` and plays stream with `hls.js`.

---

## Project structure

```text
video-factory/
├─ api/                  # Auth, upload, and streaming API
├─ worker/               # Background transcoding worker
├─ web/                  # React frontend
├─ media/
│  ├─ uploads/           # Raw uploaded videos
│  └─ videos/            # Generated HLS outputs
├─ script/               # Utility scripts (cleanup/testing)
└─ docker-compose.yml
```

---

## API routes

Base URL: `http://127.0.0.1:8000/api/v1`

### Health
- `GET /healthcheck`

### User
- `POST /users/register`
- `POST /users/login`

### Video
- `POST /video/upload` (auth required, `multipart/form-data`, field: `video`)
- `GET /video/all` (auth required)
- `GET /video/:videoId` (auth required)

### HLS
- `GET /hls/:videoId`

> Notes:
> - Auth token is accepted from `accessToken` cookie or `Authorization: Bearer <token>`.
> - Uploaded file type is limited to `.mp4`.

---

## Environment setup

Create environment files from samples:

- `api/.env` from `api/.env.sample`
- `worker/.env` from `worker/.env.sample`
- `web/.env` from `web/.env.sample`

For Docker Compose in this repo, create these files too (compose expects them):

- `api/.env.docker`
- `worker/.env.docker`
- `web/.env.docker`

You can start by copying the same values from the `.env` files and then adjusting hostnames (`mongodb`, `redis`, etc.) for container networking.

### Required variables (API)

| Key | Example | Purpose |
|---|---|---|
| `DEV_ENV` | `local` or `production` | Environment behavior |
| `MONGO_URI` | `mongodb://127.0.0.1:27017` | MongoDB connection |
| `PORT` | `8000` | API server port |
| `CORS_ORIGIN` | `*` or frontend URL | CORS allowlist |
| `ACCESS_TOKEN_SECRET` | `your-secret` | JWT access signing |
| `ACCESS_TOKEN_EXPIRY` | `1d` | Access token TTL |
| `REFRESH_TOKEN_SECRET` | `your-secret` | JWT refresh signing |
| `REFRESH_TOKEN_EXPIRY` | `10d` | Refresh token TTL |
| `REDIS_URI` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |

### Required variables (Worker)

| Key | Example | Purpose |
|---|---|---|
| `DEV_ENV` | `local` or `production` | Controls media root |
| `MONGO_URI_W` | `mongodb://127.0.0.1:27017` | Worker MongoDB connection |
| `REDIS_URI` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |

### Required variables (Web)

| Key | Example | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://127.0.0.1:8000/api/v1` | API base URL used by frontend |

---

## Run with Docker (recommended)

### Prerequisites
- Docker Desktop

### Start

```powershell
cd d:\study-mat\project\video-factory
docker compose up --build
```

### Access
- Frontend: `http://localhost:3000`
- API: `http://localhost:8000`

### Stop

```powershell
docker compose down
```

---

## Run locally (without Docker)

### Prerequisites
- Bun (same runtime used in the project)
- Node-compatible toolchain for frontend build
- MongoDB running locally
- Redis running locally
- FFmpeg + ffprobe installed and available in `PATH` (worker needs this)

### 1) API

```powershell
cd d:\study-mat\project\video-factory\api
bun install
bun run dev
```

### 2) Worker

```powershell
cd d:\study-mat\project\video-factory\worker
bun install
bun run dev
```

### 3) Web

```powershell
cd d:\study-mat\project\video-factory\web
bun install
bun run dev
```

Open the frontend URL printed by Vite (usually `http://localhost:5173`).

---

## Typical user flow

1. Register at `/register`
2. Login at `/login`
3. Upload a `.mp4` from `/upload`
4. Wait while worker finishes transcoding
5. Go to `/` and play available videos

---

## Important implementation details

- Queue name/job name are configured in both API and worker constants.
- API serves static HLS files under `/api/v1/hls` and also provides playlist route by `videoId`.
- Worker removes the original uploaded file after successful HLS generation.
- Generated outputs are stored per video under `media/videos/<uniqueName>/`.

---

## Known caveats / cleanup suggestions

- `docker-compose.yml` references `.env.docker` files that are not committed in this repo, so create them before running compose.
- `web/.env.sample` currently points to `http://localhost:5000`; for this API setup use `http://127.0.0.1:8000/api/v1`.
- Local media path constants are currently absolute paths; if you move the repo, update constants accordingly.

---

## Useful scripts and folders

- `script/db_clean.js`: database cleanup helper
- `script/media_clean.js`: media cleanup helper
- `script/test.ps1`: PowerShell test helper

---

## License

No license file is currently included.

