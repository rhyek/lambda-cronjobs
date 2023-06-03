import { Job } from '../job.js';
import { CheckRogerWatersTicketSalesReadiness } from './check-roger-waters-ticket-stales-readiness.js';

// export enum JobName {
//   CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY = 'check-mexican-embassy-visa-appointment-availability',
//   GOOGLE_TITLE = 'google-title',
//   CHECK_ROGER_WATERS_TICKET_SALES_READINESS = 'check-roger-waters-ticket-sales-readiness',
// }

export const jobs = {
  // [JobName.CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY]:
  //   new CheckMexicanEmbassyVisaAppointmentAvailability(),
  // [JobName.GOOGLE_TITLE]: new GoogleTitleJob(),
  'check-roger-waters-ticket-sales-readiness':
    new CheckRogerWatersTicketSalesReadiness(),
} satisfies { [x: string]: Job };

export type JobName = keyof typeof jobs;
