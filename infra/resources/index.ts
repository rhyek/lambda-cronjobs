import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

const config = new pulumi.Config();

const mailerConfig = config.requireSecretObject<{
  smtp: {
    account: string;
    password: string;
  };
}>('mailer');

const mailerSecret = new aws.secretsmanager.Secret('mailer');
new aws.secretsmanager.SecretVersion('mailer', {
  secretId: mailerSecret.id,
  secretString: mailerConfig.apply((config) => JSON.stringify(config)),
});
export const mailerSecretArn = mailerSecret.id;

const jobRunnerImageRepo = new aws.ecr.Repository('job-runner');
export const repoUrls = {
  'job-runner': jobRunnerImageRepo.repositoryUrl,
};
