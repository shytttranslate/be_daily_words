import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface PhoneticItem {
  text?: string;
  audio?: string;
  sourceUrl?: string;
  license?: { name: string; url: string };
}

export interface GetPhoneticsResult {
  word: string;
  phonetics: PhoneticItem[];
}

const TOPHONETICS_URL = 'https://tophonetics.com/';

@Injectable()
export class ToPhoneticService {
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl =
      this.config.get<string>(
        'toPhonetic.apiUrl',
        TOPHONETICS_URL,
      ) ?? TOPHONETICS_URL;
  }

  /**
   * Lấy phonetics (phiên âm) từ tophonetics.com.
   * POST form, parse #transcr_output (span.fr_norm) để lấy phiên âm.
   */
  async getPhonetics(word: string): Promise<GetPhoneticsResult> {
    const w = (word || '').trim();
    if (!w) {
      throw new HttpException(
        { error: 'word_required', message: 'word is required' },
        400,
      );
    }

    const body = new URLSearchParams({
      text_to_transcribe: w,
      submit: 'Show transcription',
      output_dialect: 'br',
      output_style: 'only_tr',
      preBracket: '',
      postBracket: '',
      speech_support: '1',
    }).toString();

    try {
      const { data: html } = await axios.post<string>(this.baseUrl.replace(/\/$/, '') || TOPHONETICS_URL, body, {
        timeout: 15000,
        headers: {
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'content-type': 'application/x-www-form-urlencoded',
          'referer': TOPHONETICS_URL,
        },
        maxRedirects: 5,
        responseType: 'text',
      });

      const phonetics = this.parseTranscrOutput(html);
      return { word: w, phonetics };
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? (err as { message?: string }).message : 'Phonetics service error';
      const status = (axios.isAxiosError(err) && (err as { response?: { status?: number } }).response?.status) || 502;
      throw new HttpException({ error: 'phonetics_error', message }, status);
    }
  }

  /**
   * Parse HTML: lấy nội dung #transcr_output, các span.fr_norm hoặc toàn bộ text.
   */
  private parseTranscrOutput(html: string): PhoneticItem[] {
    const $ = cheerio.load(html);
    const $output = $('#transcr_output');
    if (!$output.length) return [];

    const items: PhoneticItem[] = [];
    $output.find('span.fr_norm').each((_, el) => {
      const text = $(el).text().trim();
      if (text) items.push({ text });
    });

    if (items.length === 0) {
      const fullText = $output.text().replace(/\s+/g, ' ').trim();
      if (fullText) items.push({ text: fullText });
    }
    return items;
  }
}
