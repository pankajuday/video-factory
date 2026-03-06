import { asyncHandler } from "../utils/Asynchandler";
import type { IHlsParams, Request, Response } from "../Types";
import { ApiError } from "../utils/ApiError";
import mongoose from "mongoose";
import { MEDIA_ROOT } from "../config/constent";
import path from "path";
import fs from "fs";
import { Video } from "../models/video.model";
const hlsVideoServe = asyncHandler(
  async (req: Request<{}, {}, IHlsParams>, res: Response): Promise<void> => {
    /**
     * Here, we are getting the videoID.
     * Instead of passing the video path in the parameters,
     * this approach is more secure and better.
     * If you allow access to the storage area through params or the URL, the server is not secure and there is a risk of data leakage.
     * So, just get the videoID, query the database to get the video HLS path, and bind it with the Express server on a secure route with authentication verified.
     * Only authenticated and authorized users can access the video.
     *
     * If possible, implement session-based video serving tokens.
     */

    const { videoId } = req.params as IHlsParams;
    const VIDEOS_DIR = path.join(MEDIA_ROOT, "videos");

    if (!videoId) throw new ApiError(400, "Video id is required");

    if (!mongoose.isValidObjectId(videoId))
      throw new ApiError(400, "Invalid video id");

    const video = await Video.findById(videoId);

    if (!video) throw new ApiError(404, "video not found");

    const uniqueName = video.uniqueName;

    const requestedPath = path.join(
      VIDEOS_DIR,
      `${uniqueName}`,
      `${uniqueName}_multi_quality.m3u8`
    );

    if (!fs.existsSync(requestedPath)) {
      throw new ApiError(404, "file not found");
    }

    const ext = path.extname(requestedPath);

    const mimeTypes: Record<string, string> = {
      ".m3u8": "application/vnd.apple.mpegurl",
      ".ts": "video/mp2t",
    };

    res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");

    if (ext === ".m3u8") {
      res.setHeader("Cache-Control", "no-cache");
    } else if (ext === ".ts") {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }

    if (ext === ".m3u8") {
      const playlist = fs.readFileSync(requestedPath, "utf-8");
      const rewritten = playlist
        .split(/\r?\n/)
        .map((line) => {
          if (!line || line.startsWith("#")) return line;
          return `${uniqueName}/${line}`;
        })
        .join("\n");
      res.send(rewritten);
      return;
    }

    fs.createReadStream(requestedPath).pipe(res);
  }
);


export {
     hlsVideoServe
}
