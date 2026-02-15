
import {connectMongoDB} from "./db/mongo.db";
import { app } from "./app";

const PORT = process.env.PORT || 8000;

connectMongoDB().then(() => {

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    }).on("error", (error) => {
        console.log("ERROR", error);
        throw error;
    });

}).catch((err) => {
    console.log("MongoDB connection FAILED !! ", err)
});



