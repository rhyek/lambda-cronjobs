import { PlaywrightJob, PlaywrightRunParams } from '../playwright-job.js';

export class CheckRogerWatersTicketSalesReadiness extends PlaywrightJob {
  public enabled: boolean = true;
  // public scheduleCronExpression: string = 'cron(41 * ? * * *)';
  // public scheduleCronExpression: string = 'cron(0 * ? * * *)';
  public scheduleCronExpression: string = 'cron(0/10 * * * ? *)'; // every 10 minutes

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

    const sendEmail =
      !isVisible ||
      new Date().getMinutes() >= 58 ||
      new Date().getMinutes() <= 2;
    if (sendEmail) {
      await mailMe({
        subject: `Roger Waters CR ticket sales ${
          isVisible ? 'are NOT' : 'ARE'
        } available`,
        text: 'see title',
      });
    }
    if (!isVisible) {
      await callMe({
        twiml:
          '<Response><Say>Concert tickets for Roger Waters are available!</Say></Response>',
      });
    }
  }
}
