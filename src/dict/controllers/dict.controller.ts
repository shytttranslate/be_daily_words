import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AibitranslatorService } from '../services/aibitranslator.service';
import { DictService } from '../services/dict.service';
import { EjoyService } from '../services/ejoy.service';
import { TranslateBodyDto } from '../services/aibitranslator.dto';

@ApiTags('Dict')
@Controller('dict')
export class DictController {
  constructor(
    private readonly ejoyService: EjoyService,
    private readonly aibitranslatorService: AibitranslatorService,
    private readonly dictService: DictService,
  ) {}

  /**
   * Search một từ – gộp đầy đủ thông tin từ Ejoy (level, examples, phonetics) và Aibitranslator (trans, dict).
   * Query: to (mặc định 'vi').
   */
  @Get('search/:word')
  async searchWord(
    @Param('word') word: string,
    @Query('to') to?: string,
  ) {
    return this.dictService.getWordFull(word, to ?? 'vi');
  }

  @Get('/:word')
  async getWord(@Param('word') word: string) {
    return this.ejoyService.getWord(word);
  }

  /**
   * Dịch một từ/câu và lấy dict (trans + source_language + dict entries).
   * Body: { "text": "Hello", "from": "auto", "to": "vi", "provider": "google" }
   */
  @Post('translate')
  async translateAndDict(@Body() body: TranslateBodyDto) {
    return this.aibitranslatorService.translateAndDict(
      body.text,
      body.to ?? 'vi',
      body.from ?? 'auto',
      body.provider ?? 'google',
    );
  }
}
