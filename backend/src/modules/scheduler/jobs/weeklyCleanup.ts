import analyticsService from '../../analytics/analytics.service';

/**
 * Weekly cleanup job
 * Archives analytics data from the previous week
 */
export async function weeklyCleanupJob(): Promise<void> {
  console.log('Running weekly cleanup job...');

  try {
    // Archive previous week's data
    analyticsService.archivePreviousWeek();

    console.log('Weekly cleanup job completed successfully');
  } catch (error) {
    console.error('Error running weekly cleanup job:', error);
    throw error;
  }
}

export default weeklyCleanupJob;
