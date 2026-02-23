import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiProperty, ApiPropertyOptional, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatgptService, ChatMessage, ChatCompletionOptions } from './chatgpt.service';

class AskDto {
  @ApiProperty({ description: 'Nội dung tin nhắn', example: 'Hello, how are you?' })
  message!: string;

  @ApiPropertyOptional({ description: 'System prompt (tùy chọn)' })
  system?: string;

  @ApiPropertyOptional({ description: 'Model (vd: gpt-4o-mini)' })
  model?: string;

  @ApiPropertyOptional({ description: 'Max tokens' })
  max_tokens?: number;

  @ApiPropertyOptional({ description: 'Temperature (0-2)' })
  temperature?: number;
}

class ChatMessageDto {
  @ApiProperty({ enum: ['system', 'user', 'assistant'], description: 'Vai trò' })
  role!: 'system' | 'user' | 'assistant';

  @ApiProperty({ description: 'Nội dung' })
  content!: string;
}

class ChatOptionsDto {
  @ApiPropertyOptional()
  model?: string;
  @ApiPropertyOptional()
  max_tokens?: number;
  @ApiPropertyOptional()
  temperature?: number;
}

class ChatDto {
  @ApiProperty({ type: [ChatMessageDto], description: 'Danh sách messages' })
  messages!: ChatMessage[];

  @ApiPropertyOptional({ type: ChatOptionsDto })
  options?: ChatCompletionOptions;
}

class GenerateVocabularyDto {
  @ApiProperty({
    description: 'Nội dung/ngữ cảnh để sinh từ vựng',
    example: 'Tôi đang học Tiếng Anh, tôi không biết bắt đầu từ đâu',
  })
  content!: string;

  @ApiPropertyOptional({ description: 'CEFR level (A1–C2)', default: 'B1' })
  level?: string;

  @ApiPropertyOptional({ description: 'Số từ cần sinh', default: 10 })
  wordCount?: number;
}

class GenerateSuggestionsDto {
  @ApiProperty({
    description: 'Input của user (ý định, có thể tiếng Việt hoặc bất kỳ)',
    example: 'Tôi muốn đi du lịch',
  })
  userInput!: string;
}

@ApiTags('ChatGPT')
@Controller('chatgpt')
export class ChatgptController {
  constructor(private readonly chatgptService: ChatgptService) {}

  /** Hỏi đơn giản: POST { "message": "..." } hoặc { "message": "...", "system": "..." } */
  @ApiBody({ type: AskDto })
  @ApiResponse({ status: 200, description: 'Nội dung phản hồi từ model' })
  @Post('ask')
  async ask(@Body() body: AskDto) {
    const opts: ChatCompletionOptions = {
      model: body.model,
      max_tokens: body.max_tokens,
      temperature: body.temperature,
    };
    if (body.system) {
      return this.chatgptService.chatWithSystem(body.system, body.message, opts);
    }
    return this.chatgptService.ask(body.message, opts);
  }

  /** Chat với danh sách messages: POST { "messages": [...], "options": {} } */
  @ApiBody({ type: ChatDto })
  @ApiResponse({ status: 200, description: 'content, role, usage' })
  @Post('chat')
  async chat(@Body() body: ChatDto) {
    return this.chatgptService.chat(body.messages, body.options ?? {});
  }

  /**
   * Sinh từ vựng theo nội dung, CEFR level và số lượng từ.
   * Body: { "content": "...", "level": "B1", "wordCount": 10 }
   */
  @ApiBody({ type: GenerateVocabularyDto })
  @ApiResponse({ status: 200, description: 'Trả về { content: string }' })
  @Post('vocabulary')
  async generateVocabulary(@Body() body: GenerateVocabularyDto) {
    const text = await this.chatgptService.generateVocabulary(
      body.content,
      body.level ?? 'B1',
      body.wordCount,
    );
    return { content: text };
  }

  /**
   * Gợi ý intent-based cho người học (5 category/theme, tối đa 4 từ).
   * Body: { "userInput": "..." }
   */
  @ApiBody({ type: GenerateSuggestionsDto })
  @ApiResponse({ status: 200, description: 'Trả về { content: string }' })
  @Post('suggestions')
  async generateSuggestions(@Body() body: GenerateSuggestionsDto) {
    const text = await this.chatgptService.generateSuggestions(body.userInput);
    return { content: text };
  }
}
