import { NextResponse } from "next/server";
import { getScriptState } from "@/lib/scriptState";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const networkParam = url.searchParams.get("network");
    const useSonic = networkParam !== "false";
    const networkKey = `write-${useSonic ? "sonic" : "sepolia"}`;

    const state = getScriptState(networkKey);

    return NextResponse.json({
      success: true,
      isRunning: state.isRunning || false,
      sessionId: state.sessionId,
      startTime: state.startTime,
      network: networkKey,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Status Error:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get write registration status",
        error: errorMessage,
        isRunning: false,
      },
      { status: 500 }
    );
  }
}

