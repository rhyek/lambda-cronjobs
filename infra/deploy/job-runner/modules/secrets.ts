import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import {
  JobCheckMexicanEmbassyVisaAppointmentAvailabilityConfig,
  truncatePulumiResourceName,
} from '../../../../shared';
import { Output } from '@pulumi/pulumi';

const config = new pulumi.Config();

const resourcesStack = new pulumi.StackReference(
  `rhyek/lambda-cronjobs.resources/${pulumi.getStack()}`
);

const mailerConfigSecretArn = resourcesStack.getOutput(
  'mailerConfigSecretArn'
) as Output<string>;

const jobCheckMexicanEmbassyVisaAppointmentAvailability =
  config.requireSecretObject<{ email: string; password: string }>(
    'jobCheckMexicanEmbassyVisaAppointmentAvailability'
  );
const jobCheckMexicanEmbassyVisaAppointmentAvailabilityConfigSecret =
  new aws.secretsmanager.Secret(
    truncatePulumiResourceName(
      'job-check-mexican-embassy-visa-appointment-availability-config'
    )
  );
new aws.secretsmanager.SecretVersion(
  truncatePulumiResourceName(
    'job-check-mexican-embassy-visa-appointment-availability-config'
  ),
  {
    secretId: jobCheckMexicanEmbassyVisaAppointmentAvailabilityConfigSecret.id,
    secretString: jobCheckMexicanEmbassyVisaAppointmentAvailability.apply(
      ({ email, password }) =>
        JSON.stringify({
          account: { email, password },
        } as JobCheckMexicanEmbassyVisaAppointmentAvailabilityConfig)
    ),
  }
);

export { mailerConfigSecretArn };
export const jobCheckMexicanEmbassyVisaAppointmentAvailabilityConfigSecretArn =
  jobCheckMexicanEmbassyVisaAppointmentAvailabilityConfigSecret.arn;
