import * as mongoose from 'mongoose';

export const mcqSchema = new mongoose.Schema(
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
    searchTags: { type: Array, required: true, default: [] },
    parentIds: { type: Array, default: [] },
    isSubscription: { type: Boolean, required: true, default: false },
    isPurchase: { type: Boolean, required: true, default: false },
    productPrice: { type: Number, required: true, default: 0 },
    productPriceCurrency: { type: String, required: true, default: 'NGN' },
    subscriptionPrice: { type: Number, required: true, default: 0 },
    subscriptionPriceCurrency: { type: String, required: true, default: 'NGN' },
    subscriptionDurationNo: { type: Number, required: true, default: 0 },
    subscriptionDurationUnit: {
      type: String,
      required: true,
      default: 'months',
      enum: ['days', 'weeks', 'months', 'years'],
    },
    subscribedUsersIds: { type: Array, default: [] },
    paidUsersIds: { type: Array, default: [] },
  },
  { timestamps: true },
);
export const groupTestSchema = new mongoose.Schema(
  {
    creatorId: { type: mongoose.SchemaTypes.ObjectId, required: true },
    invitees: [{ id: mongoose.SchemaTypes.ObjectId, isQualified:{type:Boolean, default:false}}],
    submitedTests:[],
    testHasStarted:{type: Boolean, default:false},
    testEnded:{type: Boolean, default:false},
  },
  { timestamps: true },
);

//invite user
//when user pays, change their isReady status to ready
//once creator starts test, send tests to only ready participants.
//join test button shows 'Ongoing' if test has a timer?
//testHasStarted variable is false for all participants. Creator dispatches it 