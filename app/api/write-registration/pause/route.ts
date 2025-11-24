import { NextResponse } from "next/server";
import { setPauseFlag, getPauseFlag, clearPauseFlag } from "@/lib/pauseControl";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const useSonic = body.network !== false;
    const networkKey = `write-${useSonic ? "sonic" : "sepolia"}`;
    const action = body.action || "pause"; // "pause" or "resume"

    if (action === "pause") {
      setPauseFlag(networkKey, true);
      console.log(`⏸️  Write registration pause flag set for ${networkKey}`);
      return NextResponse.json({
        success: true,
        message: "Write registration paused",
        paused: true,
      });
    } else if (action === "resume") {
      clearPauseFlag(networkKey);
      console.log(`▶️  Write registration pause flag cleared for ${networkKey}`);
      return NextResponse.json({
        success: true,
        message: "Write registration resumed",
        paused: false,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid action. Use 'pause' or 'resume'",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Pause/Resume Error:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to pause/resume write registration",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const networkParam = url.searchParams.get("network");
    const useSonic = networkParam !== "false";
    const networkKey = `write-${useSonic ? "sonic" : "sepolia"}`;

    const isPaused = getPauseFlag(networkKey);

    return NextResponse.json({
      success: true,
      paused: isPaused,
      network: networkKey,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get pause status",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

