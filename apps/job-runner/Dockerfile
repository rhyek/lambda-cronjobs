FROM node:14-alpine3.12
ARG FUNCTION_DIR="/function"
RUN apk add --update-cache \
  build-base \
  libtool \
  libressl-dev \
  musl-dev \
  libffi-dev \
  autoconf \
  automake \
  libexecinfo-dev \
  make \
  cmake \
  python3 \
  py3-pip \
  libcurl
# Installs latest Chromium package.
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  freetype-dev \
  harfbuzz \
  ca-certificates \
  ttf-freefont    
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
ENTRYPOINT ["/usr/local/bin/npx", "aws-lambda-ric"]
CMD ["./dist/apps/job-runner/src/main.handler"]
