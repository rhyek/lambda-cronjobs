import type { Handler, SQSEvent } from 'aws-lambda';
import dayjs from 'dayjs';
import { JobRunnerMessagePayload } from '../../../shared/sqs-message-payloads';
import { JobName } from '../../../shared/job-names';

const jobs: { [x in JobName]?: () => Promise<void> } = {
  [JobName.CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY]: () => {
    console.log('called!');
    return Promise.resolve();
  },
};

export const handler: Handler<SQSEvent> = async (event) => {
  for (const record of event.Records) {
    const { body } = record;
    const { job: jobName } = JSON.parse(body) as JobRunnerMessagePayload;
    const jobFn = jobs[jobName];
    if (!jobFn) {
      console.warn(`No job found for name ${jobName}`);
      return;
    }
    const start = dayjs();
    console.log(`Starting job ${jobName}`);
    try {
      await jobFn();
      console.log('Finished successfully');
    } catch (error) {
      console.error(error);
    }
    console.log(`Finished in ${dayjs().diff(start, 'seconds')}s`);
  }
};
