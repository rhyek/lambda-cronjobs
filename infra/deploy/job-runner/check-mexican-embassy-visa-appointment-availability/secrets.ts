import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import { truncatePulumiResourceName } from '../../../../shared/pulumi-helpers.js';
import { JobCheckMexicanEmbassyVisaAppointmentAvailabilityConfig } from '../../../../shared/types/job-check-mexican-embassy-visa-appointment-availability-config.js';

const config = new pulumi.Config();

const jobCheckMexicanEmbassyVisaAppointmentAvailability =
  config.requireSecretObject<{
    config: { account: { email: string; password: string } };
  }>('jobCheckMexicanEmbassyVisaAppointmentAvailability');

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
      ({ config: { account } }) =>
        JSON.stringify({
          account,
        } as JobCheckMexicanEmbassyVisaAppointmentAvailabilityConfig)
    ),
  }
);

export const secrets = {
  jobCheckMexicanEmbassyVisaAppointmentAvailabilityConfig:
    jobCheckMexicanEmbassyVisaAppointmentAvailabilityConfigSecret.arn,
};
