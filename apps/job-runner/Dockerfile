# https://mcr.microsoft.com/en-us/product/playwright/tags
FROM mcr.microsoft.com/playwright:v1.30.0-focal
ARG FUNCTION_DIR="/function"
RUN apt-get update && \
  apt-get install -y \
  g++ \
  make \
  autoconf \
  cmake \
  unzip \
  libtool \
  libcurl4-openssl-dev \
  python3
RUN npm config --global set prefix /tmp/.npm
RUN npm config --global set cache /tmp/.npm-cache
RUN npm i -g pnpm
RUN mkdir -p ${FUNCTION_DIR}
WORKDIR ${FUNCTION_DIR}
WORKDIR ${FUNCTION_DIR}/apps/job-runner
RUN npm i aws-lambda-ric
COPY \
  apps/job-runner/package.json \
  apps/job-runner/pnpm-lock.yaml \
  ./
RUN pnpm i --frozen-lockfile
COPY shared ${FUNCTION_DIR}/shared
COPY apps/job-runner/tsconfig.json ./
COPY apps/job-runner/src src
RUN pnpm build
# ENTRYPOINT ["/usr/local/bin/npx", "aws-lambda-ric"]
ENTRYPOINT ["/usr/bin/npx", "aws-lambda-ric"]
CMD ["./dist/apps/job-runner/src/main.handler"]
