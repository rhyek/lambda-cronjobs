#!/usr/bin/env ts-node
import { JobName } from '../../../shared/job-names';
import { runJob } from './main';

async function main() {
  // await runJob(JobName.CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY);
  await runJob(JobName.GOOGLE_TITLE);
}

void main();
