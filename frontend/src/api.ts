import axios from "axios";

const API = '';

export const createTask = async (message: string) => {
  const res = await axios.post(`${API}/tasks`, { message });
  return res.data;
};

export const fetchStats = async () => {
  const res = await axios.get(`${API}/statistics`);
  return res.data;
};
