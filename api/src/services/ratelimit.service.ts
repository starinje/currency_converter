import { AppDataSource } from '../config/datasource';
import { Conversion } from '../models/conversion.model';
import { Between } from 'typeorm';

export class RateLimitService {
  private readonly weekdayLimit = 100;
  private readonly weekendLimit = 200;
  private readonly repository = AppDataSource.getRepository(Conversion);

  private isWeekend(): boolean {
    const day = new Date().getDay();
    return day === 0 || day === 6;  // 0 is Sunday, 6 is Saturday
  }

  private getDailyLimit(): number {
    return this.isWeekend() ? this.weekendLimit : this.weekdayLimit;
  }

  async getRemainingRequests(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const count = await this.repository.count({
      where: {
        userId,
        createdAt: Between(today, new Date())
      }
    });

    return Math.max(0, this.getDailyLimit() - count);
  }
} 