/**
 * Object-key builders. `video-factory` is the bucket, so it deliberately is
 * not part of an object key.
 */
const RAW_VIDEOS_PREFIX = "uploads";

function assertFileName(filename: string): void {
  if (!filename || filename.includes("/") || filename.includes("\\")) {
    throw new Error("An S3 object filename must not contain a path separator");
  }
}

/** Returns the key for an unprocessed upload, e.g. `uploads/abc.mp4`. */
export function rawVideoKey(filename: string): string {
  assertFileName(filename);
  return `${RAW_VIDEOS_PREFIX}/${filename}`;
}
