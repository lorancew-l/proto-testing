import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { json, urlencoded } from 'express';

import { AppModule } from './app.module';

const swaggerConfig = new DocumentBuilder()
  .setTitle('ProtoTesting Event collector API')
  .setDescription('ProtoTesting Event collector API description')
  .setVersion('1.0')
  .setBasePath('api')
  .build();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb' }));

  const config = app.get(ConfigService);
  const allowedOrigin = config.get('ALLOWED_ORIGIN');

  if (!allowedOrigin) throw new Error('ALLOWED_ORIGIN is not provided');
  const originRegex = new RegExp(`^http:\/\/${allowedOrigin}(:\\d+)?\/?$`);

  app.enableCors({
    origin: [originRegex],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = config.get('APP_PORT');

  if (!port) throw new Error('APP_PORT is not provided');

  await app.listen(port);
}

bootstrap();
