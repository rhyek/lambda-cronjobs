export function isLambda() {
  return !!process.env['AWS_LAMBDA_FUNCTION_NAME'];
}
