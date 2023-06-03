import { Page } from 'playwright';
import { PlaywrightJob } from '../playwright-job.js';
import { mailToMe } from '../mailer.js';

export class CheckRogerWatersTicketSalesReadiness extends PlaywrightJob {
  public enabled: boolean = true;
  // cron expression for every 60 minutes on minute 17
  public scheduleCronExpression: string = 'cron(17 * ? * * *)';

  protected async playwrightRun({ page }: { page: Page }): Promise<void> {
    await page.goto('https://www.eticket.cr/masinformacion.aspx?idevento=8146');
    const isVisible = await page
      .getByText('PROXIMAMENTE A LA VENTA')
      .first()
      .isVisible();

    // await page.pause();

    console.log('isVisible', isVisible);
    await mailToMe({
      subject: `Roger Waters CR ticket sales ${
        isVisible ? 'are NOT' : 'ARE'
      } available`,
      text: 'see title',
    });
  }
}
