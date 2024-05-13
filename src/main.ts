import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      process.env.NODE_ENV === 'production' ? null : 'http://localhost:3000',
      'https://charityorg.vercel.app',
      'https://lawyrv1.vercel.app',
    ],
    credentials: true,
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
  });
  app.use(cookieParser(process.env.JWT_SECRET));
  const options = new DocumentBuilder()
    .setTitle('Lawyr API documentation')
    .setDescription('Routes for Lawyr App')
    .setVersion('1.0')
    .addTag('Admin', 'Admin Routes')
    .addTag('Audios', 'Audios Routes')
    .addTag('Auth', 'Auth Routes')
    .addTag('Books', 'Books Routes')
    .addTag('Contents', 'Contents Routes')
    .addTag('Essays', 'Essays Routes')
    .addTag('FlashCards', 'FlashCards Routes')
    // .addTag('GroupTests', 'GroupTests Routes')
    .addTag('Invitations', 'Invitation Routes')
    .addTag('MCQs', 'MCQs Routes')
    .addTag('Payment', 'Payment Routes')
    .addTag('Videos', 'Videos Routes')
    .addBearerAuth({ type: 'apiKey', in: 'cookie', name: 'accessToken' })
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT || 8080);
}
bootstrap();
