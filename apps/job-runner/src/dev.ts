#!/usr/bin/env tsx
import { runJob } from './main.js';

async function main() {
  // await runJob(JobName.CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY);
  // await runJob(JobName.GOOGLE_TITLE);
  await runJob('check-roger-waters-ticket-sales-readiness');
}

void main();
