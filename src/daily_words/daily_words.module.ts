import { Module } from '@nestjs/common';
import { DailyWordsService } from './daily_words.service';
import { DailyWordsController } from './daily_words.controller';

@Module({
  providers: [DailyWordsService],
  controllers: [DailyWordsController]
})
export class DailyWordsModule { }
