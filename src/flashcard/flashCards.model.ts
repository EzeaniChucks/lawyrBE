import * as mongoose from 'mongoose';

export const flashCardSchema = new mongoose.Schema(
  {
    creatorId: { type: mongoose.SchemaTypes.ObjectId, required: true },
    details: {
      title: { type: String, required: true },
      description: { type: String, required: true },
    },
    qaPair: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
  },
  { timestamps: true },
);
