import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import nodemailer from 'nodemailer';

@Injectable()
export class DailyWordsService {
  constructor(private readonly config: ConfigService) {}

  /** Gọi container word-difficulty (CEFR + SUBTLEX) */
  async getWordDifficulty(word: string): Promise<{
    word: string;
    cefr_level: string | null;
    cefr_level_float: number | null;
    frequency: number | null;
    freq_per_million: number | null;
    cefr_error?: string;
  }> {
    const baseUrl = this.config.get<string>('wordDifficulty.baseUrl', 'http://localhost:8000');
    const url = `${baseUrl.replace(/\/$/, '')}/word/${encodeURIComponent(word)}`;
    try {
      const { data } = await axios.get(url, { timeout: 10000 });
      return data;
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.message : 'word-difficulty service unavailable';
      const status = (axios.isAxiosError(err) && err.response?.status) || 502;
      throw new HttpException({ error: 'word_difficulty_error', message }, status);
    }
  }

  async sendEmail(body) {
    await this._send(body)
    console.log('completed')
  }
  private async _send(body) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465, // or 587 with secure: false
      secure: true,
      auth: {
        user: 'thinhpham12051996@gmail.com',
        pass: 'ipnu nmen elnj ecrb', // 16-char app password
      },
    });

    const info = await transporter.sendMail({
      from: 'ShytttEmail <thinhpham12051996@gmail.com>',
      to: body.email,
      subject: body.subject,
      text: body.message,
    });

    console.log('Message ID:', info.messageId);
  }
}
