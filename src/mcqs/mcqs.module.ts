import { Module } from '@nestjs/common';
import { McqsController } from './mcqs.controller';
import { McqsService } from './mcqs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { mcqSchema } from './mcq.model';
import { contentsSchema } from 'src/contents/contents.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'mcqs', schema: mcqSchema }]),
    MongooseModule.forFeature([{ name: 'contents', schema: contentsSchema }]),
  ],
  controllers: [McqsController],
  providers: [McqsService],
  exports: [McqsService],
})
export class McqsModule {}
