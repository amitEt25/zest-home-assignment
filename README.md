# ZEST Tasks Microservice

---

This project is a microservice-based app for processing asynchronous tasks, with a real-time dashboard for monitoring.
It features a Node.js/Express backend and a React/Vite frontend, letting users submit tasks and track live statistics.

---

## Project Structure

```
/            # Root directory
├─ backend/  # Node.js API and worker logic
├─ frontend/ # React dashboard application
```

---

## Tech Stack

- **Backend:** Node.js, Express, TypeScript
- **Frontend:** React, Vite, TypeScript, Material-UI
- **Other:** Axios (HTTP client), UUID (task IDs), dotenv (env management)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/amitEt25/zest-home-assignment.git
cd zest-home-assignment
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env   # Configure environment variables as needed
npm run dev            # or: npm start
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env   # Configure as needed
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000) and will communicate with the backend.

---

## Configuration

### Backend (`backend/.env`)

- `SERVER_PORT` — API server port
- `TASK_SIMULATED_DURATION` — Task processing duration in ms
- `TASK_SIMULATED_ERROR_PERCENTAGE` — Simulated failure rate (0-100)
- `TASK_ERROR_RETRY_DELAY` — Delay before retrying a failed task (ms)
- `WORKER_TIMEOUT` — Idle time before a worker exits (ms)
- `TASK_MAX_RETRIES` — Maximum retry attempts per task

### Frontend (`frontend/.env`)

- `VITE_API_URL` — The base URL for the backend API.  
  If you're using the Vite proxy (during development), set this to an empty string (`""`).
- `VITE_REQUEST_TIMEOUT` — API request timeout in ms

---

## Application Overview

- **Task Submission:** Users submit tasks via the frontend UI. The backend enqueues each task for processing.
- **Processing:** Workers (up to the number of CPU cores) process tasks, simulating work and random failures.
- **Retries:** Failed tasks are retried with a delay, up to the configured maximum.
- **Logging:** Each task attempt (success or failure) is logged with a timestamp, worker ID, task ID, and message.
- **Live Statistics:** The dashboard displays total attempts, retries, successes, failures, average processing time, queue length, and worker status.

---

## API

### POST `/tasks`

- Request body: `{ "message": "your task here" }`
- Response: `{ "taskId": "..." }`

### GET `/statistics`

- Response example:
  ```json
  {
    "tasksProcessed": 0,
    "taskRetries": 0,
    "succeeded": 0,
    "failed": 0,
    "avgProcessingTime": 0,
    "currentQueueLength": 0,
    "idleWorkers": 0,
    "hotWorkers": 0
  }
  ```

---

## Logs

- All task events are recorded in `logs/tasks.log`.

---

## Additional Notes

- The number of workers is determined by the number of CPU cores.
- Workers exit after being idle for a configurable period.
- All configuration is managed via environment variables.
- The frontend uses Material-UI for a modern interface.

---

## License

MIT
