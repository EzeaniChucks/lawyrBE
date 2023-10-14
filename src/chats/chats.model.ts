import mongoose from 'mongoose';

export const chatSchema = new mongoose.Schema({
  grouptestId: mongoose.Schema.Types.ObjectId,
  chats: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      name: String,
      text: String,
      createdAt: { type: Date, default: new Date() },
    },
  ],
});
