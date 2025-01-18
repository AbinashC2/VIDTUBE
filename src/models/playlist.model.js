import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video", // Reference to the Video model
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
    }
  },
  { timestamps: true }
);

export const PlayList = mongoose.model("PlayList", playlistSchema);
