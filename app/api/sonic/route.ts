import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import mongoose from "mongoose";

export async function GET() {
  try {
    // Test connection using Mongoose
    await connectMongoose();
    
    // Check if connection is ready
    const isConnected = mongoose.connection.readyState === 1;
    
    if (!isConnected) {
      return NextResponse.json(
        { message: "MongoDB connection failed", connected: false },
        { status: 500 }
      );
    }

    // Get database name to verify it works
    const dbName = mongoose.connection.db?.databaseName || "unknown";
    
    return NextResponse.json({
      message: "API working!",
      connected: true,
      database: dbName,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Error connecting to MongoDB",
        error: error.message,
        connected: false,
      },
      { status: 500 }
    );
  }
}
