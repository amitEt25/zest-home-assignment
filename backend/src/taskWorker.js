process.on("message", async (data) => {
  if (
    !data ||
    typeof data.taskId !== "string" ||
    typeof data.message !== "string"
  ) {
    process.exit(1);
  }

  const startTime = Date.now();

  try {
    const duration = parseInt(process.env.TASK_SIMULATED_DURATION || "500", 10);
    const failRate = parseInt(
      process.env.TASK_SIMULATED_ERROR_PERCENTAGE || "70",
      10
    );

    await new Promise((resolve) => setTimeout(resolve, duration));

    const failed = Math.random() * 100 < failRate;
    const resultDuration = Date.now() - startTime;

    process.send({
      taskId: data.taskId,
      success: !failed,
      duration: resultDuration,
      ...(failed && { error: "Simulated task failure" }),
    });

    process.exit(failed ? 1 : 0);
  } catch (error) {
    process.send({
      taskId: data.taskId,
      success: false,
      duration: Date.now() - startTime,
      error: error?.message || "Unknown error",
    });
    process.exit(1);
  }
});
