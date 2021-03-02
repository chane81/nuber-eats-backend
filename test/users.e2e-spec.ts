import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UserModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  /**
   * 아래 warning 대응 코드
   * Jest did not exit one second after the test run has completed.
   * This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue.
   */
  afterAll(async () => {
    app.close();
  });

  it.todo('me');
  it.todo('userProfile');
  it.todo('createAccountInput');
  it.todo('login');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
