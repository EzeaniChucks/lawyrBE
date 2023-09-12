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
        signature: { type: String, required: true },
        resource_type: { type: String, required: true },
        format: { type: String, required: true },
        playback_url: { type: String },
      },
    ],
  },
  { timestamps: true },
);
