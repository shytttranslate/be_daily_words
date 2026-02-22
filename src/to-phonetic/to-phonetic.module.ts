import { Module } from '@nestjs/common';
import { ToPhoneticService } from './to-phonetic.service';
import { ToPhoneticController } from './to-phonetic.controller';

@Module({
  providers: [ToPhoneticService],
  controllers: [ToPhoneticController],
  exports: [ToPhoneticService],
})
export class ToPhoneticModule {}
