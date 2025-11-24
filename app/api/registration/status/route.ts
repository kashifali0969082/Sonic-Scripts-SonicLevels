import { NextResponse } from "next/server";
import { getScriptState } from "@/lib/scriptState";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get("network") !== "false" ? "sonic" : "sepolia";
    
    const state = getScriptState(network);
    
    return NextResponse.json({
      success: true,
      isRunning: state.isRunning || false,
      sessionId: state.sessionId,
      startTime: state.startTime,
      network: state.network,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        isRunning: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

