# Nuber Eats Backend project

## 스택

- Typescript
- NestJS
- Graphql
- Postgres DB
- Typeorm
- Jest Test

## nestjs 셋업 및 프로젝트 create

- nestjs 전역 인스톨
  - yarn global add @nestjs/cli @nestjs/schematics

- project 생성
  - nest g application

  - project 생성시 실패 된다면 캐쉬 클린 후 실행
    - yarn cache clean
    - nest g application

- graphql 관련 인스톨
  - 관련 url
    - <https://docs.nestjs.com/graphql/quick-start>
  - yarn add @nestjs/graphql graphql-tools graphql apollo-server-express

- TypeOrm & db 관련 인스톨
  - yarn add @nestjs/typeorm typeorm pg

- env config 관련 인스톨
  - yarn add @nestjs/config cross-env

- jwt 관련 인스톨
  - yarn add jsonwebtoken
  - yarn add -D @types/jsonwebtoken

- subscription 관련 인스톨
  - yarn add graphql-subscriptions

## nest cli 명령

- 모듈 생성
  - nest g mo restaurants

## env 변수 configuration

- 참고 url: <https://docs.nestjs.com/techniques/configuration>
- 기본방식
  - app.module.ts 에서 ConfigModule.forRoot로 isGlobal 설정이 되어있을 경우 service 단 resolve 단에서 사용시 아래와 같이 쓸 수 있다.

  ```javascript
  const dbHost = this.configService.get<string>('database.host');
  ```

  - 하지만 위와 같이 썼을 경우 env 명을 알기위해 .env 파일을 다시 열어 환경변수명을 확인하여 타이핑을 쳐야하는 번거로움이 있다.

- 좀 더 나은 방식
  1. nestjs 에는 registerAs 함수를 제공하여 env를 타입 기반으로 등록/호출할 수 있게 도와준다. 아래와 같이 registerAs 로 등록을 먼저 한다.

      ```javascript
      import { registerAs } from '@nestjs/config';

      export default registerAs('env', () => ({
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_USERNAME: process.env.DB_USERNAME,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_NAME: process.env.DB_NAME,
        PRIATE_KEY: process.env.PRIATE_KEY,
        NODEMAILER_USER: process.env.NODEMAILER_USER,
        NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD,
        NODEMAILER_FROM_EMAIL: process.env.NODEMAILER_FROM_EMAIL,
      }));
      ```

  2. app.module.ts 에서 load 단에 등록해준다.

      ```javascript
      @Module({
        imports: [
          // process env set
          ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.env.${process.env.NODE_ENV}`,
            load: [envConfig],
          })
        ]
      })
      ```

  3. env 사용시 아래와 같이 사용한다. 먼저 inject 를 한 후 사용

      ```javascript
      import { ConfigType } from '@nestjs/config';

      @Injectable()
      export class RestaurantService {
        constructor(
          @Inject(envConfig.KEY)
          private env: ConfigType<typeof envConfig>,
        ) {}

        async envTest(): string {
          return this.env.NODEMAILER_USER;
        }    
      }
      ```

## graphql

- graphql resolve args 의 validate 체크
  - 관련 라이브러리 설치 및 설정
    - yarn add class-validator class-transformer
    - main.ts 에 useGlobalPipes() 추가 (아래 코드 참고)

    ```js
      const app = await NestFactory.create(AppModule);

      // class-validator 사용을 위한 설정
      app.useGlobalPipes(new ValidationPipe());

      await app.listen(3000);
    ```

  - 사용
    - class-validator 를 사용하여 args dto Field 부분에 적용 (아래 코드 참고)

    ```js
    @ArgsType()
    export class CreateRestaurantDto {
      @Field(() => String)
      @IsString()
      @Length(5, 10)
      name: string;

      @Field(() => Boolean)
      @IsBoolean()
      isVegan: boolean;
    }
    ```

- graphql subscription 관련
  - subscription 은 req 가 없다. ws(websocket) 으로 데이터를 주고 받기 때문에 app.modules.ts 에서 req 를 받아 `user: req['user']` 로 리턴하는 부분을 수정해야 한다.

  - 관련 url
  <https://github.com/apollographql/graphql-subscriptions>

  - 사용 예시 code

    ```javascript
    import { PubSub } from 'graphql-subscriptions';

    const pubsub = new PubSub();
    
    @Mutation(() => Boolean)
    potatoReady() {
      pubsub.publish('hotPotatos', { readyPotato: 'Your potato is Ready.' });

      return true;
    }

    @Subscription(() => String)
    readyPotato() {
      return pubsub.asyncIterator('hotPotatos');
    }
    ```

  - app.modules.ts 세팅

    ```javascript
      // 기존 코드
      // context: ({ req }) => ({ user: req['user'] }),

      // 수정된 코드
      context: ({ req, connection }) => {
        if (req) {
          return { user: req['user'] };
        } else {
          console.log('con', connection);
        }
      },
    ```

## postgres

- download
  - <https://www.postgresql.org/download/windows>
  - 설치파일 설치시 PG Admin 은 제외하고 설치
    - 설치하고 확인결과 제대로 실행이 되지 않음
  - PG ADMIN 4는 아래에서 다운받아서 따로 설치 할 것
    - <https://www.pgadmin.org/download/pgadmin-4-windows>

- 사용자 계정생성 및 비번 set

  ```sql
    -- user add
    create user chane81
      superuser
      createdb
      createrole
      replication
      bypassrls;

    -- user pwd change
    alter user chane81 with password '12345';
  ```

## TypeOrm

- url
  - <https://typeorm.io>
- db connection 세팅
  - app.module.ts 에 아래와 같이 세팅
  - synchronize 옵션은 작성된 엔티티 모델과 DB 테이블간이 동기화 여부를 묻는 옵션이다.

  ```js
  import { TypeOrmModule } from '@nestjs/typeorm';

  TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: process.env.NODE_ENV !== 'prod',
    logging: true,
    entities: [Restaurant],
  })
  ```

- `@ManyToOne` 관계에서는 `nullable` 옵션의 기본값이 `false` 이다.
- `@OneToMany` 는 `@ManyToOne` 을 반드시 가져야 하지만, `@ManyToOne` 는 `@OneToMany`를 반드시 가질 필요는 없다,
  - <https://github.com/typeorm/typeorm/blob/master/docs/many-to-one-one-to-many-relations.md>

  ```plaintext
    If you want to use @OneToMany, @ManyToOne is required.
    If you only care about the @ManyToOne relationship, you can define it without having @OneToMany on the related entity
  ```

- RelationShip
  - entity 관계 데이터를 가져올때 아래와 같이 relation 을 써서 가져온다.
  - 아래는 엔티티 호출할 때 관계데이터를 각각 가져오고 싶은것만 설정 할 때 작성하는 방법이다.
  
  ```js
  const order = await this.orders.findOne(orderId, {
    relations: ['restaurant'],
  });
  ```

  - 매 호출시 마다 관계된 데이터를 가져오게 설정하고 싶으면 entity 작성시 로드하고 싶은 필드 부분에 아래와 같이 eager, lazy 를 쓰면된다.
  - 단 lazy 방식은 Promise 표현법을 써서 해당 필드 표현을 해주어야 한다.
  - 참고 url
    <https://orkhan.gitbook.io/typeorm/docs/eager-and-lazy-relations>

  ```js - eager 방식
  @Field(() => [OrderItem])
  @ManyToMany(() => OrderItem, {
    eager: true,
  })
  @JoinTable()
  items: OrderItem[];
  ```

  ```js - lazy 방식
   @ManyToMany(type => Category, category => category.questions)
  @JoinTable()
  categories: Promise<Category[]>;
  ```

## Service & Module & Inject & Resolver

- Module
  - Repository Inject (레포지토리 주입)
    - imports 부분에 Repository 를 기입
  - providers
    - Resolver, Service 를 사용한다고 명시

- Service
  - Business Logic 이 들어간다.
  - DB 데이터를 불러오거나 조작하는 로직이 담긴다.
  - Inject Repository
    - 생성자(constructor)에서 DB Repository Inject 를 해서 각 함수에서 사용한다.

- Resolver
  - Graphql 호출을 위한 Resolver Query, Mutation 이 담긴다.
  - Service 를 불러와서 해당 값을 리턴한다.

## DTO & Entity

- DTO
  - DTO 생성시 nest.js 에서는 mapped-type 라는것을 제공한다
  - 관련 URL
    - <https://docs.nestjs.com/openapi/mapped-types>
  - mapped-type 종류
    1. Partial
       - 모든 필드가 Optional
    2. Pick
       - 특정 필드만 사용할 때
    3. Omit
       - 특정 필드만 제거
    4. Intersection
       - 여러 엔티티의 필드를 합침
    5. Composition
       - mapped-type 를 여러개 사용

## Test

- Setup
  - package.json
    - collectCoverageFrom 부분 제거(root src 하위 ts 파일 모두 test 할 필요는 없으므로)

      ```json
      "collectCoverageFrom": [
        "**/*.(t|j)s"
      ],
      ```

    - ignore 설정

      ```json
      "coveragePathIgnorePatterns": [
        "node_modules",
        ".entity.ts",
        ".constants.ts"
      ]
      ```

## AuthGruard

- guard reference url
  <https://docs.nestjs.com/guards>

- 기본 auth guard 사용
  - 기본적으로 아래와 같이 CanActivate 에 대한 구현을 해서 return true/false 를 통해 해당 api 에 대한 기본 auth guard를 구축할 수 있다.

  ```js
  import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
  import { Observable } from 'rxjs';

  // AuthGuard 모듈
  @Injectable()
  export class AuthGuard implements CanActivate {
    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      // graphql context 가져오기
      const gqlContext = GqlExecutionContext.create(context).getContext();
      const user: User = gqlContext['user'];

      if (!user) {
        return false;
      }
    }
  }

  // api 에서 사용
  @Mutation(() => EditRestaurantOutput)
  @UseGuards(AuthGuard)
  async editRestaurant(
    @Args('input') editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    return { ok: true };
  }
  ```

- role based auth guard
  - 위의 기본적이 auth gurard 외에 실무에서 필요한 role base guard 를 구축할 수 있다.
  - 아래의 SetMetadata 를 통해 api 데코레이터에 선언한 role 를 auth guard 모듈에서 Reflector 를 이용하여 가져와서 context 와 비교해서 role guard 를 할 수 있다.
  - 글로벌로 auth guard를 사용하기 위해 provider 로 APP_GUARD 를 사용한다.
  - 키워드
    - SetMetadata - 데코레이더에서 사용
    - Reflector - 모듈에서 metadata 가져오기위해 사용
    - APP_GUARD - 글로벌 사용을 위한 provider

  - role 데코레이터 작성

  ```js - role.decorator.ts
  import { SetMetadata } from '@nestjs/common';
  import { UserRole } from 'src/users/entities/user.entity';

  export type AllowedRoles = keyof typeof UserRole | 'Any';

  export const Role = (roles: AllowedRoles[]) => SetMetadata('roles', roles);

  ```

  - auth guard 모듈 작성

  ```js auth.guards.ts
  import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { GqlExecutionContext } from '@nestjs/graphql';
  import { User } from 'src/users/entities/user.entity';
  import { AllowedRoles } from './role.decorator';
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext) {
      const roles = this.reflector.get<AllowedRoles>(
        'roles',
        context.getHandler(),
      );

      // 만약 roles 가 없다면 public 권한
      if (!roles) {
        return true;
      }

      const gqlContext = GqlExecutionContext.create(context).getContext();
      const user: User = gqlContext['user'];

      if (!user) {
        return false;
      }

      // Any role 의 경우는 user 가 있는지 여부만 체크
      if (roles.includes('Any')) {
        return true;
      }

      // 만약 user 가 있다면 role 를 체크
      return roles.includes(user.role);
    }
  }

  ```

  - auth 글로벌 모듈 작성 (APP_GUARD를 프로바이더로 사용)

  ```js auth.module.ts
  import { Module } from '@nestjs/common';
  import { APP_GUARD } from '@nestjs/core';
  import { AuthGuard } from './auth.guard';

  @Module({
    providers: [
      {
        provide: APP_GUARD,
        useClass: AuthGuard,
      },
    ],
  })
  export class AuthModule {}

  ```

  - 최종 app.module.ts 에 auth.moduel.ts 를 등록
  
  ```js app.module.ts
  @Module({
  imports: [
    ...
    AuthModule
    ...
  ]
  ```

## Subscription (필요 구독수)

- Pending Order (Owner 만 볼 수 있음)
  - subscription
    > `newOrder`
  - trigger
    > `createOrder`
- Order Status (Customer, Delivery, Owner 모두 다 볼 수 있어야 함)
  - subscription
    > `orderUpdate`
  - trigger
    > `editOrder`
- Pending Pickup Order (Delivery 만 볼 수 있음)
  - subscription
    > `orderUpdate`
  - trigger
    > `editOrder`

## Schedule (@nestjs/schedule)

- nest 에서 제공하는 스케쥴 기능
  - cron jobs
  - timeouts
  - intervals
- 참고링크
  <https://docs.nestjs.com/techniques/task-scheduling>

## File Upload

- 참고
  <https://docs.nestjs.com/techniques/file-upload>

  - 코드 - uploads.module.ts

    ```javascript
    import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
    import { FileInterceptor } from '@nestjs/platform-express';

    @Controller('uploads')
    export class UploadController {
      @Post('')
      @UseInterceptors(FileInterceptor('file'))
      uploadFile(@UploadedFile() file) {
        console.log('file', file);
      }
    }

    ```

## Deploy

- heroku
  - setup

    ```shell
    ## 설치
    choco install heroku-cli

    ## heroku repo set
    heroku git:remote -a nuber-eats-backend-k

    ## heroku repo push
    git add .
    git commit -am "make it better"
    git push heroku master
    ```
