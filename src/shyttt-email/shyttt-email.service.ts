import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { SendEmailDto } from './shyttt-email.dto';

@Injectable()
export class ShytttEmailService {
    async sendEmail(body: SendEmailDto) {
        await this._send(body)
        console.log('completed')
    }
    private async  _send(body:SendEmailDto) {
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
