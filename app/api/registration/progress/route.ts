import { NextResponse } from "next/server";
import { initProgressControllers } from "@/lib/progressSSE";

// Server-Sent Events endpoint for real-time progress
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId") || "default";

  // Initialize controllers map
  initProgressControllers();

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Send initial connection message
      const send = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      send({ type: "connected", sessionId });
      console.log(`✅ SSE connection established for session: ${sessionId}`);

      // Store the controller for progress updates
      if (globalThis._progressControllers) {
        globalThis._progressControllers.set(sessionId, { controller, encoder, send });
        console.log(`📝 Stored SSE controller for session: ${sessionId}. Total sessions: ${globalThis._progressControllers.size}`);
      } else {
        console.error("❌ Progress controllers map not initialized!");
      }

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        if (globalThis._progressControllers) {
          globalThis._progressControllers.delete(sessionId);
        }
        try {
          controller.close();
        } catch (e) {
          // Ignore close errors
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

