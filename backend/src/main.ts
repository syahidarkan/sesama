import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for frontend (allow multiple origins for dev/prod)
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://frontend-eight-pied-77.vercel.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend server is running on: http://localhost:${port}/api`);
}
bootstrap();
