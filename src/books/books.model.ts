import * as mongoose from 'mongoose';

export const docx_pdfSchema = new mongoose.Schema(
  {
    creatorId: { type: String, required: true },
    details: {
      title: { type: String, required: true },
      description: { type: String, required: true },
    },
    docx_pdfs: [
      {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true },
        asset_id: { type: String },
        version: { type: String },
        version_id: { type: String },
        pages: { type: Number, required: true },
        width: { type: Number },
        height: { type: Number },
        signature: { type: String, required: true },
        resource_type: { type: String, required: true },
        format: { type: String, required: true },
      },
    ],
    docType: { type: String, required: true },
  },
  { timestamps: true },
);
