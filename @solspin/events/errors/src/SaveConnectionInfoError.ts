import { CustomError } from "./CustomError";

class SaveConnectionInfoError extends CustomError {
  public statusCode: number;

  constructor(error: string) {
    super(`Failed to save connection info: ${error}`);
    this.name = "SaveConnectionInfoError";
    this.statusCode = 500;

    Object.setPrototypeOf(this, SaveConnectionInfoError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
export { SaveConnectionInfoError };
