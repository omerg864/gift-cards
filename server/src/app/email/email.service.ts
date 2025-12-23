import { Injectable, Logger } from '@nestjs/common';
import * as ejs from 'ejs';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import { EMAIL_SUBJECTS, EMAIL_TEMPLATES, EmailContextMap } from './constants';

interface EmailOptions<T extends EMAIL_SUBJECTS> {
  to: string;
  template: T;
  context: EmailContextMap[T];
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail<T extends EMAIL_SUBJECTS>(
    subject: T,
    options: EmailOptions<T>,
    retries = 3,
  ): Promise<boolean> {
    const { to, template, context } = options;

    try {
      const templateName = EMAIL_TEMPLATES[template];
      const templatePath = path.join(
        __dirname,
        'templates',
        `${templateName}.ejs`,
      );
      const html = await ejs.renderFile(templatePath, context);

      for (let i = 0; i < retries; i++) {
        try {
          const info = await this.transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
          });
          this.logger.log(`Email sent: ${info.messageId}`);
          return true;
        } catch (error) {
          this.logger.error(`Error sending email (attempt ${i + 1})`, error);
          if (i === retries - 1) {
            this.logger.error('Failed to send email after multiple attempts');
          }
        }
      }
    } catch (error) {
      this.logger.error('Error rendering email template or sending', error);
    }
    return false;
  }
}
