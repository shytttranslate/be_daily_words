import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as cheerio from 'cheerio';
import md5 from 'md5';
import * as fs from 'fs';
import * as path from 'path';
export interface CambridgeWordResult {
  word: string;
  url: string;
  examples: string[];
}

/** Kết quả rút gọn từ ejoy: level phổ biến nhất, tối đa 3 ví dụ, phonetics & sound */
export interface EjoyWordResult {
  word: string;
  level: string | null;
  examples: string[];
  phonetics: {
    uk_pronun?: string;
    uk_sound?: string;
    us_pronun?: string;
    us_sound?: string;
    grammar?: string;
  };
}

const CAMBRIDGE_REFERER = 'https://dictionary.cambridge.org';

@Injectable()
export class CambridgeService {
  private readonly baseUrl: string;
  private HASH_CODE = 'ego';
  private keyHash = 'R10-ego-fs1knl34l2flksdlk3mlsf0-kfdsjksf';
  constructor(private readonly config: ConfigService) {
    this.baseUrl =
      this.config.get<string>('cambridge.baseUrl') ??
      'https://dictionary.cambridge.org/vi/dictionary/english';
  }

  /**
   * Fetch trang từ điển Cambridge cho một từ và lấy examples từ .sense-body .def-block
   */
  async getWordEntry(word: string): Promise<CambridgeWordResult> {
    const w = (word || '').trim();
    if (!w) {
      throw new HttpException(
        { error: 'word_required', message: 'word is required' },
        400,
      );
    }

    const url = `${this.baseUrl.replace(/\/$/, '')}/${encodeURIComponent(w)}`;
    try {
      const { data: html } = await axios.get<string>(url, {
        timeout: 15000,
        headers: {
          accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'accept-language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
          'cache-control': 'no-cache',
          pragma: 'no-cache',
          referer: CAMBRIDGE_REFERER,
          'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'same-origin',
          'sec-fetch-user': '?1',
          'upgrade-insecure-requests': '1',
        },
        maxRedirects: 5,
        responseType: 'text',
      });
      console.log(html)

      const examples = this.parseExamples(html);
      return { word: w, url, examples };
    } catch (err: unknown) {
      console.log(err)
      const message = axios.isAxiosError(err)
        ? (err as { message?: string }).message
        : 'Cambridge service error';
      const status =
        (axios.isAxiosError(err) &&
          (err as { response?: { status?: number } }).response?.status) ||
        502;
      throw new HttpException({ error: 'cambridge_error', message }, status);
    }
  }

  /**
   * Parse HTML: lấy example từ .sense-body .def-block (container sense-body > def-block)
   */
  parseExamples(html: string): string[] {
    const $ = cheerio.load(html);
    const examples: string[] = [];
    $('.sense-body .def-block').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text) examples.push(text);
    });
    return [...new Set(examples)];
  }


  _hash(...input) {
    const hashCode = input.length > 1 && input[1] !== undefined ? input[1] : this.HASH_CODE;
    return md5(hashCode + input[0]);
  }
  /**
   * Lấy dữ liệu từ ejoy API, ghi full JSON ra file, trả về: level (phổ biến nhất), tối đa 3 ví dụ, phonetics & sound.
   */






}
