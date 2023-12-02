import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express from 'express';
import { getDiscordRequestVerifier } from './utils/verify-request';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    express.json({
      verify: getDiscordRequestVerifier(process.env.PUBLIC_KEY),
    }),
  );
  await app.listen(3000);
}
bootstrap();
