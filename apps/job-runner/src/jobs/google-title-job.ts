import { Page } from 'playwright';
import { mailToMe } from '../mailer.js';
import { isLambda } from '../utils.js';
import { PlaywrightJob } from '../playwright-job.js';

export class GoogleTitleJob extends PlaywrightJob {
  public enabled: boolean;
  public scheduleCronExpression: string;
  protected override async playwrightRun({
    page,
  }: {
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
