import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../auth.middleware';

describe('authMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  it('should pass valid bearer token', () => {
    mockRequest.headers = {
      authorization: 'Bearer validtoken123'
    };

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should reject missing authorization header', () => {
    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'No authorization token provided'
    });
  });

  it('should reject invalid authorization format', () => {
    mockRequest.headers = {
      authorization: 'InvalidFormat token123'
    };

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'No authorization token provided'
    });
  });

  it('should reject empty token', () => {
    mockRequest.headers = {
      authorization: 'Bearer '
    };

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid authorization token'
    });
  });

  it('should set userId on request object', () => {
    const token = 'validtoken123';
    mockRequest.headers = {
      authorization: `Bearer ${token}`
    };

    authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect((mockRequest as any).userId).toBe(token);
  });
}); 