import { Readable } from "node:stream";
import { asyncHandler } from "../utils/Asynchandler";
import type { IAuthRequest, Response } from "../Types";
import { ApiError } from "../utils/ApiError";
import mongoose from "mongoose";
import { Video } from "../models/video.model";
import { s3Client } from "../config/s3";

const HLS_PREFIX = "videos";

const mimeTypes: Record<string, string> = {
  ".m3u8": "application/vnd.apple.mpegurl",
  ".ts": "video/mp2t",
};

function requestedPath(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.every((part) => typeof part === "string")) {
    return value.join("/");
  }
  return undefined;
}

function safeObjectKey(uniqueName: string, childPath?: string): string {
  const prefix = `${HLS_PREFIX}/${uniqueName}`;

  if (!childPath) return `${prefix}/${uniqueName}_multi_quality.m3u8`;

  const segments = childPath.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    throw new ApiError(400, "Invalid HLS asset path");
  }

  return `${prefix}/${segments.join("/")}`;
}

function publicHlsUrl(videoId: string, assetPath: string): string {
  const encodedPath = assetPath.split("/").map(encodeURIComponent).join("/");
  return `/api/v1/hls/${encodeURIComponent(videoId)}/${encodedPath}`;
}

function rewritePlaylist(playlist: string, videoId: string, currentAssetPath?: string): string {
  const directory = currentAssetPath?.split("/").slice(0, -1).join("/") ?? "";

  return playlist.split(/\r?\n/).map((line) => {
    const asset = line.trim();
    if (!asset || asset.startsWith("#")) return line;
    return publicHlsUrl(videoId, directory ? `${directory}/${asset}` : asset);
  }).join("\n");
}

/** Proxies the authorized video's playlists and segments from the S3 bucket. */
const hlsVideoServe = asyncHandler(async (req: IAuthRequest, res: Response): Promise<void> => {
  const { videoId } = req.params;
  const childPath = requestedPath(req.params.objectPath);

  if (!videoId || Array.isArray(videoId) || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Valid video id is required");
  }

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  if (!req.user?._id || String(video.owner) !== String(req.user._id)) {
    throw new ApiError(403, "You are not authorized to view this video");
  }

  const objectKey = safeObjectKey(video.uniqueName, childPath);
  const file = s3Client.file(objectKey);
  if (!(await file.exists())) throw new ApiError(404, "HLS asset not found");

  const extension = objectKey.slice(objectKey.lastIndexOf("."));
  res.setHeader("Content-Type", mimeTypes[extension] ?? "application/octet-stream");

  if (extension === ".m3u8") {
    res.setHeader("Cache-Control", "no-cache");
    res.send(rewritePlaylist(await file.text(), videoId, childPath));
    return;
  }

  res.setHeader("Cache-Control", "private, max-age=31536000, immutable");
  const stream = Readable.fromWeb(file.stream() as never);
  stream.on("error", (error) => {
    if (!res.headersSent) res.status(502).end();
    else res.destroy(error);
  });
  stream.pipe(res);
});

export { hlsVideoServe };
