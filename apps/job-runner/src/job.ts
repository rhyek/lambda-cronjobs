export abstract class Job<D = any> {
  public abstract enabled: boolean;
  public abstract scheduleCronExpression: string;
  abstract run(
    params: {
      data: D;
    } & Services
  ): Promise<void>;
}

export type RunParams<D> = {
  data: D;
} & Services;

type Services = {
  callMe: (params: { twiml: string }) => Promise<void>;
};
