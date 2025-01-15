import { Request, Response, NextFunction } from 'express';
import { RateLimitService } from '../services/ratelimit.service';
import { AuthenticatedRequest } from './auth.middleware';

export const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const rateLimitService = new RateLimitService();

  try {
    const isAllowed = await rateLimitService.checkRateLimit(userId);
    
    if (!isAllowed) {
      const remaining = await rateLimitService.getRemainingRequests(userId);
      return res.status(429).json({
        error: 'Rate limit exceeded',
        remaining,
        resetAt: new Date(new Date().setHours(24, 0, 0, 0))
      });
    }

    // Get initial remaining count
    const remaining = await rateLimitService.getRemainingRequests(userId);
    
    // Store original json method
    const originalJson = res.json;
    
    // Override json method to include rate limit info
    res.json = function(body) {
      if (body && typeof body === 'object') {
        body.remaining = Math.max(0, remaining - 1); // Subtract 1 for the current request
        body.resetAt = new Date(new Date().setHours(24, 0, 0, 0));
      }
      return originalJson.call(this, body);
    };

    next();
  } catch (error) {
    console.error('Rate limit error:', error);
    return res.status(500).json({ error: 'Error checking rate limit' });
  }
}; 