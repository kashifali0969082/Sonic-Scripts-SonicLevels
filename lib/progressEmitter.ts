// Progress emitter for real-time updates
// Uses a Map to store progress callbacks per session

type ProgressCallback = (data: {
  current: number;
  total: number;
  created: number;
  skipped: number;
  errors: number;
  message?: string;
}) => void;

const progressCallbacks = new Map<string, ProgressCallback>();

export function setProgressCallback(sessionId: string, callback: ProgressCallback) {
  progressCallbacks.set(sessionId, callback);
}

export function getProgressCallback(sessionId: string): ProgressCallback | undefined {
  return progressCallbacks.get(sessionId);
}

export function removeProgressCallback(sessionId: string) {
  progressCallbacks.delete(sessionId);
}

export function emitProgress(sessionId: string, data: {
  current: number;
  total: number;
  created: number;
  skipped: number;
  errors: number;
  message?: string;
}) {
  const callback = progressCallbacks.get(sessionId);
  if (callback) {
    callback(data);
  }
}

