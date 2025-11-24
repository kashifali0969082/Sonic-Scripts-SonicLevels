
import { RegistrationData } from "@/lib/models";
import { getRegistrationContractProvider } from "@/exports/exports";
import { getPauseFlag } from "@/lib/pauseControl";
import { emitProgressToSession } from "@/lib/progressSSE";
import { setScriptRunning, setScriptStopped } from "@/lib/scriptState";
export async function Registration(useSonic: boolean = true, sessionId?: string, forceStartFrom?: number) {
  const networkKey = useSonic ? "sonic" : "sepolia";
  
  // Mark script as running
  if (sessionId) {
    setScriptRunning(networkKey, sessionId);
  }
  
  try {
    const registrationContractProvider = getRegistrationContractProvider(useSonic);
    const networkName = useSonic ? "Sonic" : "Sepolia";
    console.log(`🔄 Registration function started on ${networkName} network${forceStartFrom ? ` (FORCED START FROM USER ${forceStartFrom})` : ""}`);
    
    // Test connection first with a timeout
    let lastUserId: bigint;
    try {
      lastUserId = await Promise.race([
        registrationContractProvider.lastUserId(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("RPC connection timeout - network may be unreachable")), 15000)
        )
      ]);
    } catch (connectionError) {
      const errorMsg = connectionError instanceof Error ? connectionError.message : String(connectionError);
      console.error(`❌ Failed to connect to ${networkName} RPC:`, errorMsg);
      return {
        success: false,
        message: `Failed to connect to ${networkName} network. ${errorMsg}. Please check your network connection or try switching networks.`,
        error: errorMsg,
        totalUsers: 0,
        created: 0,
        skipped: 0,
        errors: 0,
      };
    }
    
    const totalUsers = Number(lastUserId);
    console.log(`📊 Total users in contract: ${totalUsers}`);
    
    if (totalUsers === 0) {
      console.log("⚠️  No users found in contract");
      setScriptStopped(networkKey);
      return {
        success: false,
        message: "No users found in contract",
        totalUsers: 0,
        created: 0,
        skipped: 0,
        errors: 0,
      };
    }

    // If forceStartFrom is provided (for hard sync), ignore existing users and start fresh
    let existingCountIds = new Set<number>();
    let startFrom = 1;
    
    if (forceStartFrom && forceStartFrom > 0) {
      // Hard sync mode - start from specified user, ignore all existing data
      console.log(`🔄 HARD SYNC MODE: Starting from user ${forceStartFrom}, ignoring all existing data`);
      startFrom = forceStartFrom;
      existingCountIds = new Set(); // Empty set - don't skip any users
    } else {
      // Normal mode - check existing users and resume
    const existingUsers = await RegistrationData.find({}, { countId: 1 }).lean();
      existingCountIds = new Set(existingUsers.map(u => u.countId));
    console.log(`📋 Found ${existingCountIds.size} users already in database`);

    // Find the last successfully saved countId
    let lastSavedCountId = 0;
    if (existingCountIds.size > 0) {
      lastSavedCountId = Math.max(...Array.from(existingCountIds));
      console.log(`📍 Last saved countId: ${lastSavedCountId}`);
    }

    // If script broke in the middle, delete the last user and re-fetch
    // This ensures we always have complete data
    if (lastSavedCountId > 0 && lastSavedCountId <= totalUsers) {
      const lastUser = await RegistrationData.findOne({ countId: lastSavedCountId });
      if (lastUser) {
        console.log(`🗑️  Deleting last saved user (countId: ${lastSavedCountId}) to ensure fresh fetch...`);
        await RegistrationData.deleteOne({ countId: lastSavedCountId });
        existingCountIds.delete(lastSavedCountId);
        }
      }
    }

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    let consecutiveNetworkErrors = 0;
    const MAX_CONSECUTIVE_NETWORK_ERRORS = 3; // Stop after 3 consecutive network errors

    // Start from the determined starting point
    for (let i = startFrom; i <= totalUsers; i++) {
      // Check for pause flag
      if (getPauseFlag(networkKey)) {
        console.log(`⏸️  Registration paused at user ${i}`);
        
        // Delete the current user so it can be re-fetched when resumed
        try {
          await RegistrationData.deleteOne({ countId: i });
          console.log(`🗑️  Deleted user ${i} due to pause, will re-fetch on resume`);
        } catch (deleteError) {
          // Ignore delete errors
        }
        
        // Mark script as stopped when paused
        setScriptStopped(networkKey);
        
        return {
          success: false,
          message: `Registration paused by user at user ${i}`,
          totalUsers,
          created: successCount,
          skipped: skipCount,
          errors: errorCount,
          lastProcessed: i - 1,
          paused: true,
        };
      }
      
      try {
        // Check if user already exists
        if (existingCountIds.has(i)) {
          console.log(`⏭️  User ${i} already exists, skipping...`);
          skipCount++;
          consecutiveNetworkErrors = 0; // Reset on success
          
          // Emit progress for skipped users too (every user for real-time updates)
          if (sessionId) {
            try {
              emitProgressToSession(sessionId, {
                current: i,
                total: totalUsers,
                created: successCount,
                skipped: skipCount,
                errors: errorCount,
                message: `Skipped user ${i} (already exists)`,
              });
            } catch (e) {
              console.error("Failed to emit progress for skipped user", i, e);
            }
          }
          continue;
        }

        console.log(`📥 Fetching user ${i}/${totalUsers} from blockchain...`);
        const userAddress = await registrationContractProvider.countIdToAddress(i);
        const userData = await registrationContractProvider.users(userAddress);
        const userUpline = await registrationContractProvider.userUpline(userAddress);

        const downLinersCount = await registrationContractProvider.directDownlinesCount(userAddress);
        let downLiners = [];
        for (let j = 0; j < Number(downLinersCount); j++) {
          const downLinersAddress = await registrationContractProvider.directDownlines(
            userAddress,
            j
          );
          downLiners.push(downLinersAddress);
        }
        
        const userDocument = {
          userAddress: userAddress,
          name: userData[0],
          uplineId: userData[1],
          userId: userData[2],
          imgURL: userData[3],
          joiningDate: Number(userData[4]),
          countId: Number(userData[5]),
          uplineCountID: Number(userData[6]),
          uplineAddress: userUpline,
          directDownlines: downLiners,
          isWritten: false, // New entries start as unwritten
        };
        
        try {
        await RegistrationData.create(userDocument);
        existingCountIds.add(i); // Mark as processed
        successCount++;
          
          // Emit progress update for every user (for real-time stats)
          if (sessionId) {
            try {
              emitProgressToSession(sessionId, {
                current: i,
                total: totalUsers,
                created: successCount,
                skipped: skipCount,
                errors: errorCount,
                message: `User ${i}/${totalUsers} added successfully`,
              });
            } catch (e) {
              console.error("Failed to emit progress for user", i, e);
            }
          }
        } catch (createError: any) {
          // Handle duplicate key errors gracefully
          if (createError.code === 11000) {
            // Duplicate key error - user already exists
            const duplicateField = createError.keyPattern ? Object.keys(createError.keyPattern)[0] : 'unknown';
            console.log(`⏭️  User ${i} already exists (duplicate ${duplicateField}), skipping...`);
            skipCount++;
            existingCountIds.add(i); // Mark as processed
            
            // Emit progress for duplicate users too
            if (sessionId) {
              try {
                emitProgressToSession(sessionId, {
                  current: i,
                  total: totalUsers,
                  created: successCount,
                  skipped: skipCount,
                  errors: errorCount,
                  message: `User ${i} skipped (duplicate ${duplicateField})`,
                });
              } catch (e) {
                console.error("Failed to emit progress for duplicate user", i, e);
              }
            }
          } else {
            // Other errors - re-throw to be handled by outer catch
            throw createError;
          }
        }
        
        if (i % 10 === 0 || i === totalUsers) {
          console.log(`📝 Progress: ${i}/${totalUsers} (Created: ${successCount}, Skipped: ${skipCount}, Errors: ${errorCount})`);
          
          // Emit progress update every 10 users
          if (sessionId) {
            emitProgressToSession(sessionId, {
              current: i,
              total: totalUsers,
              created: successCount,
              skipped: skipCount,
              errors: errorCount,
              message: `Progress: ${i}/${totalUsers} users processed`,
            });
          }
        }
        consecutiveNetworkErrors = 0; // Reset on successful processing
      } catch (userError) {
        errorCount++;
        const errorMessage = userError instanceof Error ? userError.message : String(userError);
        console.error(`❌ Error processing user ${i}:`, errorMessage);
        
        // Check if it's a network/RPC error
        const isNetworkError = 
          errorMessage.includes("ENOTFOUND") ||
          errorMessage.includes("ECONNREFUSED") ||
          errorMessage.includes("ETIMEDOUT") ||
          errorMessage.includes("network") ||
          errorMessage.includes("RPC") ||
          errorMessage.includes("connection");
        
        if (isNetworkError) {
          consecutiveNetworkErrors++;
          console.error(`⚠️  Network error detected (${consecutiveNetworkErrors}/${MAX_CONSECUTIVE_NETWORK_ERRORS})`);
          
          // Stop if too many consecutive network errors
          if (consecutiveNetworkErrors >= MAX_CONSECUTIVE_NETWORK_ERRORS) {
            console.error(`🛑 Stopping script due to ${consecutiveNetworkErrors} consecutive network errors. Network appears to be unreachable.`);
            
            // Delete the current user so it can be re-fetched
            try {
              await RegistrationData.deleteOne({ countId: i });
              console.log(`🗑️  Deleted user ${i} due to network error, will re-fetch on next run`);
            } catch (deleteError) {
              // Ignore delete errors
            }
            
            return {
              success: false,
              message: `Script stopped due to network errors. ${consecutiveNetworkErrors} consecutive network errors detected. Last processed user: ${i - 1}. Please check your network connection and use "Continue Fetching" to resume.`,
              error: `Network unreachable: ${errorMessage}`,
              totalUsers,
              created: successCount,
              skipped: skipCount,
              errors: errorCount,
              lastProcessed: i - 1,
              stoppedDueToNetworkError: true,
            };
          }
        }
        
        // If error occurs, delete this user so it can be re-fetched next time
        try {
          await RegistrationData.deleteOne({ countId: i });
          console.log(`🗑️  Deleted user ${i} due to error, will re-fetch on next run`);
        } catch (deleteError) {
          const deleteErrorMessage = deleteError instanceof Error ? deleteError.message : String(deleteError);
          console.error(`⚠️  Could not delete user ${i}:`, deleteErrorMessage);
        }
        
        // Reset network error counter for non-network errors
        if (!isNetworkError) {
          consecutiveNetworkErrors = 0;
        }
      }
    }
    
    console.log(`\n✅ Registration completed!`);
    console.log(`   Created: ${successCount}`);
    console.log(`   Skipped: ${skipCount}`);
    console.log(`   Errors: ${errorCount}`);
    
    // Emit final progress
    if (sessionId) {
      try {
        emitProgressToSession(sessionId, {
          current: totalUsers,
          total: totalUsers,
          created: successCount,
          skipped: skipCount,
          errors: errorCount,
          message: "Registration completed successfully",
        });
        emitProgressToSession(sessionId, { type: "complete" });
      } catch (e) {
        console.error("Failed to emit final progress", e);
      }
    }
    
    // Mark script as stopped
    setScriptStopped(networkKey);
    
    return {
      success: true,
      message: "Registration completed successfully",
      totalUsers,
      created: successCount,
      skipped: skipCount,
      errors: errorCount,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("❌ Fatal error in Registration function:", errorMessage);
    if (errorStack) {
      console.error("Stack trace:", errorStack);
    }
    
    // Mark script as stopped on error
    setScriptStopped(networkKey);
    
    return {
      success: false,
      message: errorMessage,
      error: errorMessage,
      stack: errorStack,
      totalUsers: 0,
      created: 0,
      skipped: 0,
      errors: 0,
    };
  }
}
