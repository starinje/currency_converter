import { RateLimitService } from '../ratelimit.service';
import { AppDataSource } from '../../config/datasource';
import { Repository } from 'typeorm';
import { Conversion } from '../../models/conversion.model';

jest.mock('../../config/datasource', () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

describe('RateLimitService', () => {
  let service: RateLimitService;
  let mockRepository: jest.Mocked<Repository<Conversion>>;

  beforeEach(() => {
    mockRepository = {
      count: jest.fn()
    } as any;

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
    service = new RateLimitService();

    // Mock the private isWeekend method
    Object.defineProperty(service, 'isWeekend', {
      value: jest.fn().mockReturnValue(false)
    });
  });

  describe('getRemainingRequests', () => {
    it('should calculate remaining weekday requests', async () => {
      mockRepository.count.mockResolvedValue(30);
      const remaining = await service.getRemainingRequests('user123');
      expect(remaining).toBe(70); // 100 - 30
    });

    it('should calculate remaining weekend requests', async () => {
      (service as any).isWeekend.mockReturnValue(true);
      mockRepository.count.mockResolvedValue(150);
      const remaining = await service.getRemainingRequests('user123');
      expect(remaining).toBe(50); // 200 - 150
    });

    it('should return 0 when over limit', async () => {
      mockRepository.count.mockResolvedValue(250);
      const remaining = await service.getRemainingRequests('user123');
      expect(remaining).toBe(0);
    });

    it('should handle database errors', async () => {
      mockRepository.count.mockRejectedValue(new Error('DB Error'));
      await expect(service.getRemainingRequests('user123')).rejects.toThrow('DB Error');
    });
  });
}); 