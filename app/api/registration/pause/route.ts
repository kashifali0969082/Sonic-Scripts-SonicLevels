import { NextResponse } from "next/server";
import { setPauseFlag, clearPauseFlag } from "@/lib/pauseControl";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const network = body.network !== false ? "sonic" : "sepolia"; // true = Sonic, false = Sepolia
    const action = body.action || "pause"; // "pause" or "resume"
    
    if (action === "pause") {
      setPauseFlag(network, true);
      return NextResponse.json({ 
        success: true, 
        message: "Registration paused",
        paused: true 
      });
    } else if (action === "resume") {
      clearPauseFlag(network);
      return NextResponse.json({ 
        success: true, 
        message: "Registration resumed",
        paused: false 
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid action. Use 'pause' or 'resume'" },
        { status: 400 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, message: "Failed to pause/resume", error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST method with action: 'pause' or 'resume'" });
}

