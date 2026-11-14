import multer, { type FileFilterCallback } from "multer"
import path from "path"
import type { Request } from "express"

/**
 * Validate uploads while retaining them in memory. The controller persists the
 * buffer to object storage; multer must never write an upload to local disk.
 */

const allowedVideoTypes: string[] = [
    "video/mp4",
    // "video/mkv",
    // "video/webm",
    // "video/avi",
    // "video/quicktime",  // .mov
    // "video/x-matroska", // .mkv (standard MIME)
];

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
        allowedVideoTypes.includes(file.mimetype) &&
        ext === ".mp4"
    ) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type! Only .mp4 video files are allowed"));
    }
};

export const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500 MB max
    },
})
