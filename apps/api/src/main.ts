import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  app.enableCors({
    origin: process.env['CORS_ORIGINS']?.split(',') ?? [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
    ],
    credentials: true,
  });

  const port = parseInt(process.env['PORT'] ?? '3000', 10);
  await app.listen(port);
  console.warn(`🚀 CivicTrack API is running on http://localhost:${port}`);
}

void bootstrap();
