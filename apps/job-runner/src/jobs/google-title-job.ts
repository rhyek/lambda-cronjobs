import { Browser, Page } from 'playwright';
import { PlaywrightJob } from './_playwright-job';

export class GoogleTitleJob extends PlaywrightJob {
  protected override async _run({
    page,
  }: {
    browser: Browser;
    page: Page;
  }): Promise<void> {
    await page.goto('https://google.com');
    await page.getByRole('combobox', { name: 'Buscar' }).click();
    await page.getByRole('combobox', { name: 'Buscar' }).fill('steve carell');
    await page
      .getByRole('button', { name: 'Buscar con Google' })
      .first()
      .click();
    const title = await page.title();
    console.log('title:', title);
    // await page.pause();
  }
}
