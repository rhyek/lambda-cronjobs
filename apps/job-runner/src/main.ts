import 'source-map-support/register';
import type { Handler, SQSEvent } from 'aws-lambda';
import dayjs from 'dayjs';
import { JobName } from '../../../shared/job-names';
import { JobRunnerMessagePayload } from '../../../shared/sqs-message-payloads';
import { JobError } from './job-error';
import { CheckMexicanEmbassyVisaAppointmentAvailability } from './jobs/check-mexican-embassy-visa-appointments';
import { GoogleTitleJob } from './jobs/google-title-job';
import { Job } from './jobs/_job';
import { mailToMe } from './mailer';

export const jobs: { [x in JobName]?: Job } = {
  [JobName.CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY]:
    new CheckMexicanEmbassyVisaAppointmentAvailability(),
  [JobName.GOOGLE_TITLE]: new GoogleTitleJob(),
};

export async function runJob(jobName: JobName) {
  const job = jobs[jobName];
  if (!job) {
    console.warn(`No job found for name ${jobName}`);
    return;
  }
  const jobClassName = job.constructor.name;
  const start = dayjs();
  console.log(`Starting job ${jobClassName}`);
  try {
    await job.run();
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
    const { job: jobName } = JSON.parse(body) as JobRunnerMessagePayload;
    await runJob(jobName);
  }
};
