import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import { MailerConfig } from '../../../shared';

let secrets: any = null;
async function getSecrets<T extends object>(): Promise<T> {
  if (!secrets) {
    const secretArnsJson = process.env.SECRET_ARNS;
    if (!secretArnsJson) {
      throw new Error('Secret ARNs env not available');
    }
    console.log('secret arns json', secretArnsJson);
    const secretArns = JSON.parse(secretArnsJson) as T;
    const client = new SecretsManagerClient({});
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
  return secrets;
}

export const getJobRunnerSecrets = getSecrets<{ mailerConfig: MailerConfig }>;
