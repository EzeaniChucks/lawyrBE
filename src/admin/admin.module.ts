import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { audioSchema } from '../audios/audio.model';
import { mcqSchema } from 'src/mcqs/mcq.model';
import { docx_pdfSchema } from 'src/books/books.model';
import { videoSchema } from 'src/videos/videos.model';
import { essaysSchema } from 'src/essays/essays.model';
import { flashCardSchema } from 'src/flashcard/flashCards.model';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { contentsSchema } from 'src/contents/contents.model';
import { authSchema } from 'src/auth/auth.model';
import { accessSchema } from './admin.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'accesses', schema: accessSchema }]),
    MongooseModule.forFeature([{ name: 'contents', schema: contentsSchema }]),
    MongooseModule.forFeature([{ name: 'auths', schema: authSchema }]),
    MongooseModule.forFeature([{ name: 'audios', schema: audioSchema }]),
    MongooseModule.forFeature([{ name: 'mcqs', schema: mcqSchema }]),
    MongooseModule.forFeature([{ name: 'docxpdfs', schema: docx_pdfSchema }]),
    MongooseModule.forFeature([{ name: 'videos', schema: videoSchema }]),
    MongooseModule.forFeature([{ name: 'essays', schema: essaysSchema }]),
    MongooseModule.forFeature([
      { name: 'flashcards', schema: flashCardSchema },
    ]),
    CloudinaryModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService]
})
export class AdminModule {}
