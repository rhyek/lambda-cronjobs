export abstract class Job<D = any> {
  abstract run(data?: D): Promise<void>;
}
