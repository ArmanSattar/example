export const GET_CASE_FUNCTION_NAME = process.env.GET_CASE_FUNCTION_NAME || "";
export const PERFORM_SPIN_FUNCTION_NAME = process.env.PERFORM_SPIN_FUNCTION_NAME || "";
export const BET_TRANSACTION_FUNCTION_NAME = process.env.BET_TRANSACTION_FUNCTION_NAME || "";
export const GET_USER_FUNCTION_NAME = process.env.GET_USER_FUNCTION_NAME || "";
if (
  !GET_CASE_FUNCTION_NAME ||
  !PERFORM_SPIN_FUNCTION_NAME ||
  !BET_TRANSACTION_FUNCTION_NAME ||
  !GET_USER_FUNCTION_NAME
) {
  throw new Error("Missing required environment variables");
}
