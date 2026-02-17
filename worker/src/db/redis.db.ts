import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { videoJobName } from "../config/constent";
import { REDIS_URI, REDIS_PORT } from "../config/env";

// Redis DB connection
const connectRedisDB = new IORedis({
  host: REDIS_URI || "localhost",
  port: Number(REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
  retryStrategy(times: number) {
    const delay = Math.min(times * 200, 5000); // 5sec
    console.log(`Redis reconnecting... attempt ${times}, delay ${delay}ms`);
    return delay;
  },
});

// export const videoQueue = new Queue(videoJobName, {
//     connection: redisConnection,
//     defaultJobOptions: {
//         removeOnComplete: true,
//         removeOnFail: 50,       // keep last 50 failed jobs for debugging
//         attempts: 3,            // retry failed jobs 3 times
//         backoff: {
//             type: "exponential",
//             delay: 1000,        // 1s, 2s, 4s
//         },
//     },
// });



export { connectRedisDB };



