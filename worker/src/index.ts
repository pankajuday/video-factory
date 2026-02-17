import { connectMongoDB } from "./db/mongo.db";
import { connectRedisDB } from "./db/redis.db";
import { videoWorker } from "./services/workers/video.worker.service";

async function initializeDatabases() {
    try {
        await connectMongoDB();
    } catch (err) {
        console.error("MongoDB connection FAILED !!", err);
    }

    connectRedisDB.on("connect", () => {
        console.log("Redis connected");
    });

    connectRedisDB.on("error", (err) => {
        console.error("Redis connection error:", err.message);
    });
}

async function initializeWorkers() {
    try {
        videoWorker();
    } catch (error) {
        console.log(error)
    }
}

initializeDatabases();
initializeWorkers()