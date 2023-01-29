import dayjs from 'dayjs';
import type { Handler, SQSEvent } from 'aws-lambda';
import { checkMexicanEmbassyVisaAppointments } from './jobs/check-mexican-embassy-visa-appointments';

async function main() {
  const start = dayjs();
  console.log(`Starting job ${checkMexicanEmbassyVisaAppointments.name}`);
  try {
    await checkMexicanEmbassyVisaAppointments();
    console.log('Finished successfully');
  } catch (error) {
    console.error(error);
  }
  console.log(`Finished in ${dayjs().diff(start, 'seconds')}s`);
}

void main();
// lambda-cronjobs
// OrganizationAccountAccessRole
