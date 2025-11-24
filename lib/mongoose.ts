import mongoose from "mongoose";

declare global {
  var _mongooseConnection: typeof mongoose | undefined;
}

// Environment variables se URI lo, agar nahi hai toh default use karo
const uri = process.env.MONGODB_URI || "mongodb://admin:secret@localhost:27017/";

let connection: typeof mongoose;

// Connection function - Mongoose connection setup
async function connectMongoose() {
  if (globalThis._mongooseConnection) {
    return globalThis._mongooseConnection;
  }

  if (mongoose.connection.readyState === 1) {
    globalThis._mongooseConnection = mongoose;
    return mongoose;
  }

  try {
    console.log("🔄 Attempting to connect to MongoDB with Mongoose...");
    connection = await mongoose.connect(uri);
    console.log("✅ Mongoose connected successfully!");
    console.log("📍 Connected to:", uri);
    globalThis._mongooseConnection = connection;
    return connection;
  } catch (error) {
    console.error("❌ Mongoose connection failed:", error);
    console.error("⚠️  Please make sure MongoDB is running on:", uri);
    throw error;
  }
}

// Initialize connection
const connectionPromise = connectMongoose();

export { connectionPromise, connectMongoose };
export default mongoose;

