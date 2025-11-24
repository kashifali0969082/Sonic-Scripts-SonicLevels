// lib/mongodb.ts
import { MongoClient, Db } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Environment variables se URI lo, agar nahi hai toh default use karo
const uri = process.env.MONGODB_URI || "mongodb://admin:secret@localhost:27017/";
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Connection function - immediately connect karo
function connectMongoDB() {
  if (!globalThis._mongoClientPromise) {
    console.log("🔄 Attempting to connect to MongoDB...");
    client = new MongoClient(uri, options);
    clientPromise = client.connect()
      .then((c) => {
        console.log("✅ MongoDB connected successfully!");
        console.log("📍 Connected to:", uri);
        return c;
      })
      .catch((error) => {
        console.error("❌ MongoDB connection failed:", error);
        console.error("⚠️  Please make sure MongoDB is running on:", uri);
        console.error("💡 Tip: Run 'mongod' or 'brew services start mongodb-community'");
        // Don't throw - let it retry when getDb is called
        throw error;
      });
    globalThis._mongoClientPromise = clientPromise;
  }
  return globalThis._mongoClientPromise;
}

// Immediately initialize connection when module loads
clientPromise = connectMongoDB();

// helper function to get DB
export async function getDb(dbName: string): Promise<Db> {
  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (error) {
    console.error("❌ Error getting database:", error);
    throw error;
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const client = await clientPromise;
    await client.db("admin").command({ ping: 1 });
    console.log("✅ MongoDB connection test successful!");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection test failed:", error);
    return false;
  }
}
(async () => {
  try {
    await clientPromise;
    console.log("✅ MongoDB connection initialized on startup");
  } catch (error: any) {

  }
})();

// Export connection promise for direct access if needed
export { clientPromise };
