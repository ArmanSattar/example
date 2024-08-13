import { CustomError } from "./CustomError";

class GetUserError extends CustomError {
  public statusCode: number;

  constructor(error: string) {
    super(`Failed to get user info: ${error}`);
    this.name = "GetUserError";
    this.statusCode = 500;

    Object.setPrototypeOf(this, GetUserError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export { GetUserError };
