import React, { useEffect, useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Box,
  Alert,
  Stack,
  useTheme,
} from "@mui/material";
import { createTask, fetchStats } from "./api";
import CircularProgress from "@mui/material/CircularProgress";
import type { StatsResponse } from "./interface";

const App = () => {
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const theme = useTheme();

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await createTask(message);
      setMessage("");
      setSuccess("Task added successfully!");
      setTimeout(() => setSuccess(null), 2000);
      await loadStats();
    } catch {
      setError("Failed to add task");
    }
    setLoading(false);
  };

  const loadStats = async () => {
    setError(null);
    try {
      const data = await fetchStats();
      setStats({
        tasksProcessed: data.tasksProcessed,
        succeeded: data.succeeded,
        failed: data.failed,
        taskRetries: data.taskRetries,
        avgProcessingTime: data.avgProcessingTime,
        currentQueueLength: data.currentQueueLength,
        idleWorkers: data.idleWorkers,
        hotWorkers: data.hotWorkers,
      });
    } catch {
      setError("Failed to fetch statistics");
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      minHeight="100vh"
      width="100vw"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.light} 100%)`,
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Card
          elevation={8}
          sx={{
            borderRadius: 4,
            p: 4,
            boxShadow: 6,
            width: "100%",
            maxWidth: 500,
          }}
        >
          <CardContent>
            <Typography
              variant="h3"
              align="center"
              fontWeight={700}
              gutterBottom
              color="primary"
            >
              ZEST Task Processor
            </Typography>
            <Typography align="center" color="text.secondary" sx={{ mb: 4 }}>
              Asynchronous Task Queue & Real-Time Metrics
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="center"
              sx={{ mb: 2 }}
            >
              <TextField
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setError(null);
                  setSuccess(null);
                }}
                placeholder="Enter task message"
                label="Task Message"
                variant="outlined"
                fullWidth
                size="medium"
                autoFocus
              />
              <Button
                onClick={handleSubmit}
                disabled={loading || !message.trim()}
                variant="contained"
                size="large"
                sx={{ minWidth: 120, fontWeight: 600 }}
              >
                {loading ? "Adding..." : "Add Task"}
              </Button>
            </Stack>
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Typography variant="h5" sx={{ mt: 4, mb: 2 }} fontWeight={600}>
              <span role="img" aria-label="bar chart">
                📊
              </span>{" "}
              Statistics
            </Typography>
            <Card
              variant="outlined"
              sx={{
                bgcolor: "background.paper",
                p: 2,
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontFamily: "Fira Mono, monospace",
                }}
              >
                {stats ? (
                  JSON.stringify(stats, null, 2)
                ) : (
                  <CircularProgress size={24} />
                )}
              </pre>
            </Card>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default App;
