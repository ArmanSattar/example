import type { SSTConfig } from "sst";
import { UserManagementHandlerAPI } from "./stacks/UserManagementStack";
import { S3Stack } from "./stacks/S3Stack";
export default {
  config() {
    return {
      name: "user-management",
      stage: "dev",
      region: "eu-west-2",
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      runtime: "nodejs18.x",
      architecture: "arm_64",
      nodejs: {
        esbuild: {
          external: ["@solana/web3.js"],
        },
      },
    });
    app.stack(S3Stack);
    app.stack(UserManagementHandlerAPI);
  },
} satisfies SSTConfig;
