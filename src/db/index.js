import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "../constant.js";

dotenv.config(); // Ensure environment variables are loaded

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI || !DB_NAME) {
      throw new Error(
        "Mongo URI or Database Name is not defined in environment variables."
      );
    }

    const connectInstance = await mongoose.connect(
      `${mongoURI}/${DB_NAME}`,
      {}
    );

    console.log(
      `\nMongoDB is connected! DB host: ${connectInstance.connection.host}`
    );
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1); // Exit process with failure code
  }
};

export default connectDB;
