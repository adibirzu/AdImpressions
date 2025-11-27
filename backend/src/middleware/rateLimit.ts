import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
}

/**
 * Simple in-memory rate limiter middleware
 * @param options - Rate limit configuration options
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
  const maxRequests = options.maxRequests || parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
  const message = options.message || 'Too many requests, please try again later.';

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    // Initialize or get the current rate limit data for this IP
    if (!store[ip] || store[ip].resetTime < now) {
      store[ip] = {
        count: 1,
        resetTime: now + windowMs
      };
      next();
      return;
    }

    // Increment the request count
    store[ip].count++;

    // Check if the limit has been exceeded
    if (store[ip].count > maxRequests) {
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil((store[ip].resetTime - now) / 1000)
      });
      return;
    }

    next();
  };
}

/**
 * Stricter rate limiter for sensitive endpoints like voting
 */
export function strictRateLimit() {
  return rateLimit({
    windowMs: 60000, // 1 minute
    maxRequests: 10,
    message: 'Too many requests to this endpoint, please slow down.'
  });
}

/**
 * Clean up old entries from the rate limit store periodically
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  Object.keys(store).forEach(ip => {
    if (store[ip].resetTime < now) {
      delete store[ip];
    }
  });
}

// Clean up every hour
setInterval(cleanupRateLimitStore, 3600000);

export default {
  rateLimit,
  strictRateLimit,
  cleanupRateLimitStore
};
