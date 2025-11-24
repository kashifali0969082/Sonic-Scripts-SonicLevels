import { ethers } from "ethers";
export const registrationContract =
  "0x1EB2F315eA3d4888000818F750975B7C5010A987";
export const sepoliaRPCURL =
  // "https://sepolia.infura.io/v3/d574632a7d69458f9a4568bc89042613";
  "https://monad-mainnet.g.alchemy.com/v2/dn58Cx-lDJHKiX8XYZwcPYZqZAUsT5JQ";
export const SonicRpcUrl = "https://rpc.soniclabs.com";
export const registrationContractAbi = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "userId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "uplineId",
        type: "string",
      },
      { indexed: false, internalType: "string", name: "name", type: "string" },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "userId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "uplineId",
        type: "string",
      },
      { indexed: false, internalType: "string", name: "name", type: "string" },
    ],
    name: "UserRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "newName",
        type: "string",
      },
    ],
    name: "newNameUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "newUrlUpdated",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "AddressToCountId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "AdrToId",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "NumberOfUsers",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "countIdToAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "directDownlines",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "directDownlinesCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "depth", type: "uint256" },
    ],
    name: "getTeamSizeUpToLevel",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTopSponsors",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "downlineCount", type: "uint256" },
          { internalType: "address", name: "user", type: "address" },
        ],
        internalType: "struct Web3SonicRegistration.downlineData[20]",
        name: "topSponsors",
        type: "tuple[20]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getTotalTeamSize",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUser",
    outputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "uplineId", type: "string" },
          { internalType: "string", name: "userId", type: "string" },
          { internalType: "string", name: "imgURL", type: "string" },
          { internalType: "uint256", name: "joiningDate", type: "uint256" },
          { internalType: "uint256", name: "countId", type: "uint256" },
          { internalType: "uint256", name: "uplineCountID", type: "uint256" },
        ],
        internalType: "struct Web3SonicRegistration.User",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isLock",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "isRegistered",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lastUserId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "upline", type: "address" },
      { internalType: "string", name: "name", type: "string" },
    ],
    name: "register",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "upline", type: "address" },
      { internalType: "address", name: "user", type: "address" },
      { internalType: "string", name: "name", type: "string" },
    ],
    name: "registerByOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "newUrl", type: "string" }],
    name: "setDefaultImgUrl",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "address[]", name: "downlines", type: "address[]" },
    ],
    name: "setDirectDownlinesForID1usersIfRequired",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "newUrl", type: "string" }],
    name: "setImgUrl",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "setIsLock",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "newName", type: "string" }],
    name: "setUsername",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "userAddress", type: "address" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "uplineId", type: "string" },
          { internalType: "string", name: "userId", type: "string" },
          { internalType: "string", name: "imgURL", type: "string" },
          { internalType: "uint256", name: "joiningDate", type: "uint256" },
          { internalType: "uint256", name: "countId", type: "uint256" },
          { internalType: "uint256", name: "uplineCountID", type: "uint256" },
          { internalType: "address", name: "uplineAddress", type: "address" },
          {
            internalType: "address[]",
            name: "directDownlines",
            type: "address[]",
          },
        ],
        internalType: "struct Web3SonicRegistration.TransferUserData[]",
        name: "userDataArray",
        type: "tuple[]",
      },
    ],
    name: "transferUsers",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address[]", name: "userAddresses", type: "address[]" },
    ],
    name: "updateDownlineCounts",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "Id", type: "uint256" },
      { internalType: "address", name: "_newAddress", type: "address" },
    ],
    name: "updateIDs",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "", type: "string" }],
    name: "userIds",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "userUpline",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "users",
    outputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "uplineId", type: "string" },
      { internalType: "string", name: "userId", type: "string" },
      { internalType: "string", name: "imgURL", type: "string" },
      { internalType: "uint256", name: "joiningDate", type: "uint256" },
      { internalType: "uint256", name: "countId", type: "uint256" },
      { internalType: "uint256", name: "uplineCountID", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "usersById",
    outputs: [
      { internalType: "uint256", name: "downlineCount", type: "uint256" },
      { internalType: "address", name: "user", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
];
export const writeregistrationContractAddress =
  "0x93C5c8cF89e8944621Dd225b923927631FaFeCc3";
export const writeregistrationContractAbi = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "userId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "uplineId",
        type: "string",
      },
      { indexed: false, internalType: "string", name: "name", type: "string" },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "userId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "uplineId",
        type: "string",
      },
      { indexed: false, internalType: "string", name: "name", type: "string" },
    ],
    name: "UserRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "newName",
        type: "string",
      },
    ],
    name: "newNameUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "newUrlUpdated",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "AddressToCountId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "AdrToId",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "NumberOfUsers",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "countIdToAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "directDownlines",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "directDownlinesCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "depth", type: "uint256" },
    ],
    name: "getTeamSizeUpToLevel",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTopSponsors",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "downlineCount", type: "uint256" },
          { internalType: "address", name: "user", type: "address" },
        ],
        internalType: "struct Web3SonicRegistration.downlineData[20]",
        name: "topSponsors",
        type: "tuple[20]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getTotalTeamSize",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUser",
    outputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "uplineId", type: "string" },
          { internalType: "string", name: "userId", type: "string" },
          { internalType: "string", name: "imgURL", type: "string" },
          { internalType: "uint256", name: "joiningDate", type: "uint256" },
          { internalType: "uint256", name: "countId", type: "uint256" },
          { internalType: "uint256", name: "uplineCountID", type: "uint256" },
        ],
        internalType: "struct Web3SonicRegistration.User",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isLock",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "isRegistered",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lastUserId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "upline", type: "address" },
      { internalType: "string", name: "name", type: "string" },
    ],
    name: "register",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "upline", type: "address" },
      { internalType: "address", name: "user", type: "address" },
      { internalType: "string", name: "name", type: "string" },
    ],
    name: "registerByOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "newUrl", type: "string" }],
    name: "setDefaultImgUrl",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "address[]", name: "downlines", type: "address[]" },
    ],
    name: "setDirectDownlinesForID1usersIfRequired",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "newUrl", type: "string" }],
    name: "setImgUrl",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "setIsLock",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "newName", type: "string" }],
    name: "setUsername",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "userAddress", type: "address" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "uplineId", type: "string" },
          { internalType: "string", name: "userId", type: "string" },
          { internalType: "string", name: "imgURL", type: "string" },
          { internalType: "uint256", name: "joiningDate", type: "uint256" },
          { internalType: "uint256", name: "countId", type: "uint256" },
          { internalType: "uint256", name: "uplineCountID", type: "uint256" },
          { internalType: "address", name: "uplineAddress", type: "address" },
          {
            internalType: "address[]",
            name: "directDownlines",
            type: "address[]",
          },
        ],
        internalType: "struct Web3SonicRegistration.TransferUserData[]",
        name: "userDataArray",
        type: "tuple[]",
      },
    ],
    name: "transferUsers",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address[]", name: "userAddresses", type: "address[]" },
    ],
    name: "updateDownlineCounts",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "Id", type: "uint256" },
      { internalType: "address", name: "_newAddress", type: "address" },
    ],
    name: "updateIDs",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "", type: "string" }],
    name: "userIds",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "userUpline",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "users",
    outputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "uplineId", type: "string" },
      { internalType: "string", name: "userId", type: "string" },
      { internalType: "string", name: "imgURL", type: "string" },
      { internalType: "uint256", name: "joiningDate", type: "uint256" },
      { internalType: "uint256", name: "countId", type: "uint256" },
      { internalType: "uint256", name: "uplineCountID", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "usersById",
    outputs: [
      { internalType: "uint256", name: "downlineCount", type: "uint256" },
      { internalType: "address", name: "user", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
];
// Environment variable se private key lo
export const privateKey = process.env.PRIVATE_KEY || "";
// Providers create karo
const sepoliaProvider = new ethers.JsonRpcProvider(sepoliaRPCURL);
const sonicProvider = new ethers.JsonRpcProvider(SonicRpcUrl);

// Signers create karo (agar private key hai)
const sepoliaSigner = privateKey
  ? new ethers.Wallet(privateKey, sepoliaProvider)
  : sepoliaProvider;
const sonicSigner = privateKey
  ? new ethers.Wallet(privateKey, sonicProvider)
  : sonicProvider;

// Contract providers - read operations ke liye provider, write ke liye signer
export const registrationContractProvider = new ethers.Contract(
  registrationContract,
  registrationContractAbi,
  sonicSigner
);
export const testRegistrationContractProvider = new ethers.Contract(
  registrationContract,
  registrationContractAbi,
  sepoliaSigner
);
export const contracts = new ethers.Contract(
  writeregistrationContractAddress,
  writeregistrationContractAbi,
  sepoliaSigner
);

// Write contract for Sonic (if different address needed, update here)
export const sonicWriteContract = new ethers.Contract(
  writeregistrationContractAddress,
  writeregistrationContractAbi,
  sonicSigner
);

// Helper function to get the correct contract provider based on network
export function getRegistrationContractProvider(useSonic: boolean = true) {
  return useSonic
    ? registrationContractProvider
    : testRegistrationContractProvider;
}

// Helper function to get the correct write contract based on network
export function getWriteContract(useSonic: boolean = true) {
  return useSonic ? sonicWriteContract : contracts;
}
