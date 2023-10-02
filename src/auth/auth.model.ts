import * as mongoose from 'mongoose';

export const authSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    phoneNumber: String,
    password: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    isAdmin: { type: Boolean, default: false },
    isSubAdmin: { type: Boolean, default: false },
    assets: { subscriptions: [], purchases: [] },
    mcqs: [
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
            candidate_answer: {
              type: String,
              default: '',
              enum: ['A', 'B', 'C', 'D'],
            },
            explanation: { type: String },
          },
        ],
      },
    ],
    userStatus: { type: String, default: 'active', enum: ['active', 'banned'] },
  },
  { timestamps: true },
);
