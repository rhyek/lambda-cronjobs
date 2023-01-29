# https://www.larihaataja.com/running-e2e-tests-playwright-aws-lambda
# https://repost.aws/questions/QUtlb2BYIEQjyirCUWspC-CQ/exit-254-lambda-error-with-no-extra-explanations
FROM mcr.microsoft.com/playwright:v1.22.2-focal
ARG FUNCTION_DIR="/function"
ARG APP_NAME

RUN apt-get update && \
  apt-get install -y \
  g++ \
  make \
  autoconf \
  cmake \
  unzip \
  libtool \
  libcurl4-openssl-dev
RUN npm i -g pnpm
RUN mkdir -p ${FUNCTION_DIR}
WORKDIR ${FUNCTION_DIR}
RUN npm i aws-lambda-ric
COPY shared shared
WORKDIR ${FUNCTION_DIR}/apps/job-runner
COPY \
  apps/job-runner/package.json \
  apps/job-runner/pnpm-lock.yaml \
  ./
RUN pnpm i --frozen-lockfile
COPY \
  apps/job-runner/tsconfig.json \
  ./
COPY apps/job-runner/src src
RUN pnpm build
ENTRYPOINT ["/usr/bin/npx", "aws-lambda-ric"]
CMD ["./dist/apps/job-runner/src/main.handler"]
