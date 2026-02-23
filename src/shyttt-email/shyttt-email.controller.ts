import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ShytttEmailService } from './shyttt-email.service';
import { SendEmailDto } from './shyttt-email.dto';

@ApiTags('Mail')
@Controller('/mail')
export class ShytttEmailController {
    constructor(private readonly shytttEmailService: ShytttEmailService) {}
    @Post('/send')
    async sendEmail(@Body() body: SendEmailDto) {
        return this.shytttEmailService.sendEmail(body);
    }
}
