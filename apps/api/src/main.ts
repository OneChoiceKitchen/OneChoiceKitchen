/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.enableCors();

  // ── Swagger / OpenAPI documentation ───────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('OneChoiceKitchen API')
    .setDescription(
      'Enterprise food delivery platform REST API. ' +
      'Covers orders, menus, partners, riders, loyalty, payments, and more.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('Auth', 'Authentication & session management')
    .addTag('Orders', 'Order lifecycle management')
    .addTag('Menu', 'Menu items & categories')
    .addTag('Partners', 'Partner restaurant management')
    .addTag('Riders', 'Delivery rider management')
    .addTag('Users', 'Customer accounts')
    .addTag('Loyalty', 'OCK Points & rewards')
    .addTag('Payments', 'Payments & refunds')
    .addTag('Notifications', 'Push, SMS & email notifications')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  // Served at /api/docs  (globalPrefix is handled by NestJS; Swagger path is relative)
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'OneChoiceKitchen API Docs',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  Logger.log(
    ` Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(` API Documentation:          http://localhost:${port}/api/docs`);
}

bootstrap();
