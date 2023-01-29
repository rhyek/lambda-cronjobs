import { Browser, Page } from 'playwright-core';
import { launchChromium } from 'playwright-aws-lambda';
import { Job } from './_job';

export abstract class PlaywrightJob extends Job {
  override async run(): Promise<void> {
    let browser: Browser | null = null;
    let page: Page | null = null;
    try {
      browser = await launchChromium({
        // headless: false,
      });
      page = await browser.newPage({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
      });
      await this._run({ browser, page });
    } finally {
      await page?.close();
      await browser?.close();
    }
  }

  protected abstract _run({
    browser,
    page,
  }: {
    browser: Browser;
    page: Page;
  }): Promise<void>;
}
