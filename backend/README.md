# Tasks Microservice Backend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and configure as needed:
   ```bash
   cp .env.example .env
   ```
3. Start the server:
   ```bash
   npm run dev
   # or
   npm start
   ```

## Environment Variables

- `SERVER_PORT` — HTTP server port
- `TASK_SIMULATED_DURATION` — Simulated duration (ms) per task attempt
- `TASK_SIMULATED_ERROR_PERCENTAGE` — Simulated task error percentage (0-100)
- `TASK_ERROR_RETRY_DELAY` — Delay (ms) between retries
- `WORKER_TIMEOUT` — Time (ms) a worker needs to be idle before it is cleaned up
- `TASK_MAX_RETRIES` — Maximum retry attempts per task

## Endpoints

### POST /tasks
- Accepts: `{ "message": string }`
- Returns: `{ "taskId": string }`

### GET /statistics
- Returns processing metrics in JSON.

## Logs
- Task logs are written to `logs/tasks.log`. 