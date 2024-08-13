import { CustomError } from "./CustomError";

class UnknownValidationTypeError extends CustomError {
  public statusCode: number;

  constructor(type: string) {
    super(`Unknown validation type: ${type}`);
    this.name = "UnknownValidationTypeError";
    this.statusCode = 400;

    Object.setPrototypeOf(this, UnknownValidationTypeError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export { UnknownValidationTypeError };
