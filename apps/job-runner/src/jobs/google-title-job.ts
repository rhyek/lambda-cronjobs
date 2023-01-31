import { Browser, Page } from 'playwright-core';
import { PlaywrightJob } from './_playwright-job';

export class GoogleTitleJob extends PlaywrightJob {
  protected override async playwrightRun({
    page,
  }: {
    browser: Browser;
    page: Page;
  }): Promise<void> {
    await page.goto('https://google.com');
    await page.getByRole('combobox', { name: 'Search' }).click();
    await page.getByRole('combobox', { name: 'Search' }).fill('steve carell');
    await page.getByRole('button', { name: 'Google Search' }).first().click();
    const title = await page.title();
    console.log('title:', title);
    // await page.pause();
  }
}
