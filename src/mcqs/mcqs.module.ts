import { Module } from '@nestjs/common';
import { McqsController } from './mcqs.controller';
import { McqsService } from './mcqs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { mcqSchema } from './mcq.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'mcqs', schema: mcqSchema }])],
  controllers: [McqsController],
  providers: [McqsService],
  exports: [],
})
export class McqsModule {}
