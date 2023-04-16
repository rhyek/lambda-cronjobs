import 'source-map-support/register';
import type { Handler, SQSEvent } from 'aws-lambda';
import dayjs from 'dayjs';
import { JobName } from '../../../shared/job-names.js';
import { JobRunnerMessagePayload } from '../../../shared/sqs-message-payloads.js';
import { JobError } from './job-error.js';
import { CheckMexicanEmbassyVisaAppointmentAvailability } from './jobs/check-mexican-embassy-visa-appointments.js';
import { GoogleTitleJob } from './jobs/google-title-job.js';
import { Job } from './job.js';
import { mailToMe } from './mailer.js';

export const jobs: { [x in JobName]?: Job } = {
  [JobName.CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY]:
    new CheckMexicanEmbassyVisaAppointmentAvailability(),
  [JobName.GOOGLE_TITLE]: new GoogleTitleJob(),
};

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
    await job.run(data);
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
    await mailToMe({
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
    await runJob(jobName, data);
  }
};
