import { Request, Response } from 'express';
import { CoinbaseService } from '../services/coinbase.service';
import { AppDataSource } from '../config/datasource';
import { Conversion } from '../models/conversion.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Repository } from 'typeorm';

// Initialize default instances
const defaultCoinbaseService = new CoinbaseService();
const defaultRepository = AppDataSource.getRepository(Conversion);

export const createConversionHandler = (
  repository: Repository<Conversion> = defaultRepository,
  coinbaseService: CoinbaseService = defaultCoinbaseService
) => {
  return async (req: Request, res: Response) => {
    try {
      const { from , to, amount } = req.query;
      const userId = (req as AuthenticatedRequest).userId;

      if (!from || !to || !amount) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      // Validate currencies
      const [isFromValid, isToValid] = await Promise.all([
        coinbaseService.validateCurrency(from as string),
        coinbaseService.validateCurrency(to as string)
      ]);

      if (!isFromValid || !isToValid) {
        return res.status(400).json({ error: 'Invalid currency' });
      }

      const rate = await coinbaseService.getExchangeRate(from as string, to as string);
      const result = parseFloat(amount as string) * rate;

      // Save conversion to database
      const conversion = new Conversion();
      conversion.userId = userId;
      conversion.fromCurrency = from as string;
      conversion.toCurrency = to as string;
      conversion.amount = parseFloat(amount as string);
      conversion.result = result;
      conversion.responseBody = { rate, result };

      await repository.save(conversion);

      return res.json({
        from,
        to,
        amount: parseFloat(amount as string),
        rate,
        result
      });
    } catch (error) {
      console.error('Conversion error:', error);
      return res.status(500).json({ error: 'Conversion failed' });
    }
  };
};

export const convertCurrency = createConversionHandler(); 