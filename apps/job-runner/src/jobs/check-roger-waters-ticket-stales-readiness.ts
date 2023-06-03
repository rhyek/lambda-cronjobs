import { PlaywrightJob, PlaywrightRunParams } from '../playwright-job.js';

export class CheckRogerWatersTicketSalesReadiness extends PlaywrightJob {
  public enabled: boolean = true;
  // cron expression 10 minutes after every hour
  public scheduleCronExpression: string = '10 * * * *';

  protected async playwrightRun({
    page,
    mailMe,
    callMe,
  }: PlaywrightRunParams<never>): Promise<void> {
    await page.goto('https://www.eticket.cr/masinformacion.aspx?idevento=8146');

    const isVisible = await page
      .getByText('PROXIMAMENTE A LA VENTA')
      .first()
      .isVisible();

    // await page.pause();

    console.log('isVisible', isVisible);

    await mailMe({
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
