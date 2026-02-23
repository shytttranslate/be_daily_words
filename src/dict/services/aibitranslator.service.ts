import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type {
  TranslateRequestDto,
  TranslateResponseDto,
} from './aibitranslator.dto';

const AIBIT_BASE_URL = 'https://api.aibitranslator.com';

@Injectable()
export class AibitranslatorService {
  constructor(private readonly config: ConfigService) { }

  /**
   * Dịch một từ/câu và lấy dict (các nghĩa, từ loại, reverse translation).
   * @param text - Từ hoặc câu cần dịch
   * @param to - Mã ngôn ngữ đích (vd: 'vi', 'en')
   * @param from - Mã ngôn ngữ nguồn, mặc định 'auto'
   * @param provider - Provider dịch, mặc định 'google'
   */
  async translateAndDict(
    text: string,
    to: string = 'vi',
    from: string = 'auto',
    provider: string = 'google',
  ): Promise<TranslateResponseDto> {
    const apiKey = this.config.get<string>('aibitranslator.apiKey') ?? '';
    console.log(apiKey)
    const body: TranslateRequestDto = { from, to, text, provider };
    try {
      const { data } = await axios.post<TranslateResponseDto>(
        `${AIBIT_BASE_URL}/api/v1/translator/text`,
        body,
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'x-aibit-key': apiKey,
          },
        },
      );
      console.log(data)
      return data;
    } catch (err: any) {
      const status = err.response?.status ?? 500;
      const message =
        err.response?.data?.message ?? err.message ?? 'Aibitranslator request failed';
      throw new HttpException({ error: 'aibitranslator_error', message }, status);
    }
  }
}
