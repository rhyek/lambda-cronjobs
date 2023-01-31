import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import { MailerConfig } from '../../shared';

const config = new pulumi.Config();

const mailerConfig = config.requireSecretObject<MailerConfig>('mailer');

const mailerConfigSecret = new aws.secretsmanager.Secret('mailer-config');
new aws.secretsmanager.SecretVersion('mailer-config', {
  secretId: mailerConfigSecret.id,
  secretString: mailerConfig.apply((mailer) => JSON.stringify(mailer)),
});
export const mailerConfigSecretArn = mailerConfigSecret.id;

const jobRunnerImageRepo = new aws.ecr.Repository('job-runner');
export const repoUrls = {
  'job-runner': jobRunnerImageRepo.repositoryUrl,
};
