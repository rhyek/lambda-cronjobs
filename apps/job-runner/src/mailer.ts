// https://www.pulumi.com/blog/safe-lambda-secrets/
import { createTransport, Transporter } from 'nodemailer';
import { isLambda } from './utils.js';
import { getJobRunnerSecrets } from './secrets.js';

let transport: Transporter | null = null;

export async function getMailer(): Promise<Transporter> {
  if (!transport) {
    let account: string;
    let password: string;
    if (isLambda()) {
      ({
        mailerConfig: {
          smtp: { account, password },
        },
      } = await getJobRunnerSecrets());
    } else {
      account = process.env.MAILER_SMTP_ACCOUNT!;
      password = process.env.MAILER_SMTP_PASSWORD!;
    }
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

export async function mailToMe({
  subject,
  text,
}: {
  subject: string;
  text: string;
}): Promise<void> {
  const mailer = await getMailer();
  await mailer.sendMail({
    to: isLambda()
      ? (
          await getJobRunnerSecrets()
        ).mailerConfig.me
      : process.env.MAILER_ME!,
    subject,
    text,
  });
}
