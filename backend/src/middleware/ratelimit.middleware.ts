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
    next();
  } catch (error) {
    console.error('Rate limit error:', error);
    return res.status(500).json({ error: 'Error checking rate limit' });
  }
}; 