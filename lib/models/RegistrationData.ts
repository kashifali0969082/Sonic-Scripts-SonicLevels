import mongoose from "mongoose";
import { connectMongoose } from "../mongoose";

// TransferUserData Schema
const TransferUserDataSchema = new mongoose.Schema({
  userAddress: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  uplineId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  imgURL: {
    type: String,
  },
  joiningDate: {
    type: Number,
    required: true,
  },
  countId: {
    type: Number,
    required: true,
    unique: true,
  },
  uplineCountID: {
    type: Number,
  },
  uplineAddress: {
    type: String,
    required: true,
  },
  directDownlines: {
    type: [String],
    default: [],
  },
  isWritten: {
    type: Boolean,
    default: false,
  },
});

// Create model - ensure connection is established
let RegistrationData: mongoose.Model<any>;

async function getRegistrationDataModel() {
  if (!RegistrationData) {
    await connectMongoose();
    RegistrationData = mongoose.models.RegistrationData || mongoose.model("RegistrationData", TransferUserDataSchema);
  }
  return RegistrationData;
}

// Export the model getter and schema
export { getRegistrationDataModel, TransferUserDataSchema };

// Export model directly (will be available after first connection)
export default getRegistrationDataModel;

