import { Inject, Injectable } from '@nestjs/common';
import { MailModuleOptions } from './mail.interfaces';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { EmailVar } from './mail.interfaces';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  // 기존 mailgun 으로 메일 보내던 것을 nodemailer 모듈 사용방법으로 변경
  public async sendEmail(
    subject: string,
    emailVars: EmailVar[],
  ): Promise<boolean> {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          // gmail user email 입력 (ex. test@gmail.com)
          user: this.options.smtpUser,
          // gmail user password 입력
          pass: this.options.smtpPwd,
        },
      });

      let html =
        '<div>Hi! {{username}}</div><div>Your Code: {{code}}</div><div style="margin-top: 20px;"><a href="http://localhost:3000/confirm?code={{code}}" style="height:12px;border:1px solid #5c7cfa;background-color:#5c7cfa;color:white; padding: 8px;text-decoration: none;">Verify Your E-Mail</a></div>';
      emailVars.forEach(({ key, value }) => {
        const matcher = new RegExp('{{' + key + '}}', 'g');
        html = html.replace(matcher, value);
      });

      // send email
      await transporter.sendMail({
        // 보내는 곳 메일 주소
        from: this.options.fromEmail,
        // 받는 곳의 메일 주소
        to: 'chane81@naver.com',
        // 제목
        subject: subject,
        html,
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify Your Email', [
      {
        key: 'code',
        value: code,
      },
      {
        key: 'username',
        value: email,
      },
    ]);
  }
}
