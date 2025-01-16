import { CoinbaseService } from '../coinbase.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CoinbaseService', () => {
  let service: CoinbaseService;

  beforeEach(() => {
    service = new CoinbaseService();
    jest.clearAllMocks();
  });

  describe('validateCurrency', () => {
    it('should return true for supported currencies', async () => {
      expect(await service.validateCurrency('BTC')).toBe(true);
      expect(await service.validateCurrency('USD')).toBe(true);
      expect(await service.validateCurrency('ETH')).toBe(true);
      expect(await service.validateCurrency('EUR')).toBe(true);
    });

    it('should return false for unsupported currencies', async () => {
      expect(await service.validateCurrency('XXX')).toBe(false);
      expect(await service.validateCurrency('')).toBe(false);
    });

    it('should be case insensitive', async () => {
      expect(await service.validateCurrency('btc')).toBe(true);
      expect(await service.validateCurrency('uSd')).toBe(true);
    });
  });

  describe('getExchangeRate', () => {
    it('should return exchange rate for valid currencies', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: {
            rates: {
              USD: '40000.00'
            }
          }
        }
      });

      const rate = await service.getExchangeRate('BTC', 'USD');
      expect(rate).toBe(40000);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.coinbase.com/v2/exchange-rates',
        { params: { currency: 'BTC' } }
      );
    });

    it('should throw error when rate not found', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: {
            rates: {}
          }
        }
      });

      await expect(service.getExchangeRate('BTC', 'XXX'))
        .rejects
        .toThrow('Exchange rate not found for BTC to XXX');
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.getExchangeRate('BTC', 'USD'))
        .rejects
        .toThrow('Failed to get exchange rate: API Error');
    });
  });
}); 