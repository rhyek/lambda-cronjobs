// https://www.pulumi.com/blog/safe-lambda-secrets/
import { createTransport, Transporter } from 'nodemailer';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import { MailerConfig } from '../../../shared';
import { isLambda } from './utils';

let transport: Transporter | null = null;

export async function getMailer(): Promise<Transporter> {
  if (!transport) {
    let account: string;
    let password: string;
    if (!isLambda()) {
      account = process.env.MAILER_SMTP_ACCOUNT!;
      password = process.env.MAILER_SMTP_PASSWORD!;
    } else {
      const client = new SecretsManagerClient({});
      const secretValue = await client.send(
        new GetSecretValueCommand({
          SecretId: process.env.MAILER_SECRET_ARN,
        })
      );
      if (!secretValue.SecretString) {
        throw new Error(
          `Could not obtain secret ${process.env.MAILER_SECRET_ARN}`
        );
      }
      const mailerConfig = JSON.parse(secretValue.SecretString) as MailerConfig;
      account = mailerConfig.smtp.account;
      password = mailerConfig.smtp.password;
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
