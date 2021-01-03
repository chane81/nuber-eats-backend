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

- db 관련 인스톨
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
