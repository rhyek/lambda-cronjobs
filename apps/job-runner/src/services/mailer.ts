// https://www.pulumi.com/blog/safe-lambda-secrets/
import { createTransport, Transporter } from 'nodemailer';
import { isLambda } from '../utils.js';
import { MailerConfig } from '../../../../shared/index.js';

let transport: Transporter | null = null;

export async function getMailer(): Promise<Transporter> {
  if (!transport) {
    let account: string;
    let password: string;
    if (isLambda()) {
      ({
        smtp: { account, password },
      } = JSON.parse(process.env.MAILER!) as MailerConfig);
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
      ? (JSON.parse(process.env.MAILER!) as MailerConfig).me
      : process.env.MAILER_ME!,
    subject,
    text,
  });
}
