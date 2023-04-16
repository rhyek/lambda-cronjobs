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
  ...(
    await import(
      '../jobs/check-mexican-embassy-visa-appointment-availability/secrets.js'
    )
  ).default,
};
