import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Allow requests from any origin
  app.enableCors({
    origin: true, // or use '*' if you remove credentials: true
    credentials: true,
  });

  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT || 3001);
}
bootstrap();