#!/usr/bin/env tsx
import { JobName } from '../../../shared/job-names.js';
import { runJob } from './main.js';

async function main() {
  // await runJob(JobName.CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY);
  // await runJob(JobName.GOOGLE_TITLE);
  await runJob(JobName.CHECK_ROGER_WATERS_TICKET_SALES_READINESS);
}

void main();
