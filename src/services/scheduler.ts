/**
 * Scheduler for running periodic tasks
 */
export class Scheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Schedule a task to run periodically
   * @param name Task name
   * @param task Function to execute
   * @param intervalMinutes Interval in minutes
   */
  scheduleTask(
    name: string,
    task: () => Promise<void>,
    intervalMinutes: number
  ): void {
    // Convert minutes to milliseconds
    const intervalMs = intervalMinutes * 60 * 1000;

    // Clear existing interval if it exists
    this.clearTask(name);

    // Create a wrapper that handles errors
    const safeTask = async () => {
      try {
        await task();
      } catch (error) {
        console.error(`Error in scheduled task ${name}:`, error);
      }
    };

    // Run the task immediately
    safeTask();

    // Set up the interval
    const interval = setInterval(safeTask, intervalMs);
    this.intervals.set(name, interval);

    console.log(
      `Scheduled task "${name}" to run every ${intervalMinutes} minutes`
    );
  }

  /**
   * Clear a scheduled task
   * @param name Task name
   */
  clearTask(name: string): void {
    const interval = this.intervals.get(name);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(name);
      console.log(`Cleared scheduled task "${name}"`);
    }
  }

  /**
   * Clear all scheduled tasks
   */
  clearAllTasks(): void {
    for (const [name, interval] of this.intervals.entries()) {
      clearInterval(interval);
      console.log(`Cleared scheduled task "${name}"`);
    }
    this.intervals.clear();
  }
}

// Create a singleton instance
export const scheduler = new Scheduler();
