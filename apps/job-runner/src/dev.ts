#!/usr/bin/env tsx
import { JobName } from '../../../shared/job-names.js';
import { runJob } from './main.js';

async function main() {
  // await runJob(JobName.CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY);
  await runJob(JobName.GOOGLE_TITLE);
}

void main();
