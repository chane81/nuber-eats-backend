import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';
import * as FormData from 'form-data';
import got from 'got';

jest.mock('got');
jest.mock('form-data');
jest.mock('Buffer', () => ({
  from: jest.fn(),
}));
jest.mock('console', () => ({
  info: jest.fn(),
}));

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
        'Verify-email',
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
    it('send email', async () => {
      const ok = await service.sendEmail('', '', []);
      const formSpy = jest.spyOn(FormData.prototype, 'append');

      expect(formSpy).toHaveBeenCalled();
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

    // it('send email authorization', async () => {
    //   const ok = await service.sendEmail('', '', []);
    //   jest.spyOn(Buffer, 'from').mockImplementation(() => {
    //     return 'test';
    //   });

    //   //expect(console.info).toHaveBeenCalledWith('test');
    //   // const bufferSpy = jest.spyOn(Buffer, 'from');

    //   expect(Buffer.from).toHaveBeenCalledTimes(1);
    //   //expect(Buffer.from).toHaveBeenCalledWith(`api:${TEST_API_KEY}`);
    // });
  });

  it.todo('sendEmail');
  it.todo('sendVerificationEmail');
});
