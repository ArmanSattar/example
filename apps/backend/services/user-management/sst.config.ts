import type { SSTConfig } from "sst";
import { UserManagementHandlerAPI } from "./stacks/UserManagementStack";

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
    });

    app.stack(UserManagementHandlerAPI);
  },
} satisfies SSTConfig;
