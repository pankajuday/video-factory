import type { VideoByIdResponse } from "../Types";
import api from "./api";

const all = async () => {
  const data = await api.get("/video/all");
  return data;
};

const getvideoById = async (videoId: string): Promise<VideoByIdResponse> => {
  const response = await api.get<VideoByIdResponse>(`/video/${videoId}`);
  return response.data;
};

export { all, getvideoById };
