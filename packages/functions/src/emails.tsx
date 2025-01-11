import { Resend } from "resend";
import { Emails } from "@nuxflare-auth/emails";
import { Resource } from "sst/resource";

const templates = {
  Welcome: Emails.Welcome,
  VerificationCode: Emails.VerificationCode,
};

export const sendEmail = async <Type extends keyof typeof templates>(
  from: string,
  to: string,
  template: Type,
  props: Parameters<(typeof templates)[Type]>[0],
) => {
  const { body, subject } = templates[template](props as any);
  const resend = new Resend(Resource.ResendApiKey.value);
  try {
    await resend.emails.send({
      from,
      to,
      subject,
      react: body,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

export type SendEmailType = typeof sendEmail;

export default {
  async fetch(req: Request) {
    try {
      const [from, to, template, props] = (await req.json()) as any[];
      await sendEmail(from, to, template, props);
    } catch (err) {
      console.error("err", err);
    }
    return new Response(null, { status: 200 });
  },
};
