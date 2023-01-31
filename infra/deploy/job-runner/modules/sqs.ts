import * as aws from '@pulumi/aws';
import { resourceName } from './resource-name';

export const queue = new aws.sqs.Queue(resourceName, {
  visibilityTimeoutSeconds: 5 * 60,
});
