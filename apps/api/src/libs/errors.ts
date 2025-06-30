export class CursorError extends Error {
  status: number;

  constructor(message: string = 'Invalid cursor') {
    super(message);
    this.name = 'CursorError';
    this.status = 422;
  }
}
