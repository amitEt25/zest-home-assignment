import axios from "axios";

const API = import.meta.env.VITE_API_URL || "";

export const createTask = async (message: string) => {
  try {
    const res = await axios.post(`${API}/tasks`, { message });
    return res.data;
  } catch (err) {
    throw new Error("Failed to create task");
  }
};

export const fetchStats = async () => {
  try {
    const res = await axios.get(`${API}/statistics`);
    return res.data;
  } catch (err) {
    throw new Error("Failed to fetch statistics");
  }
};
