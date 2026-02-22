import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ToPhoneticService, GetPhoneticsResult } from './to-phonetic.service';

const mockAxiosPost = jest.fn();

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: (...args: unknown[]) => mockAxiosPost(...args),
    isAxiosError: (err: unknown): boolean =>
      typeof (err as { isAxiosError?: boolean })?.isAxiosError === 'boolean'
        ? (err as { isAxiosError: boolean }).isAxiosError
        : false,
  },
}));

describe('ToPhoneticService', () => {
  let service: ToPhoneticService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      if (key === 'toPhonetic.apiUrl') return defaultValue ?? 'https://tophonetics.com/';
      return undefined;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToPhoneticService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    service = module.get<ToPhoneticService>(ToPhoneticService);
  });

  describe('getPhonetics', () => {
    it('should return phonetics when POST returns HTML with #transcr_output', async () => {
      const html = '<div id="transcr_output"><span id="w0" class="fr_norm">ˈtɛstɪŋ</span><br /></div>';
      mockAxiosPost.mockResolvedValueOnce({ data: html });

      const result = (await service.getPhonetics('testing')) as unknown as GetPhoneticsResult;

      expect(result.word).toBe('testing');
      expect(result.phonetics).toHaveLength(1);
      expect(result.phonetics[0].text).toBe('ˈtɛstɪŋ');
      expect(mockAxiosPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('text_to_transcribe=testing'),
        expect.any(Object),
      );
    });

    it('should trim word and use it in request', async () => {
      const html = '<div id="transcr_output"><span class="fr_norm">/test/</span></div>';
      mockAxiosPost.mockResolvedValueOnce({ data: html });

      const result = (await service.getPhonetics('  test  ')) as unknown as GetPhoneticsResult;

      expect(result.word).toBe('test');
      expect(result.phonetics[0].text).toBe('/test/');
      expect(mockAxiosPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('text_to_transcribe=test'),
        expect.any(Object),
      );
    });

    it('should throw HttpException 400 when word is empty', async () => {
      await expect(service.getPhonetics('')).rejects.toThrow(HttpException);
      const err = await service.getPhonetics('').catch((e) => e);
      expect(err.getStatus()).toBe(400);
      expect(err.getResponse()).toMatchObject({ error: 'word_required' });
      expect(mockAxiosPost).not.toHaveBeenCalled();
    });

    it('should throw HttpException 400 when word is only whitespace', async () => {
      await expect(service.getPhonetics('   ')).rejects.toThrow(HttpException);
      const err = await service.getPhonetics('   ').catch((e) => e);
      expect(err.getStatus()).toBe(400);
      expect(mockAxiosPost).not.toHaveBeenCalled();
    });

    it('should return empty phonetics when #transcr_output is missing', async () => {
      mockAxiosPost.mockResolvedValueOnce({ data: '<html><body>no output</body></html>' });

      const result = (await service.getPhonetics('x')) as unknown as GetPhoneticsResult;

      expect(result.word).toBe('x');
      expect(result.phonetics).toEqual([]);
    });

    it('should return multiple phonetics for multiple span.fr_norm', async () => {
      const html =
        '<div id="transcr_output">' +
        '<span class="fr_norm">ˈwʌn</span> <span class="fr_norm">ˈtuː</span>' +
        '</div>';
      mockAxiosPost.mockResolvedValueOnce({ data: html });

      const result = (await service.getPhonetics('one two')) as unknown as GetPhoneticsResult;

      expect(result.phonetics).toHaveLength(2);
      expect(result.phonetics[0].text).toBe('ˈwʌn');
      expect(result.phonetics[1].text).toBe('ˈtuː');
    });

    it('should throw HttpException on POST error', async () => {
      const err500 = new Error('Network Error') as Error & { isAxiosError: boolean; response?: { status?: number } };
      err500.isAxiosError = true;
      err500.response = { status: 500 };
      mockAxiosPost.mockRejectedValueOnce(err500);

      await expect(service.getPhonetics('hello')).rejects.toThrow(HttpException);
      const err = await service.getPhonetics('hello').catch((e) => e);
      expect([500, 502]).toContain(err.getStatus());
      expect(err.getResponse()).toMatchObject({ error: 'phonetics_error' });
    });

    it('should handle entries with missing phonetics array', async () => {
      const html = '<div id="transcr_output"><span class="fr_norm">/test/</span></div>';
      mockAxiosPost.mockResolvedValueOnce({ data: html });

      const result = (await service.getPhonetics('test')) as unknown as GetPhoneticsResult;

      expect(result.phonetics).toHaveLength(1);
      expect(result.phonetics[0].text).toBe('/test/');
    });
  });
});
