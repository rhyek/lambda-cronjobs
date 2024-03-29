import './bootstrap.js';
import type { Handler, SQSEvent } from 'aws-lambda';
import dayjs from 'dayjs';
import { JobError } from './job-error.js';
import { Job } from './job.js';
import { mailMe } from './services/mailer.js';
import { JobName, jobs } from './jobs/index.js';
import { JobRunnerMessagePayload } from '../../../shared/types/job-runner-message-payload.js';
import { callMe } from './services/caller.js';

export async function runJob(jobName: JobName, data?: any) {
  const job = jobs[jobName];
  if (!job) {
    console.warn(`No job found for name ${jobName}`);
    return;
  }
  const jobClassName = job.constructor.name;
  const start = dayjs();
  console.log(`Starting job ${jobClassName}`);
  try {
    await (job as Job).run({ data, mailMe, callMe });
    console.log('Finished successfully');
  } catch (_error) {
    const error: Error = _error.cause ?? _error;
    console.error(error);
    // email
    const emailSubject = `Lambda cronjobs: Job ${jobClassName} failed`;
    let emailBody = `Error message:
    
${error.message}

Stack trace:

${error.stack}
`;
    if (_error instanceof JobError && _error.extraEmailText) {
      emailBody += `
Extra:
${_error.extraEmailText}`;
    }
    await mailMe({
      subject: emailSubject,
      text: emailBody,
    });
  }
  console.log(`Finished in ${dayjs().diff(start, 'seconds')}s`);
}

export const handler: Handler<SQSEvent> = async (event) => {
  for (const record of event.Records) {
    const { body } = record;
    const { job: jobName, data } = JSON.parse(body) as JobRunnerMessagePayload;
    await runJob(jobName as JobName, data);
  }
};
