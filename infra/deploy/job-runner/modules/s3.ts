import * as aws from '@pulumi/aws';

const resourceName = 'playwright-traces';

export const playwrightTracessS3Bucket = new aws.s3.Bucket(resourceName, {
  acl: 'public-read',
});

new aws.s3.BucketPublicAccessBlock(resourceName, {
  bucket: playwrightTracessS3Bucket.id,
  blockPublicAcls: false,
  blockPublicPolicy: false,
  ignorePublicAcls: false,
  restrictPublicBuckets: false,
});

// https://www.pulumi.com/docs/aws/s3/#create-an-aws-s3-resource-using-pulumiaws
new aws.s3.BucketPolicy(resourceName, {
  bucket: playwrightTracessS3Bucket.bucket,
  policy: playwrightTracessS3Bucket.arn.apply((playwrightTracessS3BucketArn) =>
    JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`${playwrightTracessS3BucketArn}/*`],
        },
      ],
    })
  ),
});

export const playwrightTracesS3BucketLambdaPutObjectPolicy = new aws.iam.Policy(
  `${resourceName}-put-object-policy`,
  {
    path: '/',
    policy: aws.iam
      .getPolicyDocumentOutput({
        statements: [
          {
            effect: 'Allow',
            actions: ['s3:PutObject'],
            resources: [
              playwrightTracessS3Bucket.arn.apply((arn) => `${arn}/*`),
            ],
          },
        ],
      })
      .apply((doc) => doc.json),
  }
);
