import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DailyWordsService } from './daily_words.service';

@Controller('/mail')
export class DailyWordsController {
  constructor(private readonly dailyWordsService: DailyWordsService) {}

  /** Phân độ khó từ: CEFR + tần suất SUBTLEX (gọi container word-difficulty) */
  @Get('/word/:word')
  async getWordDifficulty(@Param('word') word: string) {
    return this.dailyWordsService.getWordDifficulty(word);
  }

  @Post('/send')
  async sendEmail(@Body() body: unknown) {
    return this.dailyWordsService.sendEmail(body);
  }
}
