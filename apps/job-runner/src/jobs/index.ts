import { JobName } from '../../../../shared/job-names';
import { GoogleTitleJob } from './google-title-job';
import { Job } from './_job';

export const jobs: { [x in JobName]?: Job } = {
  [JobName.CHECK_MEXICAN_EMBASSY_VISA_APPOINTMENT_AVAILABILITY]:
    new GoogleTitleJob(),
  [JobName.GOOGLE_TITLE]: new GoogleTitleJob(),
};
