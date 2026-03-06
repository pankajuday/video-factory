import { DEV_ENV } from "./env";

export const dbName = "VIDEO_FACTORY";
export const videoQueueName = "VIDEO-PROCESSING";
export const videoJobName = "TRANSCODE";
export const MEDIA_ROOT = DEV_ENV === "production" ? "/media" : "/mnt/d/study-mat/project/video-factory/media" ;