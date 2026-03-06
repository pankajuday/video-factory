import { connectMongoDB } from "./db/mongo.db";
import { waitForRedis } from "./db/redis.db";
import { videoWorker } from "./services/workers/video.worker.service";

async function initializeDatabases() {
    try {
        await connectMongoDB();
    } catch (err) {
        console.error("MongoDB connection FAILED !!", err);
    }

    try {
        await waitForRedis();
        console.log("Redis is ready");
    } catch (err) {
        console.error("Redis connection FAILED !!", err);
    }
}

async function initializeWorkers() {
    try {
        videoWorker();
        console.log("Video worker started");
    } catch (error) {
        console.log(error)
    }
}

async function main() {
    await initializeDatabases();
    await initializeWorkers();
}

main();