export enum EMAIL_SUBJECTS {
  NOTIFICATION = 'Notification',
  VERIFY_EMAIL = 'Verify Email',
  RESET_PASSWORD = 'Reset Password',
  NEW_DEVICE = 'New Device Login',
  SCRAPE_ERROR = 'Scraping Error',
}

export const EMAIL_TEMPLATES: Record<EMAIL_SUBJECTS, string> = {
  [EMAIL_SUBJECTS.NOTIFICATION]: 'notification',
  [EMAIL_SUBJECTS.VERIFY_EMAIL]: 'verify-email',
  [EMAIL_SUBJECTS.RESET_PASSWORD]: 'reset-password',
  [EMAIL_SUBJECTS.NEW_DEVICE]: 'new-device',
  [EMAIL_SUBJECTS.SCRAPE_ERROR]: 'scrape-error',
};

export type EmailContextMap = {
  [EMAIL_SUBJECTS.NOTIFICATION]: {
    cardName: string;
    timeLeft: string;
  };
  [EMAIL_SUBJECTS.VERIFY_EMAIL]: {
    name: string;
    verifyUrl: string;
  };
  [EMAIL_SUBJECTS.RESET_PASSWORD]: {
    name: string;
    resetUrl: string;
  };
  [EMAIL_SUBJECTS.NEW_DEVICE]: {
    name: string;
    deviceName: string;
    deviceType: string;
    time: string;
  };
  [EMAIL_SUBJECTS.SCRAPE_ERROR]: {
    provider: string;
    error: string;
  };
};
