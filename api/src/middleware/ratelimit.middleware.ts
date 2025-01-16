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
    const remaining = await rateLimitService.getRemainingRequests(userId);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const resetAt = new Date(tomorrow.setHours(0, 0, 0, 0));
    
    if (remaining <= 0) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        remaining: 0,
        resetAt
      });
    }

    // Add rate limit info to response body
    const originalJson = res.json.bind(res);
    res.json = (body: any) => originalJson({ 
      ...body, 
      remaining: body.error ? remaining : remaining - 1,
      resetAt 
    });

    next();
  } catch (error) {
    console.error('Rate limit error:', error);
    return res.status(500).json({ error: 'Error checking rate limit' });
  }
}; 