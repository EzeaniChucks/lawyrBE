import { Module } from '@nestjs/common';
import { AudiosController } from './audios.controller';
import { AudiosService } from './audios.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { audioSchema } from './audio.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'audios', schema: audioSchema }]),
    CloudinaryModule,
  ],
  controllers: [AudiosController],
  providers: [AudiosService],
})
export class AudiosModule {}
