import * as mongoose from 'mongoose';

export const essaysSchema = new mongoose.Schema(
  {
    creatorId: { type: mongoose.SchemaTypes.ObjectId, required: true },
    details: {
      title: { type: String, required: true },
      description: { type: String, required: true },
    },
    scenarios: [
      {
        text: String,
        linkedTo: [String],
      },
    ],
    QAs: [
      {
        question: { type: String, required: true },
        questionNum: { type: String, required: true },
        A: { type: String, required: true },
        B: { type: String, required: true },
        C: { type: String, required: true },
        D: { type: String, required: true },
        answer: { type: String, required: true },
        explanation: { type: String },
      },
    ],
  },
  { timestamps: true },
);
