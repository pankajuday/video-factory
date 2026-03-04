interface VideoDetails {
  _id: string;
  owner: string;
  title: string;
  slug: string;
  uniqueName: string;
  extname: string;
  originalName: string;
  originalPath: string;
  hlsPath: string;
  status: string;
  resolutions: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface VideoByIdResponse {
  statusCode: number;
  data: VideoDetails;
  message: string;
  success: boolean;
}

interface AllVideo {
  _id: string;
  owner: string;
  title: string;
  slug: string;
  hlsPath: string;
}

interface UploadVideo{
  statusCode: number;
  data: VideoDetails;
  message: string;
  success: boolean;
}

interface IVideoUpload {
  title: string;
  video?: File;
}

export interface ILoginBody {
  email?: string;
  username?: string;
  password: string;
}

export interface UserLogin {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface LoginResponse {
  statusCode: number;
  data: {
    user: UserLogin;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
  success: boolean;
}

export interface UserRegister{
  fullName: string;
  username: string;
  email: string;
  password: string;
  
}

export interface RegisterResponse {
  statusCode: number;
  data: UserLogin;
  message: string;
  success: boolean;
}

export type { VideoByIdResponse, VideoDetails, AllVideo, IVideoUpload, UploadVideo };
