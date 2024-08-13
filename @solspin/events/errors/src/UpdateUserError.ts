import { CustomError } from "./CustomError";

class UpdateUserError extends CustomError {
  public statusCode: number;

  constructor(error: string) {
    super(`Failed to update user info: ${error}`);
    this.name = "UpdateUserError";
    this.statusCode = 500;

    Object.setPrototypeOf(this, UpdateUserError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
export { UpdateUserError };
