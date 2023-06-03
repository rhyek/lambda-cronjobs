import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import { resourceName } from '../resource-name.js';
import { lambdaRole } from './lambda-role.js';
import { queue } from './sqs.js';
import { playwrightTracessS3Bucket } from './s3.js';

const config = new pulumi.Config();

const imageUri = process.env.IMAGE_URI!;
const arch = process.env.ARCH!;

const lambda = new aws.lambda.Function(resourceName, {
  packageType: 'Image',
  imageUri,
  architectures: [arch],
  role: lambdaRole.arn,
  timeout: 3 * 60,
  memorySize: 1024,
  environment: {
    variables: {
      PLAYWRIGHT_TRACES_S3_BUCKET: playwrightTracessS3Bucket.id,
      MAILER: config
        .requireSecretObject('mailer')
        .apply((mailer) => JSON.stringify(mailer)),
      TWILIO: config
        .requireSecretObject('twilio')
        .apply((twilio) => JSON.stringify(twilio)),
    },
  },
});

queue.onEvent(resourceName, lambda, {
  batchSize: 1,
});
