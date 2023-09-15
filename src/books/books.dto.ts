export type Docx_pdfDetailsDTO = {
  title: string;
  description: string;
};

export type Docx_pdfFullDetails = {
  details: Docx_pdfDetailsDTO;
  _id: string;
  createdAt: string | Date | number;
  updatedAt: string | Date | number;
};

export type Docx_pdfs = {
  _id: string;
  name: string;
  src: string;
  type: string;
};
export type Docx_pdfssObject = {
  _id: string;
  details: {
    title: string;
    description: string;
  };
  videos: Docx_pdfs[];
  createdAt?: Date | string | number;
  updatedAt?: Date | string | number;
};
