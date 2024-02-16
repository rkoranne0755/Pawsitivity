import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

console.log(DB_NAME)

const connectDB = async () => {
    try {
      console.log(process.env.MONGO_URI)
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );

    console.log(
      `\n MongoDB Connected !! \n DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Error", error);
    process.exit(1);
  }
};

export default connectDB;
