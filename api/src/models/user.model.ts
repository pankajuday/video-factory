import { Schema, Document, model, Types } from "mongoose";
import jwt from "jsonwebtoken";
import type { AccessTokenPayload, IRefreshToken, IUser, RefreshTokenPayload } from "../Types";




const refreshTokenSchema = new Schema<IRefreshToken>(
    {
        token: { type: String },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: "30d",
        }
    }, {
    _id: false
}
)


const userSchema = new Schema<IUser>(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: [3, "Username must be at least 3 characters"],
            maxlength: [30, "Username cannot exceed 30 characters"],
            match: [
                /^[a-zA-Z0-9_]+$/,
                "Username can only contain letters, numbers, and underscores"
            ]
        },
        email: {
            type: String,
            required: [true, "Email is Required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false,
        },
        refreshToken: [refreshTokenSchema],
    },
    { timestamps: true }
);

userSchema.pre<IUser>("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await Bun.password.hash(this.password, {
        algorithm: "bcrypt",
        cost: 10,
    });
});

userSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
    return await Bun.password.verify(password, this.password, "bcrypt");
}

userSchema.methods.generate_access_token = function (): string {

    const payload: AccessTokenPayload = {
        _id: this._id,
        email: this.email,
        username: this.username,
    }

    return jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET as string,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
        })
}

userSchema.methods.generate_refresh_token = function (): string {

    const payload: RefreshTokenPayload = {
        _id: this._id,
        email: this.email
    }

    return jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
        }
    )
}


export const User = model<IUser>("User", userSchema);