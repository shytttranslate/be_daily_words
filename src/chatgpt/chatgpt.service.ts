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
Prompt (revised):

  Generate N English vocabulary words based on the given Content and CEFR level (A1–C2).
  The value of N is specified in the user message.

  The Content may be in any language. If it is not English, first understand its meaning, then generate relevant English vocabulary.

Rules:

  Generate exactly N words.

  All words must be at or below the specified CEFR level.

  Keep example sentences simple and appropriate to the level.

Output format:
  Return the result as an array, where each element has the following structure:
  [
    {
      "word": "Word",
      "ipa": "IPA",
      "pos": "Part of Speech",
      "level": "CEFR level",
      "meaning_vi": "Vietnamese meaning",
      "example": "Example sentence"
    }
  ]
Only return the array. Do not add explanations or extra text.
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
    return JSON.parse(result.content);
  }

  /**
   * Intent-based suggestions for English learners: từ input của user (có thể bất kỳ ngôn ngữ),
   * hiểu ý định và trả về đúng 5 gợi ý category/theme ngắn (tối đa 4 từ, tiếng Anh).
   */
  async generateSuggestions(
    userInput: string,
    options?: ChatCompletionOptions,
  ): Promise<string> {
    const systemContent =
      'You generate short learning-related suggestions.';
    const userContent = `You are an intent-based suggestion generator for English learners.

User input:
${userInput}

Task:
- Understand the user's purpose or intention from the input.
- Generate exactly 5 short suggestion categories related to that purpose.
- Each suggestion must:
  - Be a category or theme
  - Be relevant to learning English
  - Contain no more than 4 words
  - Be written in User Input's Language
  - Not be a full sentence

Output format:
Suggestions:
1. ...
2. ...
3. ...
4. ...
5. ...

Rules:
- Do not explain the suggestions.`;

    const result = await this.chat(
      [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent },
      ],
      { temperature: 0.4, model: this.model, ...options },
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
