import mongoose from "mongoose";

let connectionPromise;

const connectDB = () => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }

  if (!process.env.MONGODB_URI) {
    return Promise.reject(new Error("MONGODB_URI is not configured"));
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  return connectionPromise;
};

export default connectDB;
