export const CASES_TABLE_NAME = process.env.CASES_TABLE_NAME;

if (!CASES_TABLE_NAME) {
  throw new Error("Environment variables is not defined");
}
