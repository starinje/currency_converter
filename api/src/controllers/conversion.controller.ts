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
      const { from, to, amount } = req.query as { 
        from: string; 
        to: string; 
        amount: string;
      };
      const userId = (req as AuthenticatedRequest).userId;

      if (!from || !to || !amount) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      // Validate amount is a valid number
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      // Validate currencies
      const [isFromValid, isToValid] = await Promise.all([
        coinbaseService.validateCurrency(from),
        coinbaseService.validateCurrency(to)
      ]);

      if (!isFromValid || !isToValid) {
        return res.status(400).json({ error: 'Invalid currency' });
      }

      // get the exchange rate from coinbase
      const rate = await coinbaseService.getExchangeRate(from, to);

      // Add currency pair validation
      if (from === to) {
        return res.status(400).json({ error: 'Cannot convert to same currency' });
      }

      // Add precision handling
      const result = Number((parsedAmount * rate).toFixed(8));

      const conversion = new Conversion();
      conversion.userId = userId;
      conversion.fromCurrency = from;
      conversion.toCurrency = to;
      conversion.amount = parsedAmount;
      conversion.result = result;
      conversion.responseBody = { rate, result };

      // Save conversion to database
      await repository.save(conversion);

      return res.json({
        from,
        to,
        amount: parsedAmount,
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