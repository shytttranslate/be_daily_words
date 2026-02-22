import { Module } from '@nestjs/common';
import { ShytttEmailService } from './shyttt-email.service';
import { ShytttEmailController } from './shyttt-email.controller';

@Module({
  providers: [ShytttEmailService],
  controllers: [ShytttEmailController]
})
export class ShytttEmailModule {}
