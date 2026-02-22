import { Module } from '@nestjs/common';
import { CambridgeService } from './cambridge.service';
import { CambridgeController } from './cambridge.controller';

@Module({
  providers: [CambridgeService],
  controllers: [CambridgeController],
  exports: [CambridgeService],
})
export class CambridgeModule {}
