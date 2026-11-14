/**
 * S3 helpers used by the transcoding pipeline. FFmpeg still needs local paths,
 * so source files and HLS output exist only inside a temporary work directory.
 */
import { readdir } from "node:fs/promises";
import path from "node:path";
import { HLS_VIDEOS_PREFIX } from "../config/constent";
import { s3Client } from "../config/s3";

type S3UploadContent = Parameters<typeof s3Client.write>[1];

const mimeTypes: Record<string, string> = {
  ".m3u8": "application/vnd.apple.mpegurl",
  ".ts": "video/mp2t",
};

function assertSafeName(value: string): void {
  if (!value || value.includes("/") || value.includes("\\")) {
    throw new Error("Video name must not contain a path separator");
  }
}

export function hlsPrefix(uniqueName: string): string {
  assertSafeName(uniqueName);
  return `${HLS_VIDEOS_PREFIX}/${uniqueName}`;
}

export function masterPlaylistKey(uniqueName: string): string {
  return `${hlsPrefix(uniqueName)}/${uniqueName}_multi_quality.m3u8`;
}

export async function downloadObject(objectKey: string, destination: string): Promise<void> {
  const file = s3Client.file(objectKey);

  if (!(await file.exists())) {
    throw new Error(`S3 object does not exist: ${objectKey}`);
  }

  // S3File is a Blob, so Bun streams it to the temporary file without loading
  // the complete video into JavaScript memory.
  await Bun.write(destination, file);
}

export async function uploadObject(
  objectKey: string,
  content: S3UploadContent,
  contentType = "application/octet-stream",
): Promise<void> {
  await s3Client.write(objectKey, content, { type: contentType });
}

export async function deleteObject(objectKey: string): Promise<void> {
  await s3Client.delete(objectKey);
}

/** Upload every generated HLS file while preserving its local relative path. */
export async function uploadHlsDirectory(
  localDirectory: string,
  uniqueName: string,
): Promise<void> {
  const prefix = hlsPrefix(uniqueName);

  async function uploadDirectory(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const localPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        await uploadDirectory(localPath);
        continue;
      }

      if (!entry.isFile()) continue;

      const relativePath = path.relative(localDirectory, localPath).split(path.sep).join("/");
      const objectKey = `${prefix}/${relativePath}`;
      const contentType = mimeTypes[path.extname(entry.name).toLowerCase()] ?? "application/octet-stream";

      await uploadObject(objectKey, Bun.file(localPath), contentType);
    }
  }

  await uploadDirectory(localDirectory);
}
