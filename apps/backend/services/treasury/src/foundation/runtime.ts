export const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
export const HOUSE_WALLET_ADDRESS = process.env.HOUSE_WALLET_ADDRESS || "";
export const HOUSE_WALLET_PRIVATE_KEY = process.env.HOUSE_SECRET_KEY || "";
export const FEE = Number(process.env.TRANSACTION_FEE) || 5000; // in lamports
export const COMMITMENT_LEVEL = process.env.COMMITMENT_LEVEL || "finalized";

if (!HOUSE_WALLET_ADDRESS || !HOUSE_WALLET_PRIVATE_KEY) {
  console.log("HOUSE_WALLET_ADDRESS", HOUSE_WALLET_ADDRESS);
  console.log("HOUSE", HOUSE_WALLET_PRIVATE_KEY);
  throw new Error("Missing required environment variables");
}
