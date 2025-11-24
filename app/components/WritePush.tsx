"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useUIStore } from "../store/toggleStore";

interface WriteRegistrationResult {
  success: boolean;
  message: string;
  totalUnwritten: number;
  written: number;
  skipped: number;
  errors: number;
  batches: number;
  error?: string;
  paused?: boolean;
}

interface WriteProgressData {
  current: number;
  total: number;
  written: number;
  skipped: number;
  errors: number;
  batches: number;
  message?: string;
}

export const WritePush = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WriteRegistrationResult | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [progress, setProgress] = useState<WriteProgressData | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const { network } = useUIStore(); // network: false = Sepolia, true = Sonic

  // Options for write registration
  const [userOption, setUserOption] = useState<"all" | "custom">("all");
  const [customUserCount, setCustomUserCount] = useState<number>(100);
  const [batchSize, setBatchSize] = useState<number>(20);

  // Check script status on mount and when network changes
  const checkScriptStatus = async () => {
    try {
      const response = await fetch(`/api/write-registration/status?network=${network}`);
      const data = await response.json();

      if (data.success && data.isRunning) {
        setIsLoading(true);
        if (data.sessionId) {
          setSessionId(data.sessionId);
          connectToProgressStream(data.sessionId).catch((err) => {
            console.error("Failed to reconnect to SSE:", err);
          });
        }
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to check script status", error);
    }
  };

  useEffect(() => {
    checkScriptStatus();
  }, [network]);

  // Connect to progress stream
  const connectToProgressStream = (sessionIdToConnect: string): Promise<EventSource> => {
    return new Promise((resolve, reject) => {
      if (eventSource) {
        eventSource.close();
      }

      console.log(`🔌 Connecting to SSE stream with sessionId: ${sessionIdToConnect}`);
      const es = new EventSource(`/api/write-registration/progress?sessionId=${sessionIdToConnect}`);
      setEventSource(es);

      let connectionEstablished = false;

      es.onopen = () => {
        console.log("✅ SSE connection opened");
        connectionEstablished = true;
        resolve(es);
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 Received SSE message:", data);

          if (data.type === "connected") {
            console.log("✅ Connected to progress stream");
            if (!connectionEstablished) {
              connectionEstablished = true;
              resolve(es);
            }
          } else if (data.current !== undefined) {
            setProgress({
              current: data.current,
              total: data.total,
              written: data.written || 0,
              skipped: data.skipped || 0,
              errors: data.errors || 0,
              batches: data.batches || 0,
              message: data.message,
            });

            if (data.paused) {
              setIsPaused(true);
            }
          } else if (data.type === "complete") {
            console.log("✅ Write registration completed");
            setEventSource(null);
            setIsLoading(false);
            setIsPaused(false);
          }
        } catch (e) {
          console.error("Failed to parse SSE message:", e);
        }
      };

      es.onerror = (error) => {
        console.error("SSE error:", error);
        if (!connectionEstablished) {
          reject(error);
        }
      };

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!connectionEstablished) {
          es.close();
          reject(new Error("SSE connection timeout"));
        }
      }, 10000);
    });
  };

  const handleStartWrite = async () => {
    if (isLoading) {
      toast.warning("⚠️ Write registration is already running");
      return;
    }

    // Validate inputs
    if (userOption === "custom" && (customUserCount <= 0 || !Number.isInteger(customUserCount))) {
      toast.error("❌ Please enter a valid number of users (must be a positive integer)");
      return;
    }

    if (batchSize <= 0 || !Number.isInteger(batchSize)) {
      toast.error("❌ Please enter a valid batch size (must be a positive integer)");
      return;
    }

    setIsLoading(true);
    setIsPaused(false);
    setResult(null);
    setProgress(null);

    // Close any existing SSE connections
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }

    // Generate new session ID
    const newSessionId = `write-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);

    // Connect to SSE first
    try {
      await connectToProgressStream(newSessionId);
      console.log("✅ SSE connection established");
    } catch (error) {
      console.error("⚠️ SSE connection failed:", error);
      toast.warning("⚠️ Failed to connect to live updates. Progress may not update in real-time.");
    }

    // Create abort controller
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const maxUsers = userOption === "all" ? undefined : customUserCount;

      const response = await fetch("/api/write-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          network: network,
          sessionId: newSessionId,
          maxUsers: maxUsers,
          batchSize: batchSize,
        }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        toast.success(`✅ ${data.message}`);
      } else {
        if (data.alreadyRunning) {
          toast.warning("⚠️ Write registration is already running");
        } else if (data.paused) {
          setIsPaused(true);
          toast.info("⏸️ Write registration paused");
        } else {
          setResult(data);
          toast.error(`❌ ${data.message}`);
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Request aborted");
        return;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Write registration error:", errorMessage);
      toast.error(`❌ Write registration failed: ${errorMessage}`);
      setResult({
        success: false,
        message: errorMessage,
        totalUnwritten: 0,
        written: 0,
        skipped: 0,
        errors: 0,
        batches: 0,
        error: errorMessage,
      });
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const handlePause = async () => {
    try {
      if (abortController) {
        abortController.abort();
      }

      await fetch("/api/write-registration/pause", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          network: network,
          action: "pause",
        }),
      });

      setIsPaused(true);
      toast.info("⏸️ Pausing write registration...");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to pause: ${errorMessage}`);
    }
  };

  const handleResume = async () => {
    try {
      await fetch("/api/write-registration/pause", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          network: network,
          action: "resume",
        }),
      });

      setIsPaused(false);
      toast.info("▶️ Resuming write registration...");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to resume: ${errorMessage}`);
    }
  };

  const handleContinue = async () => {
    // Continue from where isWritten: false is found (handled automatically by the script)
    await handleStartWrite();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-2 text-center">
            📝 Write Registration to Contract
          </h1>
          <p className="text-gray-300 text-center mb-8">
            Push users from database to {network ? "Sonic" : "Sepolia"} contract
          </p>

          {/* Options Section */}
          <div className="mb-8 bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">⚙️ Write Options</h2>

            {/* Number of Users Option */}
            <div className="mb-4">
              <label className="block text-white font-medium mb-2">
                Number of Users to Push:
              </label>
              <div className="flex gap-4 mb-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="userOption"
                    value="all"
                    checked={userOption === "all"}
                    onChange={(e) => setUserOption(e.target.value as "all" | "custom")}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  <span className="text-gray-300">All Unwritten Users</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="userOption"
                    value="custom"
                    checked={userOption === "custom"}
                    onChange={(e) => setUserOption(e.target.value as "all" | "custom")}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  <span className="text-gray-300">Custom</span>
                </label>
              </div>
              {userOption === "custom" && (
                <input
                  type="number"
                  min="1"
                  value={customUserCount}
                  onChange={(e) => setCustomUserCount(parseInt(e.target.value) || 100)}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  placeholder="Enter number of users"
                  disabled={isLoading}
                />
              )}
            </div>

            {/* Batch Size Option */}
            <div className="mb-4">
              <label className="block text-white font-medium mb-2">
                Batch Size (users per transaction):
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value) || 20)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                placeholder="Enter batch size (default: 20)"
                disabled={isLoading}
              />
              <p className="text-gray-400 text-xs mt-1">
                Number of users to include in each transaction (1-100)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-8 space-y-4">
            <button
              onClick={handleStartWrite}
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform ${
                isLoading
                  ? "bg-gray-600 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105 active:scale-95"
              } text-white shadow-lg border-2 border-green-500/50`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Writing to Contract...
                </span>
              ) : (
                "🚀 Start Writing to Contract"
              )}
            </button>

            {isPaused && (
              <button
                onClick={handleResume}
                className="w-full py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg border-2 border-blue-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                ▶️ Resume Writing
              </button>
            )}

            {isLoading && !isPaused && (
              <button
                onClick={handlePause}
                className="w-full py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white shadow-lg border-2 border-yellow-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                ⏸️ Pause Writing
              </button>
            )}

            {!isLoading && result && !result.success && (
              <button
                onClick={handleContinue}
                className="w-full py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg border-2 border-purple-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                🔄 Continue Writing (from unwritten users)
              </button>
            )}
          </div>

          {/* Loading State with Real-time Progress */}
          {isLoading && (
            <div className="mb-8">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {progress
                        ? `Processing batch ${progress.batches} - ${progress.current}/${progress.total} users...`
                        : "Writing users to contract..."}
                    </p>
                    {progress && (
                      <div className="mt-2 space-y-1">
                        <p className="text-gray-300 text-sm">
                          ✅ Written: <span className="text-green-400 font-semibold">{progress.written}</span> | 
                          ⏭️ Skipped: <span className="text-yellow-400 font-semibold">{progress.skipped}</span> | 
                          ❌ Errors: <span className="text-red-400 font-semibold">{progress.errors}</span> | 
                          📦 Batches: <span className="text-blue-400 font-semibold">{progress.batches}</span>
                        </p>
                        {progress.message && (
                          <p className="text-blue-300 text-xs">{progress.message}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-300"
                    style={{
                      width:
                        progress && progress.total > 0
                          ? `${(progress.current / progress.total) * 100}%`
                          : "10%",
                    }}
                  ></div>
                </div>
                {progress && progress.total > 0 && (
                  <p className="text-gray-400 text-xs text-center">
                    {Math.round((progress.current / progress.total) * 100)}% Complete
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="mb-8">
              <div
                className={`rounded-lg p-6 border-2 ${
                  result.success
                    ? "bg-green-500/10 border-green-500/50"
                    : "bg-red-500/10 border-red-500/50"
                }`}
              >
                <h3
                  className={`text-xl font-semibold mb-4 ${
                    result.success ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {result.success ? "✅ Success" : "❌ Error"}
                </h3>
                <p className="text-white mb-4">{result.message}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Total Unwritten</p>
                    <p className="text-white text-lg font-semibold">{result.totalUnwritten}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Written</p>
                    <p className="text-green-400 text-lg font-semibold">{result.written}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Skipped</p>
                    <p className="text-yellow-400 text-lg font-semibold">{result.skipped}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Errors</p>
                    <p className="text-red-400 text-lg font-semibold">{result.errors}</p>
                  </div>
                </div>
                {result.batches > 0 && (
                  <div className="mt-4 bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Batches Processed</p>
                    <p className="text-blue-400 text-lg font-semibold">{result.batches}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

