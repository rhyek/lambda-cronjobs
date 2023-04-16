import * as aws from '@pulumi/aws';
import {
  JobName,
  truncatePulumiResourceName,
} from '../../../../../shared/index.js';
import { JobRunnerMessagePayload } from '../../../../../shared/sqs-message-payloads.js';
import { resourceName } from '../resource-name.js';
import { queue } from './sqs.js';

const jobSchedules: { jobName: JobName; scheduleExpression: string }[] = [
  ...(
    await import(
      '../jobs/check-mexican-embassy-visa-appointment-availability/schedules.js'
    )
  ).default,
];

// https://github.com/awsdocs/aws-doc-sdk-examples/blob/main/javascriptv3/example_code/sqs/src/sqs_sendmessage.js

for (const { jobName, scheduleExpression } of jobSchedules) {
  const handler = new aws.lambda.CallbackFunction(
    truncatePulumiResourceName(`${resourceName}_message_${jobName}`),
    {
      runtime: 'nodejs18.x',
      callback: async () => {
        const { SQSClient, SendMessageCommand } = await import(
          '@aws-sdk/client-sqs'
        );
        try {
          const client = new SQSClient({});
          const data = await client.send(
            new SendMessageCommand({
              QueueUrl: queue.url.get(),
              MessageBody: JSON.stringify({
                job: jobName,
              } as JobRunnerMessagePayload),
            })
          );
          console.log('Success, message sent. MessageID:', data.MessageId);
          return data; // For unit tests.
        } catch (err) {
          console.log('Error', err);
        }
      },
    }
  );
  aws.cloudwatch.onSchedule(
    truncatePulumiResourceName(`${resourceName}_schedule_${jobName}`),
    scheduleExpression,
    handler
  );
}
