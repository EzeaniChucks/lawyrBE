import { Module } from '@nestjs/common';
import { FlashCardController } from './flashcards.controller';
import { FlashCardsService } from './flashcards.service';
import { MongooseModule } from '@nestjs/mongoose';
import { flashCardSchema } from './flashCards.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'flashcards', schema: flashCardSchema },
    ]),
  ],
  controllers: [FlashCardController],
  providers: [FlashCardsService],
  exports: [],
})
export class FlashCardsModule {}
