# https://www.larihaataja.com/running-e2e-tests-playwright-aws-lambda
# https://repost.aws/questions/QUtlb2BYIEQjyirCUWspC-CQ/exit-254-lambda-error-with-no-extra-explanations
FROM mcr.microsoft.com/playwright:v1.22.2-focal
ARG FUNCTION_DIR="/function"
ARG APP_NAME

ARG JOB_CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY_EMAIL
ARG JOB_CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY_PASSWORD

ENV JOB_CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY_EMAIL=$JOB_CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY_EMAIL
ENV JOB_CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY_PASSWORD=$JOB_CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY_PASSWORD

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
COPY shared shared
WORKDIR ${FUNCTION_DIR}/apps/job-runner
RUN npm i aws-lambda-ric
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
