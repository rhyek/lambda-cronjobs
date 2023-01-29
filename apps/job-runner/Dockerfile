FROM node:16.14.2-buster-slim
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
RUN npm i -g pnpm
RUN mkdir -p ${FUNCTION_DIR}
WORKDIR ${FUNCTION_DIR}
RUN npm i aws-lambda-ric
WORKDIR ${FUNCTION_DIR}/apps/job-runner
COPY \
  apps/job-runner/package.json \
  apps/job-runner/pnpm-lock.yaml \
  ./
RUN pnpm i --frozen-lockfile
COPY shared ${FUNCTION_DIR}/shared
COPY apps/job-runner/tsconfig.json ./
COPY apps/job-runner/src src
RUN pnpm build
ENTRYPOINT ["/usr/bin/npx", "aws-lambda-ric"]
CMD ["./dist/apps/job-runner/src/main.handler"]
