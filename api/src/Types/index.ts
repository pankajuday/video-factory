import { type NextFunction, type Request, type Response } from "express"
import type { Document, Types } from "mongoose";

// export type RouteHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

// export type ErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => void | Promise<void>;

export type { Request, Response, NextFunction };

export interface IApiRes<T = any> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
}

export interface IRegisterBody {
    fullName: string;
    username: string;
    email: string;
    password: string;
}

export interface IAccessTokenPayload {
    _id: string;
    email: string;
    username: string;
}

export interface IAuthRequest extends Request {
    user?: IUser;
}

export interface ILoginBody {
    email?: string;
    username?: string;
    password: string;
}

export interface IVideoUploadBody {
    title: string;
}

export interface IAuthMulterRequest extends IAuthRequest {
    file?: Express.Multer.File;
}

// USER MODEL Types 

export interface IRefreshToken {
    token: string;
    createdAt: Date;
}

export interface AccessTokenPayload {
    _id: Types.ObjectId;
    email: string;
    username: string;

}

export interface RefreshTokenPayload {
    _id: Types.ObjectId;
    email: string
}

export interface IUser extends Document {
    fullName: string;
    username: string;
    email: string;
    password: string;
    refreshToken: IRefreshToken[];
    createdAt: Date;
    updatedAt: Date;

    // instance methods

    isPasswordCorrect(password: string): Promise<boolean>;
    generate_access_token(): string;
    generate_refresh_token(): string;

}


// VIDEO MODEL Types

export type VideoStatus =
    | "uploading"
    | "processing"
    | "ready"
    | "failed"

export interface IVideo extends Document {
    owner: Types.ObjectId;
    title: string;
    slug: string;

    uniqueName: string;
    originalName: string;
    originalPath: string;
    hlsPath?: string;

    status: VideoStatus;

    duration?: number;
    resolutions?: string[];

    error?: string;

    createdAt: Date;
    updatedAt: Date;
}


export interface IVideoJobData{
    videoId: string;
    originalPath: string,
    uniqueName: string,
    slug: string,
    status: string
}