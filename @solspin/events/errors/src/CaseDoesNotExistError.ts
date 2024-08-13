import { CustomError } from "./CustomError";

class CaseDoesNotExistError extends CustomError {
  public statusCode: number;
  constructor(caseId: string) {
    super(`Case with name ${caseId} not found`);
    this.name = "CaseNotFoundError";
    this.statusCode = 404;

    Object.setPrototypeOf(this, CaseDoesNotExistError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export { CaseDoesNotExistError };
