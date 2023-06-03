import { PlaywrightJob, PlaywrightRunParams } from '../playwright-job.js';
import { mailToMe } from '../services/mailer.js';

export class CheckRogerWatersTicketSalesReadiness extends PlaywrightJob {
  public enabled: boolean = true;
  public scheduleCronExpression: string = 'cron(0/60 * ? * * *)';

  protected async playwrightRun({
    page,
    callMe,
  }: PlaywrightRunParams<never>): Promise<void> {
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

    await callMe({
      twiml:
        '<Response><Say>Concert tickets for Roger Waters are available!</Say></Response>',
    });
  }
}
