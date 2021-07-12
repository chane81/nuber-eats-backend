import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // class-validator 사용을 위한 설정
  app.useGlobalPipes(new ValidationPipe());

  // cors
  app.enableCors();

  await app.listen(config.get('PORT'));
}
bootstrap();
