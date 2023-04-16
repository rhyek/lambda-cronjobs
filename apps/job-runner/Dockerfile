# https://mcr.microsoft.com/en-us/product/playwright/tags
FROM mcr.microsoft.com/playwright:v1.30.0-focal

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

ARG FUNCTION_DIR="/function"
RUN mkdir -p ${FUNCTION_DIR}
WORKDIR ${FUNCTION_DIR}
WORKDIR ${FUNCTION_DIR}/apps/job-runner

RUN npm i aws-lambda-ric

# at runtime something related to npm
# is trying to write to or below one of its default
# folders which are read-only locations
# per aws lambda fs permissions configuration.
# /tmp is allowed
RUN npm config --global set prefix /tmp/.npm
RUN npm config --global set cache /tmp/.npm-cache
ENV PATH="$PATH:/tmp/.npm/bin"
RUN npm i -g pnpm

COPY \
  apps/job-runner/package.json \
  apps/job-runner/pnpm-lock.yaml \
  ./
RUN pnpm i --frozen-lockfile
COPY shared ${FUNCTION_DIR}/shared
COPY tsconfig.json ${FUNCTION_DIR}/
COPY apps/job-runner/tsconfig.json ./
COPY apps/job-runner/src src
RUN pnpm build
COPY apps/job-runner/main.js ../

# WORKDIR ${FUNCTION_DIR}/apps
ENTRYPOINT ["/usr/bin/npx", "aws-lambda-ric"]
CMD ["../main.handler"]
