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
    assets: {
      subscriptions: [
        {
          resourceName: String,
          resourceId: mongoose.SchemaTypes.ObjectId,
          resourceType: String,
          resourceParentIds: [mongoose.SchemaTypes.ObjectId],
        },
      ],
      purchases: [
        {
          resourceName: String,
          resourceId: mongoose.SchemaTypes.ObjectId,
          resourceType: String,
          resourceParentIds: [mongoose.SchemaTypes.ObjectId],
        },
      ],
      cart: [
        {
          resourceName: String,
          resourceId: mongoose.SchemaTypes.ObjectId,
          resourceType: String,
          resourceParentIds: [mongoose.SchemaTypes.ObjectId],
        },
      ],
    },
    mcqs: [
      new mongoose.Schema({
        creatorId: { type: mongoose.SchemaTypes.ObjectId, required: true },
        clonedresourceId: {
          type: mongoose.SchemaTypes.ObjectId,
          required: true,
        },
        mcqDetails: {
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
              enum: ['A', 'B', 'C', 'D', ''],
            },
            explanation: { type: String },
          },
        ],
        expiryDate: { type: Date },
        status: {
          type: String,
          default: 'ongoing',
          enum: ['ongoing', 'completed'],
        },
        totalAnsweredQuestions: { type: Number, default: 0 },
        totalRightQuestions: { type: Number, default: 0 },
        totalWrongQuestions: { type: Number, default: 0 },
      },{timestamps:true}),
    ],
    groupMcqs: [
      new mongoose.Schema({
        creatorId: { type: mongoose.SchemaTypes.ObjectId, required: true },
        grouptestId: { type: mongoose.SchemaTypes.ObjectId, required: true },
        clonedresourceId: {
          type: mongoose.SchemaTypes.ObjectId,
          required: true,
        },
        mcqDetails: {
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
              enum: ['A', 'B', 'C', 'D', ''],
            },
            explanation: { type: String },
          },
        ],
        expiryDate: { type: Date },
        status: {
          type: String,
          default: 'ongoing',
          enum: ['ongoing', 'completed'],
        },
        totalAnsweredQuestions: { type: Number, default: 0 },
        totalRightQuestions: { type: Number, default: 0 },
        totalWrongQuestions: { type: Number, default: 0 },
      }, {timestamps:true}),
    ],
    userStatus: { type: String, default: 'active', enum: ['active', 'banned'] },
  },
  { timestamps: true },
);