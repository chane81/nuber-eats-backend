import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';
import * as FormData from 'form-data';
import { EmailVar } from './mail.interfaces';
import got from 'got';

jest.mock('got');
jest.mock('form-data');

const TEST_DOMAIN = 'TEST-DOMAIN';
const TEST_API_KEY = 'TEST-API-KEY';

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: TEST_API_KEY,
            domain: TEST_DOMAIN,
            fromEmail: 'TEST-FROM-EMAIL',
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
      expect(service.sendEmail).toBeCalledWith(
        'Verify Your Email',
        'verify-email',
        [
          {
            key: 'code',
            value: sendVerificationEmailArgs.code,
          },
          {
            key: 'username',
            value: sendVerificationEmailArgs.email,
          },
        ],
      );
    });
  });

  describe('sendEmail', () => {
    const subject = 'test-subject';
    const template = 'test-template';
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
      const ok = await service.sendEmail(subject, template, emailVars);
      const formSpy = jest.spyOn(FormData.prototype, 'append');

      // form append test
      expect(formSpy).toHaveBeenCalledTimes(6);
      expect(formSpy).toHaveBeenCalledWith(
        'from',
        `chane81 from Nuber Eats <mailgun@${TEST_DOMAIN}>`,
      );
      expect(formSpy).toHaveBeenCalledWith('to', 'chane81@naver.com');
      expect(formSpy).toHaveBeenCalledWith('subject', subject);
      expect(formSpy).toHaveBeenCalledWith('template', template);
      emailVars.forEach((eVar) => {
        expect(formSpy).toHaveBeenCalledWith(`v:${eVar.key}`, eVar.value);
      });

      // got post
      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
        expect.any(Object),
      );

      expect(ok).toEqual(true);
    });

    it('fails on error', async () => {
      jest.spyOn(got, 'post').mockImplementation(() => {
        throw new Error();
      });
      const ok = await service.sendEmail('', '', []);

      expect(ok).toEqual(false);
    });
  });
});
