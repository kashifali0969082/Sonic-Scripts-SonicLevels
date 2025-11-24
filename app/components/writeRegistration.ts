import { RegistrationData } from "@/lib/models";
import { getWriteContract } from "@/exports/exports";
import { getPauseFlag } from "@/lib/pauseControl";
import { emitProgressToSession } from "@/lib/progressSSE";
import { setScriptRunning, setScriptStopped } from "@/lib/scriptState";

interface WriteRegistrationOptions {
  useSonic?: boolean;
  sessionId?: string;
  maxUsers?: number; // undefined = all, number = custom limit
  batchSize?: number; // default 20
}

export async function WriteRegistration(options: WriteRegistrationOptions = {}) {
  const {
    useSonic = true,
    sessionId,
    maxUsers, // undefined = all users, number = custom limit
    batchSize = 20,
  } = options;

  const networkKey = `write-${useSonic ? "sonic" : "sepolia"}`;
  const networkName = useSonic ? "Sonic" : "Sepolia";

  // Mark script as running
  if (sessionId) {
    setScriptRunning(networkKey, sessionId);
  }

  try {
    console.log(`🔄 Write Registration function started on ${networkName} network`);
    console.log(`📊 Options: maxUsers=${maxUsers || "all"}, batchSize=${batchSize}`);

    // Get write contract
    const writeContract = getWriteContract(useSonic);

    // Check if there are any unwritten entries
    const unwrittenCount = await RegistrationData.countDocuments({ isWritten: false });
    const totalCount = await RegistrationData.countDocuments({});
    const writtenCount = await RegistrationData.countDocuments({ isWritten: true });
    console.log(`📊 Database stats: Total=${totalCount}, Written=${writtenCount}, Unwritten=${unwrittenCount}`);
    
    // Find and log the first unwritten entry to verify starting point
    const firstUnwrittenEntry = await RegistrationData.findOne({ isWritten: false })
      .sort({ countId: 1 })
      .select({ countId: 1, userId: 1, isWritten: 1 });
    
    if (firstUnwrittenEntry) {
      console.log(`📍 First unwritten entry: countId=${firstUnwrittenEntry.countId}, userId=${firstUnwrittenEntry.userId}, isWritten=${firstUnwrittenEntry.isWritten}`);
    } else if (unwrittenCount > 0) {
      console.warn(`⚠️ Warning: unwrittenCount=${unwrittenCount} but no first unwritten entry found!`);
    }

    if (unwrittenCount === 0) {
      console.log("✅ All entries have been written to contracts!");
      setScriptStopped(networkKey);

      // Emit final progress
      if (sessionId) {
        try {
          emitProgressToSession(sessionId, {
            current: 0,
            total: 0,
            written: 0,
            skipped: 0,
            errors: 0,
            batches: 0,
            message: "All entries have been written to contracts!",
          });
          emitProgressToSession(sessionId, { type: "complete" });
        } catch (e) {
          console.error("Failed to emit final progress", e);
        }
      }

      return {
        success: true,
        message: "All entries have been written to contracts!",
        totalUnwritten: 0,
        written: 0,
        skipped: 0,
        errors: 0,
        batches: 0,
      };
    }

    // Determine how many users to process
    const totalToProcess = maxUsers !== undefined ? Math.min(maxUsers, unwrittenCount) : unwrittenCount;
    console.log(`🎯 Processing ${totalToProcess} users (out of ${unwrittenCount} unwritten)`);

    // Emit initial progress
    if (sessionId) {
      try {
        emitProgressToSession(sessionId, {
          current: 0,
          total: totalToProcess,
          written: 0,
          skipped: 0,
          errors: 0,
          batches: 0,
          message: `Starting to write ${totalToProcess} users to ${networkName} contract`,
        });
      } catch (e) {
        console.error("Failed to emit initial progress", e);
      }
    }

    let totalWritten = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    let batchCount = 0;
    let totalProcessed = 0;

    // Continue from where isWritten: false is found
    while (totalProcessed < totalToProcess) {
      // Check for pause flag
      if (getPauseFlag(networkKey)) {
        console.log(`⏸️  Write Registration paused at ${totalProcessed}/${totalToProcess} users`);
        setScriptStopped(networkKey);

        // Emit pause status
        if (sessionId) {
          try {
            emitProgressToSession(sessionId, {
              current: totalProcessed,
              total: totalToProcess,
              written: totalWritten,
              skipped: totalSkipped,
              errors: totalErrors,
              batches: batchCount,
              message: `⏸️ Write Registration paused at ${totalProcessed}/${totalToProcess} users`,
              paused: true,
            });
          } catch (e) {
            console.error("Failed to emit pause status", e);
          }
        }

        return {
          success: false,
          message: `Write Registration paused by user at ${totalProcessed}/${totalToProcess} users`,
          totalUnwritten: unwrittenCount,
          written: totalWritten,
          skipped: totalSkipped,
          errors: totalErrors,
          batches: batchCount,
          paused: true,
        };
      }

      // Calculate how many users to fetch in this batch
      const remaining = totalToProcess - totalProcessed;
      const currentBatchSize = Math.min(batchSize, remaining);

      // Always fetch from the first unwritten entry (isWritten: false)
      // IMPORTANT: Sort FIRST, then limit to ensure we get the first unwritten entries
      let entries = await RegistrationData.find({ isWritten: false })
        .sort({ countId: 1 }) // Sort by countId ascending (lowest first)
        .limit(currentBatchSize);

      // Verify that all fetched entries have isWritten: false
      const invalidEntries = entries.filter(entry => entry.isWritten === true);
      if (invalidEntries.length > 0) {
        console.error(`❌ CRITICAL ERROR: Found ${invalidEntries.length} entries with isWritten: true in batch!`);
        console.error(`Invalid entries countIds:`, invalidEntries.map(e => e.countId));
        // Count these as skipped (already written)
        totalSkipped += invalidEntries.length;
        console.log(`⏭️  Skipped ${invalidEntries.length} entries (already written: isWritten=true)`);
        // Remove invalid entries from the batch
        const validEntries = entries.filter(entry => entry.isWritten === false);
        if (validEntries.length === 0) {
          // All entries in batch are already written, skip this batch
          console.log(`⏭️  All entries in batch are already written. Skipping batch...`);
          totalProcessed += entries.length; // Count as processed to avoid infinite loop
          continue;
        }
        // Use only valid entries for processing
        entries = validEntries;
      }
      
      // Log first and last entry details for verification
      if (entries.length > 0) {
        const firstEntry = entries[0];
        const lastEntry = entries[entries.length - 1];
        console.log(`📦 Batch ${batchCount + 1}: Fetched ${entries.length} unwritten entries`);
        console.log(`   First: countId=${firstEntry.countId}, userId=${firstEntry.userId}, isWritten=${firstEntry.isWritten}`);
        console.log(`   Last: countId=${lastEntry.countId}, userId=${lastEntry.userId}, isWritten=${lastEntry.isWritten}`);
      }

      if (entries.length > 0) {
        const firstEntry = entries[0];
        const lastEntry = entries[entries.length - 1];
        console.log(`📦 Batch ${batchCount + 1}: Fetched ${entries.length} unwritten entries`);
        console.log(`   First entry: countId=${firstEntry.countId}, userId=${firstEntry.userId}, isWritten=${firstEntry.isWritten}`);
        console.log(`   Last entry: countId=${lastEntry.countId}, userId=${lastEntry.userId}, isWritten=${lastEntry.isWritten}`);
      } else {
        console.log(`📦 Fetched ${entries.length} unwritten entries from DB (batch ${batchCount + 1})`);
      }

      if (entries.length === 0) {
        console.log("✅ No more unwritten entries to process");
        break;
      }

      // Check pause before processing batch
      if (getPauseFlag(networkKey)) {
        console.log(`⏸️  Write Registration paused before processing batch`);
        setScriptStopped(networkKey);
        return {
          success: false,
          message: `Write Registration paused before processing batch`,
          totalUnwritten: unwrittenCount,
          written: totalWritten,
          skipped: totalSkipped,
          errors: totalErrors,
          batches: batchCount,
          paused: true,
        };
      }

      try {
        const finalUsersArray = entries.map((entry) => [
          entry.userAddress,
          entry.name,
          entry.uplineId,
          entry.userId,
          entry.imgURL,
          String(entry.joiningDate),
          String(entry.countId),
          String(entry.uplineCountID),
          entry.uplineAddress,
          entry.directDownlines || [],
        ]);

        console.log(`📤 Sending batch ${batchCount + 1} to contract (${entries.length} users)...`);

        // Check pause before transaction
        if (getPauseFlag(networkKey)) {
          console.log(`⏸️  Write Registration paused before transaction`);
          setScriptStopped(networkKey);
          return {
            success: false,
            message: `Write Registration paused before transaction`,
            totalUnwritten: unwrittenCount,
            written: totalWritten,
            skipped: totalSkipped,
            errors: totalErrors,
            batches: batchCount,
            paused: true,
          };
        }

        const tx = await writeContract.transferUsers(finalUsersArray);
        console.log(`📝 Transaction sent. Hash: ${tx.hash}`);

        // Check pause after transaction sent
        if (getPauseFlag(networkKey)) {
          console.log(`⏸️  Write Registration paused after transaction sent`);
          setScriptStopped(networkKey);
          return {
            success: false,
            message: `Write Registration paused after transaction sent. Transaction hash: ${tx.hash}`,
            totalUnwritten: unwrittenCount,
            written: totalWritten,
            skipped: totalSkipped,
            errors: totalErrors,
            batches: batchCount,
            paused: true,
            transactionHash: tx.hash,
          };
        }

        const receipt = await tx.wait();
        console.log(`⏳ Waiting for transaction confirmation...`);

        // Check pause after waiting
        if (getPauseFlag(networkKey)) {
          console.log(`⏸️  Write Registration paused after waiting for confirmation`);
          setScriptStopped(networkKey);
          return {
            success: false,
            message: `Write Registration paused after waiting for confirmation`,
            totalUnwritten: unwrittenCount,
            written: totalWritten,
            skipped: totalSkipped,
            errors: totalErrors,
            batches: batchCount,
            paused: true,
          };
        }

        if (receipt.status === 1) {
          console.log(`✅ Transaction confirmed! Block: ${receipt.blockNumber}`);

          // Mark all entries in this batch as written
          const entryIds = entries.map((entry) => entry._id);
          const updateResult = await RegistrationData.updateMany(
            { _id: { $in: entryIds }, isWritten: false }, // Only update if still false (safety check)
            { $set: { isWritten: true } }
          );
          console.log(`✅ Marked ${updateResult.modifiedCount} entries as written (out of ${entries.length} in batch)`);
          
          // Count skipped entries (entries that were already written)
          const skippedInBatch = entries.length - updateResult.modifiedCount;
          if (skippedInBatch > 0) {
            totalSkipped += skippedInBatch;
            console.log(`⏭️  Skipped ${skippedInBatch} entries (already written: isWritten=true)`);
          }

          totalWritten += updateResult.modifiedCount; // Only count actually written entries
          totalProcessed += entries.length;
          batchCount++;

          // Emit progress update for every batch
          if (sessionId) {
            try {
              emitProgressToSession(sessionId, {
                current: totalProcessed,
                total: totalToProcess,
                written: totalWritten,
                skipped: totalSkipped,
                errors: totalErrors,
                batches: batchCount,
                message: `Batch ${batchCount}: ${entries.length} users written successfully (${totalProcessed}/${totalToProcess})`,
              });
            } catch (e) {
              console.error("Failed to emit progress for batch", batchCount, e);
            }
          }
        } else {
          console.error(`❌ Transaction failed! Status: ${receipt.status}`);
          totalErrors += entries.length;
          totalProcessed += entries.length; // Count as processed even if failed

          // Emit error progress
          if (sessionId) {
            try {
              emitProgressToSession(sessionId, {
                current: totalProcessed,
                total: totalToProcess,
                written: totalWritten,
                skipped: totalSkipped,
                errors: totalErrors,
                batches: batchCount,
                message: `❌ Batch ${batchCount + 1} failed! Transaction status: ${receipt.status}`,
              });
            } catch (e) {
              console.error("Failed to emit error progress", e);
            }
          }
        }
      } catch (batchError) {
        const errorMessage = batchError instanceof Error ? batchError.message : String(batchError);
        console.error(`❌ Error processing batch ${batchCount + 1}:`, errorMessage);

        totalErrors += entries.length;
        totalProcessed += entries.length; // Count as processed even if failed

        // Emit error progress
        if (sessionId) {
          try {
            emitProgressToSession(sessionId, {
              current: totalProcessed,
              total: totalToProcess,
              written: totalWritten,
              skipped: totalSkipped,
              errors: totalErrors,
              batches: batchCount,
              message: `❌ Batch ${batchCount + 1} error: ${errorMessage}`,
            });
          } catch (e) {
            console.error("Failed to emit error progress", e);
          }
        }

        // Continue to next batch even if this one failed
        // Don't mark as written, so they can be retried
      }
    }

    console.log(`\n✅ Write Registration completed!`);
    console.log(`   Written: ${totalWritten}`);
    console.log(`   Skipped: ${totalSkipped}`);
    console.log(`   Errors: ${totalErrors}`);
    console.log(`   Batches: ${batchCount}`);

    // Emit final progress
    if (sessionId) {
      try {
        emitProgressToSession(sessionId, {
          current: totalProcessed,
          total: totalToProcess,
          written: totalWritten,
          skipped: totalSkipped,
          errors: totalErrors,
          batches: batchCount,
          message: "Write Registration completed successfully",
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
      message: "Write Registration completed successfully",
      totalUnwritten: unwrittenCount,
      written: totalWritten,
      skipped: totalSkipped,
      errors: totalErrors,
      batches: batchCount,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("❌ Fatal error in Write Registration function:", errorMessage);
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
      totalUnwritten: 0,
      written: 0,
      skipped: 0,
      errors: 0,
      batches: 0,
    };
  }
}
