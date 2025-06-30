process.on("message", async (data) => {
  if (
    !data ||
    typeof data.taskId !== "string" ||
    typeof data.message !== "string"
  ) {
    console.error("Invalid task data received");
    process.exit(1);
  }

  const startTime = Date.now();
  const workerId = process.pid.toString();

  try {
    const duration = parseInt(process.env.TASK_SIMULATED_DURATION || "500", 10);
    const failRate = parseInt(
      process.env.TASK_SIMULATED_ERROR_PERCENTAGE || "30",
      10
    );

    await new Promise((resolve) => setTimeout(resolve, duration));

    const failed = Math.random() * 100 < failRate;
    const resultDuration = Date.now() - startTime;

    process.send({
      taskId: data.taskId,
      success: !failed,
      duration: resultDuration,
      workerId: workerId,
      ...(failed && { error: "Simulated task failure" }),
    });

    process.exit(failed ? 1 : 0);
  } catch (error) {
    const resultDuration = Date.now() - startTime;

    console.error("Task processing error:", error);

    process.send({
      taskId: data.taskId,
      success: false,
      duration: resultDuration,
      workerId: workerId,
      error: error?.message || "Unknown error",
    });

    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  console.log("Worker received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("uncaughtException", async (error) => {
  console.error("Uncaught exception in worker:", error);
  process.exit(1);
});

console.log(`Task worker ${process.pid} ready`);
