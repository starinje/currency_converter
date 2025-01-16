import { Router } from 'express';
import { convertCurrency } from '../controllers/conversion.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimitMiddleware } from '../middleware/ratelimit.middleware';

const router = Router();

router.get(
  '/convert',
  authMiddleware,
  rateLimitMiddleware,
  convertCurrency
);

export default router; 