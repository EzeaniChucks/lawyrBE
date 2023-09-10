import { Module } from '@nestjs/common';
import { EssaysController } from './essays.controller';
import { EssaysService } from './essays.service';
import { MongooseModule } from '@nestjs/mongoose';
import { essaysSchema } from './essays.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'essays', schema: essaysSchema }]),
  ],
  controllers: [EssaysController],
  providers: [EssaysService],
})
export class EssaysModule {}
