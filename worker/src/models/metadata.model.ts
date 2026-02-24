import mongoose, { Schema } from "mongoose";
import type { MetadataDocument } from "../Types";
import { Video } from "./video.model";
import { API_SERVER_HOST_URL } from "../config/env";

const QualitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    resolution: {
      type: String,
      required: true,
      trim: true,
    },

    bitrate: {
      type: String,
      required: true,
      trim: true,
    },

    audio_bitrate: {
      type: String,
      required: true,
      trim: true,
    },
    playlist: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const MetadataSchema = new Schema<MetadataDocument>({
  videoId: {
    type: String,
    required: true,
    index: true,
  },
  video_name: {
    type: String,
    required: true,
    trim: true,
  },
  input_file: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: String,
    required: true,
    trim: true,
  },
  source_resolution: {
    type: String,
    required: true,
    trim: true,
  },

  output_root: {
    type: String,
    required: true,
    trim: true,
  },

  master_playlist: {
    type: String,
    required: true,
    trim: true,
  },

  qualities: {
    type: [QualitySchema],
    required: true,
  },
});



// After saving Metadata, update the corresponding Video document
MetadataSchema.post("save", async function (doc) {

  // const hlsURL = `${API_SERVER_HOST_URL}/videos/${doc.master_playlist.substring(doc.master_playlist.indexOf("/videos/")+8)}`

  try {
    await Video.findOneAndUpdate(
      { _id: doc.videoId },
      {
        hlsPath: doc.master_playlist,
        status: "ready",
        resolutions: doc.qualities.map((q: any) => q.name),
      }
    );
  } catch (err) {
    console.error("Failed to update Video after Metadata save:", err);
  }
});

export const Metadata = mongoose.model<MetadataDocument>(
  "Metadata",
  MetadataSchema
);
