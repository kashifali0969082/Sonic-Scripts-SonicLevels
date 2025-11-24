import { NextResponse } from "next/server";
import { WriteRegistration } from "@/app/components/writeRegistration";
import { isScriptRunning } from "@/lib/scriptState";

export async function POST(request: Request) {
  try {
    // Get network preference, sessionId, maxUsers, and batchSize from request body
    const body = await request.json().catch(() => ({}));
    const useSonic = body.network !== false; // Default to true (Sonic), false for Sepolia
    const networkKey = `write-${useSonic ? "sonic" : "sepolia"}`;
    const sessionId = body.sessionId || `write-session-${Date.now()}`;
    const maxUsers = body.maxUsers; // undefined = all, number = custom limit
    const batchSize = body.batchSize || 20; // default 20

    // Check if script is already running
    if (isScriptRunning(networkKey)) {
      return NextResponse.json(
        {
          success: false,
          message: "Write registration script is already running on this network. Please wait for it to complete or pause it first.",
          error: "Script already running",
          totalUnwritten: 0,
          written: 0,
          skipped: 0,
          errors: 0,
          batches: 0,
          alreadyRunning: true,
        },
        { status: 409 } // Conflict status
      );
    }

    console.log(`🚀 API: Starting write registration process on ${useSonic ? "Sonic" : "Sepolia"} network...`);
    console.log(`📊 Options: maxUsers=${maxUsers || "all"}, batchSize=${batchSize}`);
    
    const result = await WriteRegistration({
      useSonic,
      sessionId,
      maxUsers,
      batchSize,
    });

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ API Error:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to execute write registration",
        error: errorMessage,
        totalUnwritten: 0,
        written: 0,
        skipped: 0,
        errors: 0,
        batches: 0,
      },
      { status: 500 }
    );
  }
}

// Also support GET for testing
export async function GET() {
  return NextResponse.json(
    { message: "Use POST method to trigger write registration" },
    { status: 200 }
  );
}

