import { Module } from '@nestjs/common';
import { Docx_pdfsController } from './books.controller';
import { Docx_pdfsService } from './books.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { docx_pdfSchema } from './books.model';
import { contentsSchema } from 'src/contents/contents.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'docxpdf', schema: docx_pdfSchema }]),
    MongooseModule.forFeature([{ name: 'contents', schema: contentsSchema }]),
    CloudinaryModule,
  ],
  controllers: [Docx_pdfsController],
  providers: [Docx_pdfsService],
  exports: [Docx_pdfsService],
})
export class BooksModule {}
