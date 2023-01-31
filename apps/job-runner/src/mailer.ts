// https://www.pulumi.com/blog/safe-lambda-secrets/
import { createTransport, Transporter } from 'nodemailer';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import { MailerConfig } from '../../../shared';
import { isLambda } from './utils';
import { getJobRunnerSecrets } from './secrets';

let transport: Transporter | null = null;

export async function getMailer(): Promise<Transporter> {
  if (!transport) {
    let account: string;
    let password: string;
    if (!isLambda()) {
      account = process.env.MAILER_SMTP_ACCOUNT!;
      password = process.env.MAILER_SMTP_PASSWORD!;
    } else {
      ({
        mailerConfig: {
          smtp: { account, password },
        },
      } = await getJobRunnerSecrets());
    }
    console.log(`Mailer using account ${account} ${password}`);
    transport = createTransport({
      service: 'gmail',
      auth: {
        user: account,
        pass: password,
      },
    });
  }
  return transport;
}
