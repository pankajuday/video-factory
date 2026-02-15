import mongoose, { Document, Schema } from "mongoose";
import type { IVideo } from "../Types";


const VideoSchema = new Schema<IVideo>(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            uniques: true,
            index: true,
        },
        uniqueName: {
            type: String,
            required: true,
            unique: true,
        },
        originalName: {
            type: String,
            required: true,
        },
        originalPath: {
            type: String,
            required: true,
        },
        hlsPath: {
            type: String,
            default: null
        },
        status: {
            type:String ,
            enum: ["uploading", "processing", "ready", "failed"],
            default: "uploading",
            index: true,
        },
        duration: {
            type: Number,

        },
        resolutions: {
            type: [String],
            default: []
        },
        error: String,
    },
    {
        timestamps: true
    }
)


export const Video = mongoose.model<IVideo>("Video", VideoSchema);