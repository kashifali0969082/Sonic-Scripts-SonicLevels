// Shared utility for Server-Sent Events progress updates

declare global {
  var _progressControllers: Map<string, {
    controller: ReadableStreamDefaultController;
    encoder: TextEncoder;
    send: (data: any) => void;
  }> | undefined;
}

// Helper to emit progress to a specific session
export function emitProgressToSession(sessionId: string, data: any) {
  if (typeof globalThis !== 'undefined' && globalThis._progressControllers) {
    const session = globalThis._progressControllers.get(sessionId);
    if (session) {
      try {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        session.controller.enqueue(session.encoder.encode(message));
        console.log(`📤 Emitted progress to session ${sessionId}:`, data);
      } catch (e) {
        console.error(`Failed to emit progress to session ${sessionId}:`, e);
      }
    } else {
      console.warn(`⚠️ No SSE session found for sessionId: ${sessionId}. Available sessions:`, Array.from(globalThis._progressControllers.keys()));
    }
  } else {
    console.warn("⚠️ Progress controllers map not initialized");
  }
}

// Initialize global controllers map
export function initProgressControllers() {
  if (!globalThis._progressControllers) {
    globalThis._progressControllers = new Map();
  }
}

