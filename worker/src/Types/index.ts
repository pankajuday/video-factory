import type { Document, Types } from "mongoose";

export interface IVideoJobData{
    videoId: string;
    originalPath: string,
    uniqueName: string,
    slug: string,
    status: string
}
// HLS Builder Types
export interface Quality {
  name: string;
  folder: string;
  width: number;
  height: number;
  bitrate: number;
  audio: number;
}

export interface OutputQuality {
  name: string;
  resolution: string;
  bitrate: string;
  audio_bitrate: string;
  playlist: string;
}

export interface IMetadata {
  video_name: string;
  input_file: string;
  duration: string;
  source_resolution: string;
  output_root: string;
  master_playlist: string;
  qualities: OutputQuality[];
}

export interface MetadataWithVideoId extends IMetadata {
  videoId: string;
}

export interface MetadataDocument extends MetadataWithVideoId, Document {
  _id: Types.ObjectId;
}


export type VideoStatus =
    | "uploading"
    | "processing"
    | "ready"
    | "failed"

export interface IVideo extends Document {
    owner: Types.ObjectId;
    title: string;
    slug: string;

    uniqueName: string;
    originalName: string;
    originalPath: string;
    hlsPath?: string;

    status: VideoStatus;

    duration?: number;
    resolutions?: string[];

    error?: string;

    createdAt: Date;
    updatedAt: Date;
}