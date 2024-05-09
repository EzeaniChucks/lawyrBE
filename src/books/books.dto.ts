import { ApiProperty } from '@nestjs/swagger';

export class Docx_pdfDetailsDTO {
  title: string;
  description: string;
}

export class Docx_pdfFullDetails {
  details: Docx_pdfDetailsDTO;
  _id: string;
  createdAt: string | Date | number;
  updatedAt: string | Date | number;
}

export class Docx_pdfs {
  _id: string;
  name: string;
  src: string;
  type: string;
}
export class Docx_pdfssObject {
  _id: string;
  details: {
    title: string;
    description: string;
  };
  videos: Docx_pdfs[];
  createdAt?: Date | string | number;
  updatedAt?: Date | string | number;
}

export class ReplaceSingleDocx_pdfDTO {
  @ApiProperty({ example: 'name of the docx' })
  name: string;

  @ApiProperty({ example: 'mongooseGeneratedId' })
  parentId: string;

  @ApiProperty({ example: 'mongooseGeneratedId' })
  olddocx_pdfId: string;
}

export class EditSingleDocx_pdfNameDTO {
  @ApiProperty({ example: 'new name of the docx' })
  name: string;

  @ApiProperty({ example: 'mongooseGeneratedId' })
  parentId: string;

  @ApiProperty({ example: 'mongooseGeneratedId' })
  singledocx_pdfId: string;
}

export class EditSingleDocx_pdfDetailsDTO {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  parentId: string;

  @ApiProperty({ example: 'new title of the docx' })
  title: string;

  @ApiProperty({ example: 'new detailed description of the docx is about' })
  description: string;
}

export class DeleteSingleDocx_pdfDTO {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  parentId: string;

  @ApiProperty({ example: 'mongooseGeneratedId' })
  docx_pdfId: string;
}
