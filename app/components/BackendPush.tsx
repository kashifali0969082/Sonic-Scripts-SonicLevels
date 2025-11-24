"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useUIStore } from "../store/toggleStore";
import { WritePush } from "./WritePush";

interface RegistrationResult {
  success: boolean;
  message: string;
  totalUsers: number;
  created: number;
  skipped: number;
  errors: number;
  error?: string;
  lastProcessed?: number;
  stoppedDueToNetworkError?: boolean;
  paused?: boolean;
}

interface ProgressData {
  current: number;
  total: number;
  created: number;
  skipped: number;
  errors: number;
  message?: string;
}

export const BackendPush = () => {
  const [activeTab, setActiveTab] = useState<"read" | "write">("read");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isHardSyncing, setIsHardSyncing] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const { network } = useUIStore(); // network: false = Sepolia, true = Sonic

  // Check script status on mount and when network changes
  const checkScriptStatus = async () => {
    try {
      const response = await fetch(`/api/registration/status?network=${network}`);
      const data = await response.json();
      
      if (data.success && data.isRunning) {
        // Script is running on backend
        setIsLoading(true);
        // toast.info("📊 Registration script is already running. Connecting to live updates...");
        
        // Try to reconnect to progress stream if sessionId exists
        if (data.sessionId) {
          setSessionId(data.sessionId);
          connectToProgressStream(data.sessionId).catch(err => {
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

  // Connect to progress stream
  const connectToProgressStream = (sessionIdToConnect: string): Promise<EventSource> => {
    return new Promise((resolve, reject) => {
      // Close existing EventSource if any
      if (eventSource) {
        eventSource.close();
      }
      
      console.log(`🔌 Connecting to SSE stream with sessionId: ${sessionIdToConnect}`);
      const es = new EventSource(`/api/registration/progress?sessionId=${sessionIdToConnect}`);
      setEventSource(es);
      
      let connectionEstablished = false;
      
      es.onopen = () => {
        console.log("✅ SSE connection opened, readyState:", es.readyState);
        connectionEstablished = true;
        resolve(es);
      };
      
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 Received SSE message:", data);
          
          if (data.type === "connected") {
            console.log("✅ Connected to progress stream, sessionId:", data.sessionId);
            if (!connectionEstablished) {
              connectionEstablished = true;
              resolve(es);
            }
          } else if (data.current !== undefined) {
            // Progress update
            console.log(`📊 Progress update: ${data.current}/${data.total} - Created: ${data.created}, Skipped: ${data.skipped}, Errors: ${data.errors}`);
            setProgress({
              current: data.current,
              total: data.total,
              created: data.created,
              skipped: data.skipped,
              errors: data.errors,
              message: data.message,
            });
          } else if (data.type === "complete") {
            // Registration completed
            console.log("✅ Registration completed via SSE");
            es.close();
            setEventSource(null);
            setIsLoading(false);
          }
        } catch (e) {
          console.error("Failed to parse SSE message", e, event.data);
        }
      };
      
      es.onerror = (error) => {
        console.error("SSE connection error", error);
        console.log("SSE readyState:", es.readyState); // 0=CONNECTING, 1=OPEN, 2=CLOSED
        
        if (es.readyState === EventSource.CLOSED && !connectionEstablished) {
          reject(new Error("SSE connection failed"));
        }
        // Don't close on error, let it retry
      };
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (!connectionEstablished) {
          console.warn("⚠️ SSE connection timeout, but continuing anyway...");
          resolve(es); // Resolve anyway to continue
        }
      }, 5000);
    });
  };

  // Load state from localStorage on mount and check backend status
  useEffect(() => {
    setIsVisible(true);
    
    // Restore state from localStorage
    const savedResult = localStorage.getItem("registrationResult");
    const savedProgress = localStorage.getItem("registrationProgress");
    const savedIsPaused = localStorage.getItem("isPaused");
    const savedSessionId = localStorage.getItem("sessionId");
    
    if (savedResult) {
      try {
        setResult(JSON.parse(savedResult));
      } catch (e) {
        console.error("Failed to parse saved result", e);
      }
    }
    
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (e) {
        console.error("Failed to parse saved progress", e);
      }
    }
    
    if (savedIsPaused === "true") {
      setIsPaused(true);
    }
    
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }
    
    // Check if script is running on backend
    checkScriptStatus();
  }, []);

  // Check script status when network changes
  useEffect(() => {
    checkScriptStatus();
  }, [network]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (result) {
      localStorage.setItem("registrationResult", JSON.stringify(result));
    } else {
      localStorage.removeItem("registrationResult");
    }
  }, [result]);

  useEffect(() => {
    if (progress) {
      localStorage.setItem("registrationProgress", JSON.stringify(progress));
    } else {
      localStorage.removeItem("registrationProgress");
    }
  }, [progress]);

  useEffect(() => {
    localStorage.setItem("isPaused", isPaused.toString());
  }, [isPaused]);

  useEffect(() => {
    localStorage.setItem("isLoading", isLoading.toString());
  }, [isLoading]);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem("sessionId", sessionId);
    } else {
      localStorage.removeItem("sessionId");
    }
  }, [sessionId]);

  // Reset result when network changes
  useEffect(() => {
    setResult(null);
    setProgress(null);
    localStorage.removeItem("registrationResult");
    localStorage.removeItem("registrationProgress");
  }, [network]);

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  // Periodic status check while loading (in case of page refresh)
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        checkScriptStatus();
      }, 5000); // Check every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [isLoading, network]);

  const handleRegistration = async () => {
    // Check if script is already running
    try {
      const statusResponse = await fetch(`/api/registration/status?network=${network}`);
      const statusData = await statusResponse.json();
      
      if (statusData.success && statusData.isRunning) {
        toast.warning("⚠️ Registration script is already running. Please wait for it to complete or pause it first.");
        setIsLoading(true);
        // Try to reconnect to existing session
        if (statusData.sessionId) {
          setSessionId(statusData.sessionId);
          connectToProgressStream(statusData.sessionId);
        }
        return;
      }
    } catch (error) {
      console.error("Failed to check script status", error);
    }
    
    setIsLoading(true);
    setResult(null);
    setProgress(null);
    setIsPaused(false);
    
    // Generate session ID
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    console.log(`🆔 Generated sessionId: ${newSessionId}`);
    
    // Connect to SSE for real-time progress FIRST and wait for connection
    try {
      await connectToProgressStream(newSessionId);
      console.log("✅ SSE connection established, starting registration...");
    } catch (error) {
      console.error("⚠️ SSE connection failed, but continuing anyway:", error);
      toast.warning("⚠️ Live updates may not work, but registration will continue");
    }
    
    // Create new AbortController for this request
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      const response = await fetch("/api/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          network: network, // true for Sonic, false for Sepolia
          sessionId: newSessionId,
        }),
        signal: controller.signal,
      });

      const data: RegistrationResult = await response.json();
      setResult(data);
      
      // Close SSE connection on completion
      if (eventSource) {
        eventSource.close();
        setEventSource(null);
      }

      if (data.success) {
        toast.success(`✅ Registration completed! Created: ${data.created}, Skipped: ${data.skipped}`);
        setProgress(null);
        setIsLoading(false);
      } else if (data.paused) {
        setIsPaused(true);
        toast.info(`⏸️  Registration paused at user ${data.lastProcessed || 0}`);
        setIsLoading(false);
      } else if (data.alreadyRunning) {
        toast.warning("⚠️ Script is already running on the server. Reconnecting to live updates...");
        setIsLoading(true);
        // Try to reconnect to existing session
        if (sessionId) {
          connectToProgressStream(sessionId).catch(err => {
            console.error("Failed to reconnect to SSE:", err);
          });
        } else {
          // If no sessionId, try to get it from status
          checkScriptStatus();
        }
      } else {
        toast.error(`❌ Registration failed: ${data.message}`);
        setIsLoading(false);
        if (eventSource) {
          eventSource.close();
          setEventSource(null);
        }
      }
    } catch (error: any) {
      // Close SSE on error
      if (eventSource) {
        eventSource.close();
        setEventSource(null);
      }
      
      if (error.name === 'AbortError') {
        // Request was aborted (paused)
        toast.info("⏸️  Registration paused");
        setIsPaused(true);
      } else {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(`❌ Error: ${errorMessage}`);
        setResult({
          success: false,
          message: "Failed to connect to server",
          error: errorMessage,
          totalUsers: 0,
          created: 0,
          skipped: 0,
          errors: 0,
        });
      }
      setIsLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      // Abort the fetch request
      if (abortController) {
        abortController.abort();
      }
      
      // Set pause flag on server
      await fetch("/api/registration/pause", {
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
      toast.info("⏸️  Pausing registration...");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to pause: ${errorMessage}`);
    }
  };

  const handleResume = async () => {
    try {
      // Clear pause flag on server
      await fetch("/api/registration/pause", {
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
      toast.success("▶️  Resuming registration...");
      // Continue from where it stopped
      await handleRegistration();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to resume: ${errorMessage}`);
    }
  };

  const handleHardSync = async () => {
    // Confirm before hard sync
    const confirmed = window.confirm(
      "⚠️ WARNING: Hard Sync will:\n" +
      "1. Stop any running registration script\n" +
      "2. Delete ALL entries from the database\n" +
      "3. Start fresh sync from user 1\n\n" +
      "This action cannot be undone. Are you sure you want to continue?"
    );

    if (!confirmed) {
      return;
    }

    setIsHardSyncing(true);
    setResult(null);
    setProgress(null);
    setIsPaused(false);
    
    // Close any existing SSE connections
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }

    // Generate new session ID for hard sync
    const hardSyncSessionId = `hard-sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(hardSyncSessionId);
    
    // Connect to SSE for real-time progress
    try {
      await connectToProgressStream(hardSyncSessionId);
      console.log("✅ SSE connection established for hard sync");
    } catch (error) {
      console.error("⚠️ SSE connection failed for hard sync:", error);
    }

    try {
      // Hard sync API will: stop script, delete all entries, and start fresh from user 1
      const deleteResponse = await fetch("/api/registration/hard-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          network: network,
          sessionId: hardSyncSessionId,
        }),
      });

      const deleteData = await deleteResponse.json();

      if (!deleteData.success) {
        if (deleteData.error === "Script already running") {
          toast.warning("⚠️ Cannot perform Hard Sync while script is running");
        } else {
          toast.error(`❌ Hard Sync failed: ${deleteData.message}`);
        }
        setIsHardSyncing(false);
        return;
      }

      // Hard sync API now handles both deletion and starting fresh registration
      if (deleteData.registrationResult) {
        // Registration was started by the API
        setIsHardSyncing(false);
        setIsLoading(true); // Keep loading state since registration is running
        
        if (deleteData.registrationResult.success) {
          toast.success(`✅ Hard Sync completed! Deleted ${deleteData.deletedCount} entries and started fresh sync from user 1.`);
          setResult(deleteData.registrationResult);
          // Don't set loading to false - let the registration continue and update via SSE
        } else {
          toast.error(`❌ Hard Sync deleted entries but registration failed: ${deleteData.registrationResult.message}`);
          setResult(deleteData.registrationResult);
          setIsLoading(false);
        }
      } else {
        // Fallback: if API doesn't start registration, start it manually
        toast.success(`✅ Hard Sync completed! Deleted ${deleteData.deletedCount} entries. Starting fresh sync...`);
        setIsHardSyncing(false);
        await handleRegistration();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`❌ Hard Sync error: ${errorMessage}`);
      setResult({
        success: false,
        message: "Hard Sync failed",
        error: errorMessage,
        totalUsers: 0,
        created: 0,
        skipped: 0,
        errors: 0,
      });
    } finally {
      setIsHardSyncing(false);
    }
  };

  const handleClearDatabase = async () => {
    // Check if script is running (not paused, but actively running)
    if (isLoading) {
      toast.warning("⚠️ Cannot clear database while registration script is running. Please pause or stop the script first.");
      return;
    }

    // Confirm before clearing
    const confirmed = window.confirm(
      "⚠️ WARNING: This will permanently delete ALL entries from the database!\n\n" +
      "This action cannot be undone. Are you sure you want to continue?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch("/api/registration/clear-db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          network: network,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`✅ Database cleared successfully! Deleted ${data.deletedCount} entries.`);
        // Reset result and progress
        setResult(null);
        setProgress(null);
      } else {
        if (data.error === "Script is running") {
          toast.warning("⚠️ Cannot clear database while script is running. Please stop the script first.");
        } else {
          toast.error(`❌ Failed to clear database: ${data.message}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`❌ Clear database error: ${errorMessage}`);
    }
  };

  return (
    <section className="min-h-screen py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
            {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Registration Scripts
            </h1>
            <p className="text-gray-300 text-lg">
              Manage user data sync between blockchain and database
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <span className="text-gray-300 text-sm">Network:</span>
              <span className="text-white font-semibold">
                {network ? "🌐 Sonic Mainnet" : "🧪 Sepolia Testnet"}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-4 bg-white/5 rounded-lg p-2 border border-white/10">
            <button
              onClick={() => setActiveTab("read")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === "read"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-transparent text-gray-400 hover:text-white"
              }`}
            >
              📥 Read Registration
            </button>
            <button
              onClick={() => setActiveTab("write")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === "write"
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                  : "bg-transparent text-gray-400 hover:text-white"
              }`}
            >
              📝 Write Registration
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "read" ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            {/* Script Status Indicator */}
            {isLoading && (
              <div className="mb-6 bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="animate-pulse">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <p className="text-blue-300 text-sm font-medium">
                    📊 Script is running on backend. Live updates are being received...
                  </p>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4">
              {!isPaused ? (
                <>
                  <button
                    onClick={handleRegistration}
                    disabled={isLoading || isHardSyncing}
                    className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
                      isLoading || isHardSyncing
                        ? "bg-gray-600 cursor-not-allowed opacity-50"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 active:scale-95"
                    } text-white shadow-lg`}
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
                        Processing Registration...
                      </span>
                    ) : (
                      "🚀 Start Registration Sync"
                    )}
                  </button>
                  
                  {isLoading && (
                    <button
                      onClick={handlePause}
                      disabled={!isLoading}
                      className="py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 hover:scale-105 active:scale-95 text-white shadow-lg"
                    >
                      ⏸️ Pause
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={handleResume}
                  disabled={isLoading}
                  className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105 active:scale-95 text-white shadow-lg"
                >
                  ▶️ Resume Registration
                </button>
              )}
            </div>
            
            {/* Clear Database Button */}
            <div className="mb-8">
              <button
                onClick={handleClearDatabase}
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform ${
                  isLoading
                    ? "bg-gray-600 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 hover:scale-105 active:scale-95"
                } text-white shadow-lg border-2 border-red-500/50`}
              >
                🗑️ Clear Database (Delete All Entries)
              </button>
              {!isLoading && (
                <p className="text-yellow-300 text-xs text-center mt-2">
                  ⚠️ This will permanently delete ALL entries from the database
                </p>
              )}
              {isLoading && (
                <p className="text-gray-400 text-xs text-center mt-2">
                  ⏸️ Clear Database is disabled while script is running
                </p>
              )}
            </div>

            {/* Loading State with Real-time Progress */}
            {isLoading && (
              <div className="mb-8">
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="animate-pulse">
                      <div className="w-12 h-12 bg-blue-500/30 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {progress ? `Processing user ${progress.current}/${progress.total}...` : "Fetching data from blockchain..."}
                      </p>
                      {progress && (
                        <div className="mt-2 space-y-1">
                          <p className="text-gray-300 text-sm">
                            ✅ Created: <span className="text-green-400 font-semibold">{progress.created}</span> | 
                            ⏭️ Skipped: <span className="text-yellow-400 font-semibold">{progress.skipped}</span> | 
                            ❌ Errors: <span className="text-red-400 font-semibold">{progress.errors}</span>
                          </p>
                          {progress.message && (
                            <p className="text-blue-300 text-xs">{progress.message}</p>
                          )}
                        </div>
                      )}
                      {!progress && (
                        <p className="text-gray-400 text-sm mt-1">
                          This may take a few minutes depending on the number of users
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300" 
                      style={{ 
                        width: progress && progress.total > 0 
                          ? `${(progress.current / progress.total) * 100}%` 
                          : "10%" 
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

            {/* Results Display */}
            {result && !isLoading && (
              <div
                className={`rounded-xl p-6 border-2 ${
                  result.success
                    ? "bg-green-500/10 border-green-500/50"
                    : result.paused
                    ? "bg-yellow-500/10 border-yellow-500/50"
                    : "bg-red-500/10 border-red-500/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {result.success ? (
                    <span className="text-3xl">✅</span>
                  ) : result.paused ? (
                    <span className="text-3xl">⏸️</span>
                  ) : (
                    <span className="text-3xl">❌</span>
                  )}
                  <h3
                    className={`text-xl font-bold ${
                      result.success
                        ? "text-green-400"
                        : result.paused
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {result.success ? "Success" : result.paused ? "Paused" : "Error"}
                  </h3>
                </div>

                <p className="text-gray-300 mb-6">{result.message}</p>

                {result.success ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <p className="text-gray-400 text-sm mb-1">Total Users</p>
                      <p className="text-2xl font-bold text-white">
                        {result.totalUsers}
                      </p>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                      <p className="text-green-400 text-sm mb-1">Created</p>
                      <p className="text-2xl font-bold text-green-400">
                        {result.created}
                      </p>
                    </div>
                    <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                      <p className="text-yellow-400 text-sm mb-1">Skipped</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {result.skipped}
                      </p>
                    </div>
                    <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                      <p className="text-red-400 text-sm mb-1">Errors</p>
                      <p className="text-2xl font-bold text-red-400">
                        {result.errors}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                      <p className="text-red-400 font-medium">Error Details:</p>
                      <p className="text-red-300 text-sm mt-2">{result.error || result.message}</p>
                      {result.stoppedDueToNetworkError && (
                        <div className="mt-3 bg-yellow-500/10 rounded p-3 border border-yellow-500/20">
                          <p className="text-yellow-300 text-xs">
                            ⚠️ Script stopped due to network errors. Check your internet connection or try switching networks.
                          </p>
                          {result.lastProcessed && (
                            <p className="text-yellow-200 text-xs mt-1">
                              Last processed: User {result.lastProcessed}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Continue Button - appears when there's an error */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleRegistration}
                        disabled={isLoading}
                        className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform ${
                          isLoading
                            ? "bg-gray-600 cursor-not-allowed"
                            : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105 active:scale-95"
                        } text-white shadow-lg`}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
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
                            Continuing...
                          </span>
                        ) : (
                          "▶️ Continue Fetching"
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setResult(null);
                          handleRegistration();
                        }}
                        disabled={isLoading}
                        className={`py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform ${
                          isLoading
                            ? "bg-gray-600 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 active:scale-95"
                        } text-white shadow-lg`}
                      >
                        🔄 Retry
                      </button>
                    </div>
                    <p className="text-yellow-300 text-xs text-center">
                      💡 Tip: Backend automatically deletes the last processed user and will continue from there
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Info Section */}
            {!result && !isLoading && (
              <div className="mt-8 space-y-4">
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <p className="text-blue-300 text-sm flex items-center gap-2">
                    <span>💡</span>
                    <span>
                      <strong>Network Selection:</strong> Use the network toggle in the header to switch between Sonic Mainnet and Sepolia Testnet. The script will use the selected network's RPC endpoint.
                    </span>
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <span>ℹ️</span> How it works
                  </h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>
                        Uses the selected network (Sonic/Sepolia) from the header toggle
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>
                        Fetches all users from the blockchain registration contract
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>
                        Checks existing users in MongoDB to avoid duplicates
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>
                        Creates new user records with complete blockchain data
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>
                        Handles errors gracefully and allows re-syncing
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          ) : (
            <WritePush />
          )}
        </div>
      </div>
    </section>
  );
};