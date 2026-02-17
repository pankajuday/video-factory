import { connectMongoDB } from "./db/mongo.db";
import { app } from "./app";

const PORT = Number(process.env.PORT) || 8000;
const HOST = "127.0.0.1";

connectMongoDB().then(() => {
    app.listen(PORT, HOST, () => {
        console.log(`Server is running on http://${HOST}:${PORT}`);
    }).on("error", (error) => {
        console.log("ERROR", error);
        throw error;
    });
}).catch((err) => {
    console.log("MongoDB connection FAILED !! ", err);
});
