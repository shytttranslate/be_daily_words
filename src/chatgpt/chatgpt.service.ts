import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface ChatCompletionResult {
  content: string;
  role: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

const SYSTEM_PROMPT = `
Generate N English vocabulary words based on the given Content and CEFR level (A1–C2). N is specified in the user message (Number of words).

The Content may be in any language. If it is not English, first understand its meaning, then generate related English vocabulary.

Rules:
- Generate exactly the requested number of words.
- Do not exceed the specified CEFR level.
- Keep examples simple and level-appropriate.

Format:
Word (IPA) – POS
→ Vietnamese meaning
→ Example sentence
`;

@Injectable()
export class ChatgptService {
  private readonly client: OpenAI | null;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('chatgpt.apiKey') ?? '';
    const baseURL = this.config.get<string>('chatgpt.baseUrl');
    this.model = this.config.get<string>('chatgpt.model') ?? 'gpt-4o-mini';
    this.client = apiKey
      ? new OpenAI({
        apiKey,
        ...(baseURL && { baseURL }),
      })
      : null;
  }

  /**
   * Gửi tin nhắn đến ChatGPT (OpenAI Chat Completions API).
   */
  async chat(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {},
  ): Promise<ChatCompletionResult> {
    if (!this.client) {
      throw new HttpException(
        { error: 'chatgpt_not_configured', message: 'OPENAI_API_KEY is not set' },
        503,
      );
    }

    try {
      const response = await this.client.chat.completions.create({
        model: options.model ?? this.model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        max_tokens: options.max_tokens ?? 1024,
        temperature: options.temperature ?? 0.7,
      });

      const choice = response.choices?.[0];
      if (!choice?.message?.content) {
        throw new HttpException(
          { error: 'chatgpt_empty', message: 'No content in response' },
          502,
        );
      }

      return {
        content: choice.message.content,
        role: choice.message.role ?? 'assistant',
        usage: response.usage
          ? {
            prompt_tokens: response.usage.prompt_tokens,
            completion_tokens: response.usage.completion_tokens,
            total_tokens: response.usage.total_tokens ?? 0,
          }
          : undefined,
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'ChatGPT service error';
      const status =
        err && typeof (err as { status?: number }).status === 'number'
          ? (err as { status: number }).status
          : 502;
      throw new HttpException({ error: 'chatgpt_error', message }, status);
    }
  }

  /**
   * Gửi một câu user đơn giản (không system prompt).
   */
  async ask(userMessage: string, options?: ChatCompletionOptions): Promise<ChatCompletionResult> {
    return this.chat([{ role: 'user', content: userMessage }], options);
  }

  /**
   * Sinh từ vựng theo nội dung, CEFR level và số lượng từ (tùy chọn).
   */
  async generateVocabulary(
    content: string,
    level: string = 'B1',
    wordCount?: number,
    options?: ChatCompletionOptions,
  ): Promise<string> {
    const n = wordCount ?? 10;
    const userContent = `Content: ${content}\nCEFR Level: ${level}\nNumber of words: ${n}`;
    const result = await this.chat(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      { temperature: 0.4, ...options },
    );
    return result.content;
  }

  /**
   * Chat với system prompt.
   */
  async chatWithSystem(
    systemPrompt: string,
    userMessage: string,
    options?: ChatCompletionOptions,
  ): Promise<ChatCompletionResult> {
    return this.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      options,
    );
  }

}
