import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { videoJobName } from "../config/constent";
import { REDIS_URI, REDIS_PORT } from "../config/env";

// Redis connection options 
const redisOptions = {
  host: REDIS_URI || "localhost",
  port: Number(REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
  retryStrategy(times: number) {
    const delay = Math.min(times * 200, 5000); // 5sec
    console.log(`Redis reconnecting... attempt ${times}, delay ${delay}ms`);
    return delay;
  },
};

// Redis DB connection
const connectRedisDB = new IORedis(redisOptions);

connectRedisDB.on("connect", () => {
  console.log("Redis connected");
});

connectRedisDB.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

// Wait for Redis to be ready
const waitForRedis = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (connectRedisDB.status === "ready") {
      resolve();
      return;
    }
    connectRedisDB.once("ready", () => resolve());
    connectRedisDB.once("error", (err) => reject(err));
  });
};

export { connectRedisDB, redisOptions, waitForRedis };



