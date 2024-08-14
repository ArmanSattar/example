import type { SSTConfig } from "sst";
import { LambdaStack } from "./stacks/Api";
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
    });

    app.stack(DatabaseStack);
    app.stack(LambdaStack);
  },
} satisfies SSTConfig;
