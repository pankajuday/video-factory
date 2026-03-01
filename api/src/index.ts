import { connectMongoDB } from "./db/mongo.db";
import { app } from "./app";
import { DEV_ENV } from "./config/env";

const PORT = Number(process.env.PORT) || 8000;
// 0.0.0.0 for Docker/production (accepts external connections)
// 127.0.0.1 for local development (localhost only)
const HOST = DEV_ENV === "production" ? "0.0.0.0" : "127.0.0.1";

connectMongoDB().then(() => {
    app.listen(PORT, HOST, () => {
        console.log(`[${DEV_ENV}] Server is running on http://${HOST}:${PORT}`);
    }).on("error", (error) => {
        console.log("ERROR", error);
        throw error;
    });
}).catch((err) => {
    console.log("MongoDB connection FAILED !! ", err);
});
