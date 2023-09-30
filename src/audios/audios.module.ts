import { Module } from '@nestjs/common';
import { AudiosController } from './audios.controller';
import { AudiosService } from './audios.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { audioSchema } from './audio.model';
import { contentsSchema } from 'src/contents/contents.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'audios', schema: audioSchema }]),
    MongooseModule.forFeature([{ name: 'contents', schema: contentsSchema }]),
    CloudinaryModule,
  ],
  controllers: [AudiosController],
  providers: [AudiosService],
  exports: [AudiosService],
})
export class AudiosModule {}
