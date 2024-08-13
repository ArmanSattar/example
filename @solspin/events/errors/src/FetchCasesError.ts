import { CustomError } from "./CustomError";

class FetchCasesError extends CustomError {
  public statusCode: number;

  constructor(error: string) {
    super(`Error fetching cases: ${error}`);
    this.name = "FetchCasesError";
    this.statusCode = 500;

    Object.setPrototypeOf(this, FetchCasesError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export { FetchCasesError };
