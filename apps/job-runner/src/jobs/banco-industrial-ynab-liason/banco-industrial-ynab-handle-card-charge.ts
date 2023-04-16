import { Page } from 'playwright';
import { PlaywrightJob } from '../../playwright-job.js';

export class BancoIndustrialYnabHandleCardCharge extends PlaywrightJob {
  protected playwrightRun({ page }: { page: Page }): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
