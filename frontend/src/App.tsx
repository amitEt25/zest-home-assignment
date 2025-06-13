import React, { useEffect, useState } from "react";
import { createTask, fetchStats } from "./api";

const App = () => {
  const [message, setMessage] = useState("");
  type Stats = {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
  };

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    await createTask(message);
    setMessage("");
    await loadStats();
    setLoading(false);
  };

  const loadStats = async () => {
    const data = await fetchStats();
    setStats(data);
  };

  useEffect(() => {
    const interval = setInterval(loadStats, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>ZEST Task Processor</h1>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter task message"
        style={{ padding: "8px", width: "300px" }}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginLeft: 10 }}
      >
        {loading ? "Adding..." : "Add Task"}
      </button>

      <h2 style={{ marginTop: 30 }}>📊 Statistics:</h2>
      <pre
        style={{
          background: "#fff",
          padding: 10,
          color: "#000",
          borderRadius: 8,
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          marginTop: 10,
        }}
      >
        {stats ? JSON.stringify(stats, null, 2) : "Loading..."}
      </pre>
    </div>
  );
};

export default App;
