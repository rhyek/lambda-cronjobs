export abstract class Job {
  abstract run(): Promise<void>;
}
