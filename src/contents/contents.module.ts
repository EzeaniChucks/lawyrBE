import { Module } from '@nestjs/common';
import { ContentsController } from './contents.controller';
import { ContentsService } from './contents.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { MongooseModule } from '@nestjs/mongoose';
import { contentsSchema } from './contents.model';
import { audioSchema } from 'src/audios/audio.model';
import { mcqSchema } from 'src/mcqs/mcq.model';
import { docx_pdfSchema } from 'src/books/books.model';
import { videoSchema } from 'src/videos/videos.model';
import { essaysSchema } from 'src/essays/essays.model';
import { flashCardSchema } from 'src/flashcard/flashCards.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'contents', schema: contentsSchema }]),
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
  controllers: [ContentsController],
  providers: [ContentsService],
  exports: [ContentsService],
})
export class ContentsModule {}
