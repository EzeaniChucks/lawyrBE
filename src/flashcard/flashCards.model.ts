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
