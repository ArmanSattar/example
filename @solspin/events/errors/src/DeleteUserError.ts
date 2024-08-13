import { CustomError } from "./CustomError";

class DeleteUserError extends CustomError {
  public statusCode: number;

  constructor(error: string) {
    super(`Failed to delete user info: ${error}`);
    this.name = "DeleteUserError";
    this.statusCode = 500;

    Object.setPrototypeOf(this, DeleteUserError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
export { DeleteUserError };
