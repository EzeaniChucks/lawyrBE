import * as mongoose from 'mongoose';

export const authSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    phoneNumber: String,
    password: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
);
