import { Request, Response } from 'express';
import { createConversionHandler } from '../conversion.controller';
import { CoinbaseService } from '../../services/coinbase.service';
import { AppDataSource } from '../../config/datasource';
import { Conversion } from '../../models/conversion.model';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { Repository } from 'typeorm';

// Mock the entire module
jest.mock('../../services/coinbase.service', () => {
  return {
    CoinbaseService: jest.fn().mockImplementation(() => ({
      validateCurrency: jest.fn().mockResolvedValue(true),
      getExchangeRate: jest.fn().mockResolvedValue(40000),
      baseUrl: 'https://api.coinbase.com/v2',
      supportedCurrencies: ['USD', 'EUR', 'BTC', 'ETH']
    }))
  };
});

describe('ConversionController', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockRepository: jest.Mocked<Repository<Conversion>>;
  let coinbaseService: CoinbaseService;
  let consoleErrorSpy: jest.SpyInstance;
  let handler: (req: Request, res: Response) => Promise<any>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Setup request mock
    mockRequest = {
      userId: 'user123',
      query: {
        from: 'BTC',
        to: 'USD',
        amount: '1'
      }
    };

    // Setup response mock
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Get instance of mocked service
    coinbaseService = new CoinbaseService();

    // Setup repository mock
    mockRepository = {
      save: jest.fn().mockImplementation((entity: Partial<Conversion>) => Promise.resolve(entity as Conversion))
    } as unknown as jest.Mocked<Repository<Conversion>>;

    // Create handler instance
    handler = createConversionHandler(mockRepository, coinbaseService);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should successfully convert currency', async () => {
    await handler(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.json).toHaveBeenCalledWith({
      from: 'BTC',
      to: 'USD',
      amount: 1,
      rate: 40000,
      result: 40000
    });
  });

  it('should handle missing parameters', async () => {
    mockRequest.query = {};

    await handler(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Missing required parameters'
    });
  });

  it('should handle invalid currencies', async () => {
    (coinbaseService.validateCurrency as jest.Mock).mockResolvedValueOnce(false);

    await handler(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid currency'
    });
  });

  it('should handle API errors', async () => {
    (coinbaseService.getExchangeRate as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    await handler(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith('Conversion error:', expect.any(Error));
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Conversion failed'
    });
  });

  it('should save conversion to database', async () => {
    await handler(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user123',
      fromCurrency: 'BTC',
      toCurrency: 'USD',
      amount: 1,
      result: 40000,
      responseBody: {
        rate: 40000,
        result: 40000
      }
    }));
  });
}); 