import { Module } from '@nestjs/common';
import { EssaysController } from './essays.controller';
import { EssaysService } from './essays.service';
import { MongooseModule } from '@nestjs/mongoose';
import { essaysSchema } from './essays.model';
import { contentsSchema } from 'src/contents/contents.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'essays', schema: essaysSchema }]),
    MongooseModule.forFeature([{ name: 'contents', schema: contentsSchema }]),
  ],
  controllers: [EssaysController],
  providers: [EssaysService],
  exports: [EssaysService],
})
export class EssaysModule {}
