import mongoose from "mongoose";
import { connectMongoose } from "../mongoose";
import { TransferUserDataSchema } from "./RegistrationData";

// Export connection (Mongoose instance)
export const connection = mongoose;

// Create the RegistrationData model
// Mongoose will handle model caching, so we can define it directly
// The model will be available once connection is established
const RegistrationData = mongoose.models.RegistrationData || mongoose.model("RegistrationData", TransferUserDataSchema);

// Export RegistrationData model
export { RegistrationData };

// Helper function to ensure connection before using the model
export async function ensureConnection() {
  await connectMongoose();
  return RegistrationData;
}

