import { JobName } from '../../../../../../shared/job-names.js';

export default [
  // {
  //   jobName: JobName.CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY,
  //   scheduleExpression:
  //     'cron(0 1,13,16,19,22 ? * * *)' /* every 3 hours during the day */,
  // },
  // {
  //   jobName: JobName.GOOGLE_TITLE,
  //   // scheduleExpression: 'cron(0/10 * ? * * *)' /* every 10 minutes */,
  //   scheduleExpression: 'cron(* * ? * * *)' /* every minute */,
  // },
] as { jobName: JobName; scheduleExpression: string }[];
