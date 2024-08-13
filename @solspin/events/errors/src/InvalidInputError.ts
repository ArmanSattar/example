import { CustomError } from "./CustomError";

class InvalidInputError extends CustomError {
  statusCode = 400;

  constructor(message = "Invalid input") {
    super(message);
    Object.setPrototypeOf(this, InvalidInputError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export { InvalidInputError };
