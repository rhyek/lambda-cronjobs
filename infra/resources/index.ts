import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

const jobRunnerImageRepo = new aws.ecr.Repository('job-runner');
export const repoUrls = {
  'job-runner': jobRunnerImageRepo.repositoryUrl,
};
