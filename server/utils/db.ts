import mongoose from "mongoose";
import "dotenv/config";

type envProps = {
    MONGO_URI: string;
}

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect((process.env as envProps).MONGO_URI)
        console.log(`Connected to MongoDb Database: ${conn.connection.host}`)
    } catch(error) {
        console.log(`Unable to connect to MongoDb Database: ${error}`);
        process.exit(1)
    }
}
