import { CustomError } from "./CustomError";

class EnvironmentVariableError extends CustomError {
  public statusCode: number;

  constructor(variableName: string) {
    super(`Environment variable ${variableName} is not set`);
    this.name = "EnvironmentVariableError";
    this.statusCode = 500;

    Object.setPrototypeOf(this, EnvironmentVariableError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export { EnvironmentVariableError };
