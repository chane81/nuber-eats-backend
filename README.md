# Nuber Eats Backend project

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

## nest cli 명령

- 모듈 생성
  - nest g mo restaurants

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
