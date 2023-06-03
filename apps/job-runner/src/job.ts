export abstract class Job<D = any> {
  public abstract enabled: boolean;
  public abstract scheduleCronExpression: string;
  abstract run(data?: D): Promise<void>;
}
