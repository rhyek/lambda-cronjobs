import * as pulumi from '@pulumi/pulumi';
import { Output } from '@pulumi/pulumi';

const resourcesStack = new pulumi.StackReference(
  `rhyek/lambda-cronjobs.resources/${pulumi.getStack()}`
);

const mailerConfigSecretArn = resourcesStack.getOutput(
  'mailerConfigSecretArn'
) as Output<string>;

export const secrets = {
  mailerConfig: mailerConfigSecretArn,
  ...(await import(
    '../check-mexican-embassy-visa-appointment-availability/index.js'
  ).then((m) => m.checkMexicanEmbassyVisaAppointmentAvailability.secrets)),
};
