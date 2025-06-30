# ZEST Tasks Microservice

---

This project is a microservice-based app for processing asynchronous tasks, with a real-time dashboard for monitoring.
It features a Node.js/Express backend and a React/Vite frontend, letting users submit tasks and track live statistics.

---

## Project Structure

```
/            # Root directory
├─ backend/  # Node.js API and worker logic & tests
├─ frontend/ # React dashboard application & tests
```

---

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, Jest
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
cp .env.example .env   # Configure as needed
npm run dev            # or: npm start
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env   # Configure as needed
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000) and will proxy API calls to the backend.

---

## Configuration

### Backend (`backend/.env`)

- `SERVER_PORT` — HTTP server port
- `TASK_SIMULATED_DURATION` — Task processing duration in ms
- `TASK_SIMULATED_ERROR_PERCENTAGE` — Simulated failure rate (0-100)
- `TASK_ERROR_RETRY_DELAY` — Delay before retrying a failed task (ms)
- `WORKER_TIMEOUT` — Idle time before a worker exits (ms)
- `TASK_MAX_RETRIES` — Maximum retry attempts per task

### Frontend (`frontend/.env`)

- `VITE_API_URL` — Base URL for the backend API.  
  If you're using the Vite proxy (during development). Leave as "" if using Vite’s proxy.
- `VITE_REQUEST_TIMEOUT` — API request timeout in ms

---

## Application Overview

1. Task Submission:
   Frontend validates that message is a non-empty string, then calls POST /tasks.

2. Enqueue & Processing:
   Backend assigns a UUID, enqueues the task, and returns { taskId } immediately. A pool of workers (up to CPU cores) picks up tasks, simulates processing (sleep + random failure), and retries up to TASK_MAX_RETRIES.

3. Logging:
   Each attempt—success or final failure—is appended atomically to logs/tasks.log with timestamp, worker ID, task ID and message.

4. Real-Time Statistics:
   Frontend polls GET /statistics every 1.5s and displays live metrics.

---

## API

### POST `/tasks`

- Request body: `{ "message": "your task here" }`
- Validation: Returns 400 Bad Request if message is missing or not a string.
- Response: `{ "taskId": "..." }`

### GET `/statistics`

- Response example:

  ```json
  {
    "tasksProcessed": 42,
    "tasksCompleted": 42,
    "taskRetries": 15,
    "succeeded": 35,
    "failed": 7,
    "avgProcessingTime": 512,
    "currentQueueLength": 0,
    "idleWorkers": 4,
    "hotWorkers": 0
  }
  ```

---

## Testing

Backend
From backend/:

```bash
npm test
```

Unit tests (stats, logger, queue, workerManager, etc.)

---

## Logs

- All task events are recorded in `logs/tasks.log`.

---

## Additional Notes

- Workers scale up to the machine’s CPU-core count and exit after WORKER_TIMEOUT ms of idleness.

- Retried tasks respect TASK_ERROR_RETRY_DELAY and stop after TASK_MAX_RETRIES.

- Configuration is driven entirely by environment variables—no hard-coded values.

- Frontend uses Material-UI for a clean, responsive dashboard.

---

## License

MIT
