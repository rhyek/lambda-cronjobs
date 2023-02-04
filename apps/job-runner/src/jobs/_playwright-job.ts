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
        const traceAbsolutePath = '/tmp/trace.zip';
        await context.tracing.stop({ path: traceAbsolutePath });
        const buffer = await fs.readFile(traceAbsolutePath);
        const s3Client = new S3Client({});
        const command = new PutObjectCommand({
          Bucket: process.env.PLAYWRIGHT_TRACES_S3_BUCKET!,
          Key: `${new Date().toISOString()}_${this.constructor.name}`,
          Body: buffer,
        });
        const result = await s3Client.send(command);
        console.log('put result', JSON.stringify(result, null, 2));
        // https://trace.playwright.dev/?trace=https://demo.playwright.dev/reports/todomvc/data/cb0fa77ebd9487a5c899f3ae65a7ffdbac681182.zip
        throw new JobError(error as Error, `Trace url: pending`);
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
