#!/usr/bin/env ts-node
import parseArgs from 'minimist';
import execa, { command } from 'execa';
const {
  _: [appName],
} = parseArgs(process.argv.slice(2));

process.chdir(__dirname);

(async () => {
  const tag = new Date().getTime().toString();
  await command(
    `aws ecr get-login-password | docker login -u AWS --password-stdin "https://$(aws sts get-caller-identity --query 'Account' --output text).dkr.ecr.${process.env.AWS_DEFAULT_REGION}.amazonaws.com"`,
    {
      stdio: 'inherit',
      shell: true,
    }
  );
  const { stdout: repoUrl } = await command(
    `pulumi stack --stack dev output repoUrls | jq -r '."${appName}"'`,
    {
      cwd: '../infra/resources',
      shell: true,
    }
  );

  const imageUri = `${repoUrl}:${tag}`;
  const platform = process.env.CI ? 'linux/amd64' : 'linux/arm64';
  const arch = process.env.CI ? 'x86_64' : 'arm64';
  console.log('params', JSON.stringify({ imageUri, platform, arch }, null, 2));

  await execa(
    'docker',
    [
      'buildx',
      'build',
      '--platform',
      platform,
      '--provenance=false', // https://stackoverflow.com/a/75149347/410224
      '-t',
      imageUri,
      '-f',
      `apps/${appName}/Dockerfile`,
      ...(process.env.CI
        ? [
            '--cache-from',
            `type=gha,scope=${appName},url=${process.env.ACTIONS_CACHE_URL},token=${process.env.ACTIONS_RUNTIME_TOKEN}`,
            '--cache-to',
            `type=gha,scope=${appName},mode=max,url=${process.env.ACTIONS_CACHE_URL},token=${process.env.ACTIONS_RUNTIME_TOKEN}`,
          ]
        : []),
      '--push',
      '.',
    ],
    {
      cwd: '../',
      stdio: 'inherit',
    }
  );
  await command('pulumi up --stack dev --yes', {
    cwd: `../infra/deploy/${appName}`,
    stdio: 'inherit',
    env: {
      IMAGE_URI: imageUri,
      ARCH: arch,
    },
  });
})();
