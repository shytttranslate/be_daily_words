import { Module } from '@nestjs/common';
import { DictController } from './controllers/dict.controller';
import { AibitranslatorService } from './services/aibitranslator.service';
import { DictService } from './services/dict.service';
import { EjoyService } from './services/ejoy.service';

@Module({
  controllers: [DictController],
  providers: [EjoyService, AibitranslatorService, DictService],
})
export class DictModule {}
