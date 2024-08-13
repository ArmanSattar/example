import { CustomError } from "./CustomError";

class DeleteConnectionInfoError extends CustomError {
  public statusCode: number;

  constructor(error: string) {
    super(`Failed to delete connection info: ${error}`);
    this.name = "DeleteConnectionInfoError";
    this.statusCode = 500;

    Object.setPrototypeOf(this, DeleteConnectionInfoError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export { DeleteConnectionInfoError };
