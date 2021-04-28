import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  /** inject repository */
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
  ) {}
}
