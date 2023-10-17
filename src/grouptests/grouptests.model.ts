import * as mongoose from 'mongoose';

export const groupTestSchema = new mongoose.Schema(
  {
    creatorId: { type: mongoose.SchemaTypes.ObjectId, required: true },
    details: { title: { type: String }, description: { type: String } },
    testParticipantsIds: [
      {
        userId: { type: mongoose.SchemaTypes.ObjectId, required: true },
        userName: { type: String, required: true },
      },
    ],
    initialTestParticipants: [
      {
        userId: { type: mongoose.SchemaTypes.ObjectId, required: true },
        canTakeTest: { type: Boolean, default: false },
        userName: { type: String, required: true },
      },
    ],
    clonedresourceId: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
    },
    numberOfQuestions: { type: Number, default: 0, required: true },
    numberOfScenarios: { type: Number, default: 0, required: true },
    submittedTests: [
      {
        testTakerId: {
          type: mongoose.SchemaTypes.ObjectId,
          required: true,
        },
        testTakerName: { type: String, required: true },
        // scenarios: [
        //   {
        //     text: String,
        //     linkedTo: [String],
        //   },
        // ],
        // QAs: [
        //   {
        //     question: { type: String, required: true },
        //     questionNum: { type: String, required: true },
        //     A: { type: String, required: true },
        //     B: { type: String, required: true },
        //     C: { type: String, required: true },
        //     D: { type: String, required: true },
        //     answer: { type: String, required: true },
        //     candidate_answer: {
        //       type: String,
        //       default: '',
        //       enum: ['A', 'B', 'C', 'D', ''],
        //     },
        //     explanation: { type: String },
        //   },
        // ],
        // expiryDate: { type: Date },
        // status: {
        //   type: String,
        //   default: 'completed',
        //   enum: ['ongoing', 'completed'],
        // },
        totalAnsweredQuestions: { type: Number, default: 0 },
        totalRightQuestions: { type: Number, default: 0 },
        totalWrongQuestions: { type: Number, default: 0 },
      },
    ],
    testStartTimeMilliseconds: { type: Number, default: 0, required: true },
    testStartTimeString: { type: Date },
    groupTestStatus: {
      type: String,
      default: 'pending',
      enum: ['pending', 'ongoing', 'completed'],
    },
  },
  { timestamps: true },
);
