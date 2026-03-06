import { User } from "../models/user.model";
import type { Request, Response, IRegisterBody, ILoginBody } from "../Types";
import { asyncHandler } from "../utils/Asynchandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";


const generateAccessAndRefreshToken = async (userId: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const accessToken = user.generate_access_token();
    const refreshToken = user.generate_refresh_token();

    user.refreshToken.push({ token: refreshToken, createdAt: new Date() });
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

const register = asyncHandler(async (req: Request<{}, {}, IRegisterBody>, res: Response): Promise<void> => {
    // get user details from request body
    const { fullName, username, email, password } = req.body as IRegisterBody;

    // validation - not empty
    if (
        [fullName, username, email, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // check if user already exists by username or email
    const existingUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existingUser) {
        throw new ApiError(409, "User with this email or username already exists");
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
    });

    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    // check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // return response
    res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});


const login = asyncHandler(async (req: Request<{}, {}, ILoginBody>, res: Response): Promise<void> => {
    const { username, password } = req.body as ILoginBody;

    if (!username && password) {
        throw new ApiError(400, "username and password is required");
    }

    const user = await User.findOne({
        username
    }).select("+password");

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(String(user._id));

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // cookie options
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none" as const,
    };

    // return response with cookies
    res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken,
            }, "User logged in successfully")
        );



})

export { register, login, generateAccessAndRefreshToken };