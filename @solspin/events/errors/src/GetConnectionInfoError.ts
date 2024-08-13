import { CustomError } from "./CustomError";

class GetConnectionInfoError extends CustomError {
  public statusCode: number;

  constructor(error: string) {
    super(`Failed to get connection info: ${error}`);
    this.name = "GetConnectionInfoError";
    this.statusCode = 500;

    Object.setPrototypeOf(this, GetConnectionInfoError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export { GetConnectionInfoError };
