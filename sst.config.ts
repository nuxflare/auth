/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: "nuxmono",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "cloudflare",
    };
  },
  async run() {
    const fromEmail = "hi@nuxflare.com";
    const resendApiKey = new sst.Secret("ResendApiKey");
    const clientSecrets = [
      new sst.Secret("GoogleClientID"),
      new sst.Secret("GoogleClientSecret"),
      new sst.Secret("GithubClientID"),
      new sst.Secret("GithubClientSecret"),
    ];

    const kv = new sst.cloudflare.Kv("CloudflareAuthKV");
    const emails = new sst.cloudflare.Worker("Emails", {
      handler: "packages/functions/src/emails.tsx",
      link: [resendApiKey],
    });
    const staticSite = new sst.cloudflare.StaticSite("Static", {
      path: "packages/auth-frontend",
      build: {
        command: "pnpm run generate",
        output: ".output/public",
      },
    });
    const auth = new sst.cloudflare.Worker("CloudflareAuth", {
      handler: "packages/functions/src/auth.ts",
      link: [kv, emails, staticSite.nodes.router, ...clientSecrets],
      url: true,
      ...($app.stage === "production"
        ? {
          domain: "authdemo.nuxflare.com",
        }
        : {}),
      environment: {
        ...($dev ? { DEV_URL: "http://localhost:3001" } : {}),
        FROM_EMAIL: fromEmail,
      },
    });
    return {
      url: auth.url,
    };
  },
});
