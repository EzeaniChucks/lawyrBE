import * as mongoose from 'mongoose';

export const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user',
    },
    transactionId: {
      type: mongoose.Schema.Types.Mixed,
    },
    tx_ref: {
      type: String,
      required: [true, 'Transaction reference is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      trim: true,
    },
    phone: String,
    amount: {
      type: Number,
      required: [true, 'phone number is required'],
    },
    currency: {
      type: String,
      required: [true, 'currency is required'],
      default: 'NGN',
      // enum: ['NGN', 'USD', 'EUR', 'GBP'],
    },
    paymentStatus: {
      type: String,
      enum: [
        'successful',
        'success',
        'pending',
        'failed',
        'new',
        'confirmed',
        'CONFIRMED',
        'cancelled',
      ],
      default: 'pending',
    },
    paymentGateway: {
      type: String,
      required: [true, 'payment gateway is required'],
      enum: ['flutterwave', 'Flutterwave'],
      default: 'flutterwave',
    },
    description: {
      type: String,
      required: [true, 'Transaction description is required'],
    },
    narration: {
      type: String,
      required: [true, 'Transaction narration is required'],
    },
    link: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

export const walletTransactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, default: 0 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user',
    },
    isInflow: { type: Boolean, default: false },
    status: {
      type: String,
      required: [true, 'payment status is required'],
      enum: [
        'successful',
        'success',
        'pending',
        'failed',
        'new',
        'confirmed',
        'CONFIRMED',
        'cancelled',
      ],
    },
    description: {
      type: String,
      required: [true, 'Transaction description is required'],
    },
    paymentGateway: {
      type: String,
      required: [true, 'payment gateway is required'],
      enum: ['flutterwave', 'Flutterwave'],
      default: 'flutterwave',
    },
    narration: {
      type: String,
      required: [true, 'Transaction narration is required'],
    },
    link: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

export const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user',
    },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'NGN' },
  },
  { timestamps: true },
);
