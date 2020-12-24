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
  - yarn add @nestjs/graphql graphql-tools graphql apollo-server-express