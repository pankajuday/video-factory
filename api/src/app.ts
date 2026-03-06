import express from "express";
import path from "path";
import cors from "cors"
import cookieParser from "cookie-parser"
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "./utils/ApiError";
import { MEDIA_ROOT } from "./config/constent";

const app = express();

// CORS configuration
const corsOrigin = process.env.CORS_ORIGIN;
app.use(
    cors({
        origin: corsOrigin === "*" ? true : corsOrigin,
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(express.json({limit: "20kb"}));
app.use(express.urlencoded({extended: true, limit: "20kb"}));
app.use(cookieParser());
app.use("/api/v1/hls", express.static(path.join(MEDIA_ROOT, "videos")));

// routes import
import userRouter from "./routes/user.route";
import HCRouter from "./routes/health.route"
import uploadVideo from "./routes/videos.route"
import hlsRouter from "./routes/hls.route"



app.use("/api/v1/users", userRouter);
app.use("/api/v1", HCRouter);
app.use("/api/v1/video", uploadVideo)
app.use("/api/v1/hls", hlsRouter);

// global error handler
app.use((err: ApiError | Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            statusCode: err.statusCode,
            data: null,
            message: err.message,
            success: false,
            errors: err.errors,
        });
        return;
    }

    // fallback for unknown errors
    res.status(500).json({
        statusCode: 500,
        data: null,
        message: err.message || "Internal Server Error",
        success: false,
        errors: [],
    });
});

export {app}
