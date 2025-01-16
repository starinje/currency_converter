import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export const authMiddleware = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Invalid authorization token' });
    }

    // For this implementation, were just using the token as the userId
    // In a real-world application, we would want use a more secure method to authenticate the user
    // (JWT or OAuth token for example)
    (req as AuthenticatedRequest).userId = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
}; 