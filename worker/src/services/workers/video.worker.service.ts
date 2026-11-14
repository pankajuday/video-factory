import { Worker } from "bullmq";
import { videoJobName } from "../../config/constent.js";
import { generateHLS } from "../../hlsBuilder.js";
import { redisOptions } from "../../db/redis.db.js";
import { deleteObject } from "../../utils/s3.js";


const videoWorker = () => {
  new Worker(
    videoJobName,
    async (job) => {
      try {
        console.log(`Processing video: ${job.data.uniqueName}`);

        await generateHLS(
          job.data.originalPath,
          job.data.uniqueName,
          job.data.videoId,
        );

        // Keep the source object while transcoding is in progress. It is
        // deleted only after every HLS object and its metadata are persisted.
        await deleteObject(job.data.originalPath);

        console.log(`Video processing completed: ${job.data.uniqueName}`);
      } catch (error) {
        console.error(`Error processing video ${job.data.uniqueName}:`, error);
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
