import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

const DEFAULT_JWT_SECRET = 'change-me-in-env';

async function bootstrap() {
  if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === DEFAULT_JWT_SECRET)) {
    throw new Error('JWT_SECRET doit être défini avec une vraie valeur secrète en production.');
  }

  const app = await NestFactory.create(AppModule, {
    cors: process.env.CORS_ORIGIN ? { origin: process.env.CORS_ORIGIN.split(',').map((o) => o.trim()) } : true,
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Portail Suivis Service Électrique ELJ')
    .setDescription('API REST — équipements, PDR, DA/CMD, entrées/sorties, dépenses, documents')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`API démarrée sur le port ${port} — documentation sur /api/docs`, 'Bootstrap');
}
bootstrap();
