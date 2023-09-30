import { Module } from '@nestjs/common';
import { FlashCardController } from './flashcards.controller';
import { FlashCardsService } from './flashcards.service';
import { MongooseModule } from '@nestjs/mongoose';
import { flashCardSchema } from './flashCards.model';
import { contentsSchema } from 'src/contents/contents.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'flashcards', schema: flashCardSchema },
    ]),
    MongooseModule.forFeature([{ name: 'contents', schema: contentsSchema }]),
  ],
  controllers: [FlashCardController],
  providers: [FlashCardsService],
  exports: [FlashCardsService],
})
export class FlashCardsModule {}
