import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Verification } from 'src/users/entities/verification.entity';

// Jest did not exit one second after the test run has completed. 대응
// nodemailer 로 메일 보내지 않게 mock 함
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockImplementation(() => ({
    sendMail: jest.fn(() => true),
  })),
}));

const GRAPHQL_ENDPOINT = '/graphql';
const testUser = {
  email: 'chane8323@naver.com',
  password: '12345',
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let verificationRepository: Repository<Verification>;
  let jwtToken: string;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) =>
    baseTest().set('x-jwt', jwtToken).send({ query });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    verificationRepository = module.get<Repository<Verification>>(
      getRepositoryToken(Verification),
    );
    await app.init();
  });

  /**
   * 아래 warning 대응 코드
   * Jest did not exit one second after the test run has completed.
   * This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue.
   */
  afterAll(async () => {
    // 테스트가 끝나고 database drop 수행
    await getConnection().dropDatabase();

    // warning 대응
    app.close();
  });

  describe('createAccount', () => {
    it('should create account', () => {
      return publicTest(`
        mutation {
          createAccount(input: {
            email: "${testUser.email}",
            password: "${testUser.password}",
            role: Client
          }) {
            error
            ok
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(true);
          expect(res.body.data.createAccount.error).toBe(null);
        });
    });

    it('should fail if account already exists', () => {
      return publicTest(`
        mutation {
          createAccount(input: {
            email: "${testUser.email}",
            password: "${testUser.password}",
            role: Client
          }) {
            error
            ok
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(false);

          // toBe의 경우는 정확한 입력이 필요하다.
          expect(res.body.data.createAccount.error).toBe(
            'There is a user with that email already',
          );

          // 정확한 에러 메시지를 알 수 없을 경우 toEqual로 expect.any(String) 를 이용하자.
          // expect(res.body.data.createAccount.error).toEqual(expect.any(String));
        });
    });
  });

  describe('login', () => {
    it('should login with correct credentials', () => {
      return publicTest(`
        mutation {
          login(input: {
            email: "${testUser.email}",
            password: "${testUser.password}"
          }) {
            error
            ok
            token
          }
        }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;

          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));

          // 토큰 주입
          jwtToken = login.token;
        });
    });
  });

  describe('userProfile', () => {
    let userId: number;

    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });

    it("should see a user's profile", () => {
      return privateTest(`
        query {
          userProfile(userId: ${userId}) {
            error
            ok
            user {
              id
            }
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: {
                  ok,
                  error,
                  user: { id },
                },
              },
            },
          } = res;

          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(id).toBe(userId);
        });
    });

    it('should not find a profile', () => {
      return privateTest(`
        query {
          userProfile(userId: 2221) {
            error
            ok
            user {
              id
            }
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res;

          expect(ok).toBe(false);
          expect(error).toBe('User Not Found');
          expect(user).toBe(null);
        });
    });
  });

  describe('me', () => {
    it('should find my profile', () => {
      return privateTest(`
        query {
          me {
            email
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;

          expect(email).toBe(testUser.email);
        });
    });

    it('should not allow logged out user(not have jwtToken)', () => {
      return publicTest(`
        query {
          me {
            email
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: { errors },
          } = res;

          const [error] = errors;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });

  describe('editProfile', () => {
    const NEW_EMAIL = 'chch@haha.com';

    it('should change email', () => {
      return privateTest(`
        mutation {
          editProfile(input: {
            email: "${NEW_EMAIL}"
          }) {
            ok
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                editProfile: { ok, error },
              },
            },
          } = res;

          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });

    it('should have new email', () => {
      return privateTest(`
        {
          me {
            email
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;

          expect(email).toBe(NEW_EMAIL);
        });
    });
  });

  describe('verifyEmail', () => {
    let verificationCode: string;

    beforeAll(async () => {
      const [verification] = await verificationRepository.find();
      verificationCode = verification.code;
    });

    it('should verify email', () => {
      return publicTest(`
        mutation {
          verifyEmail(input: {
            code: "${verificationCode}"
          }) {
            error
            ok
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;

          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should fail on wrong verification code', () => {
      return publicTest(`
        mutation {
          verifyEmail(input: {
            code: "fail-code"
          }) {
            error
            ok
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;

          //expect(ok).toBe(true)

          // 아래와 같이 toBeFalsy() 를 사용해도 됨
          expect(ok).toBeFalsy();
          expect(error).toBe('Verification not found.');
        });
    });
  });
});
