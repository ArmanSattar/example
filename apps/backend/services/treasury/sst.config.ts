import type { SSTConfig } from "sst";
import { ApiStack } from "./stacks/Api";
import { DatabaseStack } from "./stacks/Database";

export default {
  config() {
    return {
      name: "treasury",
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

    app.stack(DatabaseStack);
    app.stack(ApiStack);
  },
} satisfies SSTConfig;
