import { s3Client } from "../config/s3";

// Do not use the global `ArrayBufferView` here. TypeScript 5.9 defines it as
// an interface, whereas Bun exposes its own union of typed arrays and
// DataView for S3 writes. Deriving this type keeps both sides identical.
type S3UploadContent = Parameters<typeof s3Client.write>[1];

/** Upload data to an exact object key in the configured bucket. */
async function uploadVideo(
  content: S3UploadContent,
  objectKey: string,
  contentType = "application/octet-stream",
): Promise<void> {
  await s3Client.write(objectKey, content, { type: contentType });
}

async function deleteVideo(objectKey: string): Promise<void> {
  await s3Client.delete(objectKey);
}

async function isExist(objectKey: string): Promise<boolean> {
  return s3Client.exists(objectKey);
}

export { uploadVideo, deleteVideo, isExist };
