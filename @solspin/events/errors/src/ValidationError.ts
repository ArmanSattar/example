import { CustomError } from "./CustomError";

class ValidationError extends CustomError {
  public statusCode: number;

  constructor(type: string, message: string) {
    super(`Validation failed for ${type}: ${message}`);
    this.name = "ValidationError";
    this.statusCode = 400;

    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export { ValidationError };
