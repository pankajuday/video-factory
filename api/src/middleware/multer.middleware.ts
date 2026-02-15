import multer, { type FileFilterCallback } from "multer"
import path from "path"
import type { Request } from "express"
import { DEV_ENV } from "../config/env";


let media_path = path.resolve(__dirname, "../../../media/uploads");
if (DEV_ENV == "production") {
    media_path = "/media/uploads"
}

const storage = multer.diskStorage({
    destination: (_req, _file, cd) => {
        cd(null, media_path);
    },

    filename: (_req, file, cd) => {
        const ext = path.extname(file.originalname);

        const uniqueName = Date.now() + "_" + Math.round(Math.random() * 1e9) + ext;

        cd(null, uniqueName);
    }
});

const allowedVideoTypes: string[] = [
    "video/mp4",
    // "video/mkv",
    // "video/webm",
    // "video/avi",
    // "video/quicktime",  // .mov
    // "video/x-matroska", // .mkv (standard MIME)
];

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    if (allowedVideoTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type! Only video files ( mp4 ) are allowed"));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500 MB max
    },
})