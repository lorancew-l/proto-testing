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

  app.enableCors({
    origin: [/^http:\/\/localhost(:\d+)?$/],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const config = app.get(ConfigService);
  const port = config.get('APP_PORT');

  if (!port) throw new Error('Port is not provided');

  await app.listen(port);
}

bootstrap();
