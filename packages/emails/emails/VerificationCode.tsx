import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface VerificationEmailProps {
  code: string;
  username?: string;
}

export const VerificationEmail = ({
  code = "123456",
  username = "there",
}: VerificationEmailProps) => {
  const previewText = "Your verification code";
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="p-4 border border-solid border-[#eaeaea] rounded my-[40px] mx-auto max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src="https://nuxflare.com/pwa-192x192.png"
                alt="Nuxflare"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Verification Code
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {username},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Here is your verification code:
            </Text>
            <Text className="text-[24px] font-mono text-center my-[20px] tracking-[0.3em]">
              {code}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VerificationEmail;

export const template = ({ code, username }: VerificationEmailProps) => ({
  subject: "Your Verification Code - Nuxflare",
  body: <VerificationEmail code={code} username={username} />,
});
