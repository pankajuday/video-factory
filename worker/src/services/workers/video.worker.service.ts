import { Worker } from "bullmq";
import { videoJobName } from "../../config/constent.js";
import { deleteFile } from "../../utils/fileHandler.js";
import { generateHLS } from "../../hlsBuilder.js";
import { redisOptions } from "../../db/redis.db.js";


const videoWorker = () => {
  new Worker(
    videoJobName,
    async (job) => {
      try {
        console.log(`Processing video: ${job.data.uniqueName}`);

        generateHLS(`${job.data.uniqueName}${job.data.extname}`, job.data.videoId);

        await deleteFile(`${job.data.uniqueName}${job.data.extname}`);

        console.log(`Video processing completed: ${job.data.uniqueName}${job.data.extname}`);
      } catch (error) {
        console.error(`Error processing video ${job.data.uniqueName}${job.data.extname}:`, error);
        throw error; 
      }
    },
    {
      connection: redisOptions,
      lockDuration: 5 * 60 * 1000, // 5 minutes lock duration for long-running jobs
      stalledInterval: 30000, // check for stalled jobs every 30 seconds
      maxStalledCount: 3, // retry stalled jobs up to 3 times
    }
  );
};

export { videoWorker };
