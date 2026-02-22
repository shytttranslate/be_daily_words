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

  /** Chi tiết từ: CEFR + SUBTLEX từ image word-difficulty */
  @Get('/get-word-detail/:word')
  async getWordDetail(@Param('word') word: string) {
    return this.dailyWordsService.getWordDetail(word);
  }

  @Post('/send')
  async sendEmail(@Body() body: unknown) {
    return this.dailyWordsService.sendEmail(body);
  }
}
