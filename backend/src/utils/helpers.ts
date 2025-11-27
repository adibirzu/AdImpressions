import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique ID
 * @returns A UUID string
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Calculates the average rating from an array of ratings
 * @param ratings - Array of rating values
 * @returns Average rating rounded to 2 decimal places
 */
export function calculateAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 100) / 100;
}

/**
 * Gets the start and end dates for the current week
 * @returns Object with week_start and week_end dates
 */
export function getCurrentWeekDates(): { week_start: string; week_end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday (0)

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return {
    week_start: weekStart.toISOString().split('T')[0],
    week_end: weekEnd.toISOString().split('T')[0]
  };
}

/**
 * Gets the start and end dates for the previous week
 * @returns Object with week_start and week_end dates
 */
export function getPreviousWeekDates(): { week_start: string; week_end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diff - 7);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return {
    week_start: weekStart.toISOString().split('T')[0],
    week_end: weekEnd.toISOString().split('T')[0]
  };
}

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns Boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates rating value (1-5)
 * @param rating - Rating value to validate
 * @returns Boolean indicating if rating is valid
 */
export function isValidRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

/**
 * Sanitizes user input to prevent XSS
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Formats a date to ISO string
 * @param date - Date to format
 * @returns ISO formatted date string
 */
export function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Paginates an array of items
 * @param items - Array of items to paginate
 * @param page - Page number (1-indexed)
 * @param limit - Number of items per page
 * @returns Paginated items and metadata
 */
export function paginate<T>(
  items: T[],
  page: number = 1,
  limit: number = 10
): {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} {
  const offset = (page - 1) * limit;
  const paginatedItems = items.slice(offset, offset + limit);

  return {
    data: paginatedItems,
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit)
    }
  };
}

export default {
  generateId,
  calculateAverageRating,
  getCurrentWeekDates,
  getPreviousWeekDates,
  isValidEmail,
  isValidRating,
  sanitizeInput,
  formatDate,
  paginate
};
