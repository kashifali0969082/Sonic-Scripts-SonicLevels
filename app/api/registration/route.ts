import { NextResponse } from "next/server";
import { Registration } from "@/app/components/readRegContract";
import { isScriptRunning } from "@/lib/scriptState";

export async function POST(request: Request) {
  try {
    // Get network preference and sessionId from request body
    const body = await request.json().catch(() => ({}));
    const useSonic = body.network !== false; // Default to true (Sonic), false for Sepolia
    const networkKey = useSonic ? "sonic" : "sepolia";
    const sessionId = body.sessionId || `session-${Date.now()}`;
    
    // Check if script is already running
    if (isScriptRunning(networkKey)) {
      return NextResponse.json(
        {
          success: false,
          message: "Registration script is already running on this network. Please wait for it to complete or pause it first.",
          error: "Script already running",
          totalUsers: 0,
          created: 0,
          skipped: 0,
          errors: 0,
          alreadyRunning: true,
        },
        { status: 409 } // Conflict status
      );
    }
    
    console.log(`🚀 API: Starting registration process on ${useSonic ? "Sonic" : "Sepolia"} network...`);
    const result = await Registration(useSonic, sessionId);
    
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
        message: "Failed to execute registration",
        error: errorMessage,
        totalUsers: 0,
        created: 0,
        skipped: 0,
        errors: 0,
      },
      { status: 500 }
    );
  }
}

// Also support GET for testing
export async function GET() {
  return NextResponse.json(
    { message: "Use POST method to trigger registration" },
    { status: 200 }
  );
}

