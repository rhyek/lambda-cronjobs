export type MailerConfig = {
  me: string;
  smtp: {
    account: string;
    password: string;
  };
};
