import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ChatgptService } from './chatgpt.service';

describe('ChatgptService', () => {
  let service: ChatgptService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const map: Record<string, string> = {
        'chatgpt.model': 'gpt-4o-mini',
        'chatgpt.baseUrl': 'https://api.openai.com/v1',
        'chatgpt.apiKey': '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',
      };
      return map[key];
    }),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatgptService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    service = module.get<ChatgptService>(ChatgptService);
  });

  describe('chat', () => {
    it('should be defined', () => {
      expect(service.chat).toBeDefined();
    });
    // TODO: add your tests
  });

  describe('generate Vocabulary', () => {
    it('should generate vocabulary', async () => {
      const vocabulary = await service.generateVocabulary('Tôi đang học Tiếng Anh, tôi không biết bắt đầu từ đâu, hãy cho tôi một số từ vựng', 'C1', 10);
      expect(vocabulary).toBeDefined();
      console.log(vocabulary)
    });
    // TODO: add your tests
  });
  describe('Generate Suggestions', () => {
    it.only('should generate vocabulary', async () => {
      const vocabulary = await service.generateSuggestions('Tôi đang học Tiếng Anh, tôi không biết bắt đầu từ đâu, hãy cho tôi một số từ vựng');
      expect(vocabulary).toBeDefined();
      console.log(vocabulary)
    });
    // TODO: add your tests
  });

});
