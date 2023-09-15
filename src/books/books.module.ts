import { Module } from '@nestjs/common';
import { Docx_pdfsController } from './books.controller';
import { Docx_pdfsService } from './books.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { docx_pdfSchema } from './books.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'docxpdf', schema: docx_pdfSchema }]),
    CloudinaryModule,
  ],
  controllers: [Docx_pdfsController],
  providers: [Docx_pdfsService],
})
export class BooksModule {}
