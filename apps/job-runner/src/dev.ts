#!/usr/bin/env ts-node
import dayjs from 'dayjs';
import { jobs } from './jobs';

async function main() {
  const job = jobs['google-title'];
  if (!job) {
    return;
  }
  const start = dayjs();
  console.log(`Starting job`);
  try {
    await job.run();
    console.log('Finished successfully');
  } catch (error) {
    console.error(error);
  }
  console.log(`Finished in ${dayjs().diff(start, 'seconds')}s`);
}

void main();
