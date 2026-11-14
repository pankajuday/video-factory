import { S3Client } from "bun";

function requiredS3Env(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required S3 configuration: ${name}`);
  }

  return value;
}

/**
 * One client for the application's configured bucket. The bucket name belongs
 * in this configuration; object keys passed to the helper must not include it.
 */
export const s3Client = new S3Client({
  accessKeyId: requiredS3Env("S3_ACCESS_KEY"),
  secretAccessKey: requiredS3Env("S3_SECRET_KEY"),
  bucket: requiredS3Env("S3_BUCKET"),
  endpoint: requiredS3Env("S3_ENDPOINT"),
  region: requiredS3Env("S3_REGION"),
});

