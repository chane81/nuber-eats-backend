import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';
import { EmailVar } from './mail.interfaces';
import * as nodemailer from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';

const TEST_SMTP_USER = 'testuser@gmail.com';
const TEST_SMTP_PWD = '1111';
const TEST_FROM_EMAIL = 'test@gmail.com';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn<Partial<Mail>, []>(() => ({
    sendMail: jest.fn(async () => true),
  })),
}));

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            smtpUser: TEST_SMTP_USER,
            smtpPwd: TEST_SMTP_PWD,
            fromEmail: TEST_FROM_EMAIL,
          },
        },
      ],
    }).compile();

    // mail service get
    service = module.get<MailService>(MailService);
  });

  it('should be decined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should call sendEmail', () => {
      const sendVerificationEmailArgs = {
        email: 'email',
        code: 'code',
      };

      jest.spyOn(service, 'sendEmail').mockImplementation(async () => true);
      service.sendVerificationEmail(
        sendVerificationEmailArgs.email,
        sendVerificationEmailArgs.code,
      );

      expect(service.sendEmail).toBeCalledTimes(1);
      expect(service.sendEmail).toBeCalledWith('Verify Your Email', [
        {
          key: 'code',
          value: sendVerificationEmailArgs.code,
        },
        {
          key: 'username',
          value: sendVerificationEmailArgs.email,
        },
      ]);
    });
  });

  describe('sendEmail', () => {
    const subject = 'test-subject';
    const emailVars: EmailVar[] = [
      {
        key: 'code',
        value: 'test-code',
      },
      {
        key: 'username',
        value: 'test-user',
      },
    ];

    it('send email', async () => {
      const ok = await service.sendEmail(subject, emailVars);

      const transportSpy = jest.spyOn(nodemailer, 'createTransport');
      transportSpy.mockImplementation(jest.fn());

      const transportObj = {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          // gmail user email 입력 (ex. test@gmail.com)
          user: TEST_SMTP_USER,
          // gmail user password 입력
          pass: TEST_SMTP_PWD,
        },
      };

      expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
      expect(nodemailer.createTransport).toHaveBeenCalledWith(transportObj);

      let html = '<div>Hi! {{username}}</div><div>Your Code: {{code}}</div>';
      emailVars.forEach(({ key, value }) => {
        const matcher = new RegExp('{{' + key + '}}', 'g');
        html = html.replace(matcher, value);
      });

      expect(ok).toEqual(true);
    });

    it('fails on error', async () => {
      jest.spyOn(nodemailer, 'createTransport').mockImplementation(() => {
        throw new Error();
      });
      const ok = await service.sendEmail('', []);

      expect(ok).toEqual(false);
    });
  });
});
