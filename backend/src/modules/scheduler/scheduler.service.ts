import cron from 'node-cron';
import dotenv from 'dotenv';
import weeklyCleanupJob from './jobs/weeklyCleanup';

dotenv.config();

export class SchedulerService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Initialize all scheduled jobs
   */
  init(): void {
    console.log('Initializing scheduled jobs...');

    // Weekly cleanup job - runs every Sunday at midnight
    const weeklyCleanupCron = process.env.WEEKLY_CLEANUP_CRON || '0 0 * * 0';
    this.scheduleJob('weekly-cleanup', weeklyCleanupCron, weeklyCleanupJob);

    console.log(`Scheduled jobs initialized: ${this.jobs.size} jobs running`);
  }

  /**
   * Schedule a job
   */
  private scheduleJob(
    name: string,
    cronExpression: string,
    task: () => void | Promise<void>
  ): void {
    if (!cron.validate(cronExpression)) {
      console.error(`Invalid cron expression for job "${name}": ${cronExpression}`);
      return;
    }

    const job = cron.schedule(cronExpression, async () => {
      console.log(`Running scheduled job: ${name}`);
      try {
        await task();
      } catch (error) {
        console.error(`Error in scheduled job "${name}":`, error);
      }
    });

    this.jobs.set(name, job);
    console.log(`Scheduled job "${name}" with cron: ${cronExpression}`);
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll(): void {
    console.log('Stopping all scheduled jobs...');
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`Stopped job: ${name}`);
    });
    this.jobs.clear();
  }

  /**
   * Stop a specific job
   */
  stopJob(name: string): boolean {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      this.jobs.delete(name);
      console.log(`Stopped job: ${name}`);
      return true;
    }
    return false;
  }

  /**
   * Get the status of all jobs
   */
  getJobsStatus(): { name: string; running: boolean }[] {
    return Array.from(this.jobs.entries()).map(([name, job]) => ({
      name,
      running: true // cron.ScheduledTask doesn't expose a status property
    }));
  }
}

export default new SchedulerService();
