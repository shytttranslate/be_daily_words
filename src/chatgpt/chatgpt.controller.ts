import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatgptService, ChatMessage, ChatCompletionOptions } from './chatgpt.service';

class AskDto {
  message!: string;
  system?: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

class ChatDto {
  messages!: ChatMessage[];
  options?: ChatCompletionOptions;
}

@ApiTags('ChatGPT')
@Controller('chatgpt')
export class ChatgptController {
  constructor(private readonly chatgptService: ChatgptService) {}

  /** Hỏi đơn giản: POST { "message": "..." } hoặc { "message": "...", "system": "..." } */
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
  @Post('chat')
  async chat(@Body() body: ChatDto) {
    return this.chatgptService.chat(body.messages, body.options ?? {});
  }
}
