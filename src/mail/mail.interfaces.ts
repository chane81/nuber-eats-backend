export interface MailModuleOptions {
  smtpUser: string;
  smtpPwd: string;
  fromEmail: string;
}

export interface EmailVar {
  key: string;
  value: string;
}
