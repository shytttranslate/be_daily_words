import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  @Get('/health-check')
  async getHealthCheck() {
    return {
      name: process.env.APP_NAME,
      status: 'ready',
    };
  }
}
