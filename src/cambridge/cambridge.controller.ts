import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CambridgeService } from './cambridge.service';

@ApiTags('Cambridge')
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
