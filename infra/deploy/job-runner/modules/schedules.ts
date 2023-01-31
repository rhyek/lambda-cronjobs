import * as aws from '@pulumi/aws';
import { JobName, truncatePulumiResourceName } from '../../../../shared';
import { JobRunnerMessagePayload } from '../../../../shared/sqs-message-payloads';
import { resourceName } from './resource-name';
import { queue } from './sqs';

const jobSchedules: { jobName: JobName; scheduleExpression: string }[] = [
  // {
  //   jobName: JobName.CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY,
  //   // scheduleExpression: 'cron(* * * * ? *)' /* every minute */,
  //   scheduleExpression:
  //     'cron(0 0,2,12,14,16,18,20,22 ? * * *)' /* every 2 hours */,
  // },
  {
    jobName: JobName.GOOGLE_TITLE,
    // scheduleExpression: 'cron(0/10 * ? * * *)' /* every 10 minutes */,
    scheduleExpression: 'cron(* * ? * * *)' /* every minute */,
  },
];

for (const { jobName, scheduleExpression } of jobSchedules) {
  aws.cloudwatch.onSchedule(
    truncatePulumiResourceName(`${resourceName}-run-${jobName}`),
    scheduleExpression, // every minute
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
