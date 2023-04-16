import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import { secrets } from '../modules/secrets.js';
import { resourceName } from '../modules/resource-name.js';
import { lambdaRole } from '../modules/lambda-role.js';
import { queue } from '../modules/sqs.js';
import { playwrightTracessS3Bucket } from './s3.js';

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
      SECRET_ARNS: pulumi.all(Object.values(secrets)).apply((secretArns) => {
        return JSON.stringify(
          Object.fromEntries(
            secretArns.map((arn, index) => [Object.keys(secrets)[index], arn])
          )
        );
      }),
    },
  },
});

queue.onEvent(resourceName, lambda, {
  batchSize: 1,
});
