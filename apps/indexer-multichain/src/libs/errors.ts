class AppError extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
    this.message = message;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class RpcError extends AppError {
  constructor(message: string) {
    super('RpcError', message);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string) {
    super('RateLimitError', message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super('NotFoundError', message);
  }
}

export class RetryFailedError extends AppError {
  constructor(message: string) {
    super('RetryFailedError', message);
  }
}
