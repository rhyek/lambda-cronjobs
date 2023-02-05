import * as pulumi from '@pulumi/pulumi';

const awsConfig = new pulumi.Config('aws');

export const config = {
  aws: {
    region: awsConfig.require('region'),
  },
};
