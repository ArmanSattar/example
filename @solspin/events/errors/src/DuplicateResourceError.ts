import { CustomError } from "./CustomError";

class DuplicateResourceError extends CustomError {
  statusCode = 409;

  constructor(message = "Resource already exists") {
    super(message);
    Object.setPrototypeOf(this, DuplicateResourceError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export { DuplicateResourceError };
