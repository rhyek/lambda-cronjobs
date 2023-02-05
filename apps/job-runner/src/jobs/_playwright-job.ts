import fs from 'node:fs/promises';
import {
  Browser,
  BrowserContext,
  Page,
  chromium,
  errors as playwrightErrors,
} from 'playwright';
import { launchChromium } from 'playwright-aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Job } from './_job';
import { isLambda } from '../utils';
import { JobError } from '../job-error';

export abstract class PlaywrightJob extends Job {
  override async run(): Promise<void> {
    let browser: Browser | null = null;
    let context: BrowserContext | null = null;
    try {
      browser = isLambda()
        ? await launchChromium({
            headless: true,
          })
        : await chromium.launch({
            headless: false,
          });
      context = await browser.newContext();
      if (isLambda()) {
        await context.tracing.start({ screenshots: true, snapshots: true });
      }
      const page = await browser.newPage({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
      });
      await this.playwrightRun({ browser, page });
    } catch (error) {
      if (
        error instanceof playwrightErrors.TimeoutError &&
        isLambda() &&
        context
      ) {
        const zipExtension = '.zip';
        const traceAbsolutePath = `/tmp/trace${zipExtension}`;
        await context.tracing.stop({ path: traceAbsolutePath });
        const buffer = await fs.readFile(traceAbsolutePath);
        const s3Client = new S3Client({});
        const objectKey = `${new Date().toISOString()}_${
          this.constructor.name
        }${zipExtension}`;
        // AWS_REGION is provided by lambda: https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html#configuration-envvars-runtime
        const region = process.env.AWS_REGION!;
        const bucket = process.env.PLAYWRIGHT_TRACES_S3_BUCKET!;
        const command = new PutObjectCommand({
          Bucket: bucket,
          Key: objectKey,
          ContentType: 'application/zip',
          Body: buffer,
        });
        await s3Client.send(command);
        const objectUrl = `https://${bucket}.s3-${region}.amazonaws.com/${objectKey}`;
        const viewTraceUrl = `https://trace.playwright.dev/?trace=${objectUrl}`;
        throw new JobError(
          error as Error,
          `\nTrace file: ${objectUrl}.\nView trace: ${viewTraceUrl}`
        );
      } else {
        throw new JobError(error as Error);
      }
    } finally {
      await context?.close();
      await browser?.close();
    }
  }

  protected abstract playwrightRun({
    browser,
    page,
  }: {
    browser: Browser;
    page: Page;
  }): Promise<void>;
}
