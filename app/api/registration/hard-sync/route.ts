import { NextResponse } from "next/server";
import { RegistrationData } from "@/lib/models";
import { connectMongoose } from "@/lib/mongoose";
import { ensureConnection } from "@/lib/models";
import { isScriptRunning, setScriptStopped } from "@/lib/scriptState";
import { setPauseFlag } from "@/lib/pauseControl";
import { Registration } from "@/app/components/readRegContract";

export async function POST(request: Request) {
  try {
    // Get network from request body
    const body = await request.json().catch(() => ({}));
    const network = body.network !== false ? "sonic" : "sepolia";
    const sessionId = body.sessionId || `hard-sync-${Date.now()}`;
    
    console.log(`🚨 HARD SYNC: Starting for ${network} network...`);
    
    // STEP 1: Stop any running script
    if (isScriptRunning(network)) {
      console.log(`⏸️  HARD SYNC: Stopping running script for ${network}...`);
      setPauseFlag(network, true); // Set pause flag
      setScriptStopped(network); // Stop script state
      // Wait a bit for script to stop
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // STEP 2: Ensure MongoDB connection
    await connectMongoose();
    await ensureConnection();
    
    // STEP 3: Delete ALL entries from the database
    console.log(`🗑️  HARD SYNC: Deleting ALL entries from database for ${network} network...`);
    const deleteResult = await RegistrationData.deleteMany({});
    console.log(`✅ HARD SYNC: Deleted ${deleteResult.deletedCount} entries from database`);
    
    // STEP 4: Clear pause flag (in case it was set)
    setPauseFlag(network, false);
    
    // STEP 5: Start fresh registration from user 1
    console.log(`🚀 HARD SYNC: Starting fresh registration from user 1...`);
    const registrationResult = await Registration(network === "sonic", sessionId, 1); // forceStartFrom = 1
    
    if (registrationResult.success) {
      return NextResponse.json({
        success: true,
        message: `Hard Sync completed successfully. Deleted ${deleteResult.deletedCount} entries and started fresh sync from user 1.`,
        deletedCount: deleteResult.deletedCount,
        registrationResult: registrationResult,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `Hard Sync deleted ${deleteResult.deletedCount} entries but registration failed: ${registrationResult.message}`,
        deletedCount: deleteResult.deletedCount,
        registrationResult: registrationResult,
      }, { status: 500 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Hard Sync Error:", errorMessage);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to perform hard sync",
        error: errorMessage,
        deletedCount: 0,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST method to perform hard sync" });
}

