import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('conversions')
export class Conversion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  fromCurrency!: string;

  @Column()
  toCurrency!: string;

  @Column('decimal', { precision: 18, scale: 8 })
  amount!: number;

  @Column('decimal', { precision: 18, scale: 8 })
  result!: number;

  @Column('jsonb')
  responseBody!: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;
} 