import httpStatus from 'http-status';

/**
 * @extends Error
 */
export class ExtendableError extends Error {

    public status: any;
    public isPublic: boolean;
    public isOperational: boolean;

  constructor(message: string, status: any, isPublic: boolean) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    this.isPublic = isPublic;
    this.isOperational = true; // This is required since bluebird 4 doesn't append it anymore.
    Error.captureStackTrace(this, this.constructor);
  }
}

export class APIError extends ExtendableError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor(message: any, status: number = httpStatus.INTERNAL_SERVER_ERROR, isPublic: boolean = false) {
    super(message, status, isPublic);
  }
}

export default APIError;
