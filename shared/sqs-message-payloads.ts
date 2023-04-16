import { JobName } from './job-names.js';

export type JobRunnerMessagePayload = {
  job: JobName;
  data: any;
};
