import "sst/node/config";
import "sst/node/table";
import "sst/node/function";

declare module "sst/node/config" {
  export interface ConfigTypes {
    APP: string;
    STAGE: string;
  }
}

declare module "sst/node/table" {
  export interface TableResources {
    transactions: {
      tableName: string;
    };
  }
}

declare module "sst/node/function" {
  export interface FunctionResources {
    DepositFunction: {
      functionName: string;
    };
  }
}

declare module "sst/node/function" {
  export interface FunctionResources {
    WithdrawFunction: {
      functionName: string;
    };
  }
}
