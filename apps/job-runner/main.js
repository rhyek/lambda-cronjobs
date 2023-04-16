// this file will be copied over one level up to avoid being treated as an es module.
exports.handler = async function (event, context) {
  const { handler } = await import(
    './job-runner/dist/apps/job-runner/src/main.js'
  );
  await handler(event, context);
};
