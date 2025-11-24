import { NextResponse } from "next/server";
import { RegistrationData } from "@/lib/models";
import { connectMongoose } from "@/lib/mongoose";
import { ensureConnection } from "@/lib/models";
import { isScriptRunning } from "@/lib/scriptState";

export async function POST(request: Request) {
  try {
    // Get network from request body
    const body = await request.json().catch(() => ({}));
    const useSonic = body.network !== false; // Default to true (Sonic), false for Sepolia
    const networkKey = useSonic ? "sonic" : "sepolia";
    
    // Check if read script is running
    if (isScriptRunning(networkKey)) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot clear database while registration script is running. Please stop the script first.",
          error: "Script is running",
        },
        { status: 409 } // Conflict status
      );
    }
    
    console.log(`🗑️  CLEAR DB: Starting database clear for ${networkKey} network...`);
    
    // Ensure MongoDB connection
    await connectMongoose();
    await ensureConnection();
    
    // Delete ALL entries from the database
    console.log(`🗑️  CLEAR DB: Deleting ALL entries from database...`);
    const deleteResult = await RegistrationData.deleteMany({});
    console.log(`✅ CLEAR DB: Deleted ${deleteResult.deletedCount} entries from database`);
    
    return NextResponse.json({
      success: true,
      message: `Database cleared successfully. Deleted ${deleteResult.deletedCount} entries.`,
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Clear DB Error:", errorMessage);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to clear database",
        error: errorMessage,
        deletedCount: 0,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST method to clear database" });
}


