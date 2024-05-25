import { CustomError } from './CustomError';

export class ResourceNotFoundError extends CustomError {
  public statusCode = 404;

  constructor(message = 'Invalid resource') {
    super(message);
    Object.setPrototypeOf(this, ResourceNotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
