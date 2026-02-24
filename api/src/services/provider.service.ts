import { videoQueueName } from "../config/constent";
import { videoQueue } from "../db/redis.db";
import type { IVideo, IVideoJobData } from "../Types";


const addVideoToQueue = async (video: IVideo): Promise<void> => {
    const jobData: IVideoJobData = {
        videoId: String(video._id),
        originalPath: video.originalPath,
        uniqueName: video.uniqueName,
        slug: video.slug,
        status: video.status,
        extname: video.extname
    }

    await videoQueue.add(videoQueueName, jobData, {
        jobId: String(video._id),
    })
    console.log(`Video added to queue: ${video.title} (${video._id})`);
}


export {
    addVideoToQueue
}