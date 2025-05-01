import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { json, urlencoded } from 'express';

import { AppModule } from './app.module';

const swaggerConfig = new DocumentBuilder()
  .setTitle('ProtoTesting Respondent API')
  .setDescription('ProtoTesting Respondent API description')
  .setVersion('1.0')
  .setBasePath('api')
  .build();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb' }));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const config = app.get(ConfigService);
  const port = config.get('APP_PORT');

  if (!port) throw new Error('Port is not provided');

  await app.listen(port);
}

bootstrap();
