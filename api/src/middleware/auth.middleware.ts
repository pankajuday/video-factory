import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/Asynchandler";
import { User } from "../models/user.model";
import type { Response, NextFunction, IAccessTokenPayload, IAuthRequest } from "../Types";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;

export const verifyJWT = asyncHandler(async (req: IAuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    const token = req.cookies?.accessToken ?? req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    let decoded: IAccessTokenPayload;
    try {
        decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as IAccessTokenPayload;
    } catch {
        throw new ApiError(401, "Invalid or expired token");
    }

    const user = await User.findById(decoded._id).select("-password -refreshToken").lean();
    
    if (!user) {
        throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
});
