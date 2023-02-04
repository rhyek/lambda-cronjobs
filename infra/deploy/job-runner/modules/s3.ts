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

const bucketPolicyDoc = aws.iam.getPolicyDocumentOutput({
  statements: [
    {
      effect: 'Allow',
      actions: ['s3:GetObject'],
      resources: [playwrightTracessS3Bucket.arn.apply((arn) => `${arn}/*`)],
    },
  ],
});

new aws.s3.BucketPolicy(resourceName, {
  bucket: playwrightTracessS3Bucket.bucket,
  policy: bucketPolicyDoc.apply((doc) => doc.json),
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
