import * as aws from '@pulumi/aws';
import {
  JobName,
  truncatePulumiResourceName,
} from '../../../../shared/index.js';
import { JobRunnerMessagePayload } from '../../../../shared/sqs-message-payloads.js';
import { resourceName } from './resource-name.js';
import { queue } from './sqs.js';
import { checkMexicanEmbassyVisaAppointmentAvailability } from '../check-mexican-embassy-visa-appointment-availability/index.js';

const jobSchedules: { jobName: JobName; scheduleExpression: string }[] = [
  ...checkMexicanEmbassyVisaAppointmentAvailability.jobSchedules,
];

for (const { jobName, scheduleExpression } of jobSchedules) {
  aws.cloudwatch.onSchedule(
    truncatePulumiResourceName(`${resourceName}-run-${jobName}`),
    scheduleExpression,
    async () => {
      const client = new aws.sdk.SQS();
      const req = await client
        .sendMessage({
          QueueUrl: queue.url.get(),
          MessageBody: JSON.stringify({
            job: jobName,
          } as JobRunnerMessagePayload),
        })
        .promise();
      console.log(req);
    }
  );
}
