import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { Docx_pdfsService } from './books.service';
import { File } from 'buffer';
import { ApiTags } from '@nestjs/swagger';

@Controller('docx_pdfs')
@ApiTags('Docx_pdfs')
export class Docx_pdfsController {
  constructor(private readonly docx_pdfservice: Docx_pdfsService) {}
  @Post('upload_docx_pdf')
  @UseInterceptors(FileInterceptor('docx_pdfFile'))
  async uploadDocx_pdf(
    @UploadedFile() file: File,
    @Body()
    body: {
      title: string;
      description: string;
    },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!file) {
      return res.status(400).json('No file uploaded');
    }
    const { title, description } = body;
    return this.docx_pdfservice.uploadDocx_pdf(
      file,
      { title, description },
      req,
      res,
    );
  }
  @Get('get_all_docx_pdfs')
  async getAlldocx_pdfs() {
    return this.docx_pdfservice.getAllDocx_pdfs();
  }
  @Get('get_single_docx_pdf/:docx_pdfId')
  async getSingledocx_pdf(@Param('docx_pdfId') docx_pdfId: string) {
    return this.docx_pdfservice.getSingleDocx_pdf(docx_pdfId);
  }
  @Put('replace_single_docx_pdf')
  @UseInterceptors(FileInterceptor('docx_pdfFile'))
  async ReplaceSingleDocx_pdf(
    @UploadedFile() file: File,
    @Body()
    body: {
      name: string;
      parentId: string;
      olddocx_pdfId: string;
    },
    @Res() res: Response,
  ) {
    if (!file) {
      return res.status(400).json('No file uploaded');
    }
    const { name, parentId, olddocx_pdfId } = body;
    return this.docx_pdfservice.replaceSingleDocx_pdf({
      docx_pdffile: file,
      name,
      parentId,
      olddocx_pdfId,
      res,
    });
  }
  @Put('edit_single_docx_pdf_name')
  async editSingleDocx_pdfName(
    @Body()
    body: {
      name: string;
      parentId: string;
      singledocx_pdfId: string;
    },
    @Res() res: Response,
  ) {
    const { parentId, singledocx_pdfId, name } = body;
    return this.docx_pdfservice.editSingleDocx_pdfName({
      name,
      parentId,
      singledocx_pdfId,
      res,
    });
  }
  @Put('edit_docx_pdf_details')
  async editDocx_pdfDetails(
    @Body()
    body: {
      title: string;
      description: string;
      parentId: string;
    },
    @Res() res: Response,
  ) {
    const { parentId, title, description } = body;
    return this.docx_pdfservice.editDocx_pdfDetails({
      title,
      description,
      parentId,
      res,
    });
  }
  @Delete('delete_single_docx_pdf')
  async deleteSingleDocx_pdf(
    @Query()
    query: {
      parentId: string;
      docx_pdfId: string;
    },
    @Res() res: Response,
  ) {
    const { parentId, docx_pdfId } = query;
    return this.docx_pdfservice.deleteSingleDocx_pdf({
      parentId,
      docx_pdfId,
      res,
    });
  }
}
