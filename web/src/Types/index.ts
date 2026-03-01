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






export type { VideoByIdResponse, VideoDetails, AllVideo };
