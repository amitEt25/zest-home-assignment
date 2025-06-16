import axios, { AxiosError } from "axios";
import type { StatsResponse, TaskResponse } from "./interface";

const API_URL = import.meta.env.VITE_API_URL || "";
const REQUEST_TIMEOUT = Number(import.meta.env.VITE_REQUEST_TIMEOUT);

const ERROR_MESSAGES = {
  API_URL_MISSING:
    "API URL is not configured. Please check your environment variables.",
  CREATE_TASK_FAILED: "Failed to create task",
  FETCH_STATS_FAILED: "Failed to fetch statistics",
} as const;

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
