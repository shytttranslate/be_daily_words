import { Test, TestingModule } from '@nestjs/testing';
import { GCEModule } from '~@/google/gce/gce.module';
import { PubsubService } from '~@/shared/pubsub/pubsub.service';
import { RequestService } from '~@/shared/request/request.service';
import { SharedModule } from '~@/shared/shared.module';
import { TestModule } from '~@/shared/test/test.module';
import { EjoyService } from './ejoy.service';
jest.setTimeout(60 * 1000);
describe('Ejoy Spec', () => {
  let module: TestingModule;
  let ejoyService: EjoyService;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [SharedModule, TestModule, GCEModule],
      providers: [EjoyService],
    }).compile();
    ejoyService = module.get<EjoyService>(EjoyService);
  });
  afterEach(async () => {
    jest.clearAllMocks();
  });
  it('able to get information of a word', async () => {
    ejoyService
      .getWord('Disconnect')
      .then((res) => {
        console.log('ok', res);
      })
      .catch((err) => {
        console.log(err);
      });
  });
});
