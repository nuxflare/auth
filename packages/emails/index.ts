import { template as WelcomeEmail } from "./emails/Welcome";
import { template as VerificationCodeEmail } from "./emails/VerificationCode";

export namespace Emails {
  export const Welcome = WelcomeEmail;
  export const VerificationCode = VerificationCodeEmail;
}
