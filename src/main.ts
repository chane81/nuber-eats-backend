import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // class-validator 사용을 위한 설정
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(4000);
}
bootstrap();
