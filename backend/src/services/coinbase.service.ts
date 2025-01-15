import axios from 'axios';

export class CoinbaseService {
  private readonly baseUrl = 'https://api.coinbase.com/v2';
  private readonly supportedCurrencies = ['USD', 'EUR', 'BTC', 'ETH'];

  async getExchangeRate(from: string, to: string): Promise<number> {
    try {
      const response = await axios.get(`${this.baseUrl}/exchange-rates`, {
        params: { currency: from }
      });

      const rate = response.data.data.rates[to];
      if (!rate) {
        throw new Error(`Exchange rate not found for ${from} to ${to}`);
      }

      return parseFloat(rate);
    } catch (error) {
      throw new Error(`Failed to get exchange rate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateCurrency(currency: string): Promise<boolean> {
    return this.supportedCurrencies.includes(currency.toUpperCase());
  }
} 