import { CustomError } from "./CustomError";

class BlockchainTransactionError extends CustomError {
  statusCode = 500;

  constructor(message = "Transaction failed during simulation") {
    super(message);
    Object.setPrototypeOf(this, BlockchainTransactionError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export { BlockchainTransactionError };
