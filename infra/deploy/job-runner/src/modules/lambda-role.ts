import * as aws from '@pulumi/aws';
import { resourceName } from '../resource-name.js';
import { playwrightTracesS3BucketLambdaPutObjectPolicy } from './s3.js';
import { secrets } from './secrets.js';

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
const lambdaRolePolicy = new aws.iam.Policy(`${resourceName}-custom`, {
  policy: aws.iam
    .getPolicyDocumentOutput({
      statements: [
        {
          effect: 'Allow',
          actions: ['secretsmanager:GetSecretValue'],
          resources: [...Object.values(secrets)],
        },
      ],
    })
    .apply((doc) => doc.json),
});
new aws.iam.RolePolicyAttachment(`${resourceName}-custom`, {
  role: lambdaRole.name,
  policyArn: lambdaRolePolicy.arn,
});

// playwright traces bucket write access: https://link.medium.com/wEyg8zQG9wb
new aws.iam.RolePolicyAttachment(
  `${resourceName}-playwright-traces-put-access`,
  {
    role: lambdaRole.name,
    policyArn: playwrightTracesS3BucketLambdaPutObjectPolicy.arn,
  }
);

export { lambdaRole };
