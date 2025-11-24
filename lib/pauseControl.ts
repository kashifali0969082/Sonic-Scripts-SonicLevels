// Simple in-memory pause control for registration script
// Uses a Map to track pause state per network

const pauseFlags = new Map<string, boolean>();

export function setPauseFlag(network: string, paused: boolean) {
  pauseFlags.set(network, paused);
}

export function getPauseFlag(network: string): boolean {
  return pauseFlags.get(network) || false;
}

export function clearPauseFlag(network: string) {
  pauseFlags.delete(network);
}

