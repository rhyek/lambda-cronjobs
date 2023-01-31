import { Browser, Page } from 'playwright-core';
import { launchChromium } from 'playwright-aws-lambda';
import { Job } from './_job';
import { isLambda } from '../utils';

export abstract class PlaywrightJob extends Job {
  override async run(): Promise<void> {
    let browser: Browser | null = null;
    let page: Page | null = null;
    try {
      browser = await launchChromium({
        headless: isLambda(),
      });
      page = await browser.newPage({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
      });
      await this.playwrightRun({ browser, page });
    } finally {
      await page?.close();
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
