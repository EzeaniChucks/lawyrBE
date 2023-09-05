import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000', 'https://charityorg.vercel.app'],
    credentials: true,
  });
  app.use(cookieParser(process.env.JWT_SECRET));
  const options = new DocumentBuilder()
    .setTitle('CharityOrg API documentation')
    .setDescription('Protected routes for the charityOrg API')
    .setVersion('1.0')
    .addTag('charity organization')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  await app.listen(8080);
}
bootstrap();
