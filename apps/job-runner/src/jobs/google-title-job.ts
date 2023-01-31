import { Browser, Page } from 'playwright-core';
import { getMailer, mailToMe } from '../mailer';
import { isLambda } from '../utils';
import { PlaywrightJob } from './_playwright-job';

export class GoogleTitleJob extends PlaywrightJob {
  protected override async playwrightRun({
    page,
  }: {
    browser: Browser;
    page: Page;
  }): Promise<void> {
    await page.goto('https://google.com');
    if (isLambda()) {
      await page.getByRole('combobox', { name: 'Search' }).click();
      await page.getByRole('combobox', { name: 'Search' }).fill('steve carell');
      await page.getByRole('button', { name: 'Google Search' }).first().click();
    } else {
      await page.getByRole('combobox', { name: 'Buscar' }).click();
      await page.getByRole('combobox', { name: 'Buscar' }).fill('steve carell');
      await page
        .getByRole('button', { name: 'Buscar con Google' })
        .first()
        .click();
    }
    const title = await page.title();
    console.log('title:', title);
    await mailToMe({
      subject: 'google title result',
      text: `title: ${title}`,
    });
    // await page.pause();
  }
}
