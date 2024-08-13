import { CustomError } from "./CustomError";

class SaveUserError extends CustomError {
  public statusCode: number;

  constructor(error: string) {
    super(`Failed to save user info: ${error}`);
    this.name = "SaveUserError";
    this.statusCode = 500;

    Object.setPrototypeOf(this, SaveUserError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
export { SaveUserError };
