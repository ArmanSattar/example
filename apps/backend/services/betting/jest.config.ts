/* eslint-disable */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  displayName: "betting",
  transform: {
    "^.+\\.[tj]sx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  testMatch: ["**/__tests__/**/*.tests.ts"],
  coverageDirectory: "../../coverage/apps/backend/services/betting",
  passWithNoTests: true,
  moduleNameMapper: {
    "^@solspin/types$": "<rootDir>/../../../../@solspin/events/types/src/index.ts",
    "^@solspin/events$": "<rootDir>/../../../../@solspin/events/src/index.ts",
    "^@solspin/events/utils/gateway-responses$":
      "<rootDir>/../../../../@solspin/events/utils/gateway-responses.ts",
    "^@solspin/logger$": "<rootDir>/../../../../@solspin/events/utils/logger",
    "^@solspin/errors$": "<rootDir>/../../../../@solspin/events/errors/src/index.ts",
    "^@solspin/events/src/service/betting/schemas$":
      "<rootDir>/../../../../@solspin/events/src/service/betting/schemas.ts",
  },
};
