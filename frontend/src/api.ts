import axios, { AxiosError } from "axios";

interface TaskResponse {
  id: string;
  message: string;
  status: string;
  createdAt: string;
}

interface StatsResponse {
  tasksProcessed: number;
  succeeded: number;
  failed: number;
  taskRetries: number;
  avgProcessingTime: number;
  currentQueueLength: number;
  idleWorkers: number;
  hotWorkers: number;
}

const API_URL = import.meta.env.VITE_API_URL;
const REQUEST_TIMEOUT = 5000;

const ERROR_MESSAGES = {
  API_URL_MISSING:
    "API URL is not configured. Please check your environment variables.",
  CREATE_TASK_FAILED: "Failed to create task",
  FETCH_STATS_FAILED: "Failed to fetch statistics",
} as const;

if (!API_URL) {
  throw new Error(ERROR_MESSAGES.API_URL_MISSING);
}

const api = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT,
});

const handleError = (error: unknown, defaultMessage: string): never => {
  if (error instanceof AxiosError) {
    throw new Error(`${defaultMessage}: ${error.message}`);
  }
  throw new Error(defaultMessage);
};

export const createTask = async (message: string): Promise<TaskResponse> => {
  try {
    const { data } = await api.post<TaskResponse>("/tasks", { message });
    return data;
  } catch (error) {
    return handleError(error, ERROR_MESSAGES.CREATE_TASK_FAILED);
  }
};

export const fetchStats = async (): Promise<StatsResponse> => {
  try {
    const { data } = await api.get<StatsResponse>("/statistics");
    return data;
  } catch (error) {
    return handleError(error, ERROR_MESSAGES.FETCH_STATS_FAILED);
  }
};
