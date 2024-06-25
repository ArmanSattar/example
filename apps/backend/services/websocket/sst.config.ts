import type { SSTConfig } from "sst";
import { WebSocketGateway } from "./stacks/WebSocketGatewayStack";
import { WebSocketHandlerAPI } from "./stacks/WebSocketHandlerStack";
import { GameEngineHandlerAPI } from "../game-engine/stacks/GameEngineStack";
import { UserManagementHandlerAPI } from "../user-management/stacks/UserManagementStack";

export default {
  config() {
    return {
      name: "websocket",
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
    app.stack(UserManagementHandlerAPI);
    app.stack(GameEngineHandlerAPI);
    app.stack(WebSocketHandlerAPI);
    app.stack(WebSocketGateway);
  },
} satisfies SSTConfig;
