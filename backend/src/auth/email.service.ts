import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('email.host');
    const port = this.configService.get<number>('email.port');
    const user = this.configService.get<string>('email.user');
    const password = this.configService.get<string>('email.password');

    this.fromAddress =
      this.configService.get<string>('email.from') ?? 'noreply@example.com';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass: password,
      },
    });
  }

  async sendMagicLink(to: string, link: string) {
    await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject: 'Your magic sign-in link',
      text: `Use this link to sign in: ${link}`,
      html: `<p>Use this link to sign in:</p><p><a href="${link}">${link}</a></p>`,
    });
  }

  async sendPasswordReset(to: string, link: string) {
    await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject: 'Reset your password',
      text: `Reset your password using this link: ${link}`,
      html: `<p>Reset your password using this link:</p><p><a href="${link}">${link}</a></p>`,
    });
  }
}
