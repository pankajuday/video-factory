import { useEffect, useState } from "react"
import { all, getvideoById } from "../lib/api.get";
import "../index.css"
import type { AllVideo, VideoDetails } from "../Types";
import { useVideoContext } from "../context/VideoProvider";
function VideoList() {

    const [allVideos, setAllVideos] = useState<AllVideo[]>([])
    const { dispatch } = useVideoContext();

    const fetchVideoById = async (videoId: string): Promise<VideoDetails> => {
        const response = await getvideoById(videoId);
        return response.data;
    }

    useEffect(() => {
        (async () => {
            const data = await all();
            setAllVideos(data.data.data)
            const videoDetails = await fetchVideoById(data.data.data[0]._id)
             dispatch({
            type: "ADD_VIDEO",
            payload: videoDetails
        })
       
        })();

    }, [])
    

    const addVideoInContext = async (videoId: string): Promise<void> => {
        const response = await getvideoById(videoId);
        const videoDetails = response.data;
        dispatch({
            type: "ADD_VIDEO",
            payload: videoDetails
        })
        

    }
    return (
        <div>
            {allVideos.map((d) => (
                <div className="list-main" key={d._id} onClick={() => addVideoInContext(d._id)}>
                   
                     <div className="list-id">
                        <h3 className="list-title">{d.title}</h3>
                        <div className="list-p">
                            <p >Owner: {d.owner}</p>
                            <p>Slug: {d.slug}</p>
                            <p>HLS Path: {d.hlsPath}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default VideoList;