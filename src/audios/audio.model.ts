import * as mongoose from 'mongoose';

export const audioSchema = new mongoose.Schema(
  {
    creatorId: { type: String, required: true },
    details: {
      title: { type: String, required: true },
      description: { type: String, required: true },
    },
    audios: [
      {
        name: { type: String, required: true },
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true },
        asset_id: { type: String },
        version: { type: String },
        version_id: { type: String },
        signature: { type: String },
        resource_type: { type: String, required: true },
        format: { type: String, required: true },
        playback_url: { type: String },
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
      enum: ['hours', 'days', 'weeks', 'months', 'years'],
    },
    subscribedUsersIds: { type: Array, default: [] },
    paidUsersIds: { type: Array, default: [] },
  },
  { timestamps: true },
);
