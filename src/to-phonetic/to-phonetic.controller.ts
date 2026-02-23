import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ToPhoneticService } from './to-phonetic.service';

@ApiTags('To Phonetic')
@Controller('to-phonetic')
export class ToPhoneticController {
  constructor(private readonly toPhoneticService: ToPhoneticService) {}

  /** Lấy phonetics (phiên âm) của một từ */
  @Get(':word')
  async getPhonetics(@Param('word') word: string) {
    return this.toPhoneticService.getPhonetics(word);
  }
}
