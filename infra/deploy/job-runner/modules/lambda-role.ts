import * as aws from '@pulumi/aws';
import { resourceName } from './resource-name';
import {
  jobCheckMexicanEmbassyVisaAppointmentAvailabilityConfigSecretArn,
  mailerConfigSecretArn,
} from './secrets';

const lambdaRole = new aws.iam.Role(resourceName, {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal(
    aws.iam.Principals.LambdaPrincipal
  ),
});

// managed policies: https://docs.aws.amazon.com/lambda/latest/dg/lambda-intro-execution-role.html
// cloudwatch
new aws.iam.RolePolicyAttachment(`${resourceName}-logs`, {
  role: lambdaRole.name,
  policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
});
// sqs
new aws.iam.RolePolicyAttachment(`${resourceName}-sqs`, {
  role: lambdaRole.name,
  policyArn: aws.iam.ManagedPolicy.AWSLambdaSQSQueueExecutionRole,
});
// custom
// https://www.pulumi.com/blog/safe-lambda-secrets/
const lambdaPolicyDoc = aws.iam.getPolicyDocumentOutput({
  statements: [
    {
      effect: 'Allow',
      actions: ['secretsmanager:GetSecretValue'],
      resources: [
        mailerConfigSecretArn,
        jobCheckMexicanEmbassyVisaAppointmentAvailabilityConfigSecretArn,
      ],
    },
  ],
});
const lambdaRolePolicy = new aws.iam.Policy(`${resourceName}-custom`, {
  policy: lambdaPolicyDoc.apply((doc) => doc.json),
});
new aws.iam.RolePolicyAttachment(`${resourceName}-custom`, {
  role: lambdaRole.name,
  policyArn: lambdaRolePolicy.arn,
});

export { lambdaRole };
