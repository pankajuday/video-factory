import mongoose from "mongoose";
import { dbName } from "../config/constent";
import { MONGO_URI } from "../config/env";



const connectMongoDB = async () => {
    try {
        const conInst = await mongoose.connect(`${MONGO_URI}/${dbName}`);
        console.log(`MongoDB connected !!! Host: ${conInst.connection.host} | DB: ${conInst.connection.name}`);
    } catch (error) {
        console.log('MongoDB connection FAILED', error);
        process.exit(1);
    }
}


export { connectMongoDB };