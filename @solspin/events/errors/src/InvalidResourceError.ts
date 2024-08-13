import { CustomError } from "./CustomError";

export class InvalidResourceError extends CustomError {
  statusCode = 404;

  constructor(message = "Invalid resource") {
    super(message);
    Object.setPrototypeOf(this, InvalidResourceError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
