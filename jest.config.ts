import { getJestProjects, getJestProjectsAsync } from "@nx/jest";

export default async () => ({
  projects: getJestProjects(),
});

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/apps/backend/services/wallet"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  globals: {
    "ts-jest": {
      tsconfig: "apps/backend/services/wallet/tsconfig.json",
    },
  },
};
