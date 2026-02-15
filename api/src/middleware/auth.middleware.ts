import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/Asynchandler";
import { User } from "../models/user.model";
import type { Response, NextFunction, IAccessTokenPayload, IAuthRequest } from "../Types";


export const verifyJWT = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }
    const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
    ) as IAccessTokenPayload;

    const user = await User.findById(decoded._id).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(401, "Invalid access token");
    }
    req.user = user;
    next();

})
