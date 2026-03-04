import type {  IVideoUpload, UploadVideo } from "../Types";
import api from "./api";

const upload = async(data:IVideoUpload):Promise<UploadVideo>=>{
    const formData = new FormData();
    formData.append("title", data.title);
    if (data.video) {
        formData.append("video", data.video);
    }
    
    const response = await api.post("/video/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
}


export {
    upload
}