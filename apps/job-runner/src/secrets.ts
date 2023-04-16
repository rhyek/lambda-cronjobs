import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import {
  JobCheckMexicanEmbassyVisaAppointmentAvailabilityConfig,
  MailerConfig,
} from '../../../shared/index.js';

let secrets: object | null = null;
async function getSecrets<T extends object>(): Promise<T> {
  if (!secrets) {
    const secretArnsJson = process.env.SECRET_ARNS;
    if (!secretArnsJson) {
      throw new Error('Secret ARNs env not available');
    }
    const client = new SecretsManagerClient({});
    const secretArns = JSON.parse(secretArnsJson) as T;
    secrets = Object.fromEntries(
      await Promise.all(
        Object.entries(secretArns).map(async ([key, arn]) => {
          const secretValue = await client.send(
            new GetSecretValueCommand({
              SecretId: arn,
            })
          );
          if (!secretValue.SecretString) {
            throw new Error(`Could not obtain secret ${key} with arn ${arn}`);
          }
          return [key, secretValue.SecretString] as [keyof T, string];
        })
      )
    ) as T;
  }
  return secrets as T;
}

export async function getJobRunnerSecrets<
  T extends {
    mailerConfig: MailerConfig;
    jobCheckMexicanEmbassyVisaAppointmentAvailabilityConfig: JobCheckMexicanEmbassyVisaAppointmentAvailabilityConfig;
  }
>(): Promise<T> {
  const secrets = await getSecrets<Record<keyof T, string>>();
  return {
    ...secrets,
    mailerConfig: JSON.parse(secrets.mailerConfig),
    jobCheckMexicanEmbassyVisaAppointmentAvailabilityConfig: JSON.parse(
      secrets.jobCheckMexicanEmbassyVisaAppointmentAvailabilityConfig
    ),
  } as T;
}
875667244027;
