import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { MongooseModule } from '@nestjs/mongoose';
import { videoSchema } from './videos.model';
import { contentsSchema } from 'src/contents/contents.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'videos', schema: videoSchema }]),
    MongooseModule.forFeature([{ name: 'contents', schema: contentsSchema }]),
    CloudinaryModule,
  ],
  controllers: [VideosController],
  providers: [VideosService],
  exports: [VideosService],
})
export class VideosModule {}
