import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import { JobRunnerMessagePayload } from '../../../shared/sqs-message-payloads';
import { JobName } from '../../../shared/job-names';
import { Output } from '@pulumi/pulumi';

const config = new pulumi.Config();

const resourceName = 'job-runner';

const resourcesStack = new pulumi.StackReference(
  `rhyek/lambda-cronjobs.resources/${pulumi.getStack()}`
);
const mailerSecretArn = resourcesStack.getOutput(
  'mailerSecretArn'
) as Output<string>;

const queue = new aws.sqs.Queue(resourceName, {
  visibilityTimeoutSeconds: 5 * 60,
});

const jobSchedules: { jobName: JobName; scheduleExpression: string }[] = [
  // {
  //   jobName: JobName.CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY,
  //   // scheduleExpression: 'cron(* * * * ? *)' /* every minute */,
  //   scheduleExpression:
  //     'cron(0 0,2,12,14,16,18,20,22 ? * * *)' /* every 2 hours */,
  // },
  {
    jobName: JobName.GOOGLE_TITLE,
    // scheduleExpression: 'cron(0/10 * ? * * *)' /* every 10 minutes */,
    scheduleExpression: 'cron(* * ? * * *)' /* every minute */,
  },
];

for (const { jobName, scheduleExpression } of jobSchedules) {
  aws.cloudwatch.onSchedule(
    `${resourceName}-run-${jobName}`.substring(
      0,
      64 - 1 - 7 /* maximum 64 - 1 dash - 7 random chars */
    ),
    scheduleExpression, // every minute
    async () => {
      const client = new aws.sdk.SQS();
      const req = await client
        .sendMessage({
          QueueUrl: queue.url.get(),
          MessageBody: JSON.stringify({
            job: jobName,
          } as JobRunnerMessagePayload),
        })
        .promise();
      console.log(req);
    }
  );
}

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
      resources: [mailerSecretArn],
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

const imageUri = process.env.IMAGE_URI!;
const arch = process.env.ARCH!;

const jobCheckMexicanEmbassyVisaAppointmentAvailability =
  config.requireSecretObject<{ email: string; password: string }>(
    'jobCheckMexicanEmbassyVisaAppointmentAvailability'
  );

const lambda = new aws.lambda.Function(resourceName, {
  packageType: 'Image',
  imageUri,
  architectures: [arch],
  role: lambdaRole.arn,
  timeout: 3 * 60,
  memorySize: 1024,
  environment: {
    variables: {
      SECRET_ARNS: pulumi.all([mailerSecretArn]).apply(([mailerSecretArn]) =>
        JSON.stringify({
          mailerConfig: mailerSecretArn,
        })
      ),
      JOB_CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY_EMAIL:
        jobCheckMexicanEmbassyVisaAppointmentAvailability.email,
      JOB_CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY_PASSWORD:
        jobCheckMexicanEmbassyVisaAppointmentAvailability.password,
    },
  },
});

queue.onEvent(resourceName, lambda, {
  batchSize: 1,
});
