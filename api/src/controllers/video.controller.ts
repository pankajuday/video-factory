import { asyncHandler } from "../utils/Asynchandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Video } from "../models/video.model";
import type { Response, IVideoUploadBody, IAuthRequest, IAuthMulterRequest, IVideo } from "../Types";
import mongoose from "mongoose";
import { addVideoToQueue } from "../services/provider.service";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { rawVideoKey } from "../utils/s3PathHandler";
import { deleteVideo, uploadVideo } from "../utils/s3";

/**
 * Persist the validated multer memory buffer in S3-compatible object storage.
 */
const videoUpload = asyncHandler(async (req: IAuthMulterRequest, res: Response): Promise<void> => {

    const { title } = req.body as IVideoUploadBody;

    if (!title?.trim()) {
        throw new ApiError(400, "Video title is required");
    }

    if (!req.file) {
        throw new ApiError(400, "Video file is required");
    }

    const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        + "-" + Date.now();

    const extname = path.extname(req.file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}_${randomUUID()}`;
    const filename = `${uniqueName}${extname}`;
    const originalPath = rawVideoKey(filename);

    try {
        await uploadVideo(req.file.buffer, originalPath, req.file.mimetype);
    } catch (error) {
        console.error("Failed to upload video to object storage:", error);
        throw new ApiError(502, "Failed to store video upload");
    }

    let video: IVideo;
    try {
        video = await Video.create({
            title: title.trim(),
            slug,
            uniqueName,
            originalName: req.file.originalname,
            originalPath,
            status: "processing",
            owner: req.user?._id,
            extname,
        });
    } catch (error) {
        // Do not leave an unreachable upload behind when database creation fails.
        await deleteVideo(originalPath).catch((cleanupError) => {
            console.error("Failed to remove orphaned video object:", cleanupError);
        });
        throw error;
    }

    try {
        await addVideoToQueue(video);
    } catch (error) {
        await Video.findByIdAndUpdate(video._id, {
            status: "failed",
            error: "Failed to add video processing job to queue",
        });
        throw new ApiError(500, "Failed to add video processing job to queue");
    }



    res.status(201).json(
        new ApiResponse(201, video, "Video uploaded successfully")
    );
});

const getVideos = asyncHandler(async (req: IAuthRequest, res: Response) => {
    const userId = req.user?._id;

    const video = await Video.aggregate([
        {
            $project: {
                title: 1,
                slug: 1,
                hlsPath: 1,
                _id: 1,
                owner: 1

            }
        }

    ]);


    if (video == null || video.length == 0) {
        throw new ApiError(404, "video Not found");
    }

    res.status(200).json(new ApiResponse(200, video, "Fetched successfully all videos"));
})

const getVideoById = asyncHandler(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { videoId } = req.params;

    if (!videoId || Array.isArray(videoId) || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Valid video ID is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
});

export { videoUpload, getVideos, getVideoById };
