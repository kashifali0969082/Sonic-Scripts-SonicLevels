import { NextResponse } from "next/server";
import { testConnection, getDb } from "../../../lib/mongod";

export async function GET() {
  try {
    // Test connection
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { message: "MongoDB connection failed", connected: false },
        { status: 500 }
      );
    }

    // Try to get a database to verify it works
    const db = await getDb("test");
    
    return NextResponse.json({
      message: "API working!",
      connected: true,
      database: "test",
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
