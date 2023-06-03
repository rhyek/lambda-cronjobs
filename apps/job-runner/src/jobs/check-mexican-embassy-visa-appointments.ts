import { Page } from 'playwright';
import { isEqual } from 'lodash-es';
import { PlaywrightJob } from '../playwright-job.js';
import { getJobRunnerSecrets } from '../secrets.js';
import { isLambda } from '../utils.js';
import { mailToMe } from '../mailer.js';

export class CheckMexicanEmbassyVisaAppointmentAvailability extends PlaywrightJob {
  public enabled: boolean = false;
  public scheduleCronExpression: string = 'cron(0 1,13,16,19,22 ? * * *)';

  protected override async playwrightRun({
    page,
  }: {
    page: Page;
  }): Promise<void> {
    const closeNotice = () =>
      page!.locator('a svg').first().click({ timeout: 10_000 });

    let email: string;
    let password: string;
    if (isLambda()) {
      ({
        jobCheckMexicanEmbassyVisaAppointmentAvailabilityConfig: {
          account: { email, password },
        },
      } = await getJobRunnerSecrets());
    } else {
      email =
        process.env
          .JOB_CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY_EMAIL!;
      password =
        process.env
          .JOB_CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY_PASSWORD!;
    }

    await page.goto('https://citas.sre.gob.mx/');
    await page.getByRole('button', { name: 'Oficinas Consulares' }).click();
    await page.locator('input[name=email]').fill(email);
    await page.locator('input[name=password]').fill(password);
    await page
      .getByLabel('He leido y acepto los términos y condiciones')
      .click();
    await closeNotice();
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.getByText('Programar', { exact: true }).click();
    await closeNotice();
    try {
      await closeNotice();
    } catch {}
    await page.getByText('Seleccionar').click();
    await page.getByRole('button', { name: 'Aceptar' }).click();
    await page.getByText('Agregar Manualmente').click();
    await page.getByPlaceholder('Ingresa nombre(s)').fill('Carlos Roberto');
    await page.getByPlaceholder('Ingresa primer apellido').fill('González');
    await page.getByPlaceholder('Ingresa segundo apellido').fill('Nazar');
    // fecha de nacimiento
    await page.getByPlaceholder('YYYY-MM-DD').click();
    await page.locator('select').nth(1).selectOption('1983');
    await page.locator('select').first().selectOption('8');
    await page.getByRole('link', { name: '13' }).click();
    // sexo
    await page
      .locator('#vs5__combobox')
      .getByPlaceholder('--Selecciona--')
      .click();
    await page.getByRole('option', { name: 'Masculino' }).click();
    // nacionalidad
    await page
      .locator('#vs6__combobox')
      .getByPlaceholder('--Selecciona--')
      .click();
    await page.getByRole('option', { name: 'Hondureña' }).click();
    // estado civil
    await page
      .locator('#vs7__combobox')
      .getByPlaceholder('--Selecciona--')
      .click();
    await page.getByRole('option', { name: 'Soltero(a)' }).click();
    // lugar de nacimiento
    await page.getByPlaceholder('--Selecciona--').click();
    await page.getByRole('option', { name: 'Honduras' }).click();
    await page.getByPlaceholder('--Selecciona--').click();
    await page.getByRole('option', { name: 'Atlántida' }).click();
    await page.getByPlaceholder('Ingresa localidad').click();
    await page.getByPlaceholder('Ingresa localidad').fill('LA CEIBA');
    // ya ha obtenido pasaporte consular previamente?
    await page.getByLabel('No', { exact: true }).check();
    await page.getByRole('button', { name: 'Verificar' }).click();
    // check passed
    await page
      .getByText(
        '¡Atención! No se encontró ningún registro a nombre de esta persona, puedes continuar con la cita'
      )
      .isVisible();
    // continuar
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    await page.getByRole('button', { name: 'Continuar' }).click();
    await closeNotice();
    // seleccionar visas
    await page.getByText('Visas').click();
    // agregar
    await page.getByRole('button', { name: 'Agregar' }).click();
    // abrir tipos de trámites
    await page
      .locator('#vs10__combobox')
      .getByPlaceholder('--Selecciona--')
      .click();

    const appointmentTypes = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('#vs10__listbox > li')).map(
        (li) => li.textContent?.trim()
      );
    });

    const didChange = !isEqual(appointmentTypes, [
      'Con permiso del INM (Validación vía servicio web con el INM)',
    ]);

    console.log(
      'did change',
      didChange,
      JSON.stringify(appointmentTypes, null, 2)
    );

    await mailToMe({
      subject: `Mexican visa appointments ${
        didChange ? 'changed' : 'did NOT change'
      }`,
      text: JSON.stringify(appointmentTypes, null, 2),
    });
  }
}
