import * as mongoose from 'mongoose';

export const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user',
    },
    frontEndObjectId: { type: mongoose.Schema.Types.ObjectId },
    has_checked: { type: Boolean, default: false },
    message: { type: String },
    link: { type: String, required: true },
    type: { type: String },
  },
  { timestamps: true },
);
