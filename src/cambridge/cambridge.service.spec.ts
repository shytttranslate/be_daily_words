import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import config from '../configuration';
import { CambridgeService, CambridgeWordResult } from './cambridge.service';

jest.setTimeout(30000);

describe('CambridgeService', () => {
  let service: CambridgeService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [config], isGlobal: true }),
      ],
      providers: [CambridgeService],
    }).compile();
    service = module.get<CambridgeService>(CambridgeService);
  });



  describe('Test Ejoy', () => {
    it('test ejoy', async () => {
      const result = await service.getWordByEjoy('hello');
      console.log(result)
    })
  })
});
