import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import {
  jobCheckMexicanEmbassyVisaAppointmentAvailabilityConfigSecretArn,
  mailerConfigSecretArn,
} from '../modules/secrets';
import { resourceName } from '../modules/resource-name';
import { lambdaRole } from '../modules/lambda-role';
import { queue } from '../modules/sqs';

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
      SECRET_ARNS: pulumi
        .all([
          mailerConfigSecretArn,
          jobCheckMexicanEmbassyVisaAppointmentAvailabilityConfigSecretArn,
        ])
        .apply(
          ([
            mailerConfigSecretArn,
            jobCheckMexicanEmbassyVisaAppointmentAvailabilityConfigSecretArn,
          ]) =>
            JSON.stringify({
              mailerConfig: mailerConfigSecretArn,
              jobCheckMexicanEmbassyVisaAppointmentAvailabilityConfig:
                jobCheckMexicanEmbassyVisaAppointmentAvailabilityConfigSecretArn,
            })
        ),
    },
  },
});

queue.onEvent(resourceName, lambda, {
  batchSize: 1,
});
