import { NextRequest } from "next/server";
import { initProgressControllers } from "@/lib/progressSSE";

// Initialize progress controllers on module load
initProgressControllers();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return new Response("Missing sessionId parameter", { status: 400 });
  }

  console.log(`📡 SSE: Write registration progress stream requested for sessionId: ${sessionId}`);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Store controller for this session
      if (!globalThis._progressControllers) {
        globalThis._progressControllers = new Map();
      }
      globalThis._progressControllers.set(sessionId, {
        controller,
        encoder,
        send: (data: any) => {
          try {
            const message = `data: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(message));
          } catch (e) {
            console.error(`Failed to send SSE message to session ${sessionId}:`, e);
          }
        },
      });

      console.log(`✅ SSE: Write registration progress stream connected for sessionId: ${sessionId}`);

      // Send initial connection message
      const initialMessage = {
        type: "connected",
        sessionId,
        message: "Connected to write registration progress stream",
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialMessage)}\n\n`));

      // Keep connection alive with periodic ping
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch (e) {
          clearInterval(pingInterval);
        }
      }, 30000); // Ping every 30 seconds

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        console.log(`🔌 SSE: Write registration progress stream closed for sessionId: ${sessionId}`);
        clearInterval(pingInterval);
        if (globalThis._progressControllers) {
          globalThis._progressControllers.delete(sessionId);
        }
        try {
          controller.close();
        } catch (e) {
          // Ignore errors on close
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

