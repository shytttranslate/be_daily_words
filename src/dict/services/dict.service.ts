import { Injectable } from '@nestjs/common';
import type { EjoyPart, WordSearchResultDto } from './aibitranslator.dto';
import { AibitranslatorService } from './aibitranslator.service';
import { EjoyService } from './ejoy.service';

@Injectable()
export class DictService {
  constructor(
    private readonly ejoyService: EjoyService,
    private readonly aibitranslatorService: AibitranslatorService,
  ) { }

  /**
   * Gộp thông tin từ Ejoy + Aibitranslator cho một từ: level, examples, phonetics (ejoy) + trans, dict (aibitranslator).
   * Gọi song song hai dịch vụ; nếu một lỗi vẫn trả về phần kia (phần lỗi = null).
   */
  async getWordFull(word: string, to: string = 'vi'): Promise<WordSearchResultDto> {
    const trimmed = (word || '').trim();
    const result: WordSearchResultDto = {
      word: trimmed,
      ejoy: null,
      translate: null,
    };
    const res = await this.aibitranslatorService.translateAndDict(trimmed, to, 'auto', 'google');
    console.log(res)
    const [ejoySettled, translateSettled] = await Promise.allSettled([
      this.getEjoyPart(trimmed),
      this.aibitranslatorService.translateAndDict(trimmed, to, 'auto', 'google'),
    ]);

    if (ejoySettled.status === 'fulfilled') result.ejoy = ejoySettled.value;
    if (translateSettled.status === 'fulfilled') result.translate = translateSettled.value;

    return result;
  }

  private async getEjoyPart(word: string): Promise<EjoyPart | null> {
    try {
      const result = await this.ejoyService.getWord(word);
      return result as EjoyPart;
    } catch {
      return null;
    }
  }
}
