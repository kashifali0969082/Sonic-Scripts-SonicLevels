// Track script running state per network

interface ScriptState {
  isRunning: boolean;
  sessionId?: string;
  startTime?: number;
  network?: string;
}

const scriptStates = new Map<string, ScriptState>();

export function setScriptRunning(network: string, sessionId: string) {
  scriptStates.set(network, {
    isRunning: true,
    sessionId,
    startTime: Date.now(),
    network,
  });
}

export function setScriptStopped(network: string) {
  scriptStates.set(network, {
    isRunning: false,
  });
}

export function getScriptState(network: string): ScriptState {
  return scriptStates.get(network) || { isRunning: false };
}

export function isScriptRunning(network: string): boolean {
  const state = scriptStates.get(network);
  return state?.isRunning || false;
}

