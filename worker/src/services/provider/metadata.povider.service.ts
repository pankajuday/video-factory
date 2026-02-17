/**
 * VideoMetadataProvider is responsible for batching processed video metadata and pushing it to Redis.
 * This enables efficient handling of high-concurrency video processing scenarios by decoupling
 * the processing from MongoDB writes. Instead of saving each video's metadata to MongoDB immediately
 * after processing, metadata is first pushed to Redis. A separate process can then batch-save
 * multiple video metadata entries from Redis to MongoDB, improving throughput and reducing write contention.
 *
 * Note: This provider is intended for use cases where multiple videos are processed concurrently.
 * It is not designed for parallel video processing itself, but for efficient metadata handling while processing parallel video.
 *
 * Data Flow: PROCESSED DATA => REDIS INSTANCE => MONGODB
 */


import { Queue } from "bullmq";

/**
 * TODO
 * 
 */