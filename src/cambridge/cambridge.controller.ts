import { Controller, Get, Param } from '@nestjs/common';
import { CambridgeService } from './cambridge.service';

@Controller('cambridge')
export class CambridgeController {
  constructor(private readonly cambridgeService: CambridgeService) {}

  @Get()
  getInfo() {
    return { module: 'cambridge', status: 'ok' };
  }

  /** Lấy entry từ Cambridge (examples từ .sense-body .def-block) */
  @Get(':word')
  async getWordEntry(@Param('word') word: string) {
    return this.cambridgeService.getWordEntry(word);
  }
}
