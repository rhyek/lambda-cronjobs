import type { Handler, SQSEvent } from 'aws-lambda';
import dayjs from 'dayjs';
import { JobRunnerMessagePayload } from '../../../shared/sqs-message-payloads';
import { jobs } from './jobs';

export const handler: Handler<SQSEvent> = async (event) => {
  for (const record of event.Records) {
    const { body } = record;
    const { job: jobName } = JSON.parse(body) as JobRunnerMessagePayload;
    const job = jobs[jobName];
    if (!job) {
      console.warn(`No job found for name ${jobName}`);
      return;
    }
    const start = dayjs();
    console.log(`Starting job ${jobName}`);
    try {
      await job.run();
      console.log('Finished successfully');
    } catch (error) {
      console.error(error);
    }
    console.log(`Finished in ${dayjs().diff(start, 'seconds')}s`);
  }
};
