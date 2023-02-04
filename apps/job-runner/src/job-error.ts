export class JobError extends Error {
  constructor(
    public readonly cause: Error,
    public readonly extraEmailText?: string
  ) {
    super();
  }
}
