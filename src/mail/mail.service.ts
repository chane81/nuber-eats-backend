import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { MailModuleOptions } from './mail.interfaces';
import { CONFIG_OPTIONS } from '../common/common.constants';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    this.sendEmail('테스트메일', '테스트임');
  }

  private async sendEmail(subject: string, content: string) {
    const Authorization = `Basic ${Buffer.from(
      `api:${this.options.apiKey}`,
    ).toString('base64')}`;

    const form = new FormData();
    form.append('from', this.options.fromEmail);
    form.append('to', 'chane81@naver.com');
    form.append('subject', subject);
    form.append('text', content);

    const response = await got(
      `https://api.mailgun.net/v3/${this.options.domain}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization,
        },
        body: form,
      },
    );

    console.log('res', response.body);
  }
}
