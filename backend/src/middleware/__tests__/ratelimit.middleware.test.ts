import { Request, Response, NextFunction } from 'express';
import { rateLimitMiddleware } from '../ratelimit.middleware';
import { RateLimitService } from '../../services/ratelimit.service';
import { AuthenticatedRequest } from '../auth.middleware';

jest.mock('../../services/ratelimit.service');

describe('rateLimitMiddleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let mockRateLimitService: jest.Mocked<RateLimitService>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {
      userId: 'user123'
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
    mockRateLimitService = {
      checkRateLimit: jest.fn().mockResolvedValue(true),
      getRemainingRequests: jest.fn().mockResolvedValue(50)
    } as any;

    (RateLimitService as jest.Mock).mockImplementation(() => mockRateLimitService);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should allow request when under rate limit', async () => {
    mockRateLimitService.checkRateLimit.mockResolvedValue(true);

    await rateLimitMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should block request when over rate limit', async () => {
    mockRateLimitService.checkRateLimit.mockResolvedValue(false);
    mockRateLimitService.getRemainingRequests.mockResolvedValue(0);

    await rateLimitMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(429);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Rate limit exceeded',
      remaining: 0
    }));
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    mockRateLimitService.checkRateLimit.mockRejectedValue(new Error('Service error'));

    await rateLimitMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Error checking rate limit'
    });
  });
}); 